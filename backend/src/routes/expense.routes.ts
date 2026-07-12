import { Router } from "express";
import { createExpense, deleteExpense, listExpenses, updateExpense } from "../controllers/expense.controller.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { idParam, listQuery } from "../validators/common.js";
import { expenseSchema } from "../validators/domain.js";

export const expenseRouter = Router();
expenseRouter.use(requireAuth, allowRoles("FLEET_MANAGER", "FINANCIAL_ANALYST"));
expenseRouter.get("/", validate(listQuery), asyncHandler(listExpenses));
expenseRouter.post("/", validate(expenseSchema), allowRoles("FLEET_MANAGER"), asyncHandler(createExpense));
expenseRouter.put("/:id", validate(idParam.merge(expenseSchema)), allowRoles("FLEET_MANAGER"), asyncHandler(updateExpense));
expenseRouter.delete("/:id", validate(idParam), allowRoles("FLEET_MANAGER"), asyncHandler(deleteExpense));
