import React, { useContext, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import { formatPrice } from '../utils/formatPrice';
import { toast } from 'react-toastify';
import axios from 'axios';

const CartTotal = ({ showVoucher = false }) => {

  const { delivery_fee, getCartAmount, discountPercent, setDiscountPercent, backendUrl, token, setAppliedVoucher } = useContext(ShopContext);
  const [voucherCode, setVoucherCode] = useState('');

  const applyVoucher = async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập để sử dụng mã giảm giá!');
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + '/api/order/apply-voucher',
        { voucherCode: voucherCode.trim().toUpperCase() },
        { headers: { token } }
      );

      if (response.data.success) {
        setDiscountPercent(response.data.discountPercent || 20);
        setAppliedVoucher(voucherCode.trim().toUpperCase());
        toast.success(response.data.message);
      } else {
        setDiscountPercent(0);
        setAppliedVoucher('');
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const cartAmount = getCartAmount();
  const discountAmount = (cartAmount * discountPercent) / 100;
  const finalTotal = cartAmount === 0 ? 0 : cartAmount - discountAmount + delivery_fee;

  return (
    <div className='w-full'>
      <div className='text=2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{formatPrice(cartAmount)}</p>
        </div>

        {discountPercent > 0 && (
          <div className='flex justify-between text-green-600'>
            <p>Discount (20%)</p>
            <p>- {formatPrice(discountAmount)}</p>
          </div>
        )}

        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{formatPrice(delivery_fee)}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
          <b>Total</b>
          <b>{formatPrice(finalTotal)}</b>
        </div>
      </div>

      {/* Voucher Input Section */}
      {showVoucher && (
        <div className='mt-6 border-t pt-4'>
          <p className="text-sm text-gray-600 mb-2">Enter voucher code (if any)</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="BARCA20"
              className="border border-gray-300 rounded px-3 py-1.5 w-full text-sm outline-none uppercase"
            />
            <button
              onClick={applyVoucher}
              type="button"
              className="bg-black text-white text-xs px-4 py-2 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartTotal
