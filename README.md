# Product Browser Backend

A high-performance Node.js backend designed to paginate through hundreds of thousands of products instantly, with zero duplicates or skipped records even during high-frequency concurrent updates.

## Tech Stack
- **Node.js** (Express.js)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Frontend**: Vanilla JS + TailwindCSS (Served statically)

## The Core Problem & Solution

**The Requirement:** 
*"If 50 new products are added/updated while someone is browsing, they must not see the same product twice or miss one."*

**The Solution:**
Traditional `OFFSET` and `LIMIT` pagination fails this requirement because offsets shift when data is inserted or updated. To solve this, the application implements strict **Keyset (Cursor-based) Pagination**. 

Instead of an offset, the API uses a cursor representing the `updatedAt` and `id` of the last seen item. The database query simply asks for the next `limit` items that come sequentially after that specific cursor:
```javascript
sql`(${products.updatedAt}, ${products.id}) < (${updatedAt.toISOString()}, ${id})`
```

### Lightning Fast Filtering
To ensure filtering by category combined with cursor pagination doesn't trigger slow sequential table scans, the database relies on carefully crafted **Composite B-Tree Indexes**:
1. `(category, updatedAt DESC, id DESC)` - For paginating filtered results.
2. `(updatedAt DESC, id DESC)` - For global pagination.

By ensuring `updatedAt` is the primary sorting mechanism, whenever an existing record is updated, it naturally bubbles straight back up to the top of "Page 1".

---

## Running the Project

### Prerequisites
- Node.js (v22+)
- A Supabase PostgreSQL connection string.

### Setup
1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgres://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres"
   PORT=3000
   ```

3. **Database Migrations**
   Generate and push the Drizzle schema to your database:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Seed the Database**
   Insert 200,000 randomized mock products:
   ```bash
   npm run seed
   ```

5. **Start the Server**
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000` to view the UI.

---

## API Documentation

### `GET /api/products`

**Query Parameters:**
- `limit` (number): Number of results per page (Default: 50).
- `category` (string, optional): Filter by category.
- `cursor` (string, optional): Base64 encoded cursor indicating where to start the next page.

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Awesome Product",
      "category": "Electronics",
      "price": "199.99",
      "createdAt": "2026-06-23T10:00:00.000Z",
      "updatedAt": "2026-06-23T10:00:00.000Z"
    }
  ],
  "nextCursor": "encoded_cursor_string"
}
```
