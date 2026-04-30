-- CreateTable
CREATE TABLE `Class` (
    `ClassID` VARCHAR(191) NOT NULL,
    `ClassName` VARCHAR(191) NOT NULL,
    `ClassSubject` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ClassID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `StudentID` VARCHAR(191) NOT NULL,
    `Name` VARCHAR(191) NOT NULL,
    `ClassID` VARCHAR(191) NOT NULL,
    `UserID` VARCHAR(191) NULL,

    UNIQUE INDEX `Student_UserID_key`(`UserID`),
    PRIMARY KEY (`StudentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `full_name` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'teacher',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `QuestID` VARCHAR(191) NOT NULL,
    `prompt` TEXT NOT NULL,
    `rubric` TEXT NOT NULL,

    PRIMARY KEY (`QuestID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Assignment` (
    `AssignmentID` VARCHAR(191) NOT NULL,
    `ClassID` VARCHAR(191) NOT NULL,
    `QuestID` VARCHAR(191) NOT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Assignment_ClassID_QuestID_key`(`ClassID`, `QuestID`),
    PRIMARY KEY (`AssignmentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Submission` (
    `StudentID` VARCHAR(191) NOT NULL,
    `QuestID` VARCHAR(191) NOT NULL,
    `submission` LONGTEXT NOT NULL,
    `score` INTEGER NULL,
    `grade` BOOLEAN NOT NULL DEFAULT false,
    `draft_feedback` TEXT NULL,
    `plagiarism_risk_score` DOUBLE NOT NULL DEFAULT 0.0,
    `plagiarism_flagged` BOOLEAN NOT NULL DEFAULT false,
    `uploaded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `graded_at` DATETIME(3) NULL,
    `graded_by` VARCHAR(191) NULL,

    PRIMARY KEY (`StudentID`, `QuestID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_ClassID_fkey` FOREIGN KEY (`ClassID`) REFERENCES `Class`(`ClassID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_UserID_fkey` FOREIGN KEY (`UserID`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_ClassID_fkey` FOREIGN KEY (`ClassID`) REFERENCES `Class`(`ClassID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Assignment` ADD CONSTRAINT `Assignment_QuestID_fkey` FOREIGN KEY (`QuestID`) REFERENCES `Question`(`QuestID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_StudentID_fkey` FOREIGN KEY (`StudentID`) REFERENCES `Student`(`StudentID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_QuestID_fkey` FOREIGN KEY (`QuestID`) REFERENCES `Question`(`QuestID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Submission` ADD CONSTRAINT `Submission_graded_by_fkey` FOREIGN KEY (`graded_by`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
