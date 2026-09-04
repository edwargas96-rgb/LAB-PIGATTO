import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "type">
>(({ className, ...props }, ref) => {
  const [mostrar, setMostrar] = React.useState(false);
  return (
    <div className="relative">
      <Input
        type={mostrar ? "text" : "password"}
        className={cn("pr-9", className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        onClick={() => setMostrar((v) => !v)}
        aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
        className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {mostrar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
