import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, Input, Label, Select, Textarea } from "@/components/ui/primitives";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: { label: string; value: string }[];
};

export function EntityForm({
  title,
  schema,
  fields,
  defaultValues,
  onSubmit,
  onClose
}: {
  title: string;
  schema: ZodTypeAny;
  fields: Field[];
  defaultValues?: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Record<string, unknown>>({ resolver: zodResolver(schema), defaultValues });
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-background/75 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <form className="grid gap-4 p-5 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field) => {
            const error = errors[field.name]?.message as string | undefined;
            return (
              <div key={field.name} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                <Label>{field.label}</Label>
                {field.type === "select" ? (
                  <Select className="mt-1" {...register(field.name)}>
                    {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea className="mt-1" {...register(field.name)} />
                ) : (
                  <Input className="mt-1" type={field.type ?? "text"} {...register(field.name)} />
                )}
                {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
              </div>
            );
          })}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Save</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
