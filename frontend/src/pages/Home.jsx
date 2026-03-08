import React from 'react'
import Hero from '../components/Hero'
import LastestCollection from '../components/LastestCollection'
import BestSeller from '../components/BestSeller'
import OurPolicy from '../components/OurPolicy'
import Newsletter from '../components/Newsletter'

const Home = () => {
  return (
    <div>
      <Hero />
      <LastestCollection />
      <BestSeller />
      <OurPolicy />
      <Newsletter />
    </div>
  )
}

export default Home
