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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const fs_1 = require("fs");
const path = require("path");
function readProductsFile() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield fs_1.promises.readFile(path.join(process.cwd(), "data", "data.json"), "utf8");
            const parsedData = JSON.parse(data);
            // don't forget the strcutre of json file the data is returned like this {products:[]} not products[]
            console.log("Products loaded:", parsedData);
            return parsedData.products;
        }
        catch (err) {
            console.error("Error reading file:", err);
            return [];
        }
    });
}
function writeProductsFile(products) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = JSON.stringify({ products }, null, 2);
            yield fs_1.promises.writeFile(path.join(process.cwd(), "data", "data.json"), data, "utf8");
            console.log("File saved successfully!");
        }
        catch (err) {
            console.error("Error writing file:", err);
        }
    });
}
function collectRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            var _a;
            try {
                console.log("Raw body received:", body);
                if ((_a = req.headers["content-type"]) === null || _a === void 0 ? void 0 : _a.includes("application/json")) {
                    resolve(JSON.parse(body));
                }
                else {
                    const parsed = new URLSearchParams(body);
                    const data = {};
                    for (const [key, value] of parsed.entries()) {
                        data[key] = value;
                    }
                    resolve(data);
                }
            }
            catch (err) {
                console.error("Failed to parse request body:", err);
                reject(err);
            }
        });
        req.on("error", reject);
    });
}
const server = http.createServer((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.method === "GET" && req.url === "/products") {
            const products = yield readProductsFile();
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
            const body = yield collectRequestBody(req);
            const { name, price } = body;
            if (!name || !price) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                return res.end("Invalid product data");
            }
            const products = yield readProductsFile();
            console.log("fetched products fro writing ", products);
            const updatedProducts = [...products, { name, price: parseFloat(price) }];
            yield writeProductsFile(updatedProducts);
            res.writeHead(302, { Location: "/products" });
            return res.end();
        }
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    }
    catch (error) {
        console.error("Server error:", error);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
    }
}));
server.listen(5001, () => {
    console.log("Server is running on http://localhost:5001");
});
