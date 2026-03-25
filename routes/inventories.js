var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');

// GET all inventories (join with product)
router.get('/', async function (req, res, next) {
    try {
        let result = await inventoryModel.find().populate({
            path: 'product',
            select: 'title slug price description images category'
        });
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// GET inventory by ID (join with product)
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await inventoryModel.findById(id).populate({
            path: 'product',
            select: 'title slug price description images category'
        });
        if (!result) {
            res.status(404).send({ message: "INVENTORY NOT FOUND" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(404).send({ message: "INVENTORY NOT FOUND" });
    }
});

// POST add_stock - tăng stock tương ứng với quantity
router.post('/add_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "product và quantity (> 0) là bắt buộc" });
        }
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory không tìm thấy cho product này" });
        }
        inventory.stock += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST remove_stock - giảm stock tương ứng với quantity
router.post('/remove_stock', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "product và quantity (> 0) là bắt buộc" });
        }
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory không tìm thấy cho product này" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Stock không đủ để giảm" });
        }
        inventory.stock -= quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST reservation - giảm stock và tăng reserved tương ứng với quantity
router.post('/reservation', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "product và quantity (> 0) là bắt buộc" });
        }
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory không tìm thấy cho product này" });
        }
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Stock không đủ để đặt trước" });
        }
        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// POST sold - giảm reserved và tăng soldCount tương ứng với quantity
router.post('/sold', async function (req, res, next) {
    try {
        let { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).send({ message: "product và quantity (> 0) là bắt buộc" });
        }
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory không tìm thấy cho product này" });
        }
        if (inventory.reserved < quantity) {
            return res.status(400).send({ message: "Reserved không đủ để bán" });
        }
        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
