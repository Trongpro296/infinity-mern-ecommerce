import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import { formatPrice } from '../utils/formatPrice';

const CartTotal = () => {

  const { delivery_fee, getCartAmount } = useContext(ShopContext);

  return (
    <div className='w-full'>
      <div className='text=2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>{formatPrice(getCartAmount())}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
          <p>Shipping fee</p>
          <p>{formatPrice(delivery_fee)}</p>
        </div>
        <hr />
        <div className='flex justify-between'>
          <b>Total</b>
          <b>{formatPrice(getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal
