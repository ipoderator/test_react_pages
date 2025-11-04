import ProductDetailClient from './ProductDetailClient';

// Use environment variable with fallback to default Fake Store API
// In Next.js, NEXT_PUBLIC_* variables are always available at build time
// @ts-ignore - process.env is available in Next.js build context
const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'https://fakestoreapi.com';

// Force static generation for static export
export const dynamic = 'force-static';

// This function is required for static export with dynamic routes
// Uses native fetch for better compatibility with static generation
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      console.error('Failed to fetch products for generateStaticParams:', res.status, res.statusText);
      // Return fallback IDs if API fails during build
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((id) => ({
        id: id.toString(),
      }));
    }

    const products = await res.json();
    
    if (!Array.isArray(products)) {
      console.error('Products API did not return an array');
      return [];
    }

    return products.map((product: { id: number }) => ({
      id: String(product.id),
    }));
  } catch (error) {
    console.error('Error generating static params from API, using fallback IDs:', error);
    // Return fallback IDs if API fails during build (e.g., rate limiting in CI)
    // This ensures static export can still generate pages
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((id) => ({
      id: id.toString(),
    }));
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
