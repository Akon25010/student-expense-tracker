const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const dataFile = path.join(__dirname, "expense.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function readExpenses() {
  try {
    const data = fs.readFileSync(dataFile, "utf8");
    return data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function saveExpenses(expenses) {
  fs.writeFileSync(dataFile, JSON.stringify(expenses, null, 2));
}

app.get("/api/expenses", (req, res) => {
  try {
    res.json(readExpenses());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not read expenses." });
  }
});

app.post("/api/expenses", (req, res) => {
  const { title, category, amount, date } = req.body;
  if (typeof title !== "string" || !title.trim() ||
      typeof category !== "string" || !category.trim() ||
      !Number.isFinite(Number(amount)) || Number(amount) <= 0 ||
      typeof date !== "string" || !/\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: "Please enter valid expense details." });
  }
  try {
    const expenses = readExpenses();
    const expense = { id: Date.now(), title: title.trim(), category: category.trim(), amount: Number(amount), date };
    expenses.push(expense);
    saveExpenses(expenses);
    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not save expense." });
  }
});

app.delete("/api/expenses/:id", (req, res) => {
  try {
    const expenses = readExpenses();
    const updated = expenses.filter(e => e.id !== Number(req.params.id));
    if (updated.length === expenses.length) return res.status(404).json({ error: "Expense not found." });
    saveExpenses(updated);
    res.json({ message: "Expense deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Could not delete expense." });
  }
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log("Student Expense Tracker running on port " + PORT));
}
