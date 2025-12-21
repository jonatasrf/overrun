-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TractorModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gearRatio" DOUBLE PRECISION NOT NULL,
    "image" BYTEA,

    CONSTRAINT "TractorModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "tractorName" TEXT NOT NULL,
    "gearRatioValue" DOUBLE PRECISION NOT NULL,
    "tractorImage" BYTEA,
    "totalWeight" TEXT,
    "frontLoad" TEXT,
    "rearLoad" TEXT,
    "frontBallast" TEXT,
    "rearBallast" TEXT,
    "tireBrandFront" TEXT,
    "tireBrandRear" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tire" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rim" TEXT,
    "rollingCircumference" DOUBLE PRECISION,
    "staticLoadedRadius" DOUBLE PRECISION,
    "overallDiameter" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurement" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pressure" INTEGER NOT NULL,
    "val1" DOUBLE PRECISION,
    "val2" DOUBLE PRECISION,
    "val3" DOUBLE PRECISION,
    "average" DOUBLE PRECISION,

    CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TractorModel_name_key" ON "TractorModel"("name");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurement" ADD CONSTRAINT "Measurement_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
