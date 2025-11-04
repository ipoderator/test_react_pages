/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Включает статический экспорт для GitHub Pages
  basePath: '/test_react_pages', // Путь к репозиторию на GitHub Pages
  assetPrefix: '/test_react_pages', // Префикс для статических ресурсов
  images: {
    unoptimized: true, // Обязательно для статического экспорта
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fakestoreapi.com',
      },
      {
        protocol: 'https',
        hostname: 'ixbt.online',
      },
      {
        protocol: 'http',
        hostname: 'ixbt.online',
      },
      // Разрешаем изображения с любых доменов для пользовательских продуктов
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig

