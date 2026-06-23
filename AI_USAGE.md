# AI Usage & Collaborative Approach

This document outlines how AI (Google Gemini via an agentic coding assistant) was utilized during the development of this Product Browser Assignment, and how human-in-the-loop architectural decisions drove the final implementation.

## 1. Initial Scaffolding & Boilerplate
I used the AI to rapidly scaffold the boilerplate for the application. Instead of manually writing the repetitive setup code, I instructed the AI to configure:
- An Express.js backend using ES Modules.
- The `drizzle.config.js` and database connection instances for Supabase.
- A beautiful, responsive frontend UI using vanilla HTML and TailwindCSS.
- A fast database seeding script (`seed.js`) utilizing Drizzle's batch insert capabilities to generate 200,000 records in seconds.

**Why AI was used here:** Scaffolding and writing 200k record loops is tedious. Delegating this to AI saved significant time, allowing me to focus entirely on the core algorithmic challenge of the pagination requirement.

## 2. Solving the Core Engineering Challenge
The primary challenge of the assignment was: *"If 50 new products are added/updated while someone is browsing, they must not see the same product twice or miss one."*

I knew traditional `OFFSET` pagination would fail this requirement because offsets shift when data changes. I discussed this with the AI, and we implemented **Keyset Pagination (Cursor-based Pagination)**. The AI wrote the initial raw SQL injection logic required by Drizzle to enforce the cursor constraint.

## 3. Human-Driven Code Review & Architectural Pivot
While the AI correctly implemented Keyset Pagination, it made a critical logical error in its initial draft: **It indexed and sorted the cursor based on `createdAt DESC, id DESC`.**

I reviewed the AI's architecture and caught the flaw. I pointed out to the AI:
> *"Your pagination order is ORDER BY createdAt DESC. But the requirement explicitly mentions updates. If Product Z is updated, it remains in its old position. You are not handling the 'updated' part of the requirement."*

I then explicitly instructed the AI to pivot the architecture:
1. Change the Drizzle schema to create composite indexes on `(updatedAt DESC, id DESC)` and `(category, updatedAt DESC, id DESC)`.
2. Rewrite the backend query logic to sort and encode the cursor using `updatedAt`.
3. Generate new database migrations to rebuild the B-Tree indexes.

**Why this matters:** This demonstrates that while AI is incredibly fast at writing code, it can easily miss nuanced business requirements. By treating the AI as a junior pair-programmer, I provided the critical architectural direction and logic validation that ultimately solved the core requirement flawlessly.

---
**Conclusion:** AI was utilized as a rapid-prototyping and boilerplate-generation tool. However, the exact architectural decisions—specifically the choice to use Keyset Pagination and the critical realization to index on `updatedAt` instead of `createdAt`—were driven and validated entirely by human oversight.
