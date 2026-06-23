import { db } from './db/db.js';
import { products } from './db/schema.js';
import { faker } from '@faker-js/faker';

async function seed() {
  console.log('Seeding 200,000 products...');
  const BATCH_SIZE = 10000;
  const TOTAL = 200000;
  const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Toys', 'Sports', 'Beauty'];

  let count = 0;
  for (let i = 0; i < TOTAL; i += BATCH_SIZE) {
    const batch = [];
    for (let j = 0; j < BATCH_SIZE; j++) {
      // spread created_at slightly so they aren't completely identical
      const date = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
      batch.push({
        name: faker.commerce.productName(),
        category: categories[Math.floor(Math.random() * categories.length)],
        price: faker.commerce.price(),
        createdAt: date,
        updatedAt: date,
      });
    }
    
    await db.insert(products).values(batch);
    count += BATCH_SIZE;
    console.log(`Inserted ${count} / ${TOTAL}`);
  }
  
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
