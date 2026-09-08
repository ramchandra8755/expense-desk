"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletCards } from "lucide-react";
import { supabase } from "@/lib/supabase";


export default function AddExpensePage() {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Food");
    const router = useRouter();

   const handleSave = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    alert("Please login first");
    return;
  }

  const { error } = await supabase.from("expenses").insert({
    title,
    amount: Number(amount),
    category,
    user_id: user.id,
  });

  if (error) {
    console.log("Insert error:", error);
    alert("Expense save nahi hua");
    return;
  }

  alert("Expense saved successfully");

  setTitle("");
  setAmount("");
  setCategory("Food");

  router.push("/dashboard");
 };
  return (

    <main className="overflow-hidden relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-100 to-fuchsia-100 px-4 py-10 ">
        <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl"></div>
      <div className="w-full max-w-xl rounded-3xl border border-white/40 bg-white/70 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
       
        <div className="mb-8 text-center">
           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg">
               <WalletCards size={30}/>
           </div>

         <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Add Expense
          </h1>

          <p className="mt-2 text-slate-500">
            Track your spending smartly
          </p>

          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Expense Title
            </label>

            <input
              type="text"
              placeholder="Enter expense title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 hover:border-purple-300 transition-all duration-300 bg-white px-4 py-4 text-slate-800 shadow-sm  hover:shadow-lg placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Amount
            </label>

            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-200 hover:border-purple-300 transition-all duration-300 bg-white px-4 py-4 text-slate-800 shadow-sm hover:shadow-lg placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
            />
          </div>
          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Category
            </label>

            <select
             value={category}
             onChange={(e) => setCategory(e.target.value)}
             className="w-full rounded-xl border border-slate-200 hover:border-purple-300 transition-all duration-300 bg-white px-4 py-4 text-slate-800 shadow-sm hover:shadow-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100">
              <option>Food</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>Entertainment</option>
              <option>self expense</option>
              <option>Debit</option>
               <option>Credit</option>
              <option>Health</option>
              <option>Fuel</option>
              <option>Repairing</option>
               <option>Other</option>
            </select>
          </div>

          <button
           onClick={handleSave}
           className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02] active:scale-95 shadow-blue-400/30 hover:shadow-xl">
            Save Expense
          </button>

         {title && amount && (
           <p className="text-center text-slate-600">
             {title} | ₹{amount} | {category}
           </p>
          )}

          <p className="text-center text-sm text-slate-500">
            🔒 Your expenses are encrypted and private
          </p>
        </div>
      </div>
    </main>
  );
}
