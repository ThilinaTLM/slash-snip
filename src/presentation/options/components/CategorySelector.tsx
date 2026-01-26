import React from 'react';
import type { CategoryDTO } from '@application/dto';

interface CategorySelectorProps {
  categories: CategoryDTO[];
  value: string | undefined;
  onChange: (categoryId: string | undefined) => void;
  onCreateNew?: () => void;
}

interface CategoryOption {
  id: string;
  name: string;
  level: number;
}

function buildCategoryOptions(
  categories: CategoryDTO[],
  parentId?: string,
  level = 0
): CategoryOption[] {
  const result: CategoryOption[] = [];
  const children = categories.filter((c) =>
    parentId ? c.parentId === parentId : !c.parentId
  );

  for (const child of children) {
    result.push({
      id: child.id,
      name: child.name,
      level,
    });
    result.push(...buildCategoryOptions(categories, child.id, level + 1));
  }

  return result;
}

export function CategorySelector({
  categories,
  value,
  onChange,
  onCreateNew,
}: CategorySelectorProps): React.ReactElement {
  const options = buildCategoryOptions(categories);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '__create_new__') {
      onCreateNew?.();
      return;
    }
    onChange(selectedValue === '' ? undefined : selectedValue);
  };

  return (
    <div className="category-selector">
      <select
        value={value ?? ''}
        onChange={handleChange}
        className="category-select"
      >
        <option value="">No category</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {'  '.repeat(option.level)}{option.level > 0 ? '└ ' : ''}{option.name}
          </option>
        ))}
        {onCreateNew && (
          <>
            <option disabled>─────────────</option>
            <option value="__create_new__">+ Create new category...</option>
          </>
        )}
      </select>
    </div>
  );
}
