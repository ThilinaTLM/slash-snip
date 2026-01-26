import { useState, useEffect, useCallback } from 'react';
import { sendMessage } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES } from '@shared/constants';
import type { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from '@application/dto';

interface UseCategoriesReturn {
  categories: CategoryDTO[];
  loading: boolean;
  error: string | null;
  createCategory: (data: CreateCategoryDTO) => Promise<CategoryDTO | null>;
  updateCategory: (data: UpdateCategoryDTO) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await sendMessage<void, CategoryDTO[]>(
      MESSAGE_TYPES.GET_CATEGORIES
    );

    if (response.success && response.data) {
      // Sort by order
      const sorted = [...response.data].sort((a, b) => a.order - b.order);
      setCategories(sorted);
    } else {
      setError(response.error ?? 'Failed to fetch categories');
    }

    setLoading(false);
  }, []);

  const createCategory = useCallback(async (data: CreateCategoryDTO): Promise<CategoryDTO | null> => {
    setError(null);
    const response = await sendMessage<CreateCategoryDTO, CategoryDTO>(
      MESSAGE_TYPES.CREATE_CATEGORY,
      data
    );

    if (response.success && response.data) {
      setCategories((prev) => [...prev, response.data!].sort((a, b) => a.order - b.order));
      return response.data;
    } else {
      setError(response.error ?? 'Failed to create category');
      return null;
    }
  }, []);

  const updateCategory = useCallback(async (data: UpdateCategoryDTO): Promise<boolean> => {
    setError(null);
    const response = await sendMessage<UpdateCategoryDTO, CategoryDTO>(
      MESSAGE_TYPES.UPDATE_CATEGORY,
      data
    );

    if (response.success && response.data) {
      setCategories((prev) => {
        const index = prev.findIndex((c) => c.id === data.id);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = response.data!;
        return updated.sort((a, b) => a.order - b.order);
      });
      return true;
    } else {
      setError(response.error ?? 'Failed to update category');
      return false;
    }
  }, []);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    const response = await sendMessage<{ id: string }, void>(
      MESSAGE_TYPES.DELETE_CATEGORY,
      { id }
    );

    if (response.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      return true;
    } else {
      setError(response.error ?? 'Failed to delete category');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories,
  };
}
