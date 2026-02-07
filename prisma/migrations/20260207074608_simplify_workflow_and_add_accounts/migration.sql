/*
  Warnings:

  - You are about to drop the `Craftsperson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobTransfer` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('INCOME', 'EXPENSE');

-- DropForeignKey
ALTER TABLE "Craftsperson" DROP CONSTRAINT "Craftsperson_companyId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_companyId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_currentCraftspersonId_fkey";

-- DropForeignKey
ALTER TABLE "JobCard" DROP CONSTRAINT "JobCard_orderId_fkey";

-- DropForeignKey
ALTER TABLE "JobTransfer" DROP CONSTRAINT "JobTransfer_fromCraftspersonId_fkey";

-- DropForeignKey
ALTER TABLE "JobTransfer" DROP CONSTRAINT "JobTransfer_jobCardId_fkey";

-- DropForeignKey
ALTER TABLE "JobTransfer" DROP CONSTRAINT "JobTransfer_toCraftspersonId_fkey";

-- AlterTable
ALTER TABLE "CashLedger" ADD COLUMN     "accountId" TEXT;

-- DropTable
DROP TABLE "Craftsperson";

-- DropTable
DROP TABLE "JobCard";

-- DropTable
DROP TABLE "JobTransfer";

-- DropEnum
DROP TYPE "CraftspersonType";

-- DropEnum
DROP TYPE "ManufacturingStage";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL DEFAULT 'EXPENSE',
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_companyId_idx" ON "Account"("companyId");

-- AddForeignKey
ALTER TABLE "CashLedger" ADD CONSTRAINT "CashLedger_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
