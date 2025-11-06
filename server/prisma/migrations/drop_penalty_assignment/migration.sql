-- DropForeignKey
ALTER TABLE `PenaltyAssignment` DROP FOREIGN KEY `PenaltyAssignment_incidentId_fkey`;

-- DropForeignKey
ALTER TABLE `PenaltyAssignment` DROP FOREIGN KEY `PenaltyAssignment_stewardId_fkey`;

-- DropForeignKey
ALTER TABLE `PenaltyAssignment` DROP FOREIGN KEY `PenaltyAssignment_approvedById_fkey`;

-- DropTable
DROP TABLE `PenaltyAssignment`;
