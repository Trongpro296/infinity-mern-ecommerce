import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

  const currency = '₫';
  // [L-4] delivery_fee cố định tạm thời — nếu muốn admin điều chỉnh được thì fetch từ backend
  const delivery_fee = 30000;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItem] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0); // 0 or 20
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const navigate = useNavigate()


  const addToCart = async (itemId, size) => {

    if (!size) {
      toast.error('Select Product Size')
      return;
    }

    const productData = products.find((product) => product._id === itemId);
    if (productData) {
      const currentStock = productData.sizesStock && productData.sizesStock[size] !== undefined
        ? productData.sizesStock[size]
        : productData.quantity;

      if (currentStock <= 0) {
        toast.error('Sản phẩm này đã hết hàng!');
        return;
      }
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      }
      else {
        cartData[itemId][size] = 1;
      }
    }
    else {
      cartData[itemId] = {}
      cartData[itemId][size] = 1;
    }
    setCartItem(cartData);

    if (token) {
      try {

        await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } });

      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }

  }


  const getCartCount = () => {
    let totalCount = 0

    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item]
          }
        } catch (error) {

        }
      }
    }
    return totalCount;
  }

  const updateQuantity = async (itemId, size, quantity) => {

    let cartData = structuredClone(cartItems);
    cartData[itemId][size] = quantity;
    setCartItem(cartData);

    if (token) {
      try {
        await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } });
      }
      catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    }
  }

  const getCartAmount = () => {
    let totalAmount = 0

    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item]
          }
        } catch (error) {

        }
      }
    }
    return totalAmount
  }

  const getProducts = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setProducts(response.data.products);
      }
      else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } });
      if (response.data.success) {
        setCartItem(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getProducts();
  }, [])

  useEffect(() => {
    if (!token && localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
      getUserCart(localStorage.getItem('token'));
    }
  }, [])

  const value = {
    products, currency, delivery_fee,
    search, showSearch, setSearch, setShowSearch,
    cartItems, addToCart, setCartItem,
    getCartCount, updateQuantity,
    getCartAmount, navigate, backendUrl,
    token, setToken,
    discountPercent, setDiscountPercent,
    appliedVoucher, setAppliedVoucher
  }

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  )
}

export default ShopContextProvider;