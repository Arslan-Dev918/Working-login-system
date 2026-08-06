// ==========================================
// DATABASE CONNECTION ENGINE (MySQL only)
// Urdu Comment: Yeh file sirf MySQL database se connection establish karti hai.
// ==========================================

import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const dbConfig: PoolOptions = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'login_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool: Pool = mysql.createPool(dbConfig);

export type QueryResult = RowDataPacket[] | RowDataPacket[][] | ResultSetHeader;

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log('MySQL database connection established.');
    return true;
  } catch (error) {
    console.error('MySQL database connection failed. Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, and ensure MySQL is running.');
    console.error(error);
    return false;
  }
}

/**
 * Parameterized Query Executor
 * Urdu Comment: Query run karne ka main function. Parameterized query SQL Injection se bachati hai.
 */
export async function executeQuery<T extends QueryResult = RowDataPacket[]>(
  sql: string,
  params: any[] = []
): Promise<T> {
  try {
    const [rows] = await pool.execute<T>(sql, params);
    return rows;
  } catch (error) {
    console.error('MySQL query execution failed:', error);
    throw error;
  }
}

export default {
  executeQuery,
  checkDatabaseConnection
};
