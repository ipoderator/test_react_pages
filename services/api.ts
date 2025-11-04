import axios from 'axios';
import { Product } from '@/types';

// Use environment variable with fallback to default Fake Store API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fakestoreapi.com';
const API_URL = `${API_BASE_URL}/products`;

// Retry function for API calls
const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await retryRequest(() => 
      axios.get<Product[]>(API_URL, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Accept': 'application/json',
        }
      })
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки продуктов:', error);
    // Return empty array instead of throwing to prevent app crash
    // The app will show empty state which is better than crashing
    return [];
  }
};

export const fetchProductById = async (id: number): Promise<Product | null> => {
  try {
    const response = await retryRequest(() =>
      axios.get<Product>(`${API_URL}/${id}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
        }
      })
    );
    return response.data;
  } catch (error) {
    console.error('Ошибка загрузки товара:', error);
    // Return null instead of throwing
    return null;
  }
};

// Export API base URL for use in generateStaticParams
export const getApiBaseUrl = () => API_BASE_URL;
