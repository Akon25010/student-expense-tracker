
const expenseForm = document.getElementById("expenseForm");
const budgetForm = document.getElementById("budgetForm");
const expenseList = document.getElementById("expenseList");
const message = document.getElementById("message");
const languageToggle = document.getElementById("languageToggle");

let expenses = [];
let budget = Number(localStorage.getItem("studentBudget")) || 0;
let language = localStorage.getItem("studentLanguage") || "en";

const translations = {
  en: {
    brandSubtitle: "STUDENT EXPENSE TRACKER",
    tagline: "Manage your money. Build your future.",
    dashboardTitle: "My Expense Dashboard",
    dashboardSubtitle: "Track your spending and stay within your budget.",
    monthlyBudget: "Monthly Budget",
    totalExpenses: "Total Expenses",
    remainingMoney: "Money Remaining",
    setBudget: "Set Monthly Budget",
    budgetLabel: "Your monthly budget (¥)",
    saveBudget: "Save Budget",
    addExpense: "Add New Expense",
    expenseName: "Expense Name",
    category: "Category",
    food: "Food",
    transport: "Transport",
    shopping: "Shopping",
    education: "Education",
    bills: "Bills",
    entertainment: "Entertainment",
    other: "Other",
    amount: "Amount (¥)",
    date: "Date",
    addButton: "+ Add Expense",
    expenseHistory: "Expense History",
    historySubtitle: "Review and manage your spending.",
    footerTitle: "Student Expense Tracker",
    delete: "Delete",
    noExpenses: "No expenses yet. Add your first expense!",
    invalidBudget: "Please enter a valid budget.",
    budgetSaved: "Monthly budget saved!",
    invalidExpense: "Please enter valid expense details.",
    expenseAdded: "Expense added successfully!",
    expenseDeleted: "Expense deleted.",
    categoryLabel: "Category",
    chooseCategory: "Choose category",
    expenseExample: "Example: Lunch",
    budgetExample: "Example: 100000",
    amountExample: "Example: 850",
    languageButton: "🇯🇵 日本語",
    expenseDate: "Date"
  },

  ja: {
    brandSubtitle: "学生向け支出管理アプリ",
    tagline: "お金を管理して、未来につなげよう。",
    dashboardTitle: "支出管理ダッシュボード",
    dashboardSubtitle: "支出を記録して、予算内で生活しましょう。",
    monthlyBudget: "月間予算",
    totalExpenses: "支出合計",
    remainingMoney: "残りの金額",
    setBudget: "月間予算を設定",
    budgetLabel: "月間予算（円）",
    saveBudget: "予算を保存",
    addExpense: "新しい支出を追加",
    expenseName: "支出の名前",
    category: "カテゴリー",
    food: "食費",
    transport: "交通費",
    shopping: "買い物",
    education: "教育費",
    bills: "光熱費・請求",
    entertainment: "娯楽費",
    other: "その他",
    amount: "金額（円）",
    date: "日付",
    addButton: "＋ 支出を追加",
    expenseHistory: "支出履歴",
    historySubtitle: "支出を確認・管理できます。",
    footerTitle: "学生向け支出管理アプリ",
    delete: "削除",
    noExpenses: "支出はまだありません。最初の支出を追加しましょう！",
    invalidBudget: "正しい予算金額を入力してください。",
    budgetSaved: "月間予算を保存しました！",
    invalidExpense: "正しい支出情報を入力してください。",
    expenseAdded: "支出を追加しました！",
    expenseDeleted: "支出を削除しました。",
    categoryLabel: "カテゴリー",
    chooseCategory: "カテゴリーを選択",
    expenseExample: "例：昼食",
    budgetExample: "例：100000",
    amountExample: "例：850",
    languageButton: "🇬🇧 English",
    expenseDate: "日付"
  }
};

function t(key) {
  return translations[language][key] || translations.en[key] || key;
}

const money = amount =>
  "¥" + Number(amount).toLocaleString(
    language === "ja" ? "ja-JP" : "en-US",
    { maximumFractionDigits: 2 }
  );

function showMessage(text) {
  message.textContent = text;
}

function saveExpenses() {
  localStorage.setItem("studentExpenses", JSON.stringify(expenses));
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.title = language === "ja"
    ? "SAPKOTA | 学生向け支出管理"
    : "SAPKOTA | Student Expense Tracker";

  document.querySelectorAll("[data-i18n]").forEach(element => {
    const key = element.dataset.i18n;
    if (t(key)) {
      element.textContent = t(key);
    }
  });

  languageToggle.textContent = t("languageButton");

  document.getElementById("budget").placeholder = t("budgetExample");
  document.getElementById("title").placeholder = t("expenseExample");
  document.getElementById("amount").placeholder = t("amountExample");

  const categorySelect = document.getElementById("category");
  categorySelect.querySelectorAll("option").forEach(option => {
    const key = option.dataset.i18n;
    if (key) option.textContent = t(key);
  });

  render();
}

function render() {
  const spent = expenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  document.getElementById("budgetDisplay").textContent = money(budget);
  document.getElementById("spentDisplay").textContent = money(spent);
  document.getElementById("remainingDisplay").textContent = money(budget - spent);

  expenseList.replaceChildren();

  if (expenses.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = t("noExpenses");
    expenseList.appendChild(empty);
    return;
  }

  [...expenses].reverse().forEach(expense => {
    const item = document.createElement("li");

    const details = document.createElement("div");
    details.className = "expense-details";

    const name = document.createElement("div");
    name.className = "expense-title";
    name.textContent = expense.title;

    const meta = document.createElement("span");
    meta.className = "expense-meta";

    const categoryKey = {
      Food: "food",
      Transport: "transport",
      Shopping: "shopping",
      Education: "education",
      Bills: "bills",
      Entertainment: "entertainment",
      Other: "other"
    }[expense.category];

    const categoryName = categoryKey ? t(categoryKey) : expense.category;
    const dateText = expense.date || "";

    meta.textContent =
      `${t("category")}: ${categoryName} · ${t("date")}: ${dateText}`;

    details.append(name, meta);

    const actions = document.createElement("div");
    actions.className = "expense-actions";

    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = money(expense.amount);

    const removeButton = document.createElement("button");
    removeButton.className = "delete-button";
    removeButton.type = "button";
    removeButton.textContent = t("delete");

    removeButton.addEventListener("click", () => {
      expenses = expenses.filter(entry => entry.id !== expense.id);
      saveExpenses();
      render();
      showMessage(t("expenseDeleted"));
    });

    actions.append(amount, removeButton);
    item.append(details, actions);
    expenseList.appendChild(item);
  });
}

languageToggle.addEventListener("click", () => {
  language = language === "en" ? "ja" : "en";
  localStorage.setItem("studentLanguage", language);
  applyLanguage();
});

budgetForm.addEventListener("submit", event => {
  event.preventDefault();

  const newBudget = Number(document.getElementById("budget").value);

  if (!Number.isFinite(newBudget) || newBudget < 0) {
    showMessage(t("invalidBudget"));
    return;
  }

  budget = newBudget;
  localStorage.setItem("studentBudget", String(budget));
  render();
  showMessage(t("budgetSaved"));
});

expenseForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value;
  const amount = Number(document.getElementById("amount").value);
  const date = document.getElementById("date").value;

  if (
    !title ||
    !category ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !date
  ) {
    showMessage(t("invalidExpense"));
    return;
  }

  expenses.push({
    id: Date.now(),
    title,
    category,
    amount,
    date
  });

  saveExpenses();
  render();
  expenseForm.reset();

  document.getElementById("date").value =
    new Date().toLocaleDateString("en-CA");

  showMessage(t("expenseAdded"));
});

try {
  const saved = JSON.parse(
    localStorage.getItem("studentExpenses") || "[]"
  );
  expenses = Array.isArray(saved) ? saved : [];
} catch {
  expenses = [];
}

document.getElementById("date").value =
  new Date().toLocaleDateString("en-CA");

document.getElementById("budget").value = budget || "";

applyLanguage();
