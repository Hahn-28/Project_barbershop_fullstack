"use client";


type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// Contenedor raíz: solo controla si se muestra o no mediante estado externo
function AlertDialog(props: DivProps) {
  return <div data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger(props: ButtonProps) {
  return <button data-slot="alert-dialog-trigger" {...props} />;
}

function AlertDialogPortal(props: DivProps) {
  return <div data-slot="alert-dialog-portal" {...props} />;
}

function AlertDialogOverlay({ className, ...props }: DivProps) {
  return (
    <div
      data-slot="alert-dialog-overlay"
      className={
        "fixed inset-0 z-50 bg-black/50 " + (className ?? "")
      }
      {...props}
    />
  );
}

function AlertDialogContent({ className, ...props }: DivProps) {
  return (
    <div
      data-slot="alert-dialog-content"
      className={
        "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg sm:max-w-lg " +
        (className ?? "")
      }
      {...props}
    />
  );
}

function AlertDialogHeader({ className, ...props }: DivProps) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={
        "flex flex-col gap-2 text-center sm:text-left " + (className ?? "")
      }
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: DivProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end " +
        (className ?? "")
      }
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: DivProps) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={"text-lg font-semibold " + (className ?? "")}
      {...props}
    />
  );
}

function AlertDialogDescription({ className, ...props }: DivProps) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={"text-muted-foreground text-sm " + (className ?? "")}
      {...props}
    />
  );
}

function AlertDialogAction({ className, ...props }: ButtonProps) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-md bg-gold px-4 py-2 text-sm font-medium text-dark hover:bg-gold/90 " +
        (className ?? "")
      }
      {...props}
    />
  );
}

function AlertDialogCancel({ className, ...props }: ButtonProps) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-100 " +
        (className ?? "")
      }
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
