import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './dfaCanvas.ts', // Your main entry point
  output: {
    file: './dfaCanvas.js',
    format: 'iife', // Immediately Invoked Function Expression (no modules)
    name: 'DfaCanvas' // Global variable name
  },
  plugins: [
    nodeResolve(),
    typescript()
  ]
};