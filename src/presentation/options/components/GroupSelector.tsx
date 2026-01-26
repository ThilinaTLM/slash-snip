import React from 'react';
import type { GroupDTO } from '@application/dto';

interface GroupSelectorProps {
  groups: GroupDTO[];
  value: string | undefined;
  onChange: (groupId: string | undefined) => void;
  onCreateNew?: () => void;
}

export function GroupSelector({
  groups,
  value,
  onChange,
  onCreateNew,
}: GroupSelectorProps): React.ReactElement {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '__create_new__') {
      onCreateNew?.();
      return;
    }
    onChange(selectedValue === '' ? undefined : selectedValue);
  };

  return (
    <div className="group-selector">
      <select
        value={value ?? ''}
        onChange={handleChange}
        className="group-select"
      >
        <option value="">No group</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
        {onCreateNew && (
          <>
            <option disabled>─────────────</option>
            <option value="__create_new__">+ Create new group...</option>
          </>
        )}
      </select>
    </div>
  );
}
