import EditProductClient from './EditProductClient';

// Allow dynamic routes for user-created products (ID >= 1000)
// This allows Next.js to handle any product ID, not just those from API
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <EditProductClient id={id} />;
}
