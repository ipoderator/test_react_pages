import { fetchProducts } from '@/services/api';
import EditProductClient from './EditProductClient';

// Fallback IDs if API fails during build
const FALLBACK_PRODUCT_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

// Force static generation for static export
export const dynamic = 'force-static';

// This function is required for static export with dynamic routes
export async function generateStaticParams() {
  try {
    const products = await fetchProducts();
    return products.map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating static params from API, using fallback IDs:', error);
    // Return fallback IDs if API fails during build (e.g., rate limiting in CI)
    // This ensures static export can still generate pages
    return FALLBACK_PRODUCT_IDS.map((id) => ({
      id: id.toString(),
    }));
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
