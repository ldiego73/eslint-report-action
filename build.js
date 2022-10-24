/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */
const { build } = require('esbuild');

build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.js',
  bundle: true,
  minify: true,
  platform: 'node',
  sourcemap: false,
  target: 'node16',
}).catch(() => process.exit(1));
