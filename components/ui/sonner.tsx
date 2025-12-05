"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:gap-3 group-[.toaster]:font-sans",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-full group-[.toast]:px-4",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-full",
          error:
            "group-[.toaster]:text-red-600 group-[.toaster]:border-red-100 group-[.toaster]:bg-red-50",
          success:
            "group-[.toaster]:text-green-600 group-[.toaster]:border-green-100 group-[.toaster]:bg-green-50",
          warning:
            "group-[.toaster]:text-orange-600 group-[.toaster]:border-orange-100 group-[.toaster]:bg-orange-50",
          info: "group-[.toaster]:text-blue-600 group-[.toaster]:border-blue-100 group-[.toaster]:bg-blue-50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
