import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProduct from '../components/RelatedProduct';
import { formatPrice } from '../utils/formatPrice';

const Product = () => {

  const { productId } = useParams();
  const { products, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size, setSize] = useState('')

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity eare-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/* Product Image */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
            {
              productData.image.map((item, index) => (
                <img onClick={() => setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
              ))
            }
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1 '>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_icon} alt="" className="w-3" />
            <img src={assets.star_dull_icon} alt="" className="w-3" />
            <p className='pl-2'>(122)</p>
          </div>

          {(() => {
            const currentStock = size && productData.sizesStock && productData.sizesStock[size] !== undefined
              ? productData.sizesStock[size]
              : productData.quantity;

            const isSoldOut = size && currentStock <= 0;

            return (
              <React.Fragment>
                {isSoldOut
                  ? <p className='mt-5 text-3xl font-medium text-red-500'>Sold out</p>
                  : <p className='mt-5 text-3xl font-medium'>{formatPrice(productData.price)}</p>
                }
                <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
                <div className='flex flex-col gap-4 my-8'>
                  <div className='flex items-center gap-4'>
                    <p>Select Size</p>
                    {size && (
                      <p className="text-sm text-gray-500">(Còn lại: {currentStock} sản phẩm)</p>
                    )}
                  </div>
                  <div className='flex gap-2'>
                    {productData.sizes && [...productData.sizes].sort((a, b) => {
                      const orderedSizes = ["S", "M", "L", "XL", "XXL"];
                      return orderedSizes.indexOf(a) - orderedSizes.indexOf(b);
                    }).map((item, index) => (
                      <button onClick={() => setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => addToCart(productData._id, size)}
                  className={`px-8 py-3 text-sm ${isSoldOut ? 'bg-gray-400 cursor-not-allowed text-gray-200' : 'bg-black text-white active:bg-gray-700'}`}
                  disabled={isSoldOut}
                >
                  ADD TO CART
                </button>
              </React.Fragment>
            );
          })()}
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1 '>
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* Description & Review Section */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews (122) </p>
        </div>
        <div className='flex flex-col border gap-4 px-6 py-6 text-sm text-gray-500'>
          <p>Designed with the iconic blaugrana stripes, this jersey features a gradient effect in blue and red tones that gives it a modern and dynamic style. The FC Barcelona crest is placed on the chest, on the left side, while the Nike logo appears on the right side.
            Inspired by the pros, our Stadium collection combines details with sweat-wicking technology to give you a match-ready look inspired by your favorite team. Stay dry.</p>
          <p>Nike Dri-FIT technology moves sweat away from your skin for quicker evaporation, helping you stay dry and comfortable.
            Color: Blue and Red
            100% polyester
          </p>
        </div>
      </div>

      {/* Display related */}
      <RelatedProduct category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : <div className='opacity-0'></div>
}

export default Product
