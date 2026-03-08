import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import Newsletter from '../components/Newsletter'

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>
            INFINITY was born from a deep passion for football and a love for the Blaugrana spirit. Our journey began with a simple goal: to create a dedicated online destination where football fans can easily find authentic-inspired Barcelona sportswear and accessories.
            From match-day jerseys to training gear and everyday football fashion, we carefully select products that combine quality, comfort, and style. Every item reflects the passion, pride, and identity of true football lovers.
            At INFINITY, we don’t just sell sportswear — we celebrate football culture.
          </p>
          <b className='text-gray-800'>Our Misson</b>
          <p>Our mission at INFINITY is to bring football fans closer to the game they love by offering high-quality football apparel with a smooth, reliable, and enjoyable shopping experience.
            We are committed to:
            Delivering stylish and durable football sportswear
            Making online shopping simple and convenient
            Helping fans express their passion for football every day</p>
        </div>
      </div>

      <div className='text-xl py-4'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>We carefully select every product to ensure high quality, comfort, and durability for football fans and players.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience: </b>
          <p className='text-gray-600'>Enjoy a smooth and easy shopping experience with a user-friendly interface and fast, hassle-free ordering.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>Our team is always ready to support you, ensuring satisfaction before and after every purchase.</p>
        </div>
      </div>

      <Newsletter />
    </div>

  )
}

export default About
