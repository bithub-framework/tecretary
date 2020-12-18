import Database from 'promisified-sqlite';

(async () => {
    const db = new Database('/home/zim/Downloads/huobi-test.db');
    await db.start(err => {
        if (err) console.error(err);
    });
    const r = (await db.sql(`
        SELECT MIN(time) AS "0" FROM orderbook
    ;`))[0][0];
    await db.stop();
    console.log(r);
})().catch(err => console.error(err));
