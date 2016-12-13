import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  format: 'iife',
  plugins: [
    babel({
      exclude: process.env.BABEL_ENV === 'production' ? '' : 'node_modules/**'
    }),
    nodeResolve({
      jsnext: true,
      main: true
    })
  ]
};
