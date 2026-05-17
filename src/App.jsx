import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet
} from "lucide-react";

const STORAGE_KEY = "expense-tracker-transactions";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Education",
  "Entertainment",
  "Salary",
  "Freelance",
  "Investment",
  "Other"
];

const initialTransactions = [
  {
    id: "sample-1",
    title: "Monthly salary",
    amount: 52000,
    type: "income",
    category: "Salary",
    date: "2026-05-01",
    note: "Primary job"
  },
  {
    id: "sample-2",
    title: "Groceries",
    amount: 3400,
    type: "expense",
    category: "Food",
    date: "2026-05-04",
    note: "Weekly essentials"
  },
  {
    id: "sample-3",
    title: "Metro card",
    amount: 900,
    type: "expense",
    category: "Transport",
    date: "2026-05-06",
    note: ""
  },
  {
    id: "sample-4",
    title: "Freelance design",
    amount: 8500,
    type: "income",
    category: "Freelance",
    date: "2026-05-10",
    note: "Landing page project"
  }
];

const blankForm = {
  title: "",
  amount: "",
  type: "expense",
  category: "Food",
  date: new Date().toISOString().slice(0, 10),
  note: ""
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialTransactions;
  });
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    query: "",
    startDate: "",
    endDate: ""
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const matchesType = filters.type === "all" || transaction.type === filters.type;
        const matchesCategory =
          filters.category === "all" || transaction.category === filters.category;
        const text = `${transaction.title} ${transaction.note} ${transaction.category}`.toLowerCase();
        const matchesQuery = text.includes(filters.query.toLowerCase());
        const afterStart = !filters.startDate || transaction.date >= filters.startDate;
        const beforeEnd = !filters.endDate || transaction.date <= filters.endDate;
        return matchesType && matchesCategory && matchesQuery && afterStart && beforeEnd;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, filters]);

  const totals = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);
    const expenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);
    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expenses, balance, savingsRate };
  }, [transactions]);

  const categoryTotals = useMemo(() => {
    const expenseItems = transactions.filter((item) => item.type === "expense");
    const grouped = expenseItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});
    return Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
        percent: totals.expenses ? Math.round((amount / totals.expenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, totals.expenses]);

  function handleSubmit(event) {
    event.preventDefault();

    const amount = Number(form.amount);
    if (!form.title.trim() || !amount || amount <= 0) {
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      note: form.note.trim(),
      amount
    };

    if (editingId) {
      setTransactions((items) =>
        items.map((item) => (item.id === editingId ? { ...payload, id: editingId } : item))
      );
      setEditingId(null);
    } else {
      setTransactions((items) => [{ ...payload, id: crypto.randomUUID() }, ...items]);
    }

    setForm(blankForm);
  }

  function handleEdit(transaction) {
    setEditingId(transaction.id);
    setForm({ ...transaction, amount: String(transaction.amount) });
  }

  function handleDelete(id) {
    setTransactions((items) => items.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(blankForm);
    }
  }

  function clearForm() {
    setEditingId(null);
    setForm(blankForm);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Personal finance dashboard</p>
          <h1>Expense Tracker</h1>
          <p className="hero-copy">
            Track income, watch spending patterns, and keep your balance clear at a glance.
          </p>
        </div>
        <div className="hero-balance" aria-label="Current balance">
          <span>Current balance</span>
          <strong>{formatCurrency(totals.balance)}</strong>
        </div>
      </section>

      <section className="stats-grid" aria-label="Financial summary">
        <StatCard
          title="Income"
          value={formatCurrency(totals.income)}
          icon={<TrendingUp size={22} />}
          tone="positive"
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(totals.expenses)}
          icon={<TrendingDown size={22} />}
          tone="negative"
        />
        <StatCard
          title="Transactions"
          value={String(transactions.length)}
          icon={<Wallet size={22} />}
          tone="neutral"
        />
        <StatCard
          title="Savings rate"
          value={`${totals.savingsRate}%`}
          icon={<CalendarDays size={22} />}
          tone="accent"
        />
      </section>

      <section className="workspace">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId ? "Update entry" : "New entry"}</p>
              <h2>{editingId ? "Edit transaction" : "Add transaction"}</h2>
            </div>
            {editingId && (
              <button className="icon-button" type="button" onClick={clearForm} title="Cancel edit">
                <Plus size={18} />
              </button>
            )}
          </div>

          <label>
            Title
            <input
              type="text"
              placeholder="e.g. Rent, salary, groceries"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </label>

          <div className="field-row">
            <label>
              Amount
              <input
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                required
              />
            </label>
            <label>
              Type
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>

          <div className="field-row">
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </label>
          </div>

          <label>
            Note
            <textarea
              placeholder="Optional details"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
            />
          </label>

          <button className="primary-button" type="submit">
            <Plus size={18} />
            {editingId ? "Save changes" : "Add transaction"}
          </button>
        </form>

        <section className="panel transactions-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Money movement</p>
              <h2>Transactions</h2>
            </div>
            <span className="count-badge">{filteredTransactions.length}</span>
          </div>

          <div className="filters">
            <label className="search-field">
              <Search size={18} />
              <input
                type="search"
                placeholder="Search"
                value={filters.query}
                onChange={(event) => setFilters({ ...filters, query: event.target.value })}
              />
            </label>
            <label>
              <Filter size={16} />
              <select
                value={filters.type}
                onChange={(event) => setFilters({ ...filters, type: event.target.value })}
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>
            <label>
              Category
              <select
                value={filters.category}
                onChange={(event) => setFilters({ ...filters, category: event.target.value })}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              From
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => setFilters({ ...filters, startDate: event.target.value })}
              />
            </label>
            <label>
              To
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => setFilters({ ...filters, endDate: event.target.value })}
              />
            </label>
          </div>

          <div className="transaction-list">
            {filteredTransactions.length === 0 ? (
              <div className="empty-state">No transactions match the current filters.</div>
            ) : (
              filteredTransactions.map((transaction) => (
                <article className="transaction-card" key={transaction.id}>
                  <div className={`type-dot ${transaction.type}`} />
                  <div>
                    <h3>{transaction.title}</h3>
                    <p>
                      {transaction.category} • {transaction.date}
                      {transaction.note ? ` • ${transaction.note}` : ""}
                    </p>
                  </div>
                  <strong className={transaction.type}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </strong>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      type="button"
                      onClick={() => handleEdit(transaction)}
                      title="Edit transaction"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => handleDelete(transaction.id)}
                      title="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel category-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Expense mix</p>
              <h2>Categories</h2>
            </div>
          </div>
          {categoryTotals.length === 0 ? (
            <div className="empty-state">Add expenses to see category totals.</div>
          ) : (
            <div className="category-list">
              {categoryTotals.map((item) => (
                <div className="category-item" key={item.category}>
                  <div className="category-row">
                    <span>{item.category}</span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                  <div className="meter" aria-label={`${item.category} ${item.percent}%`}>
                    <span style={{ width: `${item.percent}%` }} />
                  </div>
                  <small>{item.percent}% of expenses</small>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function StatCard({ title, value, icon, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default App;
