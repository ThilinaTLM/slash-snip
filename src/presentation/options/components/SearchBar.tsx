import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({
  value,
  onChange,
}: SearchBarProps): React.ReactElement {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search templates..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search templates"
      />
    </div>
  );
}
