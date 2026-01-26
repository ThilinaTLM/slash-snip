import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { cn } from "@lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, className, ...props }, ref) => {
    return (
      <BaseSwitch.Root
        ref={ref}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "switch",
          checked ? "switch-checked" : "switch-unchecked",
          className
        )}
        {...props}
      >
        <BaseSwitch.Thumb
          className={cn(
            "switch-thumb",
            checked ? "switch-thumb-checked" : "switch-thumb-unchecked"
          )}
        />
      </BaseSwitch.Root>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };
