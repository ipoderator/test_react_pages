/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Включает статический экспорт для GitHub Pages
  basePath: '/test_react_pages', // Путь к репозиторию на GitHub Pages
  assetPrefix: '/test_react_pages', // Префикс для статических ресурсов
  trailingSlash: true,
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
  experimental: {
    // Disable static optimization for dynamic routes in static export
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
