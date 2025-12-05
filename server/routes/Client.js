
const express = require('express');
const router = express.Router();
const Client = require('../models/Client'); // Assuming you have a Client model
router.get("/", async (req, res) => {
  try {
    const clients = await Client.find().exec();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients" });
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
    res.json(client); // Only send one response
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();
    if (!client) {
      return res.status(404).json({ message: "Client not found" }); 
    }
    res.json(client); 
  } catch (error) {
    res.status(500).json({ message: "Error updating client" }); 
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
router.patch("/:id", async (req, res) => {
  const clientId = req.params.id;

  const updateData = req.body;

  try {
    const client = await Client.findByIdAndUpdate(clientId, updateData, {
      new: true,
    });

    res.send(client);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;