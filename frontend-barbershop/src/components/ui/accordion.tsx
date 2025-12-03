"use client";

type AccordionProps = React.HTMLAttributes<HTMLDivElement>;

function Accordion(props: AccordionProps) {
  return <div data-slot="accordion" {...props} />;
}

type AccordionItemProps = React.HTMLAttributes<HTMLDivElement>;

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <div
      data-slot="accordion-item"
      className={"border-b last:border-b-0 " + (className ?? "")}
      {...props}
    />
  );
}

type AccordionTriggerProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  };

function AccordionTrigger({ className, children, ...props }: AccordionTriggerProps) {
  return (
    <button
      data-slot="accordion-trigger"
      className={
        "flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium outline-none hover:underline " +
        (className ?? "")
      }
      {...props}
    >
      {children}
      <span className="text-muted-foreground text-xs">˅</span>
    </button>
  );
}

type AccordionContentProps = React.HTMLAttributes<HTMLDivElement>;

function AccordionContent({ className, children, ...props }: AccordionContentProps) {
  return (
    <div
      data-slot="accordion-content"
      className={"overflow-hidden text-sm pt-0 pb-4 " + (className ?? "")}
      {...props}
    >
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
