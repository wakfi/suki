-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "birthday" DATETIME NOT NULL,
    "discordId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "preferredName" TEXT
);

-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "discordId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserGuildPivot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    CONSTRAINT "UserGuildPivot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserGuildPivot_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Guild_discordId_key" ON "Guild"("discordId");

-- CreateIndex
CREATE INDEX "UserGuildPivot_userId_idx" ON "UserGuildPivot"("userId");

-- CreateIndex
CREATE INDEX "UserGuildPivot_guildId_idx" ON "UserGuildPivot"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGuildPivot_userId_guildId_key" ON "UserGuildPivot"("userId", "guildId");
