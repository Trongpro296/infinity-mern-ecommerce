import mongoose from "mongoose";
import dotenv from "dotenv";
import productModel from "./models/productModel.js";

dotenv.config();

mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`)
  .then(async () => {
    console.log("Connected to DB");
    const products = await productModel.find({});
    let count = 0;
    for (let p of products) {
      console.log(`Checking ${p.name}: sizes=${p.sizes}, sizesStock=`, p.sizesStock);
      let needsMigration = false;
      let currentSizesStock = p.sizesStock || {};

      if (p.sizes && p.sizes.length > 0) {
        for (let sz of p.sizes) {
          if (currentSizesStock[sz] === undefined) {
            needsMigration = true;
            currentSizesStock[sz] = p.quantity || 0;
          }
        }
      }

      if (needsMigration || !p.sizesStock) {
        p.sizesStock = currentSizesStock;
        p.markModified('sizesStock');
        await p.save();
        count++;
        console.log('Migrated', p.name, 'with sizesStock:', p.sizesStock);
      }
    }
    console.log('Successfully migrated', count, 'products.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
