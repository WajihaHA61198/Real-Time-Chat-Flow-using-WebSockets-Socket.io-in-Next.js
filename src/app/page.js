"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  // formData = User ne form mein kya likha hai?
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Page wont reload
    setError("");
    setLoading(true);

    // Step 1: Backend ka URL banao
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/${
      isLogin ? "login" : "register"
    }`;
    // console.log("Attempting to connect to:", url); // Debug log

    try {
      // Step 2: Backend ko data bhejo
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // {email: "...", password: "..."}
      });

      // Step 3: Response check karo
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Step 4: User info save karo
      localStorage.setItem("user", JSON.stringify(data.user));

      // Step 5: Redirect to chat
      router.push("/chat");
    } catch (err) {
      console.error("Login error:", err); // Debug log
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <MessageCircle className="w-16 h-16 text-green-900" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isLogin ? "Welcome Back" : "Join ChatFlow"}
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isLogin
            ? "Login to continue chatting"
            : "Create an account to start"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-900 focus:outline-none placeholder:text-gray-400 text-gray-900"
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-900 focus:outline-none placeholder:text-gray-400 text-gray-900"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-emerald-900 focus:outline-none placeholder:text-gray-400 text-gray-900"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-900 text-white py-3 rounded-lg font-semibold hover:from-emerald-900 hover:to-slate-700 transition shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Register"}
          </button>

          <div className="text-center mt-4">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="text-emerald-600 hover:text-emerald-900 font-medium"
            >
              {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
