import express from "express";
import ProductController from "./controllers/Product.controller";
import ProductService from "./services/Product.service";
import path from "path";

// much cleaner
const app = express();

app.use(express.json());
app.set("view engine", "pug"); // using pug as template engine

app.use(express.static(path.join(__dirname, "public")));

const productService = new ProductService();
const productController = new ProductController(productService);

app.get("/", productController.renderAllProducts);
app.get("/products/:id", productController.renderProductById);
app.get("/api/products", productController.getAllProducts);
app.get("/api/products/length", productController.getProductsLength);
app.get("/api//products/:id", productController.getProductById);
app.post("/api//products", productController.createProduct);
app.patch("/api//products/:id", productController.patchProduct);
app.put("/api//products/:id", productController.updateProduct);
app.delete("/api//products/:id", productController.deleteProduct);

app.get("*", (req, res) => {
  res.render("404");
});
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
