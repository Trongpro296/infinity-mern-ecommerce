import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Users = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(backendUrl + "/api/user/list", {
        headers: { token },
      });
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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
      console.log(error);
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
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-gray-600 text-sm">
              <th className="py-3 px-4 rounded-tl-lg">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4 text-center">Joined</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "Blocked"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.status || "Active"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => updateUserStatus(user._id, user.status || "Active")}
                    className={`text-sm px-3 py-1 rounded border mr-2 cursor-pointer transition-colors ${
                      user.status === "Blocked"
                        ? "text-blue-600 border-blue-600 hover:bg-blue-50"
                        : "text-orange-600 border-orange-600 hover:bg-orange-50"
                    }`}
                  >
                    {user.status === "Blocked" ? "Unblock" : "Block"}
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="text-sm px-3 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
