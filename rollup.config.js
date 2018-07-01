import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'

export default [
  {
    input: 'src/spriteling.ts',
    output: {
      file: 'dist/spriteling.js',
      name: 'Spriteling',
      format: 'esm'
    },
    plugins: [
      resolve(),
      typescript(),
      commonjs()
    ]
  },
  {
    input: 'src/spriteling.ts',
    output: {
      file: 'dist/spriteling.min.js',
      name: 'Spriteling',
      format: 'umd'
    },
    plugins: [
      resolve(),
      typescript(),
      commonjs(),
      uglify()
    ]
  }
]
