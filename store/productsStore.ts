import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, FilterType } from '@/types';

interface ProductsState {
  products: Product[];
  favorites: number[];
  filter: FilterType;
  isLoading: boolean;
  searchQuery: string;
  categoryFilter: string;
  priceRange: { min: number; max: number };
  currentPage: number;
  itemsPerPage: number;
  hasLoadedFromAPI: boolean;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id' | 'rating'>) => void;
  updateProduct: (id: number, product: Partial<Product>) => void;
  toggleFavorite: (productId: number) => void;
  deleteProduct: (productId: number) => void;
  setFilter: (filter: FilterType) => void;
  setLoading: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setCurrentPage: (page: number) => void;
  getNextId: () => number;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      favorites: [],
      filter: 'all',
      isLoading: false,
      searchQuery: '',
      categoryFilter: '',
      priceRange: { min: 0, max: 10000 },
      currentPage: 1,
      itemsPerPage: 12,
      hasLoadedFromAPI: false,
      setProducts: (products) => {
        set((state) => {
          // Если это первый раз загрузка из API и еще нет продуктов, просто устанавливаем
          if (!state.hasLoadedFromAPI && state.products.length === 0) {
            return { products, hasLoadedFromAPI: true };
          }
          // Иначе всегда объединяем с существующими продуктами (сохраняем созданные пользователем)
          const existingIds = new Set(state.products.map(p => p.id));
          const newProducts = products.filter(p => !existingIds.has(p.id));
          return { 
            products: [...state.products, ...newProducts],
            hasLoadedFromAPI: true 
          };
        });
      },
      addProduct: (productData) => {
        const newId = get().getNextId();
        const newProduct: Product = {
          ...productData,
          id: newId,
          rating: { rate: 0, count: 0 },
        };
        set((state) => ({
          products: [newProduct, ...state.products],
          currentPage: 1, // Сбрасываем на первую страницу, чтобы новый товар был виден
        }));
      },
      updateProduct: (id, productData) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? { ...product, ...productData } : product
          ),
        })),
      toggleFavorite: (productId) =>
        set((state) => ({
          favorites: state.favorites.includes(productId)
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId],
        })),
      deleteProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((product) => product.id !== productId),
          favorites: state.favorites.filter((id) => id !== productId),
        })),
      setFilter: (filter) => set({ filter, currentPage: 1 }),
      setLoading: (isLoading) => set({ isLoading }),
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setCategoryFilter: (categoryFilter) => set({ categoryFilter, currentPage: 1 }),
      setPriceRange: (priceRange) => set({ priceRange, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      getNextId: () => {
        const state = get();
        if (state.products.length === 0) {
          return 1000; // Начинаем с большого числа, чтобы избежать конфликтов с API продуктами
        }
        const maxId = Math.max(
          ...state.products.map((p) => p.id),
          0
        );
        return maxId + 1;
      },
    }),
    {
      name: 'products-storage',
      partialize: (state) => ({
        products: state.products,
        favorites: state.favorites,
        hasLoadedFromAPI: state.hasLoadedFromAPI,
      }),
    }
  )
);

