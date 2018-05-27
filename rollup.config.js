import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'src/spriteling.ts',
  output: {
    file: 'dist/spriteling.min.js',
    name: 'Spriteling',
    format: 'umd'
  },
  plugins: [
    resolve(),
    typescript(),
    commonjs()
  ]
}
