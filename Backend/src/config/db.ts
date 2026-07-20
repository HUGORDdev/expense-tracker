import { Database } from "bun:sqlite";

const db = new Database("myexpense.sqlite", { create: true });

// db.run("PRAGMA foreign_keys = ON;");
db.run("PRAGMA foreign_keys = ON;")
export const innitDB = () => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users(
      id TEXT PRIMARY KEY,
      userName TEXT  NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      solde FLOAT DEFAULT 0
      );
         `);
    db.run(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        tokenId TEXT PRIMARY KEY,
        familyId TEXT NOT NULL,
        deviceInfo TEXT,
        createdAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        revoked INTEGER DEFAULT 0,
        userId Text NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expense(
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    amout FLOAT NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id Text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ); 
    `);

    console.log('les tables on ete cree avec success')
};

export default db