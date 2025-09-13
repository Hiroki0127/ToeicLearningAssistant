/*
  Warnings:

  - You are about to drop the column `category` on the `flashcards` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `flashcards` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_flashcards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "word" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    CONSTRAINT "flashcards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_flashcards" ("createdAt", "definition", "difficulty", "example", "id", "partOfSpeech", "updatedAt", "userId", "word") SELECT "createdAt", "definition", "difficulty", "example", "id", "partOfSpeech", "updatedAt", "userId", "word" FROM "flashcards";
DROP TABLE "flashcards";
ALTER TABLE "new_flashcards" RENAME TO "flashcards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
