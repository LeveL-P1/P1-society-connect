import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { logCreated } from "@/lib/activity-log";
import { EXPENSE_CATEGORY_IDS } from "@/lib/finance-categories";

function fiscalYearFor(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return month >= 4 ? `${year}-${String(year + 1).slice(-2)}` : `${year - 1}-${String(year).slice(-2)}`;
}

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.societyId || !["chairman", "secretary", "treasurer"].includes(session.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const month = searchParams.get("month") || "";

  const where: Record<string, unknown> = { societyId: session!.societyId };

  if (category) where.category = category;
  if (month) {
    const [year, m] = month.split("-").map(Number);
    where.paidOn = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    };
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { paidOn: "desc" },
  });

  const total = expenses.reduce((s: number, e: any) => s + e.amount, 0);

  return Response.json({ expenses, total });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.societyId || !["chairman", "secretary", "treasurer"].includes(session.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, amount, category, paidTo, paidOn, notes } = body;

    const parsedAmount = parseFloat(amount);
    if (!title || !amount || !category || !paidOn || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return Response.json({ error: "Title, amount, category, and date are required" }, { status: 400 });
    }
    if (!EXPENSE_CATEGORY_IDS.has(category)) {
      return Response.json({ error: "Invalid expense category" }, { status: 400 });
    }

    const expenseDate = new Date(paidOn);
    const expense = await prisma.$transaction(async (tx: any) => {
      const created = await tx.expense.create({
        data: {
          societyId: session!.societyId,
          title: title.trim(),
          amount: parsedAmount,
          category,
          paidTo: paidTo?.trim() || null,
          paidOn: expenseDate,
          notes: notes?.trim() || null,
          netPayable: parsedAmount,
        },
      });

      await tx.budget.updateMany({
        where: {
          societyId: session!.societyId,
          fiscalYear: fiscalYearFor(expenseDate),
          category,
        },
        data: { actual: { increment: parsedAmount } },
      });

      return created;
    });

    await logCreated("expense", expense.id, `${title} - ₹${amount}`, {
      category,
      paidTo,
      amount: parseFloat(amount),
    });

    return Response.json({ expense }, { status: 201 });
  } catch {
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
