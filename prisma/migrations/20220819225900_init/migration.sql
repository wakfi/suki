-- CreateTable
CREATE TABLE "MUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "birthday" DATETIME NOT NULL,
    "discordId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "preferredName" TEXT
);

-- CreateTable
CREATE TABLE "MGuild" (
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
    CONSTRAINT "UserGuildPivot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "MUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserGuildPivot_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "MGuild" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
