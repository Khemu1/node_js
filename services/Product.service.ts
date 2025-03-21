import { Product, Queries } from "../types";
import { generateFakeData } from "../utils";

// services hanlde complex logic and assist the controllers
export default class ProductService {
  private readonly products: Product[] = [];

  constructor() {
    this.products = generateFakeData();
    console.log(
      "Products initialized with fake data:",
      this.getProductsLength()
    );
  }

  getProductsLength(): number {
    return this.products.length;
  }

  getAllProducts(): Product[] {
    return this.products;
  }

  getAllByQuery(queries: Queries) {
    let filteredProducts: Partial<Product>[] | Product[] = [...this.products];

    if (queries.filter) {
      const filterProps = queries.filter.split(",");
      filteredProducts = this.products.map((product) => {
        const filteredProduct: Record<string, any> = { id: product.id };
        filterProps.forEach((key) => {
          if (key in product) {
            filteredProduct[key] = product[key as keyof Product];
          }
        });
        return filteredProduct;
      });
    }

    if (queries.sort) {
      const [sortField, sortOrder] = queries.sort.split(":");
      filteredProducts.sort((a: any, b: any) => {
        if (!a[sortField] || !b[sortField]) return 0;
        return sortOrder === "desc"
          ? String(b[sortField]).localeCompare(String(a[sortField]))
          : String(a[sortField]).localeCompare(String(b[sortField]));
      });
    }

    const limit = parseInt(String(queries.limit?.trim() || "10"), 10);
    const page = parseInt(String(queries.page?.trim() || "1"), 10);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    filteredProducts = filteredProducts.slice(startIndex, endIndex);
    console.log("After pagination:", filteredProducts);
    return filteredProducts;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  createProduct(product: Product): Product {
    this.products.push(product);
    return product;
  }

  patchProduct(product: Partial<Product>): Product | null {
    const productIndex = this.products.findIndex((p) => p.id === product.id);
    if (productIndex !== -1) {
      this.products[productIndex] = {
        ...this.products[productIndex],
        ...product,
      };
      return this.products[productIndex];
    }
    return null;
  }

  updateProduct(product: Product): Product | null {
    const productIndex = this.products.findIndex((p) => p.id === product.id);
    if (productIndex !== -1) {
      this.products[productIndex] = product;
      return product;
    }
    return null;
  }

  deleteProduct(id: number): boolean {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex !== -1) {
      this.products.splice(productIndex, 1);
      return true;
    }
    return false;
  }
}
