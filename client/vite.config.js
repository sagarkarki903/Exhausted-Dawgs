import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()], // ✅ Correct setup
  base: './', // ✅ Ensures correct paths for Netlify deployment
});
