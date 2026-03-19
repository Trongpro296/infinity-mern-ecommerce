import axios from "axios";
import { useEffect, useState } from "react";
import { backendUrl } from "../App";
import { formatPrice } from "../utils/formatPrice";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const [activeSizeMap, setActiveSizeMap] = useState({});

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const restockProduct = async (id, name, size) => {
    if (!size) {
      toast.error("Vui lòng chọn size cần restock trước khi bổ sung hàng");
      return;
    }

    const quantityStr = prompt(`Nhập số lượng hàng cần bổ sung cho size ${size} của sản phẩm "${name}":`, "10");
    if (!quantityStr) return; // User cancelled

    const addedQuantity = parseInt(quantityStr, 10);
    if (isNaN(addedQuantity) || addedQuantity <= 0) {
      toast.error("Vui lòng nhập một số lượng hợp lệ lớn hơn 0");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/product/update-stock",
        { id, size, addedQuantity },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">All Products Lists</p>
      <div className="flex flex-col gap-2">
        {/* LIST TABLE TITLE */}

        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1.5fr_1fr_1.5fr_1fr] items-center py-1 px-2 border text-sm bg-gray-100">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Sizes</b>
          <b>Price</b>
          <b>Stock</b>
          <b className="text-center">Action</b>
        </div>

        {/* PRODUCT LIST */}
        {list.map((item, i) => {
          const activeSize = activeSizeMap[item._id] || null;
          const totalStock = item.sizesStock
            ? Object.values(item.sizesStock).reduce((a, b) => a + b, 0)
            : 0;
          const currentStock = activeSize && item.sizesStock
            ? (item.sizesStock[activeSize] ?? 0)
            : totalStock;

          return (
            <div
              key={i}
              className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1.5fr_1fr_1.5fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            >
              <img className="w-12 " src={item.image[0]} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <div className="flex gap-1 flex-wrap">
                {item.sizes && [...item.sizes].sort((a, b) => {
                  const orderedSizes = ["S", "M", "L", "XL", "XXL"];
                  return orderedSizes.indexOf(a) - orderedSizes.indexOf(b);
                }).map((size, idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveSizeMap(prev => ({ ...prev, [item._id]: size }))}
                    className={`px-2 py-0.5 text-xs cursor-pointer rounded ${activeSize === size ? 'bg-pink-200 font-bold' : 'bg-gray-200'}`}
                  >
                    {size}
                  </span>
                ))}
              </div>
              <p>
                {formatPrice(item.price)}
              </p>
              <div className="flex flex-col items-start gap-1">
                <p>
                  {activeSize
                    ? <><span className="font-semibold text-pink-600 mr-1">({activeSize})</span>{currentStock} - {currentStock > 0 ? "In stock" : "Out of stock"}</>
                    : <span className="text-gray-500">Tổng: {currentStock}</span>
                  }
                </p>
                <button
                  onClick={() => restockProduct(item._id, item.name, activeSize)}
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 text-xs px-2 py-1 flex items-center gap-1 rounded border border-blue-200 transition-colors"
                >
                  <span>+</span> Restock
                </button>
              </div>
              <p
                onClick={() => removeProduct(item._id)}
                className="text-right md:text-center cursor-pointer text-lg text-red-500 hover:text-red-700 font-bold"
              >
                X
              </p>
            </div>
          )
        })}
      </div>
    </>
  );
};

export default List;