import React from 'react'

const Newsletter = () => {

  const onSubmitHandler = () => {
    event.preventDefault();
  }
  return (
    <div className='text-center'>
      <p className='text-2xl font-medium text-gray-800'>Join Barca fans & get 20% off</p>
      <p className='text-gray-400 mt-3'>Nhận ưu đãi & bộ sưu tập áo Barca mới nhất</p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input className='w-full sm:flex-1 outline-none' type="email" placeholder='Nhập email của bạn...' required />
        <button type='submit' className='bg-black text-white text-xs px-10 py-4'>SUBSCRIBERS</button>
      </form>
    </div>
  )
}

export default Newsletter
