-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "amout" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "create_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "tokenId" TEXT PRIMARY KEY,
    "familyId" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "createdAt" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    "revoked" INTEGER DEFAULT 0,
    "userId" TEXT NOT NULL,
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "create_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "solde" REAL DEFAULT 0
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_users_2" ON "users"("email");
Pragma writable_schema=0;
