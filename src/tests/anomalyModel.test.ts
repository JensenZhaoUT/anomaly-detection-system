import {
  getAnomalies,
  createAnomaly,
  getAnomalyById,
} from "../models/anomalyModel";
import pool from "../models/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

jest.mock("../models/db", () => ({
  query: jest.fn(),
}));

describe("Anomaly Model", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get all anomalies", async () => {
    const mockAnomalies: RowDataPacket[] = [
      {
        id: 1,
        time: "2024-06-25T13:27:57.000Z",
        type: "proximity_alert",
        message: "Test message",
        frame: "frame_1.png",
      } as RowDataPacket,
    ];
    (pool.query as jest.Mock).mockResolvedValue([mockAnomalies]);

    const anomalies = await getAnomalies();

    expect(anomalies).toEqual(mockAnomalies);
    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM anomalies");
  });

  it("should create a new anomaly", async () => {
    const newAnomaly = {
      time: "2024-06-25T13:27:57.000Z",
      type: "proximity_alert",
      message: "Test message",
      frame: "frame_1.png",
    };
    const mockResult: ResultSetHeader = { insertId: 1 } as ResultSetHeader;
    (pool.query as jest.Mock).mockResolvedValue([mockResult]);

    const result = await createAnomaly(newAnomaly);

    expect(result).toEqual({ id: 1, ...newAnomaly });
    expect(pool.query).toHaveBeenCalledWith(
      "INSERT INTO anomalies (time, type, message, frame) VALUES (?, ?, ?, ?)",
      [newAnomaly.time, newAnomaly.type, newAnomaly.message, newAnomaly.frame]
    );
  });

  it("should get anomaly by id", async () => {
    const mockAnomaly: RowDataPacket = {
      id: 1,
      time: "2024-06-25T13:27:57.000Z",
      type: "proximity_alert",
      message: "Test message",
      frame: "frame_1.png",
    } as RowDataPacket;
    (pool.query as jest.Mock).mockResolvedValue([[mockAnomaly]]);

    const anomaly = await getAnomalyById("1");

    expect(anomaly).toEqual(mockAnomaly);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM anomalies WHERE id = ?",
      ["1"]
    );
  });
});
