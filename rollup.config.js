import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'

export default [
  {
    input: 'src/index.js',
    output: [
      {
        dir: 'dist/lib/es5',
        format: 'cjs',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      commonjs({ include: ['node_modules/**'] }),
    ],
  },
  {
    input: 'src/index.js',
    output: [
      {
        dir: 'dist/lib/es6',
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      resolve(),
      copy({
        targets: [
          { src: 'src/sw.js', dest: 'dist/lib/es6' }
        ]
      })
    ],
  },
  {
    input: 'src/sw.js',
    output: [
      {
        dir: 'dist/lib/es6',
        format: 'esm',
        sourcemap: true
      }
    ]
  }
];
