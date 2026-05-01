-- DropForeignKey: Remove ClassID FK from Student
ALTER TABLE `Student` DROP FOREIGN KEY `Student_ClassID_fkey`;

-- AlterTable: Remove ClassID column from Student
ALTER TABLE `Student` DROP COLUMN `ClassID`;

-- CreateTable: Classmate (many-to-many between Student and Classroom)
CREATE TABLE `Classmate` (
    `MateID` VARCHAR(191) NOT NULL,
    `StudentID` VARCHAR(191) NOT NULL,
    `ClassroomID` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Classmate_StudentID_ClassroomID_key`(`StudentID`, `ClassroomID`),
    PRIMARY KEY (`MateID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: Classmate -> Student
ALTER TABLE `Classmate` ADD CONSTRAINT `Classmate_StudentID_fkey` FOREIGN KEY (`StudentID`) REFERENCES `Student`(`StudentID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: Classmate -> Classroom
ALTER TABLE `Classmate` ADD CONSTRAINT `Classmate_ClassroomID_fkey` FOREIGN KEY (`ClassroomID`) REFERENCES `Classroom`(`ClassID`) ON DELETE RESTRICT ON UPDATE CASCADE;
