import React, { useState, useRef, useEffect } from 'react';
import {
  Clipboard,
  MousePointer2,
  TextSelect,
  Calendar,
  Clock,
  CalendarClock,
  FormInput,
  MoveHorizontal,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@ui/button';
import { Input } from '@ui/input';

interface PlaceholderToolbarProps {
  onInsert: (placeholder: string) => void;
}

interface DropdownState {
  isOpen: boolean;
  type: 'date' | 'time' | null;
}

const DATE_FORMATS = [
  { format: 'YYYY-MM-DD', example: '2024-01-15' },
  { format: 'MM/DD/YYYY', example: '01/15/2024' },
  { format: 'DD/MM/YYYY', example: '15/01/2024' },
  { format: 'MMM D, YYYY', example: 'Jan 15, 2024' },
  { format: 'MMMM D, YYYY', example: 'January 15, 2024' },
  { format: 'D MMM YYYY', example: '15 Jan 2024' },
  { format: 'ddd, MMM D', example: 'Mon, Jan 15' },
];

const TIME_FORMATS = [
  { format: 'HH:mm', example: '14:30' },
  { format: 'HH:mm:ss', example: '14:30:45' },
  { format: 'h:mm A', example: '2:30 PM' },
  { format: 'h:mm:ss A', example: '2:30:45 PM' },
];

export function PlaceholderToolbar({
  onInsert,
}: PlaceholderToolbarProps): React.ReactElement {
  const [dropdown, setDropdown] = useState<DropdownState>({ isOpen: false, type: null });
  const [inputLabel, setInputLabel] = useState('');
  const [showInputPrompt, setShowInputPrompt] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdown({ isOpen: false, type: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBasicInsert = (placeholder: string) => {
    onInsert(`<${placeholder}>`);
  };

  const handleDateFormatSelect = (format: string) => {
    onInsert(`<date:${format}>`);
    setDropdown({ isOpen: false, type: null });
  };

  const handleTimeFormatSelect = (format: string) => {
    onInsert(`<time:${format}>`);
    setDropdown({ isOpen: false, type: null });
  };

  const handleInputSubmit = () => {
    if (inputLabel.trim()) {
      onInsert(`<input:${inputLabel.trim()}>`);
      setInputLabel('');
    }
    setShowInputPrompt(false);
  };

  const toggleDropdown = (type: 'date' | 'time') => {
    if (dropdown.isOpen && dropdown.type === type) {
      setDropdown({ isOpen: false, type: null });
    } else {
      setDropdown({ isOpen: true, type });
    }
  };

  const isDateActive = dropdown.isOpen && dropdown.type === 'date';
  const isTimeActive = dropdown.isOpen && dropdown.type === 'time';

  return (
    <div className="placeholder-toolbar">
      <span className="placeholder-toolbar-label">Insert:</span>

      <div className="placeholder-toolbar-group">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleBasicInsert('clipboard')}
          title="Insert clipboard content"
        >
          <Clipboard size={12} />
          Clipboard
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleBasicInsert('cursor')}
          title="Insert cursor position marker"
        >
          <MousePointer2 size={12} />
          Cursor
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleBasicInsert('selection')}
          title="Insert selected text"
        >
          <TextSelect size={12} />
          Selection
        </Button>
      </div>

      <div className="placeholder-toolbar-divider" />

      <div className="placeholder-toolbar-group" ref={dropdownRef}>
        <div className="relative">
          <Button
            type="button"
            variant={isDateActive ? 'default' : 'secondary'}
            size="sm"
            onClick={() => toggleDropdown('date')}
            title="Insert date"
          >
            <Calendar size={12} />
            Date
            <ChevronDown size={10} />
          </Button>
          {isDateActive && (
            <div className="placeholder-dropdown">
              {DATE_FORMATS.map((item) => (
                <button
                  key={item.format}
                  type="button"
                  className="placeholder-dropdown-item"
                  onClick={() => handleDateFormatSelect(item.format)}
                >
                  <span className="placeholder-dropdown-format">{item.format}</span>
                  <span className="placeholder-dropdown-example">{item.example}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <Button
            type="button"
            variant={isTimeActive ? 'default' : 'secondary'}
            size="sm"
            onClick={() => toggleDropdown('time')}
            title="Insert time"
          >
            <Clock size={12} />
            Time
            <ChevronDown size={10} />
          </Button>
          {isTimeActive && (
            <div className="placeholder-dropdown">
              {TIME_FORMATS.map((item) => (
                <button
                  key={item.format}
                  type="button"
                  className="placeholder-dropdown-item"
                  onClick={() => handleTimeFormatSelect(item.format)}
                >
                  <span className="placeholder-dropdown-format">{item.format}</span>
                  <span className="placeholder-dropdown-example">{item.example}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleBasicInsert('datetime')}
          title="Insert date and time"
        >
          <CalendarClock size={12} />
          DateTime
        </Button>
      </div>

      <div className="placeholder-toolbar-divider" />

      <div className="placeholder-toolbar-group">
        {showInputPrompt ? (
          <div className="placeholder-input-group">
            <Input
              type="text"
              value={inputLabel}
              onChange={(e) => setInputLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInputSubmit();
                if (e.key === 'Escape') setShowInputPrompt(false);
              }}
              placeholder="Label..."
              autoFocus
              className="placeholder-input"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={handleInputSubmit}
            >
              <Check size={12} />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              onClick={() => setShowInputPrompt(false)}
            >
              <X size={12} />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowInputPrompt(true)}
            title="Insert user input prompt"
          >
            <FormInput size={12} />
            Input
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleBasicInsert('tab:1')}
          title="Insert tab stop"
        >
          <MoveHorizontal size={12} />
          Tab
        </Button>
      </div>
    </div>
  );
}
