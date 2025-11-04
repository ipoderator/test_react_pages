import { fetchProducts } from '@/services/api';
import EditProductClient from './EditProductClient';

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

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}
