import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { formatPrice } from '../utils/formatPrice';
import axios from 'axios';

const Orders = () => {

  const { backendUrl, token } = useContext(ShopContext);

  const [orderData, setorderData] = useState([]);

  const loadOrderData = async () => {
    try {

      if (!token) {
        return null
      }

      const response = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } })

      if (response.data.success) {
        const sortedOrders = response.data.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        setorderData(sortedOrders);
      }

    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    loadOrderData();
  }, [token])

  return (
    <div className='border-t pt-16'>

      <div className='text-2xl'>
        <Title text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className=''>
        {
          orderData.map((order, index) => (
            <div key={index} className='py-6 border-t border-b text-gray-700 flex flex-col gap-4'>
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100'>
                <div>
                  <p className='sm:text-base font-medium'>Order ID: <span className='text-gray-400 font-normal'>#{order._id.slice(-6).toUpperCase()}</span></p>
                  <p className='mt-1 text-sm'>Date: <span className='text-gray-400'>{new Date(order.date).toDateString()}</span></p>
                  <p className='mt-1 text-sm'>Payment: <span className='text-gray-400'>{order.paymentMethod}</span></p>
                  <p className='mt-1 text-sm'>Total: <span className='text-black font-medium'>{formatPrice(order.amount)}</span></p>
                </div>
                <div className='md:w-1/2 flex flex-col md:flex-row justify-between md:justify-end gap-4 md:items-center'>
                  <div className='flex items-center gap-2'>
                    <p className='min-w-2 h-2 rounded-full bg-green-500'></p>
                    <p className='text-sm md:text-base'>{order.status}</p>
                  </div>
                  <button onClick={loadOrderData} className='border px-4 py-2 text-sm font-medium rounded-sm active:bg-gray-100 hover:bg-gray-50 transition-all'>Track Order</button>
                </div>
              </div>

              <div className='flex flex-col gap-3 mt-2 bg-gray-50 p-4 rounded'>
                {order.items.map((item, itemIndex) => (
                  <div key={itemIndex} className='flex items-start gap-4 text-sm pb-3 border-b border-gray-200 last:border-0 last:pb-0'>
                    <img className='w-12 sm:w-16 rounded object-cover' src={item.image?.[0]} alt="" />
                    <div className='flex-1'>
                      <p className='sm:text-base font-medium'>{item.name}</p>
                      <div className='flex items-center gap-4 mt-1 text-sm text-gray-600'>
                        <p className='font-medium text-black'>{formatPrice(item.price)}</p>
                        <p>Qty: {item.quantity}</p>
                        <p className='px-2 py-0.5 bg-gray-200 text-xs rounded'>Size: {item.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        }
      </div>
    </div>

  )
}

export default Orders
