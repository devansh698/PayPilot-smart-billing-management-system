const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../paypilot/public/uploads"));
    
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

const validateProduct = (req, res, next) => {
  const { name, price, description, category, brand,quantity } = req.body;
  const updateFields = {};

  if (name) {
    updateFields.name = name.trim();
  }
  if (price) {
    updateFields.price = price.trim();
  }
  if (description) {
    updateFields.description = description.trim();
  }
  if (category) {
    updateFields.category = category.trim();
  }
  if (brand) {
    updateFields.brand = brand.trim();
  }
  if (quantity) {
    // Convert quantity to number and validate
    const numQuantity = Number(quantity);
    if (!isNaN(numQuantity) && numQuantity >= 0) {
        updateFields.quantity = numQuantity;
    } else if(quantity !== undefined) {
         return res.status(400).json({ error: "Quantity must be a valid non-negative number." });
    }
  }


  if (Object.keys(updateFields).length === 0 && !req.file) { 
    return res.status(400).json({ error: "At least one field or an image is required" });
  }

  req.validatedUpdateFields = updateFields;

  next();
};

router.post("/", upload.single("image"), validateProduct, async (req, res) => {
  try {
    const { name, price, description, category, brand, quantity } = req.validatedUpdateFields; 
    const image = req.file ? req.file.filename : null;

    const product = new Product({
      name,
      price,
      description,
      category,
      brand,
      image,
      quantity: quantity || 0,
    });

    await product.save();

    res.json({ message: "Product created successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all products with pagination, sorting, and filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '', category, brand } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
        ];
    }

    if (category) {
        filter.category = category;
    }

    if (brand) {
        filter.brand = brand;
    }


    const products = await Product.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalProducts = await Product.countDocuments(filter);

    res.json({
        products,
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        currentPage: parseInt(page),
        totalProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", upload.single("image"), validateProduct, async (req, res) => {
  try {
    const id = req.params.id;
    const updateFields = req.validatedUpdateFields;

    if (req.file) {
      updateFields.image = req.file.filename;
    }
    
    const product = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true, 
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) =>{
  const id = req.params.id;
  const updateData = req.body;
  console.log("id",id,updateData);
  try {
    const product= await Product.findByIdAndUpdate(id,updateData,
        { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;