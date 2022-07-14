BEGIN TRANSACTION;
DROP TABLE IF EXISTS "book_orders";
CREATE TABLE IF NOT EXISTS "book_orders" (
	"price"	REAL NOT NULL,
	"quantity"	REAL NOT NULL,
	"side"	INTEGER NOT NULL,
	"bid"	INTEGER NOT NULL,
	FOREIGN KEY("bid") REFERENCES "orderbooks"("id")
);
DROP TABLE IF EXISTS "markets";
CREATE TABLE IF NOT EXISTS "markets" (
	"id"	INTEGER NOT NULL UNIQUE,
	"name"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id")
);
DROP TABLE IF EXISTS "orderbooks";
CREATE TABLE IF NOT EXISTS "orderbooks" (
	"id"	INTEGER NOT NULL UNIQUE,
	"time"	INTEGER NOT NULL,
	"mid"	INTEGER NOT NULL,
	PRIMARY KEY("id"),
	FOREIGN KEY("mid") REFERENCES "markets"("id")
);
DROP TABLE IF EXISTS "trades";
CREATE TABLE IF NOT EXISTS "trades" (
	"id"	INTEGER NOT NULL UNIQUE,
	"price"	REAL NOT NULL,
	"quantity"	REAL NOT NULL,
	"side"	INTEGER NOT NULL,
	"time"	INTEGER NOT NULL,
	"mid"	INTEGER NOT NULL,
	FOREIGN KEY("mid") REFERENCES "markets"("id"),
	PRIMARY KEY("id")
);
INSERT INTO "markets" ("id","name") VALUES (1,'binance-perpetual-btcusdt');
DROP INDEX IF EXISTS "book_orders_bid_price";
CREATE INDEX IF NOT EXISTS "book_orders_bid_price" ON "book_orders" (
	"bid",
	"price"
);
DROP INDEX IF EXISTS "markets_name";
CREATE UNIQUE INDEX IF NOT EXISTS "markets_name" ON "markets" (
	"name"
);
DROP INDEX IF EXISTS "orderbooks_mid_time_id";
CREATE INDEX IF NOT EXISTS "orderbooks_mid_time_id" ON "orderbooks" (
	"mid",
	"time",
	"id"
);
DROP INDEX IF EXISTS "trades_mid_time_id";
CREATE INDEX IF NOT EXISTS "trades_mid_time_id" ON "trades" (
	"mid",
	"time",
	"id"
);
COMMIT;
