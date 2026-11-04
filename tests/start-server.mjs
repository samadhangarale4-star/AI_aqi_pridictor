import { spawn } from 'node:child_process';

const server = spawn(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'server.ts'], {
  env: {
    ...process.env,
    PORT: '4180',
    DISABLE_HMR: 'true',
    NODE_ENV: 'production',
    GEMINI_API_KEY: '',
  },
  stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}

server.on('exit', (code) => process.exit(code ?? 1));
