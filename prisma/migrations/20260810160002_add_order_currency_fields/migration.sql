-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "chargedAmount" DECIMAL(18,2),
ADD COLUMN     "chargedCurrency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NGN',
ADD COLUMN     "exchangeRate" DECIMAL(18,6);
