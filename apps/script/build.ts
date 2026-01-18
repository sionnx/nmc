import * as esbuild from 'esbuild';

const isWatch = process.env.WATCH === 'true'

let rebuildCount = 0;

const buildOptions: esbuild.BuildOptions = {
  entryPoints: ['src/index.ts'], 
  outfile: `dist/nmc.js`, 
  bundle: true,                 
  platform: 'neutral',        
  target: 'es2022',        
  minify: true,
  format: 'iife',
  plugins: isWatch ? [
    {
      name: 'watch-rebuild-notify',
      setup(build) {
        build.onEnd((result) => {
          rebuildCount++;
          if (rebuildCount === 1) {
            if (result.errors.length > 0) {
              console.error(`❌ Initial build failed with ${result.errors.length} error(s)`);
            } else {
              console.log(`✅ Initial build succeeded!`);
            }
          } else {
            if (result.errors.length > 0) {
              console.error(`❌ Rebuild #${rebuildCount} failed with ${result.errors.length} error(s)`);
            } else {
              console.log(`✅ Rebuild #${rebuildCount} succeeded!`);
            }
          }
        });
      },
    },
  ] : undefined,
};

if (isWatch) {
  console.log(`🚀 Starting dev mode (watching for changes)...`);
  
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  
  console.log('✅ Watching for file changes...');
} else {
  console.log(`🚀 Starting build...`);
  
  await esbuild.build(buildOptions).catch((error) => {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  });
  
  console.log('✅ Build finished successfully!');
}