import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
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

const copyProject = () => {
  const excluded = new Set(['node_modules', '.git', 'dist', 'public 2']);

  for (const entry of readdirSync(projectRoot, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.startsWith('.git.dataless-backup-')) {
      continue;
    }

    cpSync(join(projectRoot, entry.name), join(buildRoot, entry.name), {
      recursive: true,
      dereference: false,
      filter: (source) => {
        const name = basename(source);
        return !excluded.has(name) && !name.startsWith('.git.dataless-backup-');
      }
    });
  }
};

rmSync(buildRoot, { recursive: true, force: true });
run('mkdir', ['-p', buildRoot]);
copyProject();
run('npm', ['install', '--no-audit', '--no-fund', '--fetch-timeout=30000', '--fetch-retries=2'], {
  cwd: buildRoot,
  env
});
run('npm', ['run', 'build:direct'], {
  cwd: buildRoot,
  env
});
rmSync(resolve(projectRoot, 'dist'), { recursive: true, force: true });
cpSync(resolve(buildRoot, 'dist'), resolve(projectRoot, 'dist'), { recursive: true });
