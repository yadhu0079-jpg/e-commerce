import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, User, Order } from "./src/types";

// Setup database paths
const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "db.json");

// Types for DB representation
interface Database {
  users: User[];
  passwords: Record<string, string>; // userId -> password
  products: Product[];
  orders: Order[];
}

// Initial seed products
const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Keystone Walnut Keyboard",
    description: "Premium hot-swappable 75% layout mechanical keyboard with a solid walnut wood casing, lubricated linear switches, and dye-sub PBT keycaps.",
    price: 189,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600",
    category: "Desk Setup",
    stock: 12,
    rating: 4.8,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-2",
    name: "QuietComfort ANC Pro",
    description: "Studio-grade over-ear active noise-canceling headphones with spatial audio, high-res audio certification, and up to 40 hours of battery life.",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600",
    category: "Audio",
    stock: 8,
    rating: 4.9,
    createdAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Merino Wool Desk Mat",
    description: "Extra-thick 4mm desk pad crafted from ethically sourced sustainable merino felt wool. Provides premium comfort and smooth mouse tracking.",
    price: 49,
    imageUrl: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600",
    category: "Desk Setup",
    stock: 25,
    rating: 4.7,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-4",
    name: "Titan EDC Bolt-Action Pen",
    description: "Precision-machined pen made from solid aerospace-grade titanium alloy with a tactical bolt-action mechanism and smooth high-capacity gel refill.",
    price: 69,
    imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600",
    category: "Accessories",
    stock: 15,
    rating: 4.6,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-5",
    name: "Aero RFID Carbon Wallet",
    description: "Ultra-slim carbon fiber wallet holding up to 12 cards with integrated RFID blocking technology and heavy-duty cash strap strap.",
    price: 89,
    imageUrl: "https://images.unsplash.com/photo-1627124110996-7a065099e828?auto=format&fit=crop&q=80&w=600",
    category: "Accessories",
    stock: 20,
    rating: 4.5,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-6",
    name: "Vertex Aluminum Monitor Stand",
    description: "Sleek anodized aluminum monitor riser designed to improve posture. Features memory room below and integrated front USB-C expansion ports.",
    price: 79,
    imageUrl: "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=600",
    category: "Desk Setup",
    stock: 6,
    rating: 4.4,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prod-7",
    name: "Signature StudioBuds Pro",
    description: "Compact wireless active noise canceling earbuds with natural transparency mode, IPX4 sweat resistance, and clear high-frequency output.",
    price: 139,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=600",
    category: "Audio",
    stock: 14,
    rating: 4.3,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper to initialize and read DB
