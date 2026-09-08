import { WalletCards, Wallet, BarChart3, FileText } from "lucide-react";

export default function Home() {  
  return (
    <main className="min-h-screen bg-slate-50">
            <nav className="flex justify-between items-center p-6 bg-white/90 backdrop-blur-md shadow-sm">

          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-slate-900">Expense</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Desk
            </span>

            <br />

            <p className="mt-1.5 text-sm uppercase tracking-[0.25em] text-slate-500">
              Smart Finance Tracker
            </p>
          </h1>

          {/* 👇 Ye div add karo */}
          <div className="flex gap-4">

            <a
              href="/login"
              className="rounded-lg border-2 border-blue-600 px-4 py-2 text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              Login
            </a>

            <a
              href="/signup"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Sign Up
            </a>

          </div>

        </nav>
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-indigo-100 px-5 py-20 md:py-24">
  <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
  <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

  <div className="relative mx-auto max-w-5xl text-center">
    <p className="mx-auto inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
      Smart finance tracking made simple
    </p>

    <h2 className="mt-6 text-5xl font-black tracking-tight text-slate-950 md:text-7xl">
      Manage Your Expenses
      <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        Like a Pro
      </span>
    </h2>

    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
      Track expenses, manage monthly salary, understand spending patterns,
      and export professional financial reports from one dashboard.
    </p>

    <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
      <a
        href="/signup"
        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1"
      >
        Get Started Free
      </a>

      <a
        href="/login"
        className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 shadow-sm transition hover:-translate-y-1 hover:border-blue-400"
      >
        View Dashboard
      </a>
    </div>

    <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
      <span>✓ Monthly reports</span>
      <span>✓ Smart analytics</span>
      <span>✓ PDF & CSV export</span>
      <span>✓ Secure Supabase login</span>
    </div>
  </div>
 </section>

 <section className="bg-white px-5 py-20">
  <div className="mx-auto max-w-6xl text-center">
    <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
      Dashboard Preview
    </p>

    <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
      Manage Everything From One Place
    </h2>

    <p className="mx-auto mt-4 max-w-2xl text-slate-500">
      Track monthly salary, expenses, remaining balance, analytics and
      downloadable reports from one clean dashboard.
    </p>

    <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-2xl md:p-6">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-6 md:p-10">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <p className="text-sm text-slate-400">Monthly Salary</p>
            <h3 className="mt-3 text-3xl font-bold text-emerald-300">
              ₹30,000
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <p className="text-sm text-slate-400">Total Expenses</p>
            <h3 className="mt-3 text-3xl font-bold text-red-300">
              ₹4,600
            </h3>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
            <p className="text-sm text-slate-400">Remaining Balance</p>
            <h3 className="mt-3 text-3xl font-bold text-indigo-300">
              ₹25,400
            </h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      <section className="px-8 py-20 bg-slate-100">

          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-600">
              Everything You Need
            </p>

            <h2 className="mt-3 text-4xl font-black text-slate-950">
              Powerful Tools For Your Finances
            </h2>

            <p className="mt-4 text-lg text-slate-600">
              Manage your salary, track expenses, analyze spending and generate reports
              from one simple dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl hover:shadow-blue-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
           <h3 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
              <WalletCards className="w-7 h-7 text-blue-600" />
              <span>Expense Tracking</span>
          </h3>
            <p className="mt-4 text-gray-600">
              Add, edit, delete and manage your daily expenses with ease.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl hover:shadow-blue-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <h3 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                  <BarChart3 className="w-7 h-7 text-blue-600" />
                  <span> Analytics</span>
            </h3>     
            <p className="mt-4 text-gray-600">
              Understand your spending patterns with smart analytics and insights.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl hover:shadow-blue-200 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
            <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                <FileText className="w-7 h-7 text-blue-600" />
                <span>Reports</span>
            </h3>
            <p className="mt-4 text-gray-600">
              Export your monthly financial data as professional PDF and CSV reports.
            </p>
          </div>
        </div>

        
          <footer className="bg-slate-900 text-white py-10 mt-20">
           <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-2xl font-bold">ExpenseDesk</h2>

          <p className="mt-2 text-slate-400">
           Smart Personal Finance Dashboard
          </p>

          <p className="mt-6 text-sm text-slate-500">
          © 2026 ExpenseDesk. All Rights Reserved.
          </p>
        </div>
         </footer>
      </section>
    </main>
  );
}

