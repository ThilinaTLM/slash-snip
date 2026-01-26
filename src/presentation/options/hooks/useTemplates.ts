import { useState, useEffect, useCallback } from 'react';
import { sendMessage } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES } from '@shared/constants';
import type { TemplateDTO, CreateTemplateDTO, UpdateTemplateDTO } from '@application/dto';

interface UseTemplatesReturn {
  templates: TemplateDTO[];
  loading: boolean;
  error: string | null;
  createTemplate: (data: CreateTemplateDTO) => Promise<TemplateDTO | null>;
  updateTemplate: (data: UpdateTemplateDTO) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<TemplateDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await sendMessage<void, TemplateDTO[]>(
      MESSAGE_TYPES.GET_TEMPLATES
    );

    if (response.success && response.data) {
      // Sort by updatedAt descending (most recent first)
      const sorted = [...response.data].sort((a, b) => b.updatedAt - a.updatedAt);
      setTemplates(sorted);
    } else {
      setError(response.error ?? 'Failed to fetch templates');
    }

    setLoading(false);
  }, []);

  const createTemplate = useCallback(async (data: CreateTemplateDTO): Promise<TemplateDTO | null> => {
    setError(null);
    const response = await sendMessage<CreateTemplateDTO, TemplateDTO>(
      MESSAGE_TYPES.CREATE_TEMPLATE,
      data
    );

    if (response.success && response.data) {
      setTemplates((prev) => [response.data!, ...prev]);
      return response.data;
    } else {
      setError(response.error ?? 'Failed to create template');
      return null;
    }
  }, []);

  const updateTemplate = useCallback(async (data: UpdateTemplateDTO): Promise<boolean> => {
    setError(null);
    const response = await sendMessage<UpdateTemplateDTO, TemplateDTO>(
      MESSAGE_TYPES.UPDATE_TEMPLATE,
      data
    );

    if (response.success && response.data) {
      setTemplates((prev) => {
        const index = prev.findIndex((t) => t.id === data.id);
        if (index === -1) return prev;
        const updated = [...prev];
        updated[index] = response.data!;
        // Re-sort by updatedAt
        return updated.sort((a, b) => b.updatedAt - a.updatedAt);
      });
      return true;
    } else {
      setError(response.error ?? 'Failed to update template');
      return false;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    const response = await sendMessage<{ id: string }, void>(
      MESSAGE_TYPES.DELETE_TEMPLATE,
      { id }
    );

    if (response.success) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      return true;
    } else {
      setError(response.error ?? 'Failed to delete template');
      return false;
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refresh: fetchTemplates,
  };
}
