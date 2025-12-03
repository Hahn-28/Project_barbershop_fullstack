import * as React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
};

function baseClasses() {
  return "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";
}

function variantClasses(variant: ButtonProps["variant"]) {
  switch (variant) {
    case "destructive":
      return "bg-destructive text-white hover:bg-destructive/90";
    case "outline":
      return "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground";
    case "secondary":
      return "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    case "ghost":
      return "hover:bg-accent hover:text-accent-foreground";
    case "link":
      return "text-primary underline-offset-4 hover:underline";
    default:
      return "bg-primary text-primary-foreground hover:bg-primary/90";
  }
}

function sizeClasses(size: ButtonProps["size"]) {
  switch (size) {
    case "sm":
      return "h-8 rounded-md gap-1.5 px-3";
    case "lg":
      return "h-10 rounded-md px-6";
    case "icon":
      return "size-9 rounded-md";
    default:
      return "h-9 px-4 py-2";
  }
}

function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
  const classes = [baseClasses(), variantClasses(variant), sizeClasses(size), className]
    .filter(Boolean)
    .join(" ");
  return (
    <button data-slot="button" className={classes} {...props} />
  );
}

export { Button };
