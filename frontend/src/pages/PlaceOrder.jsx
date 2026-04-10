import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';

import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const PROVINCES_API = 'https://provinces.open-api.vn/api/v2';

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');
  const { navigate, backendUrl, token, cartItems, setCartItem, getCartAmount, delivery_fee, products, discountPercent, appliedVoucher, setAppliedVoucher, setDiscountPercent } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    phone: "",
  });

  // Vietnam address states
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [provinceName, setProvinceName] = useState("");
  const [wardName, setWardName] = useState("");

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/p/`);
        setProvinces(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch wards when province changes (v2: wards directly under province)
  useEffect(() => {
    if (!selectedProvince) {
      setWards([]);
      setSelectedWard("");
      setWardName("");
      return;
    }
    const fetchWards = async () => {
      try {
        const res = await axios.get(`${PROVINCES_API}/p/${selectedProvince}?depth=2`);
        setProvinceName(res.data.name);
        setWards(res.data.wards || []);
      } catch (error) {
        console.log(error);
      }
    };
    fetchWards();
    setSelectedWard("");
    setWardName("");
  }, [selectedProvince]);

  // Set ward name when ward changes
  useEffect(() => {
    if (selectedWard) {
      const ward = wards.find((w) => String(w.code) === String(selectedWard));
      if (ward) setWardName(ward.name);
    } else {
      setWardName("");
    }
  }, [selectedWard]);

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!selectedProvince || !selectedWard) {
      toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã");
      return;
    }

    try {

      let orderItems = []

      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find(products => products._id === items))
            if (itemInfo) {
              itemInfo.size = item
              itemInfo.quantity = cartItems[items][item]
              orderItems.push(itemInfo)
            }
          }
        }
      }

      const cartAmount = getCartAmount();
      const discountAmount = (cartAmount * discountPercent) / 100;
      const finalAmount = cartAmount === 0 ? 0 : cartAmount - discountAmount + delivery_fee;

      let orderData = {
        address: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          street: formData.street,
          province: provinceName,
          ward: wardName,
          phone: formData.phone,
        },
        items: orderItems,
        amount: finalAmount,
        appliedVoucher: appliedVoucher || null
      }

      switch (method) {
        case 'cod':
          const response = await axios.post(backendUrl + '/api/order/place', orderData, { headers: { token } })
          if (response.data.success) {
            setCartItem({})
            setAppliedVoucher('')
            setDiscountPercent(0)
            navigate('/orders')
          }
          else {
            toast.error(response.data.message)
          }
          break;
        default:
          break;
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

  }
  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
      {/* Left side */}
      <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>

        <div className='text-xl sm:text-2xl my-3'>
          <Title text1={'DELIVERY'} text2={'INFORMATION'} />
        </div>
        <div className='flex gap-3'>
          <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
          <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
        </div>
        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street address' />

        {/* Province & Ward */}
        <div className='flex gap-3'>
          <select
            required
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${selectedProvince ? 'text-gray-700' : 'text-gray-400'}`}
          >
            <option value="" disabled className='text-gray-400'>Select Province/City</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code} className='text-gray-700'>{p.name}</option>
            ))}
          </select>

          <select
            required
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className={`border border-gray-300 rounded py-1.5 px-3.5 w-full ${selectedWard ? 'text-gray-700' : 'text-gray-400'}`}
            disabled={!selectedProvince}
          >
            <option value="" disabled className='text-gray-400'>Select Ward/Commune</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code} className='text-gray-700'>{w.name}</option>
            ))}
          </select>
        </div>

        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Phone' />
      </div>

      {/* Right Side */}
      <div className='mt-8'>
        <div className='mt-8 min-w-80'>
          <CartTotal showVoucher={true} />
        </div>

        <div className='mt-12'>
          <Title text1={'PAYMENT'} text2={'METHOD'} />

          {/* Payment method section */}
          <div className='flex gap-3 flex-col lg:flex-row'>
            <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
              <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
            </div>
          </div>

          <div className='w-full text-end mt-8'>
            <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
          </div>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
