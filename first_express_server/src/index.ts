import express from "express";
import { faker } from "@faker-js/faker";

const app = express();
app.use(
  express.json({
    type: ["application/jsons", "application/json"], // trying to parse using a custom header
  })
);

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}
const products: Product[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: faker.commerce.productName(),
  price: +faker.commerce.price(),
  description: faker.commerce.productDescription(),
}));

app.get("/products", (req, res) => {
  const query: {
    filter?: string;
    sort?: string;
    limit?: number;
    page?: number;
    include?: string;
    exclude?: string;
    fields?: string;
    [key: string]: any;
  } = req.query;

  console.log("queries ", query);

  let filteredProducts: typeof products | Partial<(typeof products)[number]>[] =
    [...products];

  if (query.filter) {
    const filterProps = query.filter.split(",");
    filteredProducts = products.map((product) => {
      // make an object that only conatins they id then check of the prop is key of product if it has attribute
      const filteredProduct: Partial<typeof product> = { id: product.id };
      filterProps.forEach((key) => {
        if (key in product) {
          (filteredProduct as any)[key] = product[key as keyof typeof product];
        }
      });
      return filteredProduct;
    });
  }

  if (query.sort) {
    const [sortField, sortOrder] = query.sort.split(":");
    filteredProducts.sort((a: any, b: any) => {
      if (!a[sortField] || !b[sortField]) return 0;
      return sortOrder === "desc"
        ? b[sortField] - a[sortField]
        : a[sortField] - b[sortField];
    });
  }

  const limit = query.limit ? parseInt(query.limit as any, 10) : 10;
  const page = query.page ? parseInt(query.page as any, 10) : 1;
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
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } else {
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
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } else {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

app.put("/product/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product: Product = req.body;

  if (!isNaN(productId)) {
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex !== -1) {
      if (!product.name || !product.price || !product.description) {
        res.status(400).json({ error: "Invalid product data" });
        return;
      }
      products[productIndex] = { ...products[productIndex], ...product };
      res.json(products[productIndex]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } else {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

app.patch("/product/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, description }: Product = req.body;

  if (!isNaN(productId)) {
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex !== -1) {
      if (name) products[productIndex].name = name;
      if (price) products[productIndex].price = price;
      if (description) products[productIndex].description = description;
      res.json(products[productIndex]);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } else {
    res.status(400).json({ error: "Invalid product ID" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
