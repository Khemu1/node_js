import * as http from "http";
import { promises as fs } from "fs";
import path = require("path");

async function readProductsFile() {
  try {
    const data = await fs.readFile(
      path.join(process.cwd(), "data", "data.json"),
      "utf8"
    );
    const parsedData = JSON.parse(data);
    // don't forget the strcutre of json file the data is returned like this {products:[]} not products[]
    console.log("Products loaded:", parsedData);
    return parsedData.products;
  } catch (err) {
    console.error("Error reading file:", err);
    return [];
  }
}

async function writeProductsFile(products: { name: string; price: number }[]) {
  try {
    const data = JSON.stringify({ products }, null, 2);
    await fs.writeFile(
      path.join(process.cwd(), "data", "data.json"),
      data,
      "utf8"
    );
    console.log("File saved successfully!");
  } catch (err) {
    console.error("Error writing file:", err);
  }
}

function collectRequestBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        console.log("Raw body received:", body);
        if (req.headers["content-type"]?.includes("application/json")) {
          resolve(JSON.parse(body));
        } else {
          const parsed = new URLSearchParams(body);
          const data: Record<string, string> = {};
          for (const [key, value] of parsed.entries()) {
            data[key] = value;
          }
          resolve(data);
        }
      } catch (err) {
        console.error("Failed to parse request body:", err);
        reject(err);
      }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/products") {
      const products = await readProductsFile();
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(products));
    }

    if (req.method === "GET" && req.url === "/addproduct") {
      res.writeHead(200, { "Content-Type": "text/html" });
      return res.end(`
        <html>
        <body>
          <h2>Add a Product</h2>
          <form action="/submitproduct" method="POST">
            <input type="text" name="name" placeholder="Product Name" required /><br/><br/>
            <input type="number" step="0.01" name="price" placeholder="Price" required /><br/><br/>
            <button type="submit">Submit</button>
          </form>
        </body>
        </html>
      `);
    }

    if (req.method === "POST" && req.url === "/submitproduct") {
      const body = await collectRequestBody(req);
      const { name, price } = body;

      if (!name || !price) {
        res.writeHead(400, { "Content-Type": "text/plain" });
        return res.end("Invalid product data");
      }

      const products = await readProductsFile();
      console.log("fetched products fro writing ", products);
      const updatedProducts = [...products, { name, price: parseFloat(price) }];
      await writeProductsFile(updatedProducts);

      res.writeHead(302, { Location: "/products" });
      return res.end();
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("Internal Server Error");
  }
});
server.listen(5001, () => {
  console.log("Server is running on http://localhost:5001");
});
