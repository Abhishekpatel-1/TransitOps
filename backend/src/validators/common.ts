import { z } from "zod";

export const idParam = z.object({ params: z.object({ id: z.string().min(1) }) });
export const listQuery = z.object({
  query: z.object({
    page: z.coerce.number().optional(),
    pageSize: z.coerce.number().optional(),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    region: z.string().optional(),
    driverId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional()
  }).partial()
});
