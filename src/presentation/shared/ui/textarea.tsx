import * as React from "react";
import { cn } from "@lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  mono?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, mono = false, ...props }, ref) => {
    return (
      <textarea
        className={cn("textarea", mono && "textarea-mono", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
