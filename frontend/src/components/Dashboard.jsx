import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  LogOut,
  DollarSign,
  Calendar,
  Tag,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  X
} from "lucide-react";
import api from "../api";

// Helper for Category Colors
const CATEGORY_COLORS = {
  Food: "#f59e0b",
  Rent: "#3b82f6",
  Utilities: "#10b981",
  Entertainment: "#ec4899",
  Travel: "#8b5cf6",
  Other: "#6b7280"
};

export default function Dashboard({ onLogout }) {
  // State
  const [user, setUser] = useState(null);

  const [summary, setSummary] = useState({
    total_spent: 0,
    monthly_budget: 1000,
    remaining_budget: 1000,
    category_breakdown: [],
    recent_activity: []
  });

  const [expenses, setExpenses] = useState([]);

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    description: ""
  });

  const [budgetForm, setBudgetForm] = useState("");

  // Filters state
  const [filters, setFilters] = useState({
    category: "",
    search: "",
    startDate: "",
    endDate: "",
    sortBy: "date_desc"
  });

  // Feedback state
  const [toast, setToast] = useState(null);

  // Fetch Init Data
  useEffect(() => {
    fetchUserData();
    fetchSummary();
  }, []);

  // Fetch Expenses on Filter changes
  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchUserData = async () => {
    try {
      const userData = await api.getCurrentUser();

      setUser(userData);
      setBudgetForm(userData.monthly_budget.toString());
    } catch (err) {
      showToast(
        err.message || "Failed to fetch profile info",
        "error"
      );
    }
  };

  const fetchSummary = async () => {
    try {
      const summaryData = await api.getSummary();
      setSummary(summaryData);
    } catch (err) {
      showToast(
        err.message || "Failed to fetch summary stats",
        "error"
      );
    }
  };

  const fetchExpenses = async () => {
    try {
      const expenseList = await api.getExpenses(filters);
      setExpenses(expenseList);
    } catch (err) {
      showToast(
        err.message || "Failed to fetch expenses list",
        "error"
      );
    }
  };

  // Create/Edit Expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();

    if (
      !expenseForm.title ||
      !expenseForm.amount ||
      !expenseForm.date
    ) {
      showToast(
        "Please fill in all required fields",
        "error"
      );

      return;
    }

    const payload = {
      title: expenseForm.title,
      amount: parseFloat(expenseForm.amount),
      category: expenseForm.category,
      date: expenseForm.date,
      description: expenseForm.description || null
    };

    try {
      if (editingExpense) {
        await api.updateExpense(
          editingExpense.id,
          payload
        );

        showToast("Expense updated successfully");
      } else {
        await api.createExpense(payload);

        showToast("Expense created successfully");
      }

      closeExpenseModal();

      fetchSummary();
      fetchExpenses();
    } catch (err) {
      showToast(
        err.message || "Operation failed",
        "error"
      );
    }
  };

  const handleEditClick = (expense) => {
    setEditingExpense(expense);

    setExpenseForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      description: expense.description || ""
    });

    setIsExpenseModalOpen(true);
  };

  const handleDeleteClick = async (expenseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this expense?"
      )
    ) {
      return;
    }

    try {
      await api.deleteExpense(expenseId);

      showToast("Expense deleted successfully");

      fetchSummary();
      fetchExpenses();
    } catch (err) {
      showToast(
        err.message || "Deletion failed",
        "error"
      );
    }
  };

  // Budget Edit
  const handleBudgetSubmit = async (e) => {
    e.preventDefault();

    if (
      !budgetForm ||
      parseFloat(budgetForm) <= 0
    ) {
      showToast(
        "Please enter a valid budget",
        "error"
      );

      return;
    }

    try {
      await api.updateBudget(budgetForm);

      showToast("Budget updated successfully");

      setIsBudgetModalOpen(false);

      fetchUserData();
      fetchSummary();
    } catch (err) {
      showToast(
        err.message || "Failed to update budget",
        "error"
      );
    }
  };

  const openExpenseModal = () => {
    setEditingExpense(null);

    setExpenseForm({
      title: "",
      amount: "",
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      description: ""
    });

    setIsExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(null);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      search: "",
      startDate: "",
      endDate: "",
      sortBy: "date_desc"
    });
  };

  // =====================================================
  // DONUT CHART
  // =====================================================

