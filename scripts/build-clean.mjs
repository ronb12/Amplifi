import { existsSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildRoot = '/tmp/amplifi-build';
const node20Bin = '/usr/local/opt/node@20/bin';
const node20 = `${node20Bin}/node`;

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    stdio: 'inherit',
    env: options.env ?? process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (!existsSync(node20)) {
  const major = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);
  if (major !== 20) {
    console.error('Build requires Node 20. Install it with `brew install node@20` or run the build from Node 20.');
    process.exit(1);
  }
}

const env = existsSync(node20)
  ? { ...process.env, PATH: `${node20Bin}:${process.env.PATH ?? ''}` }
  : process.env;

rmSync(buildRoot, { recursive: true, force: true });
run('mkdir', ['-p', buildRoot]);
run('rsync', [
  '-a',
  '--exclude',
  'node_modules',
  '--exclude',
  '.git',
  '--exclude',
  'dist',
  '--exclude',
  'public 2',
  `${projectRoot}/`,
  `${buildRoot}/`
]);
run('npm', ['install', '--no-audit', '--no-fund', '--fetch-timeout=30000', '--fetch-retries=2'], {
  cwd: buildRoot,
  env
});
run('npm', ['run', 'build:direct'], {
  cwd: buildRoot,
  env
});
run('rsync', ['-a', '--delete', `${buildRoot}/dist/`, `${projectRoot}/dist/`]);
