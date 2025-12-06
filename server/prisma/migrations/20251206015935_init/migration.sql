-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME,
    "sockets" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Message_roomId_createdAt_idx" ON "Message"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_fromUserId_idx" ON "Message"("fromUserId");
