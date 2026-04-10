-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "thumbsUp" BOOLEAN,
    "comment" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Feedback_analysisId_idx" ON "Feedback"("analysisId");

-- CreateIndex
CREATE INDEX "Feedback_thumbsUp_idx" ON "Feedback"("thumbsUp");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");
