import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom', 'react-redux', 'react-helmet-async'],
          'vendor-redux': ['@reduxjs/toolkit'],
          'vendor-plotly': ['plotly.js/lib/core', 'plotly.js/lib/scatter', 'plotly.js/lib/box', 'react-plotly.js/factory'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'chartjs-plugin-datalabels'],
          'vendor-html2canvas': ['html2canvas'],
          'vendor-lodash': ['lodash/find', 'lodash/filter', 'lodash/sortBy'],
        },
      },
    },
  },
});
