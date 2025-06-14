// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // A seção 'css' permite configurar o processamento de CSS.
  css: {
    // Especifica o caminho para o seu arquivo de configuração do PostCSS.
    // Isso garante que o Vite use o postcss.config.js para processar seus estilos.
    postcss: './postcss.config.js',
  },
});
