import { defineConfig } from 'rollup'
import ts from '@rollup/plugin-typescript'

export default defineConfig({
  input: 'src/loop-protect.ts',
  output: [
    {
      file: 'dist/cjs/loop-protect.js',
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/esm/loop-protect.js',
      format: 'esm'
    },
    {
      file: 'dist/umd/loop-protect.js',
      format: 'umd',
      name: 'loopProtect'
    }
  ],
  plugins: [ts({ target: 'es2015' })]
})
