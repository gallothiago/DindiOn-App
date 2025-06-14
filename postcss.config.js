// postcss.config.js
// Este arquivo configura os plugins PostCSS que serão usados para processar seu CSS.
export default {
  plugins: {
    // Adiciona o plugin Tailwind CSS, que é responsável por processar as diretivas @tailwind e gerar o CSS.
    tailwindcss: {},
    // Adiciona o plugin Autoprefixer, que adiciona prefixos de fornecedor (-webkit-, -moz-, etc.)
    // às propriedades CSS para garantir compatibilidade com diferentes navegadores.
    autoprefixer: {},
  },
};