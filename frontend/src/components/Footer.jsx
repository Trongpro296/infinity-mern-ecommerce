import React from 'react'
import { assets } from '../assets/assets'
import { FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { RiInstagramFill } from "react-icons/ri";
import { FaFacebook } from "react-icons/fa";

const Footer = () => {
  return (
    <div>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

        <div>
          <img src={assets.logo} className='mb-5 w-32' alt="" />
          <p className='w-full md:w-2/3 text-gray-600'>At INFINITY, we deliver a football lifestyle for true fans, offering high-quality kits and sportswear inspired by the Blaugrana spirit.</p>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>Home</li>
            <li>About us</li>
            <li>Delivery</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        <div>
          <p className='text-xl font-medium mb-5'>CONTACT</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li className='flex items-center gap-2'><FaPhone /> (+84) 888149225</li>
            <li className='flex items-center gap-2'><MdEmail />hoangtrong2962005@gmail.com</li>
            <li className='flex items-center gap-2'><RiInstagramFill />hm.trong296</li>
            <li className='flex items-center gap-2'><FaFacebook />Hoang Trong</li>
          </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>
          Copyright 2026 hm.trong296 - All Right Reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer
