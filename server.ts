import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("mess_shop.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'manager')) DEFAULT 'manager'
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL,
    stock INTEGER,
    min_stock INTEGER DEFAULT 5,
    unit TEXT DEFAULT 'pcs'
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    type TEXT CHECK(type IN ('sale', 'purchase')),
    quantity INTEGER,
    total_price REAL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY(product_id) REFERENCES products(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed Admin if not exists
const adminExists = db.prepare("SELECT * FROM users WHERE role = 'admin'").get();
if (!adminExists) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin123", "admin");
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // Auth Middleware (Simple for demo, in real app use JWT)
  const auth = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  };

  const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // API Routes
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?").get(username, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // User Management (Admin Only)
  app.get("/api/users", auth, adminOnly, (req, res) => {
    const users = db.prepare("SELECT id, username, role FROM users").all();
    res.json(users);
  });

  app.post("/api/users", auth, adminOnly, (req, res) => {
    const { username, password, role } = req.body;
    try {
      const result = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(username, password, role);
      res.json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Username already exists" });
    }
  });

  app.delete("/api/users/:id", auth, adminOnly, (req, res) => {
    db.prepare("DELETE FROM users WHERE id = ? AND role != 'admin'").run(req.params.id);
    res.json({ success: true });
  });

  // Inventory
  app.get("/api/products", auth, (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", auth, (req, res) => {
    const { name, category, price, stock, min_stock, unit } = req.body;
    const result = db.prepare("INSERT INTO products (name, category, price, stock, min_stock, unit) VALUES (?, ?, ?, ?, ?, ?)").run(name, category, price, stock, min_stock, unit);
    res.json({ id: result.lastInsertRowid });
  });

  app.put("/api/products/:id", auth, (req, res) => {
    const { name, category, price, stock, min_stock, unit } = req.body;
    db.prepare("UPDATE products SET name = ?, category = ?, price = ?, stock = ?, min_stock = ?, unit = ? WHERE id = ?").run(name, category, price, stock, min_stock, unit, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", auth, (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Transactions
  app.get("/api/transactions", auth, (req, res) => {
    const transactions = db.prepare(`
      SELECT t.*, p.name as product_name, u.username 
      FROM transactions t 
      JOIN products p ON t.product_id = p.id 
      JOIN users u ON t.user_id = u.id
      ORDER BY t.date DESC
    `).all();
    res.json(transactions);
  });

  app.post("/api/transactions", auth, (req, res) => {
    const { product_id, type, quantity, total_price } = req.body;
    const db_trans = db.transaction(() => {
      // Update stock
      const product = db.prepare("SELECT stock FROM products WHERE id = ?").get(product_id);
      if (!product) throw new Error("Product not found");
      
      const newStock = type === 'sale' ? product.stock - quantity : product.stock + quantity;
      if (newStock < 0) throw new Error("Insufficient stock");

      db.prepare("UPDATE products SET stock = ? WHERE id = ?").run(newStock, product_id);
      db.prepare("INSERT INTO transactions (product_id, type, quantity, total_price, user_id) VALUES (?, ?, ?, ?, ?)").run(product_id, type, quantity, total_price, req.user.id);
    });

    try {
      db_trans();
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
