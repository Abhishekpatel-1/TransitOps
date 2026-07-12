import { ChevronDown, ChevronUp, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState, Input, Skeleton } from "@/components/ui/primitives";
import { cn, titleCase } from "@/lib/utils";

export type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export function statusTone(status?: string): "default" | "success" | "warning" | "danger" | "muted" {
  if (!status) return "muted";
  if (["AVAILABLE", "COMPLETED", "CLOSED"].includes(status)) return "success";
  if (["DRAFT", "SCHEDULED", "OFF_DUTY"].includes(status)) return "warning";
  if (["CANCELLED", "SUSPENDED", "RETIRED"].includes(status)) return "danger";
  return "default";
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{titleCase(status)}</Badge>;
}

export function DataTable<T extends { id: string }>({
  title,
  description,
  columns,
  rows,
  loading,
  search,
  onSearch,
  onCreate,
  onEdit,
  onDelete,
  actions,
  sortBy,
  sortOrder,
  onSort
}: {
  title: string;
  description: string;
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  search: string;
  onSearch: (value: string) => void;
  onCreate?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
}) {
  return (
    <Card>
      <div className="flex flex-col gap-4 border-b p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => onSearch(event.target.value)} className="w-full pl-9 sm:w-64" placeholder="Search" />
          </div>
          {onCreate && <Button onClick={onCreate}><Plus className="h-4 w-4" /> New</Button>}
        </div>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>
        ) : rows.length === 0 ? (
          <div className="p-5"><EmptyState title="No records found" body="Adjust filters or create a new record." /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className="whitespace-nowrap px-4 py-3 text-left font-medium">
                    <button disabled={!column.sortable || !onSort} onClick={() => onSort?.(String(column.key))} className={cn("inline-flex items-center gap-1", column.sortable && "hover:text-foreground")}>
                      {column.label}
                      {sortBy === column.key && (sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                    </button>
                  </th>
                ))}
                {(onEdit || onDelete || actions) && <th className="px-4 py-3 text-right font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {columns.map((column) => <td key={String(column.key)} className="whitespace-nowrap px-4 py-3">{column.render ? column.render(row) : String((row as Record<string, unknown>)[String(column.key)] ?? "")}</td>)}
                  {(onEdit || onDelete || actions) && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {actions?.(row)}
                        {onEdit && <Button aria-label="Edit row" variant="ghost" size="icon" onClick={() => onEdit(row)}><Pencil className="h-4 w-4" /></Button>}
                        {onDelete && <Button aria-label="Delete row" variant="ghost" size="icon" onClick={() => onDelete(row)}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}
