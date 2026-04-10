import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { formatPrice } from "../utils/formatPrice";

const ITEMS_PER_PAGE = 10;

const SearchIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Users = ({ token }) => {
  const [users, setUsers]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage]         = useState(1);
  const [totalUsers, setTotalUsers]           = useState(0);
  const [sortOrder, setSortOrder]             = useState("desc"); // "asc" | "desc"

  // Debounce: wait 400ms after user stops typing before calling API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset page on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch users from backend with search + pagination params
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: debouncedSearch,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        sortOrder,
      });
      const response = await axios.get(
        `${backendUrl}/api/user/list?${params.toString()}`,
        { headers: { token } }
      );
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearch, currentPage, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Active" ? "Blocked" : "Active";
      const response = await axios.post(
        backendUrl + "/api/user/status",
        { userId, status: newStatus },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to completely delete this user?")) return;
    try {
      const response = await axios.post(
        backendUrl + "/api/user/delete",
        { userId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalUsers / ITEMS_PER_PAGE));

  const pageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>

        {/* Search bar — triggers backend search with debounce */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
          />
          {/* Loading indicator while debouncing */}
          {loading && (
            <span className="absolute inset-y-0 right-3 flex items-center">
              <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600">
              <th className="py-3 px-4 rounded-tl-lg">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4 text-center">Joined</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th
                className="py-3 px-4 text-right cursor-pointer select-none hover:bg-gray-100 transition-colors group"
                onClick={() => {
                  setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
                  setCurrentPage(1);
                }}
              >
                <span className="inline-flex items-center justify-end gap-1">
                  Total Spent
                  <span className="text-gray-400 group-hover:text-gray-600">
                    {sortOrder === "desc" ? "↓" : "↑"}
                  </span>
                </span>
              </th>
              <th className="py-3 px-4 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                <td className="py-3 px-4 text-center text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.status === "Blocked"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {user.status || "Active"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-semibold text-gray-700">
                  {user.totalSpent > 0
                    ? formatPrice(user.totalSpent)
                    : <span className="text-gray-400 font-normal">—</span>}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => updateUserStatus(user._id, user.status || "Active")}
                    className={`text-xs px-3 py-1 rounded border mr-2 cursor-pointer transition-colors ${
                      user.status === "Blocked"
                        ? "text-blue-600 border-blue-600 hover:bg-blue-50"
                        : "text-orange-600 border-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    {user.status === "Blocked" ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-xs px-3 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && users.length === 0 && (
              <tr>
                <td colSpan="6" className="py-10 text-center text-gray-400">
                  {debouncedSearch
                    ? `Không tìm thấy kết quả cho "${debouncedSearch}"`
                    : "No users found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, totalUsers)}
              </span>{" "}
              of <span className="font-medium">{totalUsers}</span> users
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              {pageNumbers().map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`w-8 h-7 text-xs rounded border transition-colors ${
                    n === currentPage
                      ? "bg-blue-600 text-white border-blue-600 font-semibold"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
