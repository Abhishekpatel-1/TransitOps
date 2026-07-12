import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";

export function ConfirmDialog({ open, title, body, onCancel, onConfirm }: { open: boolean; title: string; body: string; onCancel: () => void; onConfirm: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/75 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-secondary" />
          <div>
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirm</Button>
        </div>
      </Card>
    </div>
  );
}
