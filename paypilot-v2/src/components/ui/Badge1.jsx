import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = "default", children, ...props }) {
  const variants = {
    default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
    secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
    outline: "text-foreground",
    success: "border-transparent bg-green-100 text-green-800 hover:bg-green-200", // Custom for Paid status
    warning: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200", // Custom for Pending
  };

  return (
    <div className={cn("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} {...props}>
      {children}
    </div>
  );
}