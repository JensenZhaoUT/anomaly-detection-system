import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: 'your-db-host',
  user: 'your-db-username',
  password: 'your-db-password',
  database: 'your-db-name',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
