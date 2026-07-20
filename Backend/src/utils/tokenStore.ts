import db from "../config/db";


// Création de la table si elle n'existe pas


interface StoredToken {
  tokenId: string;
  userId: string;
  familyId: string;
  deviceInfo: string;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
}

// Fonction utilitaire pour convertir les lignes SQL brutes en format TypeScript propre
function mapRowToToken(row: any): StoredToken {
  return {
    tokenId: row.tokenId,
    userId: row.userId,
    familyId: row.familyId,
    deviceInfo: row.deviceInfo,
    createdAt: new Date(row.createdAt),
    expiresAt: new Date(row.expiresAt),
    revoked: row.revoked === 1,
  };
}

export function storeRefreshToken(
  tokenId: string,
  userId: string,
  familyId: string,
  deviceInfo: string,
  expiresInDays: number = 7
): void {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const stmt = db.prepare(`
    INSERT INTO refresh_tokens (tokenId, userId, familyId, deviceInfo, createdAt, expiresAt, revoked)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `);
  stmt.run(tokenId, userId, familyId, deviceInfo, new Date().toISOString(), expiresAt.toISOString());
}

export function getStoredToken(tokenId: string): StoredToken | undefined {
  const row = db.prepare("SELECT * FROM refresh_tokens WHERE tokenId = ?").get(tokenId) as any;
  return row ? mapRowToToken(row) : undefined;
}

export function revokeToken(tokenId: string): boolean {
  const result = db.prepare("UPDATE refresh_tokens SET revoked = 1 WHERE tokenId = ?").run(tokenId);
  return result.changes > 0;
}

export function revokeTokenFamily(familyId: string): void {
  db.prepare("UPDATE refresh_tokens SET revoked = 1 WHERE familyId = ?").run(familyId);
}

export function revokeAllUserTokens(userId: string): void {
  db.prepare("UPDATE refresh_tokens SET revoked = 1 WHERE userId = ?").run(userId);
}

export function getUserSessions(userId: string): StoredToken[] {
  const now = new Date().toISOString();
  const rows = db.prepare(`
    SELECT * FROM refresh_tokens 
    WHERE userId = ? AND revoked = 0 AND expiresAt > ?
  `).all(userId) as any[];
  
  return rows.map(mapRowToToken);
}

export function cleanupExpiredTokens(): number {
  const now = new Date().toISOString();
  const result = db.prepare("DELETE FROM refresh_tokens WHERE expiresAt < ?").run(now);
  return result.changes;
}