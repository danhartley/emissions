import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        dir: 'dist/lib/es6',
        format: 'esm',
      },
      {
      dir: 'dist/lib/es5',
      format: 'cjs',
      }
    ],
    plugins: [
      resolve(),
      commonjs({ include: ['node_modules/**'] }),
      copy({
        targets: [
          { src: 'src/assets/*', dest: 'dist/assets' },
          { src: 'src/config/*.json', dest: 'dist/config' }
        ]
      })
    ],
  }
];
