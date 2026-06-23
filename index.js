import express from 'express';
import cors from 'cors';
import { db } from './db/db.js';
import { products } from './db/schema.js';
import { and, eq, desc, sql } from 'drizzle-orm';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve the bonus UI

// Explicitly serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Helper to encode/decode cursors (Base64)
const encodeCursor = (updatedAt, id) => Buffer.from(`${updatedAt.getTime()}_${id}`).toString('base64');
const decodeCursor = (cursor) => {
  const decoded = Buffer.from(cursor, 'base64').toString('ascii');
  const [time, id] = decoded.split('_');
  return { updatedAt: new Date(parseInt(time)), id };
};

app.get('/api/products', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const { category, cursor } = req.query;

    let conditions = [];
    if (category) {
      conditions.push(eq(products.category, category));
    }

    if (cursor) {
      const { updatedAt, id } = decodeCursor(cursor);
      // Keyset pagination condition: (updatedAt, id) < (cursor_updatedAt, cursor_id)
      conditions.push(
        sql`(${products.updatedAt}, ${products.id}) < (${updatedAt.toISOString()}, ${id})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.select()
      .from(products)
      .where(whereClause)
      .orderBy(desc(products.updatedAt), desc(products.id))
      .limit(limit);

    let nextCursor = null;
    if (data.length === limit) {
      const lastItem = data[data.length - 1];
      nextCursor = encodeCursor(lastItem.updatedAt, lastItem.id);
    }

    res.json({ data, nextCursor });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Export the Express API for Vercel Serverless Functions
export default app;

// Only start the server locally if not in production/Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
