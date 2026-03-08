import { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [quantity, setQuantity] = useState("");

  const [categoriesData, setCategoriesData] = useState([]);

  // States for adding Main Category
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");

  // States for adding Sub Category
  const [isAddingSubCategory, setIsAddingSubCategory] = useState(false);
  const [newSubCatName, setNewSubCatName] = useState("");

  const fetchCategories = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/category/list");
      if (response.data.success) {
        setCategoriesData(response.data.categories);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      if (!newCatName) return toast.error("Please enter a category name");
      const response = await axios.post(
        backendUrl + "/api/category/add",
        { name: newCatName, parent_name: "" },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setNewCatName("");
        setIsAddingCategory(false);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleAddSubCategory = async () => {
    try {
      if (!newSubCatName) return toast.error("Please enter a sub category name");

      const response = await axios.post(
        backendUrl + "/api/category/add",
        { name: newSubCatName, parent_name: "SubCategory" },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setNewSubCatName("");
        setIsAddingSubCategory(false);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleRemoveCategory = async (nameToRemove) => {
    try {
      if (!nameToRemove) return;
      const confirmDelete = window.confirm(`Bạn có chắc muốn xóa danh mục "${nameToRemove}"?`);
      if (!confirmDelete) return;

      const response = await axios.post(backendUrl + "/api/category/remove", { name: nameToRemove }, { headers: { token } });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchCategories();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const defaultMainCats = ["Men", "Women", "Kids"];
  const defaultSubCatsArr = ["Topwear", "Bottomwear", "Winterwear"];

  const dbMainCats = categoriesData.filter((c) => !c.parent_name).map(c => c.name);
  const allMainCategories = [...new Set([...defaultMainCats, ...dbMainCats])];

  const dbSubCats = categoriesData.filter((c) => c.parent_name === "SubCategory").map(c => c.name);
  const allSubCategories = [...new Set([...defaultSubCatsArr, ...dbSubCats])];

  useEffect(() => {
    if (allMainCategories.length > 0 && !allMainCategories.includes(category)) {
      setCategory(allMainCategories[0]);
    }
  }, [categoriesData]);

  useEffect(() => {
    if (allSubCategories.length > 0 && !allSubCategories.includes(subCategory)) {
      setSubCategory(allSubCategories[0]);
    } else if (allSubCategories.length === 0) {
      setSubCategory("");
    }
  }, [categoriesData]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("bestseller", bestseller);
      const orderedSizes = ["S", "M", "L", "XL", "XXL"];
      const sortedSizes = [...sizes].sort((a, b) => orderedSizes.indexOf(a) - orderedSizes.indexOf(b));

      formData.append("sizes", JSON.stringify(sortedSizes));
      formData.append("quantity", quantity);

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const response = await axios.post(
        backendUrl + "/api/product/add",
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setName("");
        setDescription("");
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setPrice("");
        setQuantity("");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col w-full items-start gap-3">
      <div>
        <p className="mb-2 ">Upload Image</p>
        <div className="flex gap-2">
          <label htmlFor="image1">
            <img src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} className="w-20" alt="" />
            <input onChange={(e) => setImage1(e.target.files[0])} type="file" id="image1" hidden />
          </label>

          <label htmlFor="image2">
            <img src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} className="w-20" alt="" />
            <input onChange={(e) => setImage2(e.target.files[0])} type="file" id="image2" hidden />
          </label>

          <label htmlFor="image3">
            <img src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} className="w-20" alt="" />
            <input onChange={(e) => setImage3(e.target.files[0])} type="file" id="image3" hidden />
          </label>

          <label htmlFor="image4">
            <img src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} className="w-20" alt="" />
            <input onChange={(e) => setImage4(e.target.files[0])} type="file" id="image4" hidden />
          </label>
        </div>
      </div>

      <div className="w-full ">
        <p className="mb-2">Product name</p>
        <input className="w-full max-w-[500px] px-3 py-2" type="text" placeholder="Type here" required onChange={(e) => setName(e.target.value)} value={name} />
      </div>

      <div className="w-full ">
        <p className="mb-2">Product description</p>
        <textarea className="w-full max-w-[500px] px-3 py-2" type="text" placeholder="Write content here" required onChange={(e) => setDescription(e.target.value)} value={description} />
      </div>

      <div className="w-full flex gap-4 mb-2">
        <button type="button" onClick={() => { setIsAddingCategory(!isAddingCategory); setIsAddingSubCategory(false); }} className={`text-sm ${isAddingCategory ? 'text-red-500' : 'text-blue-500'}`}>
          {isAddingCategory ? "Add product category" : "+ Add product category"}
        </button>
        <button type="button" onClick={() => { setIsAddingSubCategory(!isAddingSubCategory); setIsAddingCategory(false); }} className={`text-sm ${isAddingSubCategory ? 'text-red-500' : 'text-blue-500'}`}>
          {isAddingSubCategory ? "Add sub category" : "+ Add sub category"}
        </button>
      </div>

      {isAddingCategory && (
        <div className="w-full flex gap-2 items-center mb-4 border p-3 bg-gray-50 max-w-[500px]">
          <input type="text" placeholder="New Category name..." className="px-3 py-2 border flex-1 text-sm" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
          <button type="button" onClick={handleAddCategory} className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors text-sm">Save</button>
        </div>
      )}

      {isAddingSubCategory && (
        <div className="w-full flex gap-2 items-center mb-4 border p-3 bg-gray-50 max-w-[500px]">
          <input type="text" placeholder="New Sub-category name..." className="px-3 py-2 border flex-1 text-sm" value={newSubCatName} onChange={(e) => setNewSubCatName(e.target.value)} />
          <button type="button" onClick={handleAddSubCategory} className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors text-sm">Save</button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 w-full sm:gap-8">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <p className="mb-0">Product category</p>
            {category && !defaultMainCats.includes(category) && (
              <button type="button" onClick={() => handleRemoveCategory(category)} className="text-[10px] text-red-500 hover:text-red-700 bg-red-50 w-5 h-5 flex items-center justify-center rounded cursor-pointer border border-red-200" title="Delete this category">
                ✕
              </button>
            )}
          </div>
          <select onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 mb-2" value={category}>
            {allMainCategories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex gap-2 items-center mb-2">
            <p className="mb-0">Sub category</p>
            {subCategory && !defaultSubCatsArr.includes(subCategory) && (
              <button type="button" onClick={() => handleRemoveCategory(subCategory)} className="text-[10px] text-red-500 hover:text-red-700 bg-red-50 w-5 h-5 flex items-center justify-center rounded cursor-pointer border border-red-200" title="Delete this sub-category">
                ✕
              </button>
            )}
          </div>
          <select onChange={(e) => setSubCategory(e.target.value)} className="w-full px-3 py-2 mb-2" value={subCategory}>
            {allSubCategories.length > 0 ? (
              allSubCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))
            ) : (
              <option value="">No sub-category</option>
            )}
          </select>
        </div>

        <div>
          <p className="mb-2">Product Price</p>
          <input type="number" className="w-full px-3 py-2 sm:w-[120px]" placeholder="250000" onChange={(e) => setPrice(e.target.value)} value={price} />
        </div>

        <div>
          <p className="mb-2">Product Quantity</p>
          <input type="number" className="w-full px-3 py-2 sm:w-[120px]" placeholder="10" onChange={(e) => setQuantity(e.target.value)} value={quantity} required />
        </div>
      </div>

      <div>
        <p className="mb-2">Product Sizes</p>
        <div className="flex gap-3 ">
          <div onClick={() => setSizes((p) => p.includes("S") ? p.filter((item) => item !== "S") : [...p, "S"])}>
            <p className={`${sizes.includes("S") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer `}>S</p>
          </div>

          <div onClick={() => setSizes((p) => p.includes("M") ? p.filter((item) => item !== "M") : [...p, "M"])}>
            <p className={`${sizes.includes("M") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer `}>M</p>
          </div>

          <div onClick={() => setSizes((p) => p.includes("L") ? p.filter((item) => item !== "L") : [...p, "L"])}>
            <p className={`${sizes.includes("L") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer `}>L</p>
          </div>

          <div onClick={() => setSizes((p) => p.includes("XL") ? p.filter((item) => item !== "XL") : [...p, "XL"])}>
            <p className={`${sizes.includes("XL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer `}>XL</p>
          </div>

          <div onClick={() => setSizes((p) => p.includes("XXL") ? p.filter((item) => item !== "XXL") : [...p, "XXL"])}>
            <p className={`${sizes.includes("XXL") ? "bg-pink-100" : "bg-slate-200"} px-3 py-1 cursor-pointer `}>XXL</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-2">
        <input onChange={() => setBestseller((p) => !p)} checked={bestseller} type="checkbox" id="bestseller" />
        <label className="cursor-pointer" htmlFor="bestseller">Add to bestseller</label>
      </div>

      <button className="w-28 py-3 mt-4 bg-black text-white" type="submit">Add</button>
    </form>
  );
};

export default Add;