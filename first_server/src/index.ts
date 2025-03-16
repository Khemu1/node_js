import * as http from "http";
import * as fs from "fs";

const products = [
  { name: "Apple", price: 1.5 },
  { name: "Banana", price: 0.8 },
  { name: "Orange", price: 1.2 },
];

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/products") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products));
  } else if (req.method === "GET" && req.url === "/addproduct") {
    // Serve an HTML form for adding a product
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
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
  } else if (req.method === "POST" && req.url === "/submitproduct") {
    collectRequestBody(req)
      .then((body) => {
        const { name, price } = body;

        if (!name || !price) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          return res.end("Invalid product data");
        }

        products.push({ name, price: parseFloat(price) });
        res.writeHead(302, { Location: "/products" });
        res.end();
      })
      .catch(() => {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error");
      });
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});

function collectRequestBody(
  req: http.IncomingMessage
): Promise<Record<string, string>> {
  // since we can't reach the body directly this is the only way
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const parsed = new URLSearchParams(body);
        const data: Record<string, string> = {};
        for (const [key, value] of parsed.entries()) {
          data[key] = value;
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