const renderDonutChart = () => {
  const breakdown = summary.category_breakdown;
  const total = summary.total_spent;

  if (total === 0 || breakdown.length === 0) {
    return (
      <div className="empty-state" style={{ height: "100%" }}>
        <Tag size={40} style={{ opacity: 0.5 }} />
        <span>No expenses recorded yet.</span>
      </div>
    );
  }

  const size = 220;
  const center = size / 2;

  const radius = 70;
  const strokeWidth = 14;

  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div style={{ position: "relative" }}>

      <div className="chart-container">

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="chart-svg"
        >

          {/* BACKGROUND RING */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />

          {/* CATEGORY SEGMENTS */}
          {breakdown.map((item) => {
            const color =
              CATEGORY_COLORS[item.category] || "#ccc";

            const percentage =
              Number(item.percentage);

            const segmentLength =
              (percentage / 100) * circumference;

            const offset =
              -(
                (accumulatedPercentage / 100) *
                circumference
              );

            accumulatedPercentage += percentage;

            return (
              <circle
                key={item.category}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${
                  circumference - segmentLength
                }`}
                strokeDashoffset={offset}
                strokeLinecap="butt"

                style={{
                  transform: "rotate(-90deg)",
                  transformOrigin: `${center}px ${center}px`
                }}
              />
            );
          })}

          {/* CENTER TEXT */}
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            className="chart-center-title"
          >
            $
            {total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </text>

          <text
            x={center}
            y={center + 20}
            textAnchor="middle"
            className="chart-center-sub"
          >
            SPENT THIS MONTH
          </text>

        </svg>

      </div>

      {/* LEGEND */}
      <div className="chart-legend">

        {breakdown.map((item) => {
          const color =
            CATEGORY_COLORS[item.category] || "#ccc";

          return (
            <div
              key={item.category}
              className="legend-item"
            >

              <div
                className="legend-color"
                style={{
                  backgroundColor: color
                }}
              />

              <span
                style={{
                  textTransform: "capitalize",
                  flex: 1
                }}
              >
                {item.category}
              </span>

              <span style={{ fontWeight: 600 }}>
                {item.percentage}%
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
};

  // =====================================================
  // BUDGET METRICS
  // =====================================================

  const budgetRatio =
    summary.total_spent /
    (summary.monthly_budget || 1000);

  const budgetPercent =
    Math.min(
      Math.round(budgetRatio * 100),
      100
    );

  const isOverBudget =
    summary.total_spent >
    summary.monthly_budget;

  const isNearBudget =
    budgetPercent >= 85 &&
    !isOverBudget;

  return (
    <div className="app-container">

      {/* HEADER */}

      <header className="dashboard-header">

        <div className="header-brand">
          <div className="brand-logo">
            EXSPEND
          </div>
        </div>

        <div className="header-actions">

          {user && (
            <div className="user-profile">

              <div className="avatar">
                {user.email
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="user-details">

                <span className="user-name">
                  {user.full_name ||
                    user.email.split("@")[0]}
                </span>

                <span className="user-role">
                  {user.email}
                </span>

              </div>

            </div>
          )}

          <button
            className="btn-secondary btn-logout"
            onClick={onLogout}
          >
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </header>

      {/* MAIN CONTENT */}

      <main className="dashboard-body">

        {/* STATS */}

        <div className="stats-grid">

          {/* TOTAL SPENT */}

          <div className="stat-card">

            <div
              className={`stat-icon-wrapper ${isOverBudget
                  ? "overbudget"
                  : "spent"
                }`}
            >
              <DollarSign size={24} />
            </div>

            <div className="stat-info">

              <span className="stat-label">
                Total Spent This Month
              </span>

              <span className="stat-value">
                $
                {summary.total_spent.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </span>

              <span className="stat-sub">

                {isOverBudget
                  ? "Exceeded budget!"
                  : `${budgetPercent}% of monthly budget`}

              </span>

              <div className="budget-progress-container">

                <div
                  className={`budget-progress-bar ${isOverBudget
                      ? "danger"
                      : isNearBudget
                        ? "warning"
                        : ""
                    }`}
                  style={{
                    width: `${budgetPercent}%`
                  }}
                />

              </div>

            </div>

          </div>

          {/* MONTHLY LIMIT */}

          <div className="stat-card">

            <div className="stat-icon-wrapper budget">
              <Settings size={24} />
            </div>

            <div className="stat-info">

              <span className="stat-label">
                Monthly Limit
              </span>

              <span className="stat-value">
                $
                {summary.monthly_budget.toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </span>

              <span
                className="stat-sub"
                style={{
                  color:
                    "var(--primary-light)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                onClick={() =>
                  setIsBudgetModalOpen(true)
                }
              >
                <Edit2 size={10} />
                Edit Budget Limit
              </span>

            </div>

          </div>

          {/* REMAINING */}

          <div className="stat-card">

            <div
              className={`stat-icon-wrapper ${isOverBudget
                  ? "overbudget"
                  : "remaining"
                }`}
            >

              {isOverBudget ? (
                <AlertTriangle size={24} />
              ) : (
                <CheckCircle size={24} />
              )}

            </div>

            <div className="stat-info">

              <span className="stat-label">
                Remaining Balance
              </span>

              <span
                className="stat-value"
                style={{
                  color: isOverBudget
                    ? "var(--danger)"
                    : "var(--success)"
                }}
              >
                $
                {(
                  isOverBudget
                    ? -summary.remaining_budget
                    : summary.remaining_budget
                ).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2
                  }
                )}
              </span>

              <span className="stat-sub">
                {isOverBudget
                  ? "Over draft amount"
                  : "Available to spend"}
              </span>

            </div>

          </div>

        </div>

        {/* PANELS */}

        <div className="main-grid">

          {/* LEFT PANEL */}

          <div className="dashboard-panel">

            <div className="panel-title">

              <Tag
                size={20}
                style={{
                  color:
                    "var(--primary-light)"
                }}
              />

              Category Breakdown

            </div>

            {renderDonutChart()}

            <button
              className="btn-primary"
              style={{
                marginTop: "auto"
              }}
              onClick={openExpenseModal}
            >
              <Plus
                size={18}
                style={{
                  marginRight: "6px"
                }}
              />

              Add New Expense
            </button>

          </div>

          {/* RIGHT PANEL */}

          <div className="dashboard-panel">

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                marginBottom: "5px"
              }}
            >

              <div className="panel-title">

                <FileText
                  size={20}
                  style={{
                    color:
                      "var(--primary-light)"
                  }}
                />

                Expense Records

              </div>

              {(filters.category ||
                filters.search ||
                filters.startDate ||
                filters.endDate) && (

                  <button
                    className="btn-secondary"
                    style={{
                      padding: "4px 8px",
                      fontSize: "11px"
                    }}
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </button>

                )}

            </div>

            {/* FILTERS */}

            <div className="filters-bar">

              <input
                type="text"
                placeholder="Search description..."
                className="filter-input"
                value={filters.search}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    search: e.target.value
                  })
                }
              />

              <select
                className="filter-input"
                value={filters.category}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: e.target.value
                  })
                }
              >

                <option value="">
                  All Categories
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Rent">
                  Rent
                </option>

                <option value="Utilities">
                  Utilities
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Travel">
                  Travel
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

              <select
                className="filter-input"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value
                  })
                }
              >

                <option value="date_desc">
                  Newest Date
                </option>

                <option value="date_asc">
                  Oldest Date
                </option>

                <option value="amount_desc">
                  Highest Amount
                </option>

                <option value="amount_asc">
                  Lowest Amount
                </option>

              </select>

            </div>

            {/* DATE FILTERS */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginBottom: "10px"
              }}
            >

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >

                <span
                  style={{
                    fontSize: "10px",
                    color:
                      "var(--text-muted)",
                    textTransform:
                      "uppercase"
                  }}
                >
                  Start Date
                </span>

                <input
                  type="date"
                  className="filter-input"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      startDate:
                        e.target.value
                    })
                  }
                />

              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px"
                }}
              >

                <span
                  style={{
                    fontSize: "10px",
                    color:
                      "var(--text-muted)",
                    textTransform:
                      "uppercase"
                  }}
                >
                  End Date
                </span>

                <input
                  type="date"
                  className="filter-input"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      endDate:
                        e.target.value
                    })
                  }
                />

              </div>

            </div>

            {/* EXPENSE LIST */}

            <div className="expense-list-container">

              {expenses.length === 0 ? (

                <div className="empty-state">

                  <Search
                    size={36}
                    style={{
                      opacity: 0.5
                    }}
                  />

                  <span>
                    No matching expenses found
                  </span>

                </div>

              ) : (

                expenses.map((expense) => (

                  <div
                    key={expense.id}
                    className="expense-item"
                  >

                    <div className="expense-meta">

                      <div
                        className={`category-badge ${expense.category}`}
                      >

                        {expense.category ===
                          "Food" && "🍔"}

                        {expense.category ===
                          "Rent" && "🏠"}

                        {expense.category ===
                          "Utilities" && "⚡"}

                        {expense.category ===
                          "Entertainment" && "🎉"}

                        {expense.category ===
                          "Travel" && "✈️"}

                        {expense.category ===
                          "Other" && "🏷️"}

                      </div>

                      <div className="expense-details">

                        <span className="expense-title">
                          {expense.title}
                        </span>

                        <span className="expense-date">

                          {new Date(
                            expense.date
                          ).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric"
                            }
                          )}

                        </span>

                        {expense.description && (

                          <span className="expense-desc">
                            {expense.description}
                          </span>

                        )}

                      </div>

                    </div>

                    <div className="expense-actions-value">

                      <span className="expense-amount">
                        $
                        {expense.amount.toFixed(
                          2
                        )}
                      </span>

                      <div className="expense-item-actions">

                        <button
                          className="btn-icon"
                          onClick={() =>
                            handleEditClick(
                              expense
                            )
                          }
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          className="btn-icon delete"
                          onClick={() =>
                            handleDeleteClick(
                              expense.id
                            )
                          }
                        >
                          <Trash2 size={14} />
                        </button>

                      </div>

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

        </div>

      </main>

      {/* EXPENSE MODAL */}

      {isExpenseModalOpen && (

        <div className="modal-overlay">

          <div className="modal-content">

            <button
              className="btn-icon modal-close"
              onClick={
                closeExpenseModal
              }
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              {editingExpense
                ? "Modify Expense"
                : "New Expense Log"}
            </div>

            <form
              onSubmit={
                handleExpenseSubmit
              }
            >

              <div className="form-group">

                <label className="form-label">
                  Expense Title
                </label>

                <div className="input-wrapper">

                  <FileText
                    className="input-icon"
                    size={16}
                  />

                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Grocery Shop"
                    value={
                      expenseForm.title
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        title:
                          e.target.value
                      })
                    }
                    required
                  />

                </div>

              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "15px"
                }}
              >

                <div className="form-group">

                  <label className="form-label">
                    Amount ($)
                  </label>

                  <div className="input-wrapper">

                    <DollarSign
                      className="input-icon"
                      size={16}
                    />

                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={
                        expenseForm.amount
                      }
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount:
                            e.target.value
                        })
                      }
                      required
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label className="form-label">
                    Category
                  </label>

                  <select
                    className="form-select"
                    value={
                      expenseForm.category
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        category:
                          e.target.value
                      })
                    }
                  >

                    <option value="Food">
                      Food
                    </option>

                    <option value="Rent">
                      Rent
                    </option>

                    <option value="Utilities">
                      Utilities
                    </option>

                    <option value="Entertainment">
                      Entertainment
                    </option>

                    <option value="Travel">
                      Travel
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

              <div className="form-group">

                <label className="form-label">
                  Date
                </label>

                <div className="input-wrapper">

                  <Calendar
                    className="input-icon"
                    size={16}
                  />

                  <input
                    type="date"
                    className="form-input"
                    value={
                      expenseForm.date
                    }
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        date:
                          e.target.value
                      })
                    }
                    required
                  />

                </div>

              </div>

              <div className="form-group">

                <label className="form-label">
                  Description (Optional)
                </label>

                <textarea
                  className="form-input"
                  style={{
                    paddingLeft: "14px",
                    height: "80px",
                    resize: "none"
                  }}
                  placeholder="Notes, store location, tags..."
                  value={
                    expenseForm.description
                  }
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description:
                        e.target.value
                    })
                  }
                />

              </div>

              <div className="btn-group">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={
                    closeExpenseModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: "auto"
                  }}
                >
                  {editingExpense
                    ? "Save Updates"
                    : "Create Log"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* BUDGET MODAL */}

      {isBudgetModalOpen && (

        <div className="modal-overlay">

          <div className="modal-content">

            <button
              className="btn-icon modal-close"
              onClick={() =>
                setIsBudgetModalOpen(
                  false
                )
              }
            >
              <X size={18} />
            </button>

            <div className="modal-header">
              Update Budget Limit
            </div>

            <form
              onSubmit={
                handleBudgetSubmit
              }
            >

              <div className="form-group">

                <label className="form-label">
                  Monthly Spending Cap ($)
                </label>

                <div className="input-wrapper">

                  <DollarSign
                    className="input-icon"
                    size={16}
                  />

                  <input
                    type="number"
                    step="50"
                    min="1"
                    className="form-input"
                    placeholder="1000"
                    value={budgetForm}
                    onChange={(e) =>
                      setBudgetForm(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

              <div className="btn-group">

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setIsBudgetModalOpen(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: "auto"
                  }}
                >
                  Save Limits
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* TOAST */}

      {toast && (

        <div
          className={`notification-bubble ${toast.type}`}
        >

          {toast.type ===
            "success" && (

              <CheckCircle
                size={16}
                style={{
                  color:
                    "var(--success)"
                }}
              />

            )}

          {toast.type ===
            "error" && (

              <XCircle
                size={16}
                style={{
                  color:
                    "var(--danger)"
                }}
              />

            )}

          <span>
            {toast.message}
          </span>

        </div>

      )}

    </div>
  );
}