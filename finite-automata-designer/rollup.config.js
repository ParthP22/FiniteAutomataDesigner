// import typescript from '@rollup/plugin-typescript';
// import { nodeResolve } from '@rollup/plugin-node-resolve';

// export default {
//   input: 'public/scripts/dfaCanvas.js', // Start with your TypeScript source file
//   output: {
//     file: 'public/scripts/dfaCanvas.js', // Output the bundled result here
//     format: 'iife', // Immediately Invoked Function Expression (no modules)
//     name: 'DfaCanvas', // Global variable name
//     // globals: {
//     //   // This makes your functions available globally
//     //   'inputDeterminismCheck': 'inputDeterminismCheck',
//     //   'transitionDeterminismCheck': 'transitionDeterminismCheck'
//     // }
//   },
//   plugins: [
//     nodeResolve(),
//     typescript()
//   ]
// };

// import typescript from '@rollup/plugin-typescript';
// import { nodeResolve } from '@rollup/plugin-node-resolve';

// export default {
//   input: './dfaCanvas.ts', // Your main entry point
//   output: {
//     file: './dfaCanvas.js',
//     format: 'iife', // Immediately Invoked Function Expression (no modules)
//     name: 'DfaCanvas' // Global variable name
//   },
//   plugins: [
//     nodeResolve(),
//     typescript()
//   ]
// };

import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'public/scripts/dfaCanvas.ts',
  output: {
    file: 'public/scripts/dfaCanvas.js',
    format: 'iife',
    name: 'DfaCanvas'
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: false,
      compilerOptions: {
        module: 'esnext',
        target: 'es2020'
      }
    }),
    
  ],
  
};