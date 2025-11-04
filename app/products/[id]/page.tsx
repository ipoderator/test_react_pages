import ProductDetailClient from './ProductDetailClient';

// For static export, generateStaticParams is required
// Return static IDs to create route structure
// Client-side ProductDetailClient will handle all product IDs (including user-created >= 1000)
export async function generateStaticParams() {
  // Return static array of common product IDs to create route structure
  // ProductDetailClient handles loading any product ID on the client side
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
    { id: '4' },
    { id: '5' },
  ];
}

// Server component wrapper - required for static export
export default async function ProductDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
