import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import apiRouter from "./server/api.js";
import fs from "fs";
import prisma from "./server/prisma.js";
import { seedOnStartup } from "./server/startup-seeder.js";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  console.log(`Starting Express app on Port ${PORT} with PID ${process.pid}`);

  // Test Database Connection
  try {
    await prisma.$connect();
    console.log("[Server] PostgreSQL Database connected successfully.");
    await seedOnStartup(prisma);
  } catch (error: any) {
    console.error("[Server] Critical Database Connection Error:", error.message);
    console.warn("Continuing startup to allow frontend to load, but APIs will fail.");
  }

  app.use(cors());
  app.use(express.json());
  
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // Serve uploads
  const uploadDir = process.env.NODE_ENV === 'production' 
    ? '/tmp/uploads' 
    : path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));

  // Mount API
  app.use('/api', apiRouter);

  // Vite middleware for development (only if requested or default)
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Mounting Vite middleware for frontend development...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Simple direct server listen without infinite retry loops
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening successfully on http://0.0.0.0:${PORT}`);
  }).on("error", (err: any) => {
    console.error("[Server] Critical listener error:", err.message);
    process.exit(1);
  });
}

startServer();
