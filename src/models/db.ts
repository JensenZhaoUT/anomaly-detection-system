import { createPool } from 'mysql2/promise';

const pool = createPool({
  host: 'database-anomaly-detection.clskoem8w7z5.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'jensen123',
  database: 'database_anomaly_detection',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
