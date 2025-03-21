import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import ProductController from "./controllers/Product.controller";
import ProductService from "./services/Product.service";
import path from "path";
import ErrorMiddleware from "./middlewares/Error";

// much cleaner
const app = express();

app.use(express.json());
app.use(helmet()); // adding helemt to secure HTTP headers

app.use(morgan("dev")); // adding morgan for logging
app.set("view engine", "pug"); // using pug as template engine

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

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

app.use(ErrorMiddleware.handleRoute); // will handle not found routes for api and views
app.use(ErrorMiddleware.hanldeError); // will hanle errors
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
