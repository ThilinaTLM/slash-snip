import React from 'react';
import type { GroupDTO } from '@application/dto';
import { Select, SelectItem, SelectSeparator } from '@ui/index';

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
  const handleChange = (selectedValue: string) => {
    if (selectedValue === '__create_new__') {
      onCreateNew?.();
      return;
    }
    onChange(selectedValue === '' ? undefined : selectedValue);
  };

  return (
    <Select
      value={value ?? ''}
      onValueChange={handleChange}
      placeholder="No group"
    >
      <SelectItem value="">No group</SelectItem>
      {groups.map((group) => (
        <SelectItem key={group.id} value={group.id}>
          {group.name}
        </SelectItem>
      ))}
      {onCreateNew && (
        <>
          <SelectSeparator />
          <SelectItem value="__create_new__">+ Create new group...</SelectItem>
        </>
      )}
    </Select>
  );
}
