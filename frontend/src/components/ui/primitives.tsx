import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />;
export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h3 className={cn("text-base font-semibold", className)} {...props} />;
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-5 pt-0", className)} {...props} />;
export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => <input className={cn("flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
export const Select = ({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => <select className={cn("flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />;
export const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea className={cn("min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props} />;
export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label className={cn("text-sm font-medium text-foreground", className)} {...props} />;
export const Badge = ({ className, tone = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "success" | "warning" | "danger" | "muted" }) => (
  <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", {
    "border-primary/25 bg-primary/15 text-primary": tone === "default",
    "border-accent/25 bg-accent/15 text-accent": tone === "success",
    "border-secondary/25 bg-secondary/15 text-secondary": tone === "warning",
    "border-destructive/25 bg-destructive/15 text-destructive": tone === "danger",
    "border-border bg-muted text-muted-foreground": tone === "muted"
  }, className)} {...props} />
);
export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
export const EmptyState = ({ title, body }: { title: string; body: string }) => <div className="rounded-lg border border-dashed p-8 text-center"><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{body}</p></div>;
