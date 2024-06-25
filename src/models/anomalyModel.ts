import pool from "./db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface Anomaly {
  time: string;
  type: string;
  message: string;
  frame: string;
}

export const getAnomalies = async (): Promise<RowDataPacket[]> => {
  const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM anomalies");
  return rows;
};

export const createAnomaly = async (anomaly: Anomaly) => {
  const { time, type, message, frame } = anomaly;
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO anomalies (time, type, message, frame) VALUES (?, ?, ?, ?)",
    [time, type, message, frame]
  );
  return { id: result.insertId, ...anomaly };
};

export const getAnomalyById = async (id: string): Promise<RowDataPacket> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM anomalies WHERE id = ?",
    [id]
  );
  return rows[0];
};
