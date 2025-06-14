// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // O array 'content' informa ao Tailwind onde encontrar as classes que você está usando
  // Ele irá escanear esses arquivos para gerar o CSS final e otimizado.
  content: [
    "./index.html", // Inclui o arquivo HTML principal
    "./src/**/*.{js,ts,jsx,tsx}", // Inclui todos os arquivos JavaScript, TypeScript, JSX e TSX na pasta src e subpastas
  ],
  // A seção 'theme' permite que você estenda o tema padrão do Tailwind CSS.
  theme: {
    extend: {
      // Adiciona uma nova família de fonte chamada 'inter'.
      // Você pode usar 'font-inter' nas suas classes Tailwind.
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  // A seção 'plugins' é onde você pode adicionar plugins de terceiros para o Tailwind.
  plugins: [],
}
