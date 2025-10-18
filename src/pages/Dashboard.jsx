import React, { useEffect, useState, useRef } from "react";
import adminApi from "../utils/adminApi";
import toast, { Toaster } from "react-hot-toast"; // optional; remove if you don't use
import axios from "axios";


const BASE_URL = "http://localhost:5050"; // change if needed
// Small UI components to avoid import errors
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-md p-6 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, className = "", disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-semibold shadow inline-flex items-center justify-center ${className} ${disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] transition"}`}
  >
    {children}
  </button>
);
const Badge = ({ children, className = "" }) => (
  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${className}`}>{children}</span>
);
// Helper to format currency
const formatNaira = (num) => {
  if (num === undefined || num === null) return "₦0";
  if (typeof num !== "number") num = Number(num) || 0;
  return "₦" + num.toLocaleString();
};
export default function AdminDashboard() {
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInvoices: 0,
    totalReceipts: 0,
    totalTransactions: 0,
    totalTransactionVolume: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  // Logs (paginated)
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPages, setLogsPages] = useState(1);
  const [logsLimit] = useState(20);
  const [loadingLogs, setLoadingLogs] = useState(false);
  // Freeze/unfreeze UX
  const [emailInput, setEmailInput] = useState("");
  const [freezeLoading, setFreezeLoading] = useState(false);
  // realtime poll ref
  const pollRef = useRef(null);
  // fetch stats
  const fetchStats = async () => {
  setLoadingStats(true);
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("No admin token found");
    const res = await axios.get("http://localhost:5050/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Stats response: ", res.data);
    if (res.data?.success) {
      setStats(res.data.stats || {});
    } else {
      console.warn("Unexpected stats response", res.data);
      throw new Error("Invalid stats format");
    }
  } catch (err) {
    console.error("Fetch stats error:", err);
    toast?.error ? toast.error("Failed to load stats") : alert("Failed to load stats");
  } finally {
    setLoadingStats(false);
  }
};

  // fetch logs (paginated)
 const fetchLogs = async (page = 1) => {
  setLoadingLogs(true);
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("No admin token found");
    const res = await axios.get(`http://localhost:5050/api/admin/logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit: logsLimit },
    });
    if (res.data?.success) {
      setLogs(res.data.logs || []);
      setLogsPage(res.data.page || page);
      setLogsPages(res.data.pages || 1);
    } else {
      console.warn("Unexpected logs response", res.data);
    }
  } catch (err) {
    console.error("Fetch logs error", err);
    // No toast here as requested
  } finally {
    setLoadingLogs(false);
  }
};
  // freeze/unfreeze user by ID
  const handleFreeze = async (freeze = true) => {
  if (!emailInput || emailInput.trim().length === 0) {
    toast?.error ? toast.error("Enter User ID") : alert("Enter User ID");
    return;
  }
  setFreezeLoading(true);
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) throw new Error("No admin token found");
    const res = await axios.post(
      `http://localhost:5050/api/admin/freeze/${emailInput.trim()}`,
      {
        freeze,
        reason: freeze ? "Frozen by admin via dashboard" : "Unfrozen by admin",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (res.data?.success) {
      toast?.success ? toast.success(res.data.message) : alert(res.data.message);
      fetchStats();
      fetchLogs(logsPage);
    } else {
      toast?.error
        ? toast.error(res.data?.message || "Action failed")
        : alert(res.data?.message || "Action failed");
    }
  } catch (err) {
    console.error("Freeze error", err);
    toast?.error
      ? toast.error(err.response?.data?.message || "Server error")
      : alert(err.response?.data?.message || "Server error");
  } finally {
    setFreezeLoading(false);
  }
};
  // pagination handlers
  const goPrev = () => {
    if (logsPage <= 1) return;
    fetchLogs(logsPage - 1);
  };
  const goNext = () => {
    if (logsPage >= logsPages) return;
    fetchLogs(logsPage + 1);
  };
  // mount: fetch initial data + start polling logs
  useEffect(() => {
    fetchStats();
    fetchLogs(1);
    // polling logs every 5s to show near-real-time stream
    pollRef.current = setInterval(() => {
      fetchLogs(logsPage);
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only once on mount
  // small helper to render log line
  const renderLogLine = (log) => {
    const ts = new Date(log.createdAt).toLocaleString();
    return (
      <div key={log._id} className="py-2 border-b last:border-b-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="text-sm text-gray-700">{log.message}</div>
            <div className="text-xs text-gray-400 mt-1">{JSON.stringify(log.meta || {})}</div>
          </div>
          <div className="text-xs text-gray-400 text-right ml-2">{ts}</div>
        </div>
      </div>
    );
  };

  const handleSignOut = () => {
  localStorage.removeItem("token"); // or whatever key you use
  window.location.href = "/"; // Redirect to login page
};
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster position="top-right" />
      <header className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0046A5]">QuickInvoice NG Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview & user moderation</p>
        </div>
        <div className="flex flex-col items-start gap-2">
            <div className="flex items-center gap-3">
                <Badge className="bg-white border px-3 py-2 text-sm text-gray-700">Admin</Badge>
                {/* <div className="text-sm text-gray-600">Signed in</div> */}
                <button
                onClick={handleSignOut}  // You'll define this function
                className="text-sm text-red-600 hover:underline"
            >
                Sign Out
            </button>
            </div>
            
          </div>
      </header>
      {/* Stats grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card className="flex flex-col">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="mt-3 text-2xl font-bold text-[#0046A5]">{loadingStats ? "…" : stats.totalUsers ?? 0}</div>
        </Card>
        <Card className="flex flex-col">
          <div className="text-sm text-gray-500">Total Invoices</div>
          <div className="mt-3 text-2xl font-bold">{loadingStats ? "…" : stats.totalInvoices ?? 0}</div>
        </Card>
        <Card className="flex flex-col">
          <div className="text-sm text-gray-500">Total Receipts</div>
          <div className="mt-3 text-2xl font-bold">{loadingStats ? "…" : stats.totalReceipts ?? 0}</div>
        </Card>
        <Card className="flex flex-col">
          <div className="text-sm text-gray-500">Total Transactions</div>
          <div className="mt-3 text-2xl font-bold">{loadingStats ? "…" : stats.totalTransactions ?? 0}</div>
        </Card>
        <Card className="flex flex-col">
          <div className="text-sm text-gray-500">Transaction Volume</div>
          <div className="mt-3 text-2xl font-bold">{loadingStats ? "…" : formatNaira(stats.totalTransactionVolume ?? 0)}</div>
        </Card>
      </div>
      {/* Freeze panel + logs */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Freeze card */}
        <Card className="col-span-1">
          <h3 className="text-lg font-semibold text-gray-800">Freeze / Unfreeze User</h3>
          <p className="text-sm text-gray-500 mt-2">Provide the <strong>User Email</strong> to freeze or unfreeze a user account.</p>
          <div className="mt-4">
            <label className="block text-xs text-gray-600 mb-2">User Email</label>
            <input
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. johndoe@example.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0046A5]"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => handleFreeze(true)}
              disabled={freezeLoading}
              className="bg-red-600 text-white flex-1"
            >
              {freezeLoading ? "Working..." : "Freeze User"}
            </Button>
            <Button
              onClick={() => handleFreeze(false)}
              disabled={freezeLoading}
              className="bg-green-600 text-white flex-1"
            >
              {freezeLoading ? "Working..." : "Unfreeze User"}
            </Button>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Tip: Freezing blocks login. Active sessions will be terminated (server-side).
          </div>
        </Card>
        {/* Logs */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Activity Logs</h3>
                <div className="text-sm text-gray-500">Recent actions & admin logs (live)</div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => { fetchLogs(1); }} className="bg-white border border-gray-200 text-gray-700">Refresh</Button>
              </div>
            </div>
            <div className="h-96 overflow-y-auto border border-gray-100 rounded p-2">
              {loadingLogs && logs.length === 0 ? (
                <div className="text-center text-gray-400 py-10">Loading logs…</div>
              ) : logs.length === 0 ? (
                <div className="text-center text-gray-400 py-10">No logs yet.</div>
              ) : (
                logs.map(renderLogLine)
              )}
            </div>
            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">Page {logsPage} of {logsPages}</div>
              <div className="flex items-center gap-2">
                <Button onClick={goPrev} className="bg-gray-100 text-gray-700">Prev</Button>
                <Button onClick={goNext} className="bg-gray-100 text-gray-700">Next</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}












