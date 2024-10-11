/*
  Warnings:

  - You are about to drop the `categorytracker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `categorytracker` DROP FOREIGN KEY `CategoryTracker_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `categorytracker` DROP FOREIGN KEY `CategoryTracker_categoryId_fkey`;

-- DropTable
DROP TABLE `categorytracker`;

-- CreateTable
CREATE TABLE `CategoryLastChecked` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CategoryLastChecked_categoryId_key`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CategoryLastChecked` ADD CONSTRAINT `CategoryLastChecked_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryLastChecked` ADD CONSTRAINT `CategoryLastChecked_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
