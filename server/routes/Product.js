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
    updateFields.quantity = quantity;
  }


  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: "At least one field is required" });
  }

  next();
};

router.post("/", upload.single("image"), validateProduct, async (req, res) => {
  try {
    const { name, price, description, category, brand } = req.body;
    const image = req.file.filename;

    const product = new Product({
      name,
      price,
      description,
      category,
      brand,
      image,
    });

    await product.save();

    res.json({ message: "Product created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
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
    const updateFields = {};

    if (req.file) {
      updateFields.image = req.file.filename;
    }

    if (req.body.name) {
      updateFields.name = req.body.name.trim();
    }
    if (req.body.description) {
      updateFields.description = req.body.description.trim();
    }
    if (req.body.category) {
      updateFields.category = req.body.category.trim();
    }
    if (req.body.brand) {
      updateFields.brand = req.body.brand.trim();
    }
    if (req.body.quantity) {
      updateFields.quantity = req.body.quantity;
    }


    const product = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
        { new: true });
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