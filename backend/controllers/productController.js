import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// function for add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestSeller, quantity } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (image) => image !== undefined
    );

    let imageUrl = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path, {
          resource_type: 'image',
        });
        return result.secure_url;
      })
    );

    const parsedSizes = JSON.parse(sizes);
    const parsedQuantity = Number(quantity) || 0;

    let sizesStock = {};
    parsedSizes.forEach(size => {
      sizesStock[size] = parsedQuantity;
    });

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestSeller: bestSeller === 'true' ? true : false,
      sizes: parsedSizes,
      sizesStock: sizesStock,
      quantity: parsedQuantity,
      image: imageUrl,
      date: Date.now(),
    };


    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for list product
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: e.message });
  }
};

// function for remove product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: e.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);

    res.json({ success: true, product });
  } catch (e) {
    console.log(e);
    res.json({ success: false, message: e.message });
  }
};

// function to restock/update product stock
const updateStock = async (req, res) => {
  try {
    const { id, size, addedQuantity } = req.body;
    
    if (!id || !addedQuantity || isNaN(addedQuantity) || addedQuantity <= 0) {
      return res.json({ success: false, message: "Invalid parameters for restocking" });
    }

    const product = await productModel.findById(id);
    if (!product) {
       return res.json({ success: false, message: "Product not found" });
    }

    // Update size-specific stock if size is provided
    if (size) {
      if (!product.sizesStock) {
        product.sizesStock = {};
      }
      product.sizesStock[size] = (product.sizesStock[size] || 0) + Number(addedQuantity);
      product.markModified('sizesStock');
    } else {
      // Update general quantity if no size
      product.quantity = (product.quantity || 0) + Number(addedQuantity);
    }
    
    await product.save();

    res.json({ success: true, message: "Stock replenished successfully", product });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export { addProduct, listProduct, removeProduct, singleProduct, updateStock };