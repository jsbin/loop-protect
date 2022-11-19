import { defineConfig } from 'rollup'
import ts from '@rollup/plugin-typescript'

export default defineConfig({
  input: 'src/auto-break.ts',
  output: [
    {
      file: 'dist/cjs/auto-break.js',
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/esm/auto-break.js',
      format: 'esm'
    },
    {
      file: 'dist/umd/auto-break.js',
      format: 'umd',
      name: 'autoBreak'
    }
  ],
  plugins: [ts({ target: 'es2015' })]
})
