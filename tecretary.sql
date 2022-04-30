BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS `trades` (
	`id`	INTEGER NOT NULL UNIQUE,
	`price`	DECIMAL ( 12 , 2 ) NOT NULL,
	`quantity`	DECIMAL ( 16 , 2 ) NOT NULL,
	`side`	CHAR ( 1 ) NOT NULL,
	`time`	BIGINT NOT NULL,
	`mid`	INTEGER NOT NULL,
	FOREIGN KEY(`mid`) REFERENCES `markets`(`id`),
	PRIMARY KEY(`id`)
);
CREATE TABLE IF NOT EXISTS `orderbooks` (
	`id`	INTEGER NOT NULL UNIQUE,
	`time`	BIGINT NOT NULL,
	`mid`	INTEGER NOT NULL,
	PRIMARY KEY(`id`),
	FOREIGN KEY(`mid`) REFERENCES `markets`(`id`)
);
CREATE TABLE IF NOT EXISTS `markets` (
	`id`	INTEGER NOT NULL UNIQUE,
	`name`	VARCHAR ( 60 ) NOT NULL UNIQUE,
	PRIMARY KEY(`id`)
);
INSERT INTO `markets` (id,name) VALUES (1,'binance-perpetual-btcusdt');
CREATE TABLE IF NOT EXISTS `book_orders` (
	`price`	DECIMAL ( 12 , 2 ) NOT NULL,
	`quantity`	DECIMAL ( 16 , 2 ) NOT NULL,
	`side`	CHAR ( 1 ) NOT NULL,
	`bid`	INTEGER NOT NULL,
	FOREIGN KEY(`bid`) REFERENCES `orderbooks`(`id`)
);
CREATE INDEX IF NOT EXISTS `trades_mid_time_id` ON `trades` (
	`mid`,
	`time`,
	`id`
);
CREATE INDEX IF NOT EXISTS `orderbooks_mid_time_id` ON `orderbooks` (
	`mid`,
	`time`,
	`id`
);
CREATE UNIQUE INDEX IF NOT EXISTS `markets_name` ON `markets` (
	`name`
);
CREATE INDEX IF NOT EXISTS `book_orders_bid_price` ON `book_orders` (
	`bid`,
	`price`
);
COMMIT;
