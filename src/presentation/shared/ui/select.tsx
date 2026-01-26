import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onValueChange, children, placeholder, className, disabled }, ref) => {
    const handleChange = (newValue: string | null) => {
      if (newValue !== null) {
        onValueChange(newValue);
      }
    };

    return (
      <BaseSelect.Root value={value} onValueChange={handleChange} disabled={disabled}>
        <BaseSelect.Trigger
          ref={ref}
          className={cn("select-trigger", className)}
        >
          <BaseSelect.Value placeholder={placeholder} />
          <BaseSelect.Icon className="select-icon">
            <ChevronDown size={14} />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner sideOffset={4}>
            <BaseSelect.Popup className="select-popup">
              {children}
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    );
  }
);
Select.displayName = "Select";

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, disabled }, ref) => {
    return (
      <BaseSelect.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className="select-item"
      >
        <BaseSelect.ItemIndicator className="select-item-indicator">
          <Check size={12} />
        </BaseSelect.ItemIndicator>
        <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      </BaseSelect.Item>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectSeparator = () => <div className="select-separator" />;

export { Select, SelectItem, SelectSeparator };
