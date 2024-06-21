import { Pool } from 'pg';

const pool = new Pool({
  user: 'your-db-username',
  host: 'your-db-host',
  database: 'your-db-name',
  password: 'your-db-password',
  port: 5432,
});

export const getAnomalies = async () => {
  const result = await pool.query('SELECT * FROM anomalies');
  return result.rows;
};

export const createAnomaly = async (anomaly: any) => {
  const { time, type, message, frame, details } = anomaly;
  const result = await pool.query(
    'INSERT INTO anomalies (time, type, message, frame, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [time, type, message, frame, details]
  );
  return result.rows[0];
};

export const getAnomalyById = async (id: string) => {
  const result = await pool.query('SELECT * FROM anomalies WHERE id = $1', [id]);
  return result.rows[0];
};