import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { pagination, sortBy } from "../utils/query.js";

export async function listExpenses(req: Request, res: Response) {
  const { skip, take, page, pageSize } = pagination(req.query);
  const where = {
    AND: [
      req.query.status ? { vehicle: { status: req.query.status as never } } : {},
      req.query.type ? { expenseType: req.query.type as never } : {},
      req.query.region ? { vehicle: { region: req.query.region as string } } : {},
      req.query.startDate ? { date: { gte: new Date(req.query.startDate as string) } } : {},
      req.query.endDate ? { date: { lte: new Date(req.query.endDate as string) } } : {}
    ]
  };
  const [data, total] = await Promise.all([
    prisma.expense.findMany({ where, skip, take, orderBy: sortBy(req.query, ["createdAt", "date", "amount", "expenseType"]), include: { vehicle: true } }),
    prisma.expense.count({ where })
  ]);
  res.json({ data, meta: { total, page, pageSize } });
}

export async function createExpense(req: Request, res: Response) {
  const data = await prisma.expense.create({ data: { ...req.body, date: new Date(req.body.date) }, include: { vehicle: true } });
  res.status(201).json(data);
}

export async function updateExpense(req: Request, res: Response) {
  const data = await prisma.expense.update({ where: { id: String(req.params.id) }, data: { ...req.body, date: new Date(req.body.date) }, include: { vehicle: true } });
  res.json(data);
}

export async function deleteExpense(req: Request, res: Response) {
  await prisma.expense.delete({ where: { id: String(req.params.id) } });
  res.status(204).send();
}
