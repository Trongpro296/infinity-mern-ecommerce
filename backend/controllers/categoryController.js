import categoryModel from "../models/categoryModel.js";

// Route for adding new category
const addCategory = async (req, res) => {
  try {
    const { name, parent_name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Category name is required" });
    }

    const categoryData = {
      name,
      parent_name: parent_name || "",
      date: Date.now(),
    };

    const category = new categoryModel(categoryData);
    await category.save();

    res.json({ success: true, message: "Category Added", category });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for list category
const listCategory = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.json({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
// Route for removing category
const removeCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Category name is required" });
    }

    // Attempt to delete it 
    await categoryModel.deleteOne({ name });

    res.json({ success: true, message: "Category Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addCategory, listCategory, removeCategory };
