import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';
import axios from 'axios';

const Collection = () => {

  const { products, search, showSearch, backendUrl } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState('relavent');
  const [categoriesList, setCategoriesList] = useState([]);

  // Fetch categories dynamically from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/category/list');
      if (response.data.success) {
        setCategoriesList(response.data.categories);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory(prev => prev.filter(item => item != e.target.value))
    }
    else {
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {

    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }

    setFilterProducts(productsCopy);
  }

  const sortProduct = () => {

    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case 'low-hight':
        setFilterProducts(fpCopy.sort((a, b) => (a.price - b.price)));
        break;

      case 'hight-low':
        setFilterProducts(fpCopy.sort((a, b) => (b.price - a.price)));
        break;

      default:
        applyFilter();
        break;
    }

  }

  useEffect(() => {
    setFilterProducts(products);
  }, [])

  useEffect(() => {
    applyFilter();
  }, [category, search, showSearch, products])

  useEffect(() => {
    sortProduct();
  }, [sortType])
  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>

      {/* Filter Option */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>FILTERS
          <img src={assets.dropdown_icon} className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} alt="" />
        </p>

        {/* Category Filters - Dynamic from API */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {categoriesList.map((cat) => (
              <p className='flex gap-2' key={cat._id}>
                <input className='w-3' type="checkbox" value={cat.name} onChange={toggleCategory} />{cat.name}
              </p>
            ))}
            {categoriesList.length === 0 && (
              <p className='text-gray-400 text-xs'>No categories available</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1={'ALL'} text2={'COLLECTONS'} />
          {/* Procucts Sort */}
          <select onChange={(e) => setSortType(e.target.value)} className='border border-gray-300 text-sm px-2'>
            <option value="relavent">Sort by: Relavent</option>
            <option value="low-hight">Sort by: Low to Hight</option>
            <option value="hight-low">Sort by: Hight to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
          {
            filterProducts.map((item, index) => (
              <ProductItem key={index} id={item._id} name={item.name} price={item.price} image={item.image} />
            ))
          }
        </div>

      </div>
    </div>
  )
}

export default Collection
