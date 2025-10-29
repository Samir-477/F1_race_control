-- AlterTable
ALTER TABLE `race` ADD COLUMN `isReviewed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reviewedAt` DATETIME(3) NULL,
    ADD COLUMN `reviewedById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Race` ADD CONSTRAINT `Race_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
