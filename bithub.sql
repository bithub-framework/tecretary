BEGIN TRANSACTION;
DROP TABLE IF EXISTS "orderbooks";
CREATE TABLE IF NOT EXISTS "orderbooks" (
	"mid"	SMALLINT NOT NULL,
	"asks"	JSON NOT NULL,
	"bids"	JSON NOT NULL,
	"time"	BIGINT NOT NULL,
	FOREIGN KEY("mid") REFERENCES "markets"("id")
);
DROP TABLE IF EXISTS "trades";
CREATE TABLE IF NOT EXISTS "trades" (
	"mid"	SMALLINT NOT NULL,
	"price"	DECIMAL(12 , 2) NOT NULL,
	"quantity"	DECIMAL(16 , 2) NOT NULL,
	"side"	CHAR(3) NOT NULL,
	"time"	BIGINT NOT NULL,
	FOREIGN KEY("mid") REFERENCES "markets"("id")
);
DROP TABLE IF EXISTS "markets";
CREATE TABLE IF NOT EXISTS "markets" (
	"id"	SMALLINT NOT NULL UNIQUE,
	"name"	VARCHAR(60) NOT NULL UNIQUE,
	PRIMARY KEY("id")
);
INSERT INTO "markets" VALUES (1,'binance-perpetual-btcusdt');
DROP INDEX IF EXISTS "orderbooks_mid_time";
CREATE INDEX IF NOT EXISTS "orderbooks_mid_time" ON "orderbooks" (
	"mid",
	"time"
);
DROP INDEX IF EXISTS "trades_mid_time";
CREATE INDEX IF NOT EXISTS "trades_mid_time" ON "trades" (
	"mid",
	"time"
);
COMMIT;
