import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'public/scripts/dfa/dfaCanvas.ts',
  output: {
    file: 'public/scripts/dfa/dfaCanvas.js',
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
      },
      outputToFilesystem: false, // Prevents dupilicate file writes
    }),
    
  ],
  
};