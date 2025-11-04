'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsStore } from '@/store/productsStore';
import { fetchProductById } from '@/services/api';
import { Product } from '@/types';

interface FormErrors {
  title?: string;
  price?: string;
  description?: string;
  category?: string;
  image?: string;
}

interface EditProductClientProps {
  id: string;
}

export default function EditProductClient({ id }: EditProductClientProps) {
  const router = useRouter();
  const { products, updateProduct } = useProductsStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    image: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const loadProduct = async () => {
      const productId = Number(id);
      if (isNaN(productId)) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Сначала проверяем в store
        const productInStore = products.find((p) => p.id === productId);
        if (productInStore) {
          setProduct(productInStore);
          setFormData({
            title: productInStore.title,
            price: productInStore.price.toString(),
            description: productInStore.description,
            category: productInStore.category,
            image: productInStore.image,
          });
        } else {
          // Если нет в store, загружаем из API
          const fetchedProduct = await fetchProductById(productId);
          if (fetchedProduct) {
            setProduct(fetchedProduct);
            setFormData({
              title: fetchedProduct.title,
              price: fetchedProduct.price.toString(),
              description: fetchedProduct.description,
              category: fetchedProduct.category,
              image: fetchedProduct.image,
            });
          }
          // Если null, product останется null и покажется сообщение "Товар не найден"
        }
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, products]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && product) {
      updateProduct(product.id, {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        category: formData.category.trim(),
        image: formData.image.trim(),
      });
      router.push(`/products/${product.id}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Товар не найден</h2>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <button
          onClick={() => router.push(`/products/${product.id}`)}
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
          Вернуться к продукту
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Редактировать продукт</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                Категория * (можно выбрать из списка или ввести свою)
              </label>
              <input
                type="text"
                id="category"
                name="category"
                list="category-options"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.category
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Введите или выберите категорию"
              />
              <datalist id="category-options">
                <option value="electronics">Электроника / Electronics</option>
                <option value="jewelery">Ювелирные изделия / Jewelry</option>
                <option value="men's clothing">Мужская одежда / Men's Clothing</option>
                <option value="women's clothing">Женская одежда / Women's Clothing</option>
                <option value="Электроника">Электроника</option>
                <option value="Ювелирные изделия">Ювелирные изделия</option>
                <option value="Мужская одежда">Мужская одежда</option>
                <option value="Женская одежда">Женская одежда</option>
              </datalist>
              {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
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
                Сохранить изменения
              </button>
              <button
                type="button"
                onClick={() => router.push(`/products/${product.id}`)}
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

