import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import envCompatible from 'vite-plugin-env-compatible';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // 1. Enables Buffer, Crypto, Stream, etc.
    nodePolyfills({
      protocolImports: true,
    }),
    // 2. Enables process.env.REACT_APP_ variable access
    envCompatible(),
  ],
  resolve: {
    alias: {
      // 3. Optional: Helpful if you use absolute imports like 'src/components'
      '@': path.resolve(__dirname, './src'), 
    },
  },
  // 4. Port configuration to match your old app (optional)
  server: {
    port: 3000,
    open: true,
  },
});