function getDatabase(): Database {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Write pre-seeded DB
    const initialDB: Database = {
      users: [
        { id: "u-admin", email: "admin@example.com", name: "Admin Dashboard", role: "admin", createdAt: new Date().toISOString() },
        { id: "u-user", email: "user@example.com", name: "Alex Jones", role: "user", createdAt: new Date().toISOString() }
      ],
      passwords: {
        "u-admin": "admin123",
        "u-user": "user123"
      },
      products: SEED_PRODUCTS,
      orders: [
        {
          id: "ord-8812",
          userId: "u-user",
          userEmail: "user@example.com",
          userName: "Alex Jones",
          items: [
            { productId: "prod-3", name: "Merino Wool Desk Mat", price: 49, quantity: 1, imageUrl: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600" }
          ],
          totalAmount: 49,
          status: "Delivered",
          shippingAddress: {
            name: "Alex Jones",
            line1: "123 Serene Boulevard",
            city: "San Francisco",
            postalCode: "94103",
            country: "United States"
          },
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "ord-9345",
          userId: "u-user",
          userEmail: "user@example.com",
          userName: "Alex Jones",
          items: [
            { productId: "prod-1", name: "Keystone Walnut Keyboard", price: 189, quantity: 1, imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600" },
            { productId: "prod-4", name: "Titan EDC Bolt-Action Pen", price: 69, quantity: 2, imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=600" }
          ],
          totalAmount: 327,
          status: "Shipped",
          shippingAddress: {
            name: "Alex Jones",
            line1: "123 Serene Boulevard",
            city: "San Francisco",
            postalCode: "94103",
            country: "United States"
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), "utf8");
    return initialDB;
  }

  try {
    const rawData = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    console.error("Corrupted database file. Resetting.", err);
    return { users: [], passwords: {}, products: [], orders: [] };
  }
}

function saveDatabase(db: Database) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json());

  // Simple token / user ID resolver via "Authorization" header
  app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const db = getDatabase();
      const currentUserId = authHeader; // User ID passed as Authorization header for simplistic mock auth token
      const foundUser = db.users.find(u => u.id === currentUserId);
      if (foundUser) {
        (req as any).user = foundUser;
      }
    }
    next();
  });

  // REST API Routes

  // Auth APIs
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const db = getDatabase();
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      res.status(400).json({ error: "Email is already registered" });
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      email: email.toLowerCase(),
      name,
      role: "user", // Registered users are standard customers
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    db.passwords[newUser.id] = password;
    saveDatabase(db);

    res.json({ user: newUser });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const db = getDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ error: "No account found with this email" });
      return;
    }

    if (db.passwords[user.id] !== password) {
      res.status(401).json({ error: "Invalid password credentials" });
      return;
    }

    // Success
    res.json({ user });
  });

  app.get("/api/auth/me", (req, res) => {
    const user = (req as any).user;
    if (user) {
      res.json({ user });
    } else {
      res.json({ user: null });
    }
  });

  // Product Catalog APIs
  app.get("/api/products", (req, res) => {
    const db = getDatabase();
    res.json(db.products);
  });

  // Add Product (Admin Access)
  app.post("/api/products", (req, res) => {
    const user = (req as any).user as User;
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Unauthorized access. Administrator role required." });
      return;
    }

    const { name, description, price, imageUrl, category, stock } = req.body;
    if (!name || !description || price === undefined || !imageUrl || !category || stock === undefined) {
      res.status(400).json({ error: "All product fields are required." });
      return;
    }

    const db = getDatabase();
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name,
      description,
      price: Number(price),
      imageUrl,
      category,
      stock: Number(stock),
      rating: 5.0, // Default rating
      createdAt: new Date().toISOString()
    };

    db.products.unshift(newProduct); // Add to the top
    saveDatabase(db);
    res.json(newProduct);
  });

  // Edit Product (Admin Access)
  app.put("/api/products/:id", (req, res) => {
    const user = (req as any).user as User;
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Unauthorized access. Administrator role required." });
      return;
    }

    const prodId = req.params.id;
    const { name, description, price, imageUrl, category, stock } = req.body;

    const db = getDatabase();
    const productIndex = db.products.findIndex(p => p.id === prodId);
    if (productIndex === -1) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    // Merge changes
    const updatedProduct = {
      ...db.products[productIndex],
      name: name ?? db.products[productIndex].name,
      description: description ?? db.products[productIndex].description,
      price: price !== undefined ? Number(price) : db.products[productIndex].price,
      imageUrl: imageUrl ?? db.products[productIndex].imageUrl,
      category: category ?? db.products[productIndex].category,
      stock: stock !== undefined ? Number(stock) : db.products[productIndex].stock
    };

    db.products[productIndex] = updatedProduct;
    saveDatabase(db);
    res.json(updatedProduct);
  });

  // Delete Product (Admin Access)
  app.delete("/api/products/:id", (req, res) => {
    const user = (req as any).user as User;
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Unauthorized access. Administrator role required." });
      return;
    }

    const prodId = req.params.id;
    const db = getDatabase();
    const lenBefore = db.products.length;
    db.products = db.products.filter(p => p.id !== prodId);

    if (db.products.length === lenBefore) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    saveDatabase(db);
    res.json({ success: true, message: "Product deleted successfully." });
  });

  // Order endpoints

  // Checkout (Users/Guest Checkout)
  app.post("/api/orders", (req, res) => {
    const user = (req as any).user as User | undefined;
    const { items, shippingAddress, totalAmount } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !shippingAddress) {
      res.status(400).json({ error: "Missing required order information." });
      return;
    }

    const db = getDatabase();

    // Check & deduct stocks
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId);
      if (!product) {
        res.status(400).json({ error: `Product ${item.name} not found in catalog.` });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({ error: `Not enough stock for ${item.name}. Available: ${product.stock}` });
        return;
      }
    }

    // Deduct inventory
    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId)!;
      product.stock -= item.quantity;
    }

    const newOrder: Order = {
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user ? user.id : "u-guest",
      userEmail: user ? user.email : "guest@example.com",
      userName: user ? user.name : shippingAddress.name,
      items,
      totalAmount,
      status: "Pending",
      shippingAddress,
      createdAt: new Date().toISOString()
    };

    db.orders.unshift(newOrder); // Add to the top of logs
    saveDatabase(db);

    res.json(newOrder);
  });

  // Get orders (Admin gets ALL orders, standard users get THEIR orders only)
  app.get("/api/orders", (req, res) => {
    const user = (req as any).user as User | undefined;
    if (!user) {
      // Guest orders check -> return blank list if requested (they can search by Order ID if needed, let's allow return of a blank list by default)
      res.json([]);
      return;
    }

    const db = getDatabase();
    if (user.role === "admin") {
      res.json(db.orders);
    } else {
      const userOrders = db.orders.filter(o => o.userId === user.id);
      res.json(userOrders);
    }
  });

  // Update Order Status (Admin only)
  app.put("/api/orders/:id/status", (req, res) => {
    const user = (req as any).user as User;
    if (!user || user.role !== "admin") {
      res.status(403).json({ error: "Unauthorized access. Administrator role required." });
      return;
    }

    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: "Status field is required." });
      return;
    }

    const db = getDatabase();
    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      res.status(404).json({ error: "Order not found." });
      return;
    }

    order.status = status;
    saveDatabase(db);
    res.json(order);
  });

  // Integrate Vite Dev Server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Listen to exactly port 3000, 0.0.0.0
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server", err);
});
