export function pagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(query.pageSize ?? 10), 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function sortBy(query: Record<string, unknown>, allowed: string[], fallback = "createdAt") {
  const field = typeof query.sortBy === "string" && allowed.includes(query.sortBy) ? query.sortBy : fallback;
  const direction = query.sortOrder === "asc" ? "asc" : "desc";
  return { [field]: direction };
}

export const contains = (value?: unknown) => (typeof value === "string" && value.trim() ? { contains: value.trim(), mode: "insensitive" as const } : undefined);
