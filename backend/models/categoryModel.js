import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  parent_name: { type: String, default: "" },
  date: { type: Number, required: true },
});

const categoryModel =
  mongoose.models.category || mongoose.model("category", categorySchema);
export default categoryModel;
