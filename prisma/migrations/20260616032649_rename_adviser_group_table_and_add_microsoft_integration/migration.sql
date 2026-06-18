/*
  Warnings:

  - You are about to drop the column `adviserGroupId` on the `Party` table. All the data in the column will be lost.
  - You are about to drop the `AdviserGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Party" DROP CONSTRAINT "Party_adviserGroupId_fkey";

-- AlterTable
ALTER TABLE "Party" DROP COLUMN "adviserGroupId",
ADD COLUMN     "organisationId" TEXT;

-- DropTable
DROP TABLE "AdviserGroup";

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "letter" CHAR(1) NOT NULL,
    "bgColor" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "cbClass" TEXT NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_microsoft_integrations" (
    "organisationId" TEXT NOT NULL,
    "microsoft_tenant_id" TEXT,
    "sharepoint_site_id" TEXT,
    "sharepoint_drive_id" TEXT,

    CONSTRAINT "organisation_microsoft_integrations_pkey" PRIMARY KEY ("organisationId")
);

-- AddForeignKey
ALTER TABLE "organisation_microsoft_integrations" ADD CONSTRAINT "organisation_microsoft_integrations_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
