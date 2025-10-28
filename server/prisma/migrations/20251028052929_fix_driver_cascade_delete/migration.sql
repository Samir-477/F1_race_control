-- DropForeignKey
ALTER TABLE `driver` DROP FOREIGN KEY `Driver_teamId_fkey`;

-- DropForeignKey
ALTER TABLE `raceincident` DROP FOREIGN KEY `RaceIncident_driverId_fkey`;

-- DropForeignKey
ALTER TABLE `raceresult` DROP FOREIGN KEY `RaceResult_driverId_fkey`;

-- DropIndex
DROP INDEX `RaceIncident_driverId_fkey` ON `raceincident`;

-- DropIndex
DROP INDEX `RaceResult_driverId_fkey` ON `raceresult`;

-- AddForeignKey
ALTER TABLE `Driver` ADD CONSTRAINT `Driver_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaceResult` ADD CONSTRAINT `RaceResult_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `Driver`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RaceIncident` ADD CONSTRAINT `RaceIncident_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `Driver`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
