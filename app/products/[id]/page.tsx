import ProductDetailClient from './ProductDetailClient';

// Allow dynamic routes for user-created products (ID >= 1000)
// This allows Next.js to handle any product ID, not just those from API
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
