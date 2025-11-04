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
  _hasHydrated: boolean;
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
  setHasHydrated: (hasHydrated: boolean) => void;
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
      priceRange: { min: 0, max: 100000 },
      currentPage: 1,
      itemsPerPage: 12,
      hasLoadedFromAPI: false,
      _hasHydrated: false,
      setProducts: (products) => {
        set((state) => {
          console.log('setProducts called, current products count:', state.products.length);
          console.log('API products count:', products.length);
          
          // Если уже есть продукты в store (созданные пользователем или загруженные ранее),
          // ВСЕГДА объединяем с ними, никогда не заменяем
          if (state.products.length > 0) {
            const existingIds = new Set(state.products.map(p => p.id));
            const newProducts = products.filter(p => !existingIds.has(p.id));
            const mergedProducts = [...state.products, ...newProducts];
            console.log('Merging products, total after merge:', mergedProducts.length);
            return { 
              products: mergedProducts,
              hasLoadedFromAPI: true 
            };
          }
          
          // Если продуктов нет в store, проверяем localStorage на случай,
          // если гидратация еще не завершилась
          try {
            const stored = localStorage.getItem('products-storage');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed.state && parsed.state.products && parsed.state.products.length > 0) {
                console.log('Found products in localStorage, merging with API products');
                const localStorageProducts = parsed.state.products;
                const existingIds = new Set(localStorageProducts.map((p: Product) => p.id));
                const newProducts = products.filter(p => !existingIds.has(p.id));
                const mergedProducts = [...localStorageProducts, ...newProducts];
                console.log('Merged localStorage and API products, total:', mergedProducts.length);
                return {
                  products: mergedProducts,
                  hasLoadedFromAPI: true
                };
              }
            }
          } catch (err) {
            console.error('Error checking localStorage in setProducts:', err);
          }
          
          // Только если продуктов нет ни в store, ни в localStorage (первая загрузка),
          // устанавливаем продукты из API
          console.log('No existing products found, setting API products');
          return { 
            products,
            hasLoadedFromAPI: true 
          };
        });
      },
      addProduct: (productData) => {
        const state = get();
        console.log('addProduct called with:', productData);
        console.log('Current products count:', state.products.length);
        const newId = state.getNextId();
        console.log('Generated new ID:', newId);
        const newProduct: Product = {
          ...productData,
          id: newId,
          rating: { rate: 0, count: 0 },
        };
        console.log('New product:', newProduct);
        set((currentState) => {
          const updatedProducts = [newProduct, ...currentState.products];
          console.log('Updated products count:', updatedProducts.length);
          console.log('First product in list:', updatedProducts[0]);
          // Расширяем диапазон цены, чтобы новый продукт точно попадал в выборку
          const newMaxPrice = Math.max(currentState.priceRange.max, productData.price);
          const newMinPrice = Math.min(currentState.priceRange.min, productData.price);
          
          return {
            products: updatedProducts,
            currentPage: 1, // Сбрасываем на первую страницу, чтобы новый товар был виден
            searchQuery: '', // Сбрасываем поиск, чтобы новый продукт был виден
            categoryFilter: '', // Сбрасываем фильтр категории, чтобы новый продукт был виден
            priceRange: { 
              min: newMinPrice, 
              max: newMaxPrice // Расширяем максимум, чтобы новый продукт был виден
            },
            filter: 'all', // Сбрасываем фильтр на "Все товары", чтобы новый продукт был виден
            // Если продуктов еще не было загружено из API, но пользователь создал продукт,
            // устанавливаем флаг, чтобы предотвратить загрузку из API при следующем визите
            // (но только если продуктов нет - иначе сохраняем текущее значение)
            hasLoadedFromAPI: currentState.products.length === 0 ? false : currentState.hasLoadedFromAPI,
          };
        });
        // Проверяем, что состояние обновилось
        setTimeout(() => {
          const finalState = get();
          console.log('Final products count after addProduct:', finalState.products.length);
          console.log('First product:', finalState.products[0]);
        }, 100);
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
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      getNextId: () => {
        const state = get();
        // Всегда начинаем с ID >= 1000 для созданных пользователем продуктов
        // Это гарантирует отсутствие конфликтов с API продуктами (1-20)
        if (state.products.length === 0) {
          return 1000;
        }
        
        // Находим максимальный ID среди всех продуктов
        const maxId = Math.max(
          ...state.products.map((p) => p.id),
          999 // Минимальное значение для пользовательских продуктов
        );
        
        // Если максимальный ID меньше 1000, начинаем с 1000
        // Иначе инкрементируем на 1
        return maxId >= 1000 ? maxId + 1 : 1000;
      },
    }),
    {
      name: 'products-storage',
      partialize: (state) => ({
        products: state.products,
        favorites: state.favorites,
        hasLoadedFromAPI: state.hasLoadedFromAPI,
      }),
      skipHydration: false,
      onRehydrateStorage: () => {
        console.log('hydration starts');
        return (state: ProductsState | undefined, error?: unknown) => {
          if (error) {
            console.log('an error happened during hydration', error);
            // Устанавливаем флаг даже при ошибке, чтобы компонент не ждал бесконечно
            useProductsStore.getState().setHasHydrated(true);
          } else {
            console.log('hydration finished', state);
            // Устанавливаем флаг завершения гидратации
            useProductsStore.getState().setHasHydrated(true);
            if (state) {
              console.log('Hydration completed, products count:', state.products.length);
            }
          }
        };
      },
    }
  )
);

