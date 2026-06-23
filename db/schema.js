import { pgTable, uuid, varchar, decimal, timestamp, index } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull(),
}, (table) => {
  return {
    // Index on category, updatedAt DESC, id DESC for fast keyset pagination
    categoryPaginationIdx: index('idx_products_category_updated_at')
      .on(table.category, table.updatedAt.desc(), table.id.desc()),
    // Global pagination index
    globalPaginationIdx: index('idx_products_updated_at')
      .on(table.updatedAt.desc(), table.id.desc()),
  };
});
