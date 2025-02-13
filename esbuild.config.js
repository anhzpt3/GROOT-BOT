const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile: './dist/bundle.js',
    platform: 'node',
    target: 'node18',
    // external: ['zlib-sync', 'bufferutil', 'utf-8-validate'],
    // sourcemap: true,
    minify: true,
    loader: {
      '.ts': 'ts',
    },
    define: {
      'require.resolve': 'require.resolve',
    },
  })
  .catch(() => process.exit(1));
