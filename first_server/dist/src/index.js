"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const products = [
    { name: "Apple", price: 1.5 },
    { name: "Banana", price: 0.8 },
    { name: "Orange", price: 1.2 },
];
const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/products") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(products));
    }
    else if (req.method === "GET" && req.url === "/addproduct") {
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
    }
    else if (req.method === "POST" && req.url === "/submitproduct") {
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
    }
    else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
});
server.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
function collectRequestBody(req) {
    // since we can't reach the body directly this is the only way
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const parsed = new URLSearchParams(body);
                const data = {};
                for (const [key, value] of parsed.entries()) {
                    data[key] = value;
                }
                resolve(data);
            }
            catch (err) {
                reject(err);
            }
        });
        req.on("error", reject);
    });
}
