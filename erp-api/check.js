const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 15433,
  database: 'erp'
});

client.connect()
  .then(() => client.query("SELECT user_id, status FROM attendance_records WHERE work_date = '2026-04-15'"))
  .then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    client.end();
  })
  .catch(err => {
    console.error(err);
    client.end();
  });
