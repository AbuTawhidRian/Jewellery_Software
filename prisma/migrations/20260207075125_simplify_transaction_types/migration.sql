/*
  Warnings:

  - Changed the type of `type` on the `CashLedger` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `GoldLedger` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('RECEIVE', 'PAY', 'ADJUSTMENT');

-- AlterTable
ALTER TABLE "CashLedger" DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- AlterTable
ALTER TABLE "GoldLedger" DROP COLUMN "type",
ADD COLUMN     "type" "TransactionType" NOT NULL;

-- DropEnum
DROP TYPE "CashTransactionType";

-- DropEnum
DROP TYPE "GoldTransactionType";
