import EditProductClient from './EditProductClient';

// For static export, generateStaticParams is required
// Return static IDs to create route structure
// Client-side EditProductClient will handle all product IDs (including user-created >= 1000)
export async function generateStaticParams() {
  // Генерируем статические параметры для:
  // 1. API продуктов (1-20)
  // 2. Пользовательских продуктов (1000-10000) - широкий диапазон для новых товаров
  const apiProductIds = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
  const userProductIds = Array.from({ length: 9000 }, (_, i) => ({ id: String(i + 1000) }));
  
  return [...apiProductIds, ...userProductIds];
}

// Server component wrapper - required for static export
export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}
