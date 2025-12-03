"use client";

// Import de tipos únicamente para evitar errores TS sin añadir runtime
import type { LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>; // atributos nativos de <label>

function Label({ className, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={
        `flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50` +
        (className ? ` ${className}` : "")
      }
      {...props}
    />
  );
}

export { Label };
