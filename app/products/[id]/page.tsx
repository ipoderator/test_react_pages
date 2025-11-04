import { fetchProducts } from '@/services/api';
import ProductDetailClient from './ProductDetailClient';

// This function is required for static export with dynamic routes
export async function generateStaticParams() {
  try {
    const products = await fetchProducts();
    return products.map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    // Return empty array if API fails - pages will be generated on-demand
    return [];
  }
}

export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
