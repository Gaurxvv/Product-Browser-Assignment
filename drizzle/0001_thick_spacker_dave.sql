DROP INDEX "idx_products_category_created_at";--> statement-breakpoint
DROP INDEX "idx_products_created_at";--> statement-breakpoint
CREATE INDEX "idx_products_category_updated_at" ON "products" USING btree ("category","updated_at" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_products_updated_at" ON "products" USING btree ("updated_at" DESC NULLS LAST,"id" DESC NULLS LAST);