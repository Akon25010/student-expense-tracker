
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const dataFile = path.join(__dirname, "expenses.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function readExpenses() {
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveExpenses(expenses) {
  fs.writeFileSync(dataFile, JSON.stringify(expenses, null, 2));
}

// Get all expenses
app.get("/api/expenses", (req, res) => {
  res.json(readExpenses());
});

// Add an expense
app.post("/api/expenses", (req, res) => {
  const { title, category, amount, date } = req.body;

  if (
    typeof title !== "string" || !title.trim() ||
    typeof category !== "string" || !category.trim() ||
    !Number.isFinite(Number(amount)) || Number(amount) <= 0 ||
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)
  ) {
    return res.status(400).json({
      error: "Please enter valid expense details."
    });
  }

  const expenses = readExpenses();

  const expense = {
    id: Date.now(),
    title: title.trim(),
    category: category.trim(),
    amount: Number(amount),
    date
  };

  expenses.push(expense);
  saveExpenses(expenses);

  res.status(201).json(expense);
});

// Delete an expense
app.delete("/api/expenses/:id", (req, res) => {
  const expenses = readExpenses();

  const updated = expenses.filter(
    expense => expense.id !== Number(req.params.id)
  );

  if (updated.length === expenses.length) {
    return res.status(404).json({ error: "Expense not found." });
  }

  saveExpenses(updated);
  res.json({ message: "Expense deleted successfully." });
});

app.listen(PORT, () => {
  console.log(`Student Expense Tracker running at http://localhost:${PORT}`);
});
