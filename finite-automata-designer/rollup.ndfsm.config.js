// import typescript from '@rollup/plugin-typescript';
// import { nodeResolve } from '@rollup/plugin-node-resolve';

// export default {
//   input: {dfsm: "public/scripts/dfsmCanvas.ts", ndfsm: "public/scripts/ndfsmCanvas.ts"},
//   output: {
//     // file: {dfsm: 'public/scripts/dfsmCanvas.js', ndfsm: 'public/scripts/ndfsmCanvas.js'},
//     // format: 'iife',
//     // name: {dfsm: 'DfsmCanvas', ndfsm: 'NdfsmCanvas'},
//     dir: "public/scripts/",
//     format: "esm",
//     entryFileNames: "[name]Canvas.js",
//   },
//   plugins: [
//     nodeResolve(),
//     typescript({
//       tsconfig: './tsconfig.json',
//       sourceMap: false,
//       compilerOptions: {
//         module: 'esnext',
//         target: 'es2020'
//       },
//       outputToFilesystem: false, // Prevents dupilicate file writes
//     }),
    
//   ],
  
// };

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'public/scripts/ndfsm/ndfsmCanvas.ts',
  output: {
    file: 'public/scripts/ndfsm/ndfsmCanvas.js',
    format: 'iife',
    name: 'NdfsmCanvas'
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: false,
      compilerOptions: {
        module: 'esnext',
        target: 'es2020'
      },
      outputToFilesystem: false, // Prevents dupilicate file writes
    }),
    
  ],
  
};