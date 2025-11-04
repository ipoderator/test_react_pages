'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsStore } from '@/store/productsStore';
import { fetchProducts } from '@/services/api';
import { ProductCard } from '@/components/ProductCard';
import { Filter } from '@/components/Filter';

export default function ProductsPage() {
  const router = useRouter();
  const {
    products,
    filter,
    favorites,
    searchQuery,
    categoryFilter,
    priceRange,
    currentPage,
    itemsPerPage,
    hasLoadedFromAPI,
    setProducts,
    setLoading,
    isLoading,
    setSearchQuery,
    setCategoryFilter,
    setPriceRange,
    setCurrentPage,
  } = useProductsStore();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await fetchProducts();
        // fetchProducts теперь возвращает пустой массив при ошибке, а не выбрасывает исключение
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
        // Если пустой массив - это значит API недоступен, но приложение продолжит работать
      } catch (error) {
        console.error('Ошибка загрузки продуктов:', error);
      } finally {
        setLoading(false);
      }
    };

    // Загружаем продукты из API только если их еще нет
    // Но не перезагружаем если уже есть продукты (могут быть созданные пользователем)
    if (products.length === 0 && !hasLoadedFromAPI) {
      loadProducts();
    }
  }, [products.length, hasLoadedFromAPI, setProducts, setLoading]);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Фильтр по избранному
    if (filter === 'favorites') {
      result = result.filter((product) => favorites.includes(product.id));
    }

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
    }

    // Фильтр по категории
    if (categoryFilter) {
      result = result.filter((product) => product.category === categoryFilter);
    }

    // Фильтр по цене
    result = result.filter(
      (product) => product.price >= priceRange.min && product.price <= priceRange.max
    );

    return result;
  }, [products, filter, favorites, searchQuery, categoryFilter, priceRange]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  // Сбрасываем страницу на 1, если текущая страница больше доступных страниц
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, setCurrentPage]);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Список продуктов</h1>
          <button
            onClick={() => router.push('/create-product')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Создать продукт
          </button>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск продуктов..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Filter />

        {/* Дополнительные фильтры */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Категория
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все категории</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цена: {priceRange.min} - {priceRange.max} ₽
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: parseFloat(e.target.value) || 0 })
                }
                min="0"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Мин"
              />
              <input
                type="number"
              value={priceRange.max}
              onChange={(e) =>
                setPriceRange({ ...priceRange, max: parseFloat(e.target.value) || 10000 })
              }
              min="0"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Макс"
            />
            </div>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              {products.length === 0 && !isLoading
                ? 'Продукты не найдены. API может быть временно недоступен.'
                : 'Продукты не найдены'}
            </p>
            {products.length === 0 && !isLoading && (
              <p className="text-gray-400 text-sm">
                Попробуйте создать продукт или обновить страницу позже.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Назад
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
