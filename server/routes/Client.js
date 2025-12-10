const express = require('express');
const router = express.Router();
const Client = require('../models/Client'); // Assuming you have a Client model

// Get all clients with pagination, sorting, and filtering
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = req.query;

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const filter = {};
    if (search) {
        // Simple case-insensitive search on name or email
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    const clients = await Client.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();

    const totalClients = await Client.countDocuments(filter);

    res.json({
        clients,
        totalPages: Math.ceil(totalClients / parseInt(limit)),
        currentPage: parseInt(page),
        totalClients,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newClient = new Client(req.body);
    await newClient.save();
    res.json(newClient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).exec();
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update client profile - Added runValidators: true
router.put("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Added for robust validation
    }).exec();
    if (!client) {
      return res.status(404).json({ message: "Client not found" }); 
    }
    res.json(client); 
  } catch (error) {
    res.status(500).json({ message: "Error updating client", error: error.message }); 
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id).exec();
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client deleted" }); 
  } catch (error) {
    res.status(500).json({ message: "Error deleting client" });
  }
});

// Partial update - Added runValidators: true
router.patch("/:id", async (req, res) => {
  const clientId = req.params.id;
  const updateData = req.body;

  try {
    const client = await Client.findByIdAndUpdate(clientId, updateData, {
      new: true,
      runValidators: true,
    });

    res.send(client);
  } catch (error) {
    res.status(500).send({ message: "Error updating client partially", error: error.message });
  }
});

module.exports = router;