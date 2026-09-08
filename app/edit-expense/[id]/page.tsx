"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";

export default function EditExpensePage() {

    const params = useParams();

    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const router = useRouter();

   async function fetchExpense() {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error) {
    console.log("Fetch error:", error);
    return;
  }

  setTitle(data.title);
  setAmount(String(data.amount));
  setCategory(data.category);
}

async function handleUpdate() {
  const { error } = await supabase
    .from("expenses")
    .update({
      title,
      amount: Number(amount),
      category,
    })
    .eq("id", params.id);

  if (error) {
    console.log("Update error:", error);
    alert("Expense update nahi hua");
    return;
  }

   alert("Expense updated successfully");
   router.push("/dashboard");
 }

  useEffect(() => {
  fetchExpense();
 }, []);

 return (
  <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-4 py-10 text-white">
    <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
          ExpenseDesk
        </p>

        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          Edit Expense
        </h1>

        <p className="mt-2 text-slate-400">
          Update your expense details
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block font-semibold text-slate-200">
            Expense Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-slate-200">
            Amount
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-4 text-white outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold text-slate-200">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-4 text-white outline-none focus:border-indigo-400"
          >
            <option>Food</option>
            <option>Travel</option>
            <option>Shopping</option>
            <option>Bills</option>
            <option>Entertainment</option>
            <option>Health</option>
            <option>Fuel</option>
            <option>Other</option>
          </select>
        </div>

       <button
         onClick={handleUpdate}
         className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 font-semibold text-white shadow-lg transition hover:scale-[1.01]"
        >
        Update Expense
        </button>
      </div>
    </div>
  </main>
 );
}