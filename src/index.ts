import express from "express";
import ProductController from "./controllers/Product.controller";
import ProductService from "./services/Product.service";

// much cleaner
const app = express();
app.use(express.json());
const productService = new ProductService();
const productController = new ProductController(productService);
app.get("/products", productController.getAllProducts);
app.get("/products/length", productController.getProductsLength);
app.get("/products/:id", productController.getProductById);
app.post("/products", productController.createProduct);
app.patch("/products/:id", productController.patchProduct);
app.put("/products/:id", productController.updateProduct);
app.delete("/products/:id", productController.deleteProduct);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
