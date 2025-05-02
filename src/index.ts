import express, { Request, Response } from 'express';
import sqlite3 from 'sqlite3';
import path from 'path';


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize SQLite database
const dbPath = path.resolve('./', 'data.db');
const db = new sqlite3.Database(dbPath, (err: Error | null) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS measurements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// POST endpoint to accept temperature and humidity
app.post('/measurements', (req: Request, res: Response) => {
  const { temperature, humidity, auth } = req.body;

  if (auth !== "knowaboutmenmixx") {
    return res.status(401).json({error: 'who are you?'});
  }

  if (typeof temperature !== 'number' || typeof humidity !== 'number') {
    return res.status(400).json({ error: 'Temperature and humidity must be numbers.' });
  }

  const query = `INSERT INTO measurements (temperature, humidity) VALUES (?, ?)`;
  db.run(query, [temperature, humidity], function(this: sqlite3.RunResult, err: Error | null) {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).json({ error: 'Failed to store data.' });
    }
    res.status(201).json({ id: this.lastID, temperature, humidity, timestamp: new Date().toISOString() });
  });
});

// GET endpoint to retrieve last 10 measurements with ISO string timestamp
app.get('/measurements', (_req: Request, res: Response) => {
  const query = `SELECT * FROM measurements ORDER BY timestamp DESC LIMIT 10`;
  db.all(query, [], (err: Error | null, rows: any[]) => {
    if (err) {
      console.error('Error retrieving data:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve data.' });
    }
    // Convert timestamp to ISO string
    const formattedRows = rows.map(row => ({
      ...row,
      timestamp: new Date(row.timestamp).toISOString()
    }));
    res.json(formattedRows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
