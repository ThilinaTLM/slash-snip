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

  return (
    <div className="placeholder-toolbar">
      <span className="toolbar-label">Insert:</span>

      <div className="toolbar-group">
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => handleBasicInsert('clipboard')}
          title="Insert clipboard content"
        >
          <Clipboard size={14} />
          Clipboard
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => handleBasicInsert('cursor')}
          title="Insert cursor position marker"
        >
          <MousePointer2 size={14} />
          Cursor
        </button>
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => handleBasicInsert('selection')}
          title="Insert selected text"
        >
          <TextSelect size={14} />
          Selection
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group" ref={dropdownRef}>
        <div className="toolbar-dropdown">
          <button
            type="button"
            className={`toolbar-btn ${dropdown.isOpen && dropdown.type === 'date' ? 'active' : ''}`}
            onClick={() => toggleDropdown('date')}
            title="Insert date"
          >
            <Calendar size={14} />
            Date
            <ChevronDown size={12} />
          </button>
          {dropdown.isOpen && dropdown.type === 'date' && (
            <div className="toolbar-dropdown-menu">
              {DATE_FORMATS.map((item) => (
                <button
                  key={item.format}
                  type="button"
                  className="toolbar-dropdown-item"
                  onClick={() => handleDateFormatSelect(item.format)}
                >
                  <span className="format-name">{item.format}</span>
                  <span className="format-example">{item.example}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="toolbar-dropdown">
          <button
            type="button"
            className={`toolbar-btn ${dropdown.isOpen && dropdown.type === 'time' ? 'active' : ''}`}
            onClick={() => toggleDropdown('time')}
            title="Insert time"
          >
            <Clock size={14} />
            Time
            <ChevronDown size={12} />
          </button>
          {dropdown.isOpen && dropdown.type === 'time' && (
            <div className="toolbar-dropdown-menu">
              {TIME_FORMATS.map((item) => (
                <button
                  key={item.format}
                  type="button"
                  className="toolbar-dropdown-item"
                  onClick={() => handleTimeFormatSelect(item.format)}
                >
                  <span className="format-name">{item.format}</span>
                  <span className="format-example">{item.example}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="toolbar-btn"
          onClick={() => handleBasicInsert('datetime')}
          title="Insert date and time"
        >
          <CalendarClock size={14} />
          DateTime
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        {showInputPrompt ? (
          <div className="toolbar-input-prompt">
            <input
              type="text"
              value={inputLabel}
              onChange={(e) => setInputLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInputSubmit();
                if (e.key === 'Escape') setShowInputPrompt(false);
              }}
              placeholder="Label for input..."
              autoFocus
            />
            <button
              type="button"
              className="toolbar-btn"
              style={{ padding: '0 6px', minWidth: 24 }}
              onClick={handleInputSubmit}
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              className="toolbar-btn"
              style={{ padding: '0 6px', minWidth: 24 }}
              onClick={() => setShowInputPrompt(false)}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowInputPrompt(true)}
            title="Insert user input prompt"
          >
            <FormInput size={14} />
            Input
          </button>
        )}
        <button
          type="button"
          className="toolbar-btn"
          onClick={() => handleBasicInsert('tab:1')}
          title="Insert tab stop"
        >
          <MoveHorizontal size={14} />
          Tab
        </button>
      </div>
    </div>
  );
}
