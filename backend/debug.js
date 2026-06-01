require('dotenv').config();
const { query } = require('./config/db');

async function run() {
    const res = await query('SELECT * FROM tests WHERE title=$1', ['kdjfvhkjv']);
    console.log("DB record:", res.rows[0]);
    if (!res.rows[0]) return;
    
    const test = res.rows[0];
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    const d = new Date(test.scheduled_date);
    const testDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    console.log({
        now: now.toString(),
        today,
        currentTime,
        testDate,
        test_start: test.start_time,
        test_end: test.end_time
    });

    console.log("testDate === today:", testDate === today);
    console.log("start_time <= currentTime:", test.start_time <= currentTime);
    console.log("end_time >= currentTime:", test.end_time >= currentTime);
}

run().finally(() => process.exit(0));
