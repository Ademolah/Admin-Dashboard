import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  


  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  try {
    console.log("Submitting login...");
    const res = await fetch("http://localhost:5050/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log("Response data:", data);
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    // ✅ Store token
    localStorage.setItem("adminToken", data.token);
    console.log("Navigating now...");
    navigate("/admindashboard", { replace: true });
  } catch (err) {
    console.error("Login error:", err.message);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0046A5] to-[#00B86B] p-4">
    <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-8 w-full max-w-md border border-white/30">
      <h2 className="text-3xl font-bold text-center text-[#0046A5] mb-2">
        QuickInvoice NG
      </h2>
      <p className="text-center text-gray-600 mb-6">Admin Access Panel</p>
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00B86B] outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#00B86B] outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0046A5] hover:bg-[#003A8A] text-white py-2 rounded-lg font-medium transition-all"
        >
          {loading ? "Signing In..." : "Login"}
        </button>
      </form>
    </div>
  </div>
);
};



export default AdminLogin;