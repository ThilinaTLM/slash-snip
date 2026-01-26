import { useMemo } from 'react';
import type { TemplateDTO } from '@application/dto';
import { fuzzySearch } from '@shared/utils/fuzzySearch';

/**
 * Hook for client-side template filtering with fuzzy search
 * Searches by trigger, name, content, and tags
 * Returns templates sorted by relevance when searching
 */
export function useTemplateSearch(
  templates: TemplateDTO[],
  query: string
): TemplateDTO[] {
  return useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return templates;
    }

    const results = fuzzySearch(templates, trimmed, (template) => [
      template.trigger,
      template.name,
      template.content,
      ...template.tags,
    ]);

    return results.map((result) => result.item);
  }, [templates, query]);
}
