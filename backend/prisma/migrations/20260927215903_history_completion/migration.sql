-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WatchHistory" (
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "lastWatchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("userId", "videoId"),
    CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WatchHistory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WatchHistory" ("lastWatchedAt", "userId", "videoId") SELECT "lastWatchedAt", "userId", "videoId" FROM "WatchHistory";
DROP TABLE "WatchHistory";
ALTER TABLE "new_WatchHistory" RENAME TO "WatchHistory";
CREATE INDEX "WatchHistory_userId_lastWatchedAt_idx" ON "WatchHistory"("userId", "lastWatchedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
