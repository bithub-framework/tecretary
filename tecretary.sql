BEGIN TRANSACTION;
DROP TABLE IF EXISTS `snapshots`;
CREATE TABLE IF NOT EXISTS `snapshots` (
	`project_name`	TEXT NOT NULL UNIQUE,
	`market_name`	TEXT NOT NULL,
	`snapshot`	TEXT NOT NULL,
	PRIMARY KEY(`project_name`),
	FOREIGN KEY(`project_name`) REFERENCES `projects`(`name`)
);
DROP TABLE IF EXISTS `running`;
CREATE TABLE IF NOT EXISTS `running` (
	`name`	TEXT NOT NULL UNIQUE
);
DROP TABLE IF EXISTS `projects`;
CREATE TABLE IF NOT EXISTS `projects` (
	`name`	TEXT NOT NULL UNIQUE,
	`time`	INTEGER NOT NULL,
	PRIMARY KEY(`name`)
);
DROP TABLE IF EXISTS `logs`;
CREATE TABLE IF NOT EXISTS `logs` (
	`project_name`	TEXT NOT NULL,
	`time`	INTEGER NOT NULL,
	`content`	TEXT NOT NULL
);
DROP INDEX IF EXISTS `logs_project_name_time`;
CREATE INDEX IF NOT EXISTS `logs_project_name_time` ON `logs` (
	`project_name`,
	`time`
);
COMMIT;
