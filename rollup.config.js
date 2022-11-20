import { defineConfig } from 'rollup'
import ts from '@rollup/plugin-typescript'

export default defineConfig({
  input: 'src/babel-auto-break.ts',
  output: [
    {
      file: 'dist/cjs/babel-auto-break.js',
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/esm/babel-auto-break.js',
      format: 'esm'
    },
    {
      file: 'dist/umd/babel-auto-break.js',
      format: 'umd',
      name: 'autoBreak'
    }
  ],
  plugins: [ts({ target: 'es2015' })]
})
