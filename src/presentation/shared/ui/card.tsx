import * as React from "react";
import { cn } from "@lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-header", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

interface CardIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardIcon = React.forwardRef<HTMLDivElement, CardIconProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("card-icon", className)} {...props}>
      {children}
    </div>
  )
);
CardIcon.displayName = "CardIcon";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("card-title", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("card-description", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-content", className)} {...props} />
));
CardContent.displayName = "CardContent";

interface CardRowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardRow = React.forwardRef<HTMLDivElement, CardRowProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-row", className)} {...props} />
  )
);
CardRow.displayName = "CardRow";

const CardRowLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-row-label", className)} {...props} />
));
CardRowLabel.displayName = "CardRowLabel";

const CardRowTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-row-title", className)} {...props} />
));
CardRowTitle.displayName = "CardRowTitle";

const CardRowDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("card-row-description", className)} {...props} />
));
CardRowDescription.displayName = "CardRowDescription";

export {
  Card,
  CardHeader,
  CardIcon,
  CardTitle,
  CardDescription,
  CardContent,
  CardRow,
  CardRowLabel,
  CardRowTitle,
  CardRowDescription,
};
