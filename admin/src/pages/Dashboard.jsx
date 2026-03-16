import React, { useState, useEffect } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { formatPrice } from "../utils/formatPrice";
import { toast } from "react-toastify";

// Helper to render growth indicators
const GrowthBadge = ({ value }) => {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue === 0) return <span className="text-gray-500 text-xs mt-1 block">No change</span>;

  if (numValue > 0) {
    return <span className="text-green-600 font-medium text-xs mt-1 block">↑ +{numValue}% from last month.</span>;
  }
  return <span className="text-red-600 font-medium text-xs mt-1 block">↓ {numValue}% from last month.</span>;
};

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/dashboard/stats", {
        headers: { token },
      });
      if (response.data.success) {
        setStats(response.data.stats);
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
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6 w-full">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Operational Dashboard</h1>

      {/* MoM Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</h3>
          <GrowthBadge value={stats.growth.users} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders.toLocaleString()}</h3>
          <GrowthBadge value={stats.growth.orders} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-800 tracking-tight">{formatPrice(stats.totalRevenue)}</h3>
          <GrowthBadge value={stats.growth.revenue} />
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
          <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts.toLocaleString()}</h3>
          <span className="text-gray-400 text-xs mt-1 block">Active in catalog</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Left Column (Wider): Operations (Order Flow) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Order Status Summary */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Order Pipeline</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Order Placed', 'Packing', 'Shipped', 'Delivered'].map((status) => (
                <div key={status} className="bg-gray-50 p-3 rounded-md border border-gray-100 flex flex-col justify-center items-center">
                  <span className="text-2xl font-bold text-blue-600">{stats.orderStatuses[status] || 0}</span>
                  <span className="text-xs font-medium text-gray-500 text-center uppercase tracking-wider">{status}</span>
                </div>
              ))}
            </div>
            {stats.orderStatuses['Cancelled'] > 0 && (
              <p className="text-sm text-red-500 mt-4 text-right">⚠️ {stats.orderStatuses['Cancelled']} Orders Cancelled</p>
            )}
          </div>

          {/* Recent Orders Feed */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800">10 Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-500">
                    <th className="py-2 px-3 font-medium">Customer</th>
                    <th className="py-2 px-3 font-medium">Amount</th>
                    <th className="py-2 px-3 font-medium">Status</th>
                    <th className="py-2 px-3 font-medium text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats.recentOrders && stats.recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 font-medium text-gray-800">
                        {order.customerName}
                        <span className="text-gray-400 text-xs ml-2">({order.itemsCount} items)</span>
                      </td>
                      <td className="py-3 px-3 text-gray-700">{formatPrice(order.amount)}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 text-[10px] rounded-full uppercase tracking-wider font-semibold 
                          ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-500 text-xs">
                        {new Date(order.date).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                  {(!stats.recentOrders || stats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-400">No recent orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Inventory & Products */}
        <div className="flex flex-col gap-6">

          {/* Low Stock Alerts */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-red-200 bg-red-50/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <span className="text-xl">⚠️</span> Low Stock Alerts
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {stats.lowStockProducts && stats.lowStockProducts.map((prod) => (
                <div key={prod._id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img src={prod.image[0]} className="w-10 h-10 object-cover rounded" alt={prod.name} />
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{prod.name}</p>
                      <p className="text-xs text-gray-500">{prod.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-red-500 font-bold bg-red-100 px-2 py-0.5 rounded text-sm block">Qty: {prod.quantity}</span>
                  </div>
                </div>
              ))}
              {(!stats.lowStockProducts || stats.lowStockProducts.length === 0) && (
                <div className="text-center py-4 text-green-600 text-sm font-medium bg-green-50 rounded border border-green-100">
                  ✅ All product inventory levels are healthy.
                </div>
              )}
            </div>
          </div>

          {/* Top Products Compact */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 flex-1">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Top 5 Best Sellers</h2>
            <div className="flex flex-col gap-4">
              {stats.topProducts && stats.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 font-bold w-4">{index + 1}.</span>
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover border border-gray-100" />
                    <div className="flex flex-col max-w-[120px]">
                      <span className="text-sm font-medium text-gray-800 truncate">{product.name}</span>
                      <span className="text-xs text-gray-500">{product.quantity} sold</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{formatPrice(product.revenue)}</span>
                </div>
              ))}
              {(!stats.topProducts || stats.topProducts.length === 0) && (
                <div className="text-center py-6 text-gray-400 text-sm">No sales data recorded yet.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
