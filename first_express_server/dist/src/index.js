"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const faker_1 = require("@faker-js/faker");
const app = (0, express_1.default)();
app.use(express_1.default.json({
    type: ["application/jsons", "application/json"], // trying to parse using a custom header
}));
const products = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    name: faker_1.faker.commerce.productName(),
    price: +faker_1.faker.commerce.price(),
    description: faker_1.faker.commerce.productDescription(),
}));
app.get("/products", (req, res) => {
    const query = req.query;
    console.log("queries ", query);
    let filteredProducts = [...products];
    if (query.filter) {
        const filterProps = query.filter.split(",");
        filteredProducts = products.map((product) => {
            // make an object that only conatins they id then check of the prop is key of product if it has attribute
            const filteredProduct = { id: product.id };
            filterProps.forEach((key) => {
                if (key in product) {
                    filteredProduct[key] = product[key];
                }
            });
            return filteredProduct;
        });
    }
    if (query.sort) {
        const [sortField, sortOrder] = query.sort.split(":");
        filteredProducts.sort((a, b) => {
            if (!a[sortField] || !b[sortField])
                return 0;
            return sortOrder === "desc"
                ? b[sortField] - a[sortField]
                : a[sortField] - b[sortField];
        });
    }
    const limit = query.limit ? parseInt(query.limit, 10) : 10;
    const page = query.page ? parseInt(query.page, 10) : 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    filteredProducts = filteredProducts.slice(startIndex, endIndex);
    res.json(filteredProducts);
});
app.get("/products/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    if (!isNaN(productId)) {
        const product = products.find((p) => p.id === productId);
        if (product) {
            res.json(product);
        }
        else {
            res.status(404).json({ error: "Product not found" });
        }
    }
    else {
        res.status(400).json({ error: "Invalid product ID" });
    }
});
app.post("/create-product", (req, res) => {
    // don't forget to parse the body using middlewares
    const { name, price, description } = req.body;
    console.log("body ", req.body);
    if (!name || !price || !description) {
        res.status(400).json({ error: "Invalid product data" });
        return;
    }
    const newProduct = {
        id: products.length + 1,
        name,
        price,
        description,
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});
app.delete("/product/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    if (!isNaN(productId)) {
        const productIndex = products.findIndex((p) => p.id === productId);
        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            res.status(204).end();
        }
        else {
            res.status(404).json({ error: "Product not found" });
        }
    }
    else {
        res.status(400).json({ error: "Invalid product ID" });
    }
});
app.put("/product/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    const product = req.body;
    if (!isNaN(productId)) {
        const productIndex = products.findIndex((p) => p.id === productId);
        if (productIndex !== -1) {
            if (!product.name || !product.price || !product.description) {
                res.status(400).json({ error: "Invalid product data" });
                return;
            }
            products[productIndex] = Object.assign(Object.assign({}, products[productIndex]), product);
            res.json(products[productIndex]);
        }
        else {
            res.status(404).json({ error: "Product not found" });
        }
    }
    else {
        res.status(400).json({ error: "Invalid product ID" });
    }
});
app.patch("/product/:id", (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, price, description } = req.body;
    if (!isNaN(productId)) {
        const productIndex = products.findIndex((p) => p.id === productId);
        if (productIndex !== -1) {
            if (name)
                products[productIndex].name = name;
            if (price)
                products[productIndex].price = price;
            if (description)
                products[productIndex].description = description;
            res.json(products[productIndex]);
        }
        else {
            res.status(404).json({ error: "Product not found" });
        }
    }
    else {
        res.status(400).json({ error: "Invalid product ID" });
    }
});
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Express server is running on http://localhost:${PORT}`);
});
