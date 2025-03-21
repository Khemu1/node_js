import ProductService from "../services/Product.service";
import { Request, Response } from "express";
import { Product, Queries } from "../types";

// controlers handle http requests
export default class ProductController {
  constructor(private productService: ProductService) {
    this.productService = productService;
    // hen you pass a method as a callback (e.g., to an Express route), the method loses its original this context
    this.getAllProducts = this.getAllProducts.bind(this);
    this.renderAllProducts = this.renderAllProducts.bind(this);
    this.getProductById = this.getProductById.bind(this);
    this.renderProductById = this.renderProductById.bind(this);
    this.createProduct = this.createProduct.bind(this);
    this.patchProduct = this.patchProduct.bind(this);
    this.updateProduct = this.updateProduct.bind(this);
    this.deleteProduct = this.deleteProduct.bind(this);
    this.getProductsLength = this.getProductsLength.bind(this);
  }
  getProductsLength(_req: Request, res: Response) {
    res.json({ length: this.productService.getProductsLength() });
  }
  getAllProducts(req: Request, res: Response) {
    const queries: Queries = req.query;
    const isEmptyQuery = Object.keys(queries).length === 0;

    const products = isEmptyQuery
      ? this.productService.getAllProducts()
      : this.productService.getAllByQuery(queries);

    res.json(products);
  }

  renderAllProducts(req: Request, res: Response) {
    const queries: Queries = req.query;
    const isEmptyQuery = Object.keys(queries).length === 0;

    const products = isEmptyQuery
      ? this.productService.getAllProducts()
      : this.productService.getAllByQuery(queries);

    res.render("index", {
      title: "Product List",
      products: products,
    });
  }

  getProductById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    // don't send the req to service it won't work it only works with the controllers and middlewares
    const product = this.productService.getProductById(id);
    if (product) {
      res.json(product);
      return;
    }
    res.status(404).json({ message: "Product not found" });
  }
  renderProductById(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    // don't send the req to service it won't work it only works with the controllers and middlewares
    const product = this.productService.getProductById(id);
    if (product) {
      res.render("product", {
        title: `Product: ${product.name}`,
        product: product,
      });
      return;
    }
    res.status(400).render("404");
  }

  createProduct(req: Request, res: Response) {
    const product: Product = req.body;
    const newProduct = this.productService.createProduct(product);
    res.status(201).json(newProduct);
  }

  patchProduct(req: Request, res: Response) {
    const product: Partial<Product> = req.body;
    const updatedProduct = this.productService.patchProduct(product);
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }

  updateProduct(req: Request, res: Response) {
    const product: Product = req.body;
    const updatedProduct = this.productService.updateProduct(product);
    if (updatedProduct) {
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }

  deleteProduct(req: Request, res: Response) {
    const id = parseInt(req.params.id, 10);
    const success = this.productService.deleteProduct(id);
    if (success) {
      res.json({ message: "Product deleted successfully" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  }
}
