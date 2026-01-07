-- CreateTable
CREATE TABLE "GameResult" (
    "id" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "winnerId" TEXT,
    "player1Score" INTEGER NOT NULL,
    "player2Score" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'score_reached',
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameResult_player1Id_idx" ON "GameResult"("player1Id");

-- CreateIndex
CREATE INDEX "GameResult_player2Id_idx" ON "GameResult"("player2Id");

-- CreateIndex
CREATE INDEX "GameResult_winnerId_idx" ON "GameResult"("winnerId");

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
