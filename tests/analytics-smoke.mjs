const { chromium } = await import('playwright');

const baseUrl = process.env.ANALYTICS_BASE_URL || 'http://127.0.0.1:4173';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
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

try {
  await page.goto(`${baseUrl}/creator-dashboard`, { waitUntil: 'networkidle' });
  await page.locator('body').waitFor({ state: 'visible' });

  for (const text of [
    'Creator Dashboard',
    'Content Performance',
    'Revenue Mix',
    'Audience Growth',
    'Channel Snapshot',
    'Next Best Actions',
    'Total views',
    'Engagement rate',
    'Watch time',
    'Paid conversion'
  ]) {
    await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 10_000 });
  }

  const performanceRows = await page.locator('text=est. revenue').count();
  const revenueMix = await page.locator('text=Memberships').count();
  const actionCards = await page.locator('text=Prioritized recommendations from your analytics.').count();

  if (performanceRows < 1) {
    throw new Error('Content Performance did not render any estimated revenue rows');
  }
  if (revenueMix < 1) {
    throw new Error('Revenue Mix did not render expected labels');
  }
  if (actionCards < 1) {
    throw new Error('Next Best Actions panel did not render');
  }
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  console.log('Analytics dashboard smoke passed');
} finally {
  await browser.close();
}
