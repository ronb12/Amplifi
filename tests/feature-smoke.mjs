import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const port = Number(process.env.E2E_PORT || 4173);
const baseUrl = `http://127.0.0.1:${port}`;

const waitForServer = async () => {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Preview server did not start at ${baseUrl}`);
};

const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const server = spawn('npm', ['run', 'preview', '--', '--port', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe']
});

server.stdout.on('data', chunk => process.stdout.write(chunk));
server.stderr.on('data', chunk => process.stderr.write(chunk));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];

page.on('console', message => {
  if (message.type() === 'error') {
    errors.push(`console: ${message.text()}`);
  }
});
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('requestfailed', request => {
  const failure = request.failure();
  if (failure && !request.url().startsWith('data:')) {
    errors.push(`request failed: ${request.url()} ${failure.errorText}`);
  }
});

const expectVisibleText = async text => {
  await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 10_000 });
};

try {
  await waitForServer();

  for (const path of [
    '/',
    '/trending',
    '/subscriptions',
    '/library',
    '/history',
    '/liked',
    '/playlists',
    '/shorts',
    '/stories',
    '/live-events',
    '/search?q=react',
    '/settings',
    '/creator-dashboard',
    '/video/1',
    '/channel/1'
  ]) {
    await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
    await page.locator('body').waitFor({ state: 'visible' });
  }

  const runId = Date.now();
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Sign Up' }).click();
  await page.getByPlaceholder('Enter your display name').fill('QA Creator');
  await page.getByPlaceholder('Enter your username').fill(`qa_creator_${runId}`);
  await page.getByPlaceholder('Enter your email').fill(`qa_${runId}@example.com`);
  await page.getByPlaceholder('Enter your password').fill('password123');
  await page.getByPlaceholder('Confirm your password').fill('password123');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expectVisibleText('QA Creator');
  await page.reload({ waitUntil: 'networkidle' });
  await expectVisibleText('QA Creator');

  await page.getByRole('button', { name: 'Creator Studio' }).click();
  const creatorButton = page.getByRole('button', { name: 'Enable creator mode' });
  if (await creatorButton.isVisible().catch(() => false)) {
    await creatorButton.click();
  }
  await expectVisibleText('Stripe Account');
  await expectVisibleText('Content Performance');
  await expectVisibleText('Revenue Mix');
  await expectVisibleText('Audience Growth');
  await expectVisibleText('Channel Snapshot');
  await expectVisibleText('Next Best Actions');
  await expectVisibleText('Total views');
  await expectVisibleText('Engagement rate');
  await expectVisibleText('Watch time');
  await expectVisibleText('Paid conversion');

  await page.goto(`${baseUrl}/channel/1`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /^Subscribe$/ }).click();
  await expectVisibleText('Subscribed');
  await page.goto(`${baseUrl}/subscriptions`, { waitUntil: 'networkidle' });
  await expectVisibleText('CodeMaster Pro');

  await page.goto(`${baseUrl}/video/1`, { waitUntil: 'networkidle' });
  await page.locator('button').filter({ hasText: /^\d+$/ }).first().click();
  await page.getByRole('button', { name: /^Save$/ }).click();
  await page.getByRole('button', { name: /^Report$/ }).first().click();
  await page.getByPlaceholder('Add a comment...').fill('E2E comment looks good');
  await page.getByRole('button', { name: /^Comment$/ }).click();
  await expectVisibleText('E2E comment looks good');
  await page.goto(`${baseUrl}/library`, { waitUntil: 'networkidle' });
  await expectVisibleText('Saved videos');
  await expectVisibleText('Liked content');

  await page.goto(`${baseUrl}/video/6`, { waitUntil: 'networkidle' });
  await expectVisibleText('Premium content');
  await page.getByRole('button', { name: 'Unlock video' }).click();
  await page.locator('video').waitFor({ state: 'visible', timeout: 10_000 });

  const mediaDir = join(tmpdir(), 'amplifi-e2e');
  mkdirSync(mediaDir, { recursive: true });
  const fakeVideoPath = join(mediaDir, 'upload.mp4');
  writeFileSync(fakeVideoPath, Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50]));

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.getByTitle('Upload Video').click();
  await page.locator('input[type="file"][accept="video/*"]').setInputFiles({
    name: 'upload.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 109, 112, 52, 50])
  });
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByPlaceholder('Add a title that describes your video').fill('E2E Upload Feature');
  await page.getByPlaceholder('Tell viewers about your video').fill('Uploaded by the automated smoke suite.');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.locator('.fixed').getByRole('button', { name: 'Upload Video' }).click();
  await expectVisibleText('E2E Upload Feature');

  const creatorChannelId = await page.evaluate(() => {
    const rawUser = window.localStorage.getItem('amplifi:v1:auth-user');
    return rawUser ? JSON.parse(rawUser).channelId : null;
  });
  if (!creatorChannelId) throw new Error('Creator channel was not persisted');

  await page.goto(`${baseUrl}/channel/${creatorChannelId}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Posts' }).click();
  await page.getByRole('button', { name: 'Share something with your community...' }).click();
  await page.getByPlaceholder("What's on your mind?").fill('E2E community post');
  await page.getByRole('button', { name: /^Post$/ }).click();
  await expectVisibleText('E2E community post');

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  console.log('Feature smoke suite passed');
} finally {
  await browser.close();
  server.kill('SIGTERM');
}
