"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  LayoutDashboard,
  WalletCards,
  BarChart3,
  FileText,
  User,
  LockKeyhole,
  LogOut,
  Plus,
  Search,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Expense = {
  id: string;
  title: string;
  amount: number;
  category: string;
  created_at: string;
};

const CHART_COLORS = [
  "#4F46E5",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalary] = useState(0);
  const [salaryInput, setSalaryInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOption, setSortOption] = useState("latest");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [loading, setLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      router.push("/login");
      return;
    }

    setEmail(data.session.user.email ?? "");
  }

  async function fetchExpenses() {
    const { data, error } = await supabase
      .from("expenses")
      .select("*");

    if (error) {
      console.log("Expense fetch error:", error);
      return;
    }

    setExpenses(data ?? []);
  }

  async function fetchSalary() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: financeData, error } = await supabase
      .from("user_finance")
      .select("salary")
      .eq("user_id", user.id)
      .eq("salary_month", selectedMonth)
      .maybeSingle();

    if (error) {
      console.log("Salary fetch error:", error);
      return;
    }

    const savedSalary = Number(financeData?.salary ?? 0);

    setSalary(savedSalary);
    setSalaryInput(savedSalary > 0 ? String(savedSalary) : "");
  }

  async function loadDashboardData() {
    setLoading(true);

    await Promise.all([
      checkSession(),
      fetchExpenses(),
      fetchSalary(),
    ]);

    setLoading(false);
  }

  async function handleSaveSalary() {
    const salaryValue = Number(salaryInput);

    if (!salaryInput || salaryValue <= 0) {
      alert("Please enter a valid salary");
      return;
    }

    const { data, error: sessionError } =
      await supabase.auth.getSession();

    const user = data.session?.user;

    if (sessionError || !user) {
      alert("Session expired. Please login again.");
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("user_finance")
      .upsert(
        {
          user_id: user.id,
          salary: salaryValue,
          salary_month: selectedMonth,
        },
        {
          onConflict: "user_id,salary_month",
        }
      );

    if (error) {
      console.log("Salary save error:", error);
      alert(error.message);
      return;
    }

    setSalary(salaryValue);
    alert("Salary saved successfully");
  }

  function handleExportPDF() {
    if (isInvalidDateRange) {
      alert("From Date, To Date se badi nahi ho sakti");
      return;
    }

    if (exportExpenses.length === 0) {
      alert("Selected date range me koi expense nahi mila");
      return;
    }

    const exportTotalExpense = exportExpenses.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );

    const exportRemainingBalance = salary - exportTotalExpense;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("ExpenseDesk", 14, 20);

    doc.setFontSize(16);
    doc.text("Expense Report", 14, 32);

    doc.setFontSize(11);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      14,
      42
    );

    doc.text(
      startDate || endDate
        ? `Period: ${startDate ? formatDate(startDate) : "Beginning"} - ${
            endDate ? formatDate(endDate) : "Today"
          }`
        : `Month: ${new Date(`${selectedMonth}-01`).toLocaleDateString(
            "en-IN",
            {
              month: "long",
              year: "numeric",
            }
          )}`,
      14,
      50
    );

    autoTable(doc, {
      startY: 58,
      head: [["Title", "Category", "Amount"]],
      body: exportExpenses.map((expense) => [
        expense.title,
        expense.category,
        `Rs. ${expense.amount}`,
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.text(`Total Salary: Rs. ${salary}`, 14, finalY);
    doc.text(
      `Total Expense: Rs. ${exportTotalExpense}`,
      14,
      finalY + 10
    );
    doc.text(
      `Remaining Balance: Rs. ${exportRemainingBalance}`,
      14,
      finalY + 20
    );

    const pdfFileName =
      startDate || endDate
        ? `Expense_Report_${startDate || "Beginning"}_to_${
            endDate || "Today"
          }.pdf`
        : `Expense_Report_${selectedMonth}.pdf`;

    doc.save(pdfFileName);
  }

  function handleExportCSV() {
    if (isInvalidDateRange) {
      alert("From Date, To Date se badi nahi ho sakti");
      return;
    }

    if (exportExpenses.length === 0) {
      alert("Selected date range me koi expense nahi mila");
      return;
    }

    const reportPeriod =
      startDate || endDate
        ? `Period: ${startDate || "Beginning"} to ${endDate || "Today"}`
        : `Month: ${new Date(`${selectedMonth}-01`).toLocaleDateString(
            "en-IN",
            {
              month: "long",
              year: "numeric",
            }
          )}`;

    const headers = ["Title", "Category", "Amount", "Date"];

    const rows = exportExpenses.map((expense) => [
      expense.title,
      expense.category,
      expense.amount,
      new Date(expense.created_at).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [
      ["ExpenseDesk"],
      [reportPeriod],
      [],
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download =
      startDate || endDate
        ? `Expense_Report_${startDate || "Beginning"}_to_${
            endDate || "Today"
          }.csv`
        : `Expense_Report_${selectedMonth}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleDelete(id: string) {
    const shouldDelete = window.confirm(
      "Kya aap sure hain ki ye expense delete karna chahte hain?"
    );

    if (!shouldDelete) return;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("Delete error:", error);
      alert("Expense delete nahi hua");
      return;
    }

    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== id)
    );

    alert("Expense deleted successfully");
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    fetchSalary();
  }, [selectedMonth]);

  const monthExpenses = expenses.filter((expense) => {
    const expenseMonth = new Date(expense.created_at)
      .toISOString()
      .slice(0, 7);

    return expenseMonth === selectedMonth;
  });

  const filteredExpenses = monthExpenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      expense.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const exportExpenses =
    startDate || endDate
      ? expenses.filter((expense) => {
          const expenseDate = new Date(expense.created_at);

          if (startDate) {
            const start = new Date(`${startDate}T00:00:00`);
            if (expenseDate < start) return false;
          }

          if (endDate) {
            const end = new Date(`${endDate}T23:59:59`);
            if (expenseDate > end) return false;
          }

          return true;
        })
      : monthExpenses;

  const isInvalidDateRange =
    Boolean(startDate) &&
    Boolean(endDate) &&
    new Date(startDate) > new Date(endDate);

  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    if (sortOption === "highest") return b.amount - a.amount;
    if (sortOption === "lowest") return a.amount - b.amount;

    if (sortOption === "latest") {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    }

    if (sortOption === "oldest") {
      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    }

    return 0;
  });

  const totalExpense = monthExpenses.reduce(
    (total, expense) => total + Number(expense.amount),
    0
  );

  const remainingBalance = salary - totalExpense;

  const categoryCount = monthExpenses.reduce<Record<string, number>>(
    (acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + 1;
      return acc;
    },
    {}
  );

  const mostUsedCategory =
    Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "None";

  const categoryAmount = monthExpenses.reduce<Record<string, number>>(
    (total, expense) => {
      total[expense.category] =
        (total[expense.category] || 0) + Number(expense.amount);
      return total;
    },
    {}
  );

  const categoryData = Object.entries(categoryAmount).map(
    ([name, value]) => ({ name, value })
  );

  const monthlyTotals = monthExpenses.reduce<Record<string, number>>(
    (acc, expense) => {
      const date = new Date(expense.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });

      acc[date] = (acc[date] || 0) + Number(expense.amount);
      return acc;
    },
    {}
  );

  const monthlyData = Object.entries(monthlyTotals).map(
    ([month, amount]) => ({ month, amount })
  );

  monthlyData.sort(
    (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
          <p className="mt-4 text-slate-300">Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-6 text-white md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* NAVBAR */}
        <nav className="relative sticky top-0 z-50 mb-8 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 shadow-2xl backdrop-blur-xl md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="shrink-0">
              <h1 className="text-2xl font-black tracking-tight">
                <span className="text-white">Expense</span>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Desk
                </span>
              </h1>
              <p className="hidden text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500 sm:block">
                Smart Finance Tracker
              </p>
            </div>

            <div className="hidden items-center gap-1 lg:flex">
              <a
                href="#overview"
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600/20"
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </a>

              <a
                href="#expenses"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <WalletCards className="h-4 w-4" />
                Expenses
              </a>

              <a
                href="#analytics"
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </a>

            <button
            onClick={() => setReportsOpen(!reportsOpen)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Reports
            </button>
            </div>

            {reportsOpen && (
            <div className="absolute left-4 right-4 top-20 z-[9999] rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6 sm:w-[360px]">

             <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                    Reports
                  </p>

                  <h3 className="mt-2 text-xl font-bold text-white">
                    Export Financial Report
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setReportsOpen(false)}
                  className="rounded-lg px-2 py-1 text-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 grid gap-4">

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-400"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-400"
                  />
                </div>

                <div className="flex gap-3">

                  <button
                    onClick={handleExportPDF}
                    className="flex-1 rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 font-semibold text-blue-300 transition hover:bg-blue-500 hover:text-white"
                  >
                    📄 PDF
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex-1 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 font-semibold text-amber-300 transition hover:bg-amber-500 hover:text-white"
                  >
                    📊 CSV
                  </button>

                </div>

              </div>
            </div>
          )}

            <div className="relative shrink-0">
              <button
                onClick={() => setProfileOpen((open) => !open)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                <User className="h-5 w-5 text-indigo-300" />
                <span className="hidden text-sm font-semibold text-white sm:block">
                  Profile
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 w-72 rounded-2xl border border-white/10 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/10 pb-3">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Logged in as
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-white">
                      {email}
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/change-password")}
                    className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    <LockKeyhole className="h-4 w-4 text-indigo-300" />
                    Change Password
                  </button>

                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto border-t border-white/10 pt-3 lg:hidden">
            <a href="#overview" className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
              Overview
            </a>
            <a href="#expenses" className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
              Expenses
            </a>
            <a href="#analytics" className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
              Analytics
            </a>
            <button
              type="button"
              onClick={() => setReportsOpen((open) => !open)}
              className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300"
            >
              Reports
            </button>
          </div>
        </nav>

        {/* OVERVIEW */}
        <section id="overview" className="scroll-mt-28 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
                Your Financial Overview
              </p>

              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                Take Control of Your Money
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
                Track your money, manage your spending, and stay in control.
              </p>
            </div>

          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[auto_1fr_auto]">
            <button
              onClick={() => router.push("/add-expense")}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-500"
            >
              <Plus className="h-5 w-5" />
              Add Expense
            </button>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Select Month</label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Monthly Salary</label>
                <input
                  type="number"
                  placeholder="Enter monthly salary"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSalary}
              className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 font-semibold text-emerald-300 transition hover:bg-emerald-500 hover:text-white"
            >
              Save Salary
            </button>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total Expenses</p>
            <h2 className="mt-3 text-3xl font-bold">{formatCurrency(totalExpense)}</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total Transactions</p>
            <h2 className="mt-3 text-3xl font-bold">{expenses.length}</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Total Salary</p>
            <h2 className="mt-3 text-3xl font-bold text-emerald-300">{formatCurrency(salary)}</h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Remaining Balance</p>
            <h2 className={`mt-3 text-3xl font-bold ${remainingBalance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
              {formatCurrency(remainingBalance)}
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <p className="text-sm text-slate-400">Most Used Category</p>
            <h2 className="mt-3 text-2xl font-bold">{mostUsedCategory}</h2>
          </div>
        </section>

        {/* AI INSIGHTS */}
        <section className="mt-10 rounded-3xl border border-indigo-400/20 bg-indigo-500/10 p-6 shadow-xl backdrop-blur-xl md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">AI Insights</p>
          <h2 className="mt-2 text-2xl font-bold">Smart Spending Summary</h2>

          <div className="mt-6 space-y-3 text-slate-300">
            <p>• You have spent {formatCurrency(totalExpense)} from your salary of {formatCurrency(salary)}.</p>
            <p>• Your most used category is {mostUsedCategory}.</p>

            {salary === 0 ? (
              <p>• Add your monthly salary to receive budget insights.</p>
            ) : remainingBalance >= 0 ? (
              <p className="text-emerald-300">
                • You still have {formatCurrency(remainingBalance)} remaining. Your spending is within your salary.
              </p>
            ) : (
              <p className="text-red-300">
                • You have overspent by {formatCurrency(Math.abs(remainingBalance))}.
              </p>
            )}
          </div>
        </section>

        {/* ANALYTICS */}
        <section id="analytics" className="mt-10 scroll-mt-28 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Analytics</p>
            <h2 className="mt-2 text-3xl font-bold">Expenses by Category</h2>
            <p className="mt-2 text-sm text-slate-400">Category-wise distribution based on total amount spent.</p>
          </div>

          <div className="mt-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Monthly Analytics</p>
            <h2 className="mt-2 text-3xl font-bold">Expense Timeline</h2>

            <div className="mt-8 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

         {/* EXPENSES */}
        <section id="expenses" className="mt-10 scroll-mt-28">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-300">Activity</p>
              <h2 className="mt-2 text-2xl font-bold md:text-3xl">Recent Expenses</h2>
            </div>
            <p className="text-sm text-slate-400">{sortedExpenses.length} records</p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-400"
            >
              <option value="All">All Categories</option>
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Bills">Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Health">Health</option>
              <option value="Fuel">Fuel</option>
              <option value="Other">Other</option>
              <option value="Repairing">Repairing</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-indigo-400"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>

          <div className="mt-6 space-y-4">
            {expenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
                <h3 className="text-xl font-semibold">No expenses found</h3>
                <p className="mt-2 text-slate-400">Add your first expense to see it here.</p>
                <button
                  onClick={() => router.push("/add-expense")}
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold transition hover:bg-indigo-500"
                >
                  Add First Expense
                </button>
              </div>
            ) : sortedExpenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-10 text-center">
                <h3 className="text-xl font-semibold">No matching expenses</h3>
                <p className="mt-2 text-slate-400">Try another search or category.</p>
              </div>
            ) : (
              sortedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">{expense.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">{expense.category}</p>
                    <p className="mt-2 text-xs text-slate-400">📅 {formatDate(expense.created_at)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                    <p className="mr-1 text-xl font-bold text-indigo-300">{formatCurrency(expense.amount)}</p>

                    <button
                      onClick={() => router.push(`/edit-expense/${expense.id}`)}
                      className="rounded-lg border border-blue-400/30 bg-blue-500/10 px-3 py-2 text-sm font-semibold text-blue-300 transition hover:bg-blue-500 hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>    
  );
}
