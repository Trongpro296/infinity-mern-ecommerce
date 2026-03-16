import React, { useState, useContext } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

const Newsletter = () => {

  const [email, setEmail] = useState('');
  const { backendUrl, token } = useContext(ShopContext);

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const headers = {};
      if (token) headers.token = token;

      const response = await axios.post(backendUrl + '/api/newsletter/subscribe', { email }, { headers })
      if (response.data.success) {
        toast.success(response.data.message);
        setEmail('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  return (
    <div className='text-center'>
      <p className='text-2xl font-medium text-gray-800'>Join Barca fans & get 20% off</p>
      <p className='text-gray-400 mt-3'>Nhận ưu đãi & bộ sưu tập áo Barca mới nhất</p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full sm:flex-1 outline-none' 
          type="email" 
          placeholder='Nhập email của bạn...' 
          required 
        />
        <button type='submit' className='bg-black text-white text-xs px-10 py-4'>SUBSCRIBERS</button>
      </form>
    </div>
  )
}

export default Newsletter
