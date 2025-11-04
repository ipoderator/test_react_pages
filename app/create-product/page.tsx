'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsStore } from '@/store/productsStore';

interface FormErrors {
  title?: string;
  price?: string;
  description?: string;
  category?: string;
  image?: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { addProduct, products } = useProductsStore();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    image: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  // Получаем категории из существующих продуктов
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [products]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Название обязательно';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Название должно содержать минимум 3 символа';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Цена обязательна';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        newErrors.price = 'Цена должна быть положительным числом';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Описание должно содержать минимум 10 символов';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Категория обязательна';
    }

    if (!formData.image.trim()) {
      newErrors.image = 'URL изображения обязателен';
    } else {
      try {
        new URL(formData.image);
      } catch {
        newErrors.image = 'Введите корректный URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const productData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        category: formData.category.trim(),
        image: formData.image.trim(),
      };
      
      try {
        console.log('Creating product:', productData);
        
        // Добавляем продукт
        addProduct(productData);
        
        // Даем время для первоначального сохранения
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Ждем, пока Zustand сохранит в localStorage
        // Проверяем несколько раз, что продукт был добавлен и сохранен
        let attempts = 0;
        const maxAttempts = 30;
        let productSaved = false;
        
        while (attempts < maxAttempts && !productSaved) {
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Проверяем, что продукт есть в store
          const currentState = useProductsStore.getState();
          const productExists = currentState.products.some(
            p => p.title === productData.title && 
                 Math.abs(p.price - productData.price) < 0.01 &&
                 p.description === productData.description &&
                 p.category === productData.category
          );
          
          if (productExists) {
            // Проверяем, что продукт сохранен в localStorage
            try {
              const stored = localStorage.getItem('products-storage');
              if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.state && parsed.state.products) {
                  const hasProduct = parsed.state.products.some(
                    (p: any) => p.title === productData.title &&
                                Math.abs(p.price - productData.price) < 0.01 &&
                                p.description === productData.description &&
                                p.category === productData.category
                  );
                  if (hasProduct) {
                    console.log('Product saved successfully in localStorage');
                    productSaved = true;
                    break;
                  }
                }
              }
            } catch (err) {
              console.error('Error checking localStorage:', err);
            }
          }
          
          attempts++;
        }
        
        if (productSaved) {
          console.log('Product created successfully, redirecting...');
        } else {
          console.warn('Product may not have been saved, but redirecting anyway...');
          // Даем дополнительное время для сохранения
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        router.push('/products');
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Произошла ошибка при создании продукта. Попробуйте еще раз.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Сохраняем значение как есть, без дополнительной обработки для поддержки Unicode
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    
    // Если выбрана категория из списка, скрываем поле для ввода своей категории
    if (name === 'category' && value && categories.includes(value)) {
      setShowCustomCategory(false);
    }
  };
  
  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomCategory(true);
      setFormData((prev) => ({ ...prev, category: '' }));
    } else {
      setShowCustomCategory(false);
      setFormData((prev) => ({ ...prev, category: value }));
    }
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => router.push('/products')}
          className="mb-6 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Вернуться к списку
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Создать продукт</h1>
          <form onSubmit={handleSubmit} className="space-y-6" acceptCharset="UTF-8">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Название *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Введите название продукта"
                autoComplete="off"
                lang="ru"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Цена (руб.) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              {!showCustomCategory ? (
                <>
                  <select
                    id="category-select"
                    value={formData.category || ''}
                    onChange={handleCategorySelect}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.category
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Выберите категорию</option>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="electronics">electronics</option>
                        <option value="jewelery">jewelery</option>
                        <option value="men's clothing">men's clothing</option>
                        <option value="women's clothing">women's clothing</option>
                      </>
                    )}
                    <option value="custom">Ввести свою категорию</option>
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </>
              ) : (
                <div>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.category
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Введите свою категорию"
                    autoComplete="off"
                    lang="ru"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomCategory(false);
                      setFormData((prev) => ({ ...prev, category: '' }));
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Выбрать из списка
                  </button>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Введите описание продукта"
                autoComplete="off"
                lang="ru"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                URL изображения *
              </label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.image
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Создать продукт
              </button>
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

