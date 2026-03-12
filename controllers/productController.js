const productModel = require("../models/productModel");
const categoryModel = require("../models/categoryModel");
const supplierModel = require("../models/supplierModel");

// Create Product with Supplier and Category Names
const createProduct = async (req, res) => {
    const { name, supplierId, categoryId, price, quantity, initialStock, minimumStock } = req.body;

    console.log('====================================');
    console.log(name, supplierId, categoryId);
    console.log('====================================');
    if (!name || !supplierId || !categoryId || !price || !quantity || !initialStock || !minimumStock) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const supplier = await supplierModel.findById(supplierId);
    const category = await categoryModel.findById(categoryId);

    if (!supplier || !category) {
        return res.status(404).json({ message: 'Supplier or Category not found' });
    }

    try {
        const product = new productModel({
            name,
            supplierId,
            categoryId,
            price,
            quantity,
            initialStock,
            minimumStock,
            categoryName: category.name,
            supplierName: supplier.name,
        });
        const savedProduct = await product.save();
        res.status(201).json({
            message: 'Product created successfully',
            product: savedProduct,
        });
    } catch (error) {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        res.status(500).json({ message: 'Error creating product' });
    }
};


// Load All Products
const getProducts = async (req, res) => {
    try {
        const products = await productModel.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products' });
    }
};

module.exports = { createProduct, getProducts };