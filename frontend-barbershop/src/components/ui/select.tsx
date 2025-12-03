"use client";

import * as React from "react";
"use client";

import * as React from "react";

type SelectRootProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
  onValueChange?: (val: string) => void;
};

function Select(props: SelectRootProps) {
  return <div data-slot="select" {...props} />;
}

function SelectGroup(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="select-group" {...props} />;
}

function SelectValue({ className, value }: { className?: string; value?: string }) {
  return <span data-slot="select-value" className={className}>{value ?? ""}</span>;
}

function SelectTrigger({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      data-slot="select-trigger"
      className={"flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm " + (className ?? "")}
      {...props}
    />
  );
}

function SelectContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="select-content"
      className={"relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 shadow-md " + (className ?? "")}
      {...props}
    />
  );
}

function SelectLabel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="select-label" className={"px-2 py-1.5 text-sm font-semibold " + (className ?? "")} {...props} />;
}

function SelectItem({ className, children, onClick, value }: { className?: string; children?: React.ReactNode; onClick?: () => void; value?: string }) {
  return (
    <div
      data-slot="select-item"
      role="option"
      onClick={onClick}
      data-value={value}
      className={"relative flex w-full cursor-pointer select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm " + (className ?? "")}
    >
      <span className="absolute left-2 size-4">✔</span>
      {children}
    </div>
  );
}

function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="select-separator" className={"bg-muted -mx-1 my-1 h-px " + (className ?? "")} {...props} />;
}

function SelectScrollUpButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button data-slot="select-scroll-up-button" className={"flex items-center justify-center py-1 text-muted-foreground " + (className ?? "")} {...props}>˄</button>;
}

function SelectScrollDownButton({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button data-slot="select-scroll-down-button" className={"flex items-center justify-center py-1 text-muted-foreground " + (className ?? "")} {...props}>˅</button>;
}

function SelectViewport({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="select-viewport" className={"p-1 " + (className ?? "")} {...props} />;
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectViewport,
};
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
