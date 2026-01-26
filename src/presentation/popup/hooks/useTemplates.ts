import { useState, useEffect, useCallback } from 'react';
import { sendMessage } from '@infrastructure/chrome/messaging';
import { MESSAGE_TYPES } from '@shared/constants';
import type { TemplateDTO, CreateTemplateDTO } from '@application/dto';

interface UseTemplatesReturn {
  templates: TemplateDTO[];
  loading: boolean;
  error: string | null;
  createTemplate: (data: CreateTemplateDTO) => Promise<boolean>;
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
      setTemplates(response.data);
    } else {
      setError(response.error ?? 'Failed to fetch templates');
    }

    setLoading(false);
  }, []);

  const createTemplate = useCallback(async (data: CreateTemplateDTO): Promise<boolean> => {
    const response = await sendMessage<CreateTemplateDTO, TemplateDTO>(
      MESSAGE_TYPES.CREATE_TEMPLATE,
      data
    );

    if (response.success && response.data) {
      setTemplates((prev) => [...prev, response.data!]);
      return true;
    } else {
      setError(response.error ?? 'Failed to create template');
      return false;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
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
    deleteTemplate,
    refresh: fetchTemplates,
  };
}
