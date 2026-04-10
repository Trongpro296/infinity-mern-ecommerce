import { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";


const Categories = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setCategories(response.data.categories);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      if (!newCatName.trim()) return toast.error("Vui lòng nhập tên danh mục");

      const response = await axios.post(
        backendUrl + "/api/category/add",
        { name: newCatName.trim() },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setNewCatName("");
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleRemoveCategory = async (name) => {
    try {
      const confirmDelete = window.confirm(
        `Bạn có chắc muốn xóa danh mục "${name}"?`
      );
      if (!confirmDelete) return;

      const response = await axios.post(
        backendUrl + "/api/category/remove",
        { name },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="text-2xl font-bold text-gray-800">Categories</h1>

      {/* Add Category Form */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Add New Category</h2>
        <div className="flex gap-3 items-center max-w-[500px]">
          <input
            type="text"
            placeholder="Category name..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-500 transition-colors"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-medium w-12">#</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Date Added</th>
                <th className="py-3 px-4 font-medium text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{cat.name}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">
                      {new Date(cat.date).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRemoveCategory(cat.name)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors text-xs font-medium"
                        title="Xóa danh mục"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-400">
                    Chưa có danh mục nào. Hãy thêm danh mục đầu tiên!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
