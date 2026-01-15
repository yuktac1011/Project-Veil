const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize DB Connection (Creates veil.db in the same directory)
const dbPath = path.resolve(__dirname, 'veil.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize Schema
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    ipfsCid TEXT UNIQUE,
    title TEXT,
    category TEXT,
    severity TEXT,
    description TEXT,
    status TEXT,
    timestamp INTEGER,
    txHash TEXT,
    userCommitment TEXT
  )`, (err) => {
    if (err) {
      console.error("Error creating tables:", err);
    } else {
      console.log("Tables initialized.");
    }
  });
});

// Helper Functions
const insertReport = (report) => {
  return new Promise((resolve, reject) => {
    const { id, ipfsCid, title, category, severity, description, status, timestamp, txHash, userCommitment } = report;
    const sql = `INSERT INTO reports (id, ipfsCid, title, category, severity, description, status, timestamp, txHash, userCommitment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [id, ipfsCid, title, category, severity, description, status, timestamp, txHash, userCommitment], function(err) {
      if (err) {
        console.error("DB Insert Error:", err);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

const getReports = (filters = {}) => {
  return new Promise((resolve, reject) => {
    let sql = `SELECT * FROM reports`;
    const params = [];

    // Simple filtering
    const conditions = [];
    if (filters.status) {
      conditions.push("status = ?");
      params.push(filters.status);
    }
    if (filters.category) {
      conditions.push("category = ?");
      params.push(filters.category);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += " ORDER BY timestamp DESC";

    db.all(sql, params, (err, rows) => {
      if (err) {
          console.error("DB Select Error:", err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const updateReportStatus = (id, newStatus) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE reports SET status = ? WHERE id = ?`;
        db.run(sql, [newStatus, id], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes);
            }
        });
    });
};

const getReputationStats = (commitment) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT status, COUNT(*) as count FROM reports WHERE userCommitment = ? GROUP BY status`;
        db.all(sql, [commitment], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = {
  db,
  insertReport,
  getReports,
  updateReportStatus,
  getReputationStats
};
