-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPERUSER', 'STAFF', 'CLIENT');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('MASTER_OWNER', 'BOOKKEEPER', 'COMPLIANCE_OFFICER', 'TAX_AGENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "CompanyGroupType" AS ENUM ('REFERRER', 'INTERNAL', 'PARTNER');

-- CreateEnum
CREATE TYPE "MatterStage" AS ENUM ('START', 'PREPARE', 'CHECK', 'LODGE', 'ACTIVE');

-- CreateEnum
CREATE TYPE "MatterType" AS ENUM ('NEW_SMSF_SETUP', 'EXISTING_ONBOARDING', 'CORPORATE_TRUSTEE_SETUP');

-- CreateEnum
CREATE TYPE "TrusteeStructure" AS ENUM ('INDIVIDUAL', 'CORPORATE');

-- CreateEnum
CREATE TYPE "HandoffStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'REVIEW', 'FAILED');

-- CreateEnum
CREATE TYPE "CheckResult" AS ENUM ('PASS', 'FAIL', 'CLEAR', 'FLAG', 'RUNNING');

-- CreateEnum
CREATE TYPE "KycProvider" AS ENUM ('AAP_NATIVE', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('TRUST_DEED_ESTABLISHMENT', 'KYC_IDENTITY', 'ATO_CORRESPONDENCE', 'ASIC_CORRESPONDENCE', 'TAX_RETURN', 'FINANCIAL_STATEMENTS', 'AUDIT_REPORT', 'SIGNED_AGREEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentSignStatus" AS ENUM ('NOT_REQUIRED', 'AWAITING_SIGNATURE', 'SIGNED', 'VERIFIED');

-- CreateEnum
CREATE TYPE "FileNoteType" AS ENUM ('CALL', 'EMAIL', 'MEETING', 'INTERNAL', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FileNoteSource" AS ENUM ('MANUAL', 'THREE_CX', 'ECHO_NOTES', 'BIZ_GPT');

-- CreateEnum
CREATE TYPE "FileNoteDraftStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SignatureMode" AS ENUM ('DRAW', 'TYPE');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('MATTER_CREATED', 'STAGE_ADVANCE', 'HANDOFF_ACCEPTED', 'REASSIGNED', 'KYC_LINK_SENT', 'KYC_APPROVED', 'CALL_INITIATED', 'CALL_ENDED', 'CALL_NOTE_RECEIVED', 'CALL_NOTE_APPROVED', 'FILE_NOTE_ADDED', 'FILE_NOTE_APPROVED', 'DOCUMENT_UPLOAD', 'DOCUMENT_SIGNED', 'MESSAGE_SENT', 'MESSAGE_SENT_CLIENT', 'TASK_ADDED', 'TASK_COMPLETED', 'LODGEMENT_SUBMITTED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "PackageTier" AS ENUM ('DEFAULT_PLUS_ACCOUNTING', 'UNLISTED_ASSETS', 'BYOA');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "image" TEXT,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STAFF',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "company_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CompanyGroupType" NOT NULL DEFAULT 'REFERRER',
    "logo_url" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL,
    "experience_years" INTEGER,
    "bio" TEXT,
    "hobbies" TEXT,
    "pets" TEXT,
    "photo_url" TEXT,
    "phone" TEXT,
    "extension" TEXT,
    "smtp_host" TEXT,
    "smtp_port" INTEGER,
    "smtp_user" TEXT,
    "smtp_pass_enc" TEXT,
    "imap_host" TEXT,
    "imap_port" INTEGER,
    "company_group_id" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "tfn" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matters" (
    "id" TEXT NOT NULL,
    "matter_ref" TEXT NOT NULL,
    "fund_name" TEXT NOT NULL,
    "stage" "MatterStage" NOT NULL DEFAULT 'START',
    "matter_type" "MatterType" NOT NULL,
    "package_tier" "PackageTier" NOT NULL,
    "trustee_structure" "TrusteeStructure" NOT NULL,
    "abn" TEXT,
    "tfn" TEXT,
    "acn" TEXT,
    "establishment_date" TIMESTAMP(3),
    "referrer_name" TEXT,
    "company_group_id" TEXT,
    "primary_contact_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "client_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "tfn" TEXT,
    "is_trustee" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_assignments" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "stage" "MatterStage" NOT NULL,
    "staff_id" TEXT NOT NULL,
    "handoff_status" "HandoffStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "stage_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_checks" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "member_name" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "identity_check" "CheckResult",
    "liveness_check" "CheckResult",
    "adverse_media" "CheckResult",
    "provider" "KycProvider" NOT NULL DEFAULT 'AAP_NATIVE',
    "evidence_urls" TEXT[],
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kyc_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_key" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "financial_year" TEXT,
    "sign_status" "DocumentSignStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "uploaded_by_id" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "file_notes" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "author_staff_id" TEXT,
    "type" "FileNoteType" NOT NULL,
    "source" "FileNoteSource" NOT NULL DEFAULT 'MANUAL',
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "draft_status" "FileNoteDraftStatus" NOT NULL DEFAULT 'PUBLISHED',
    "three_cx_ref" TEXT,
    "echo_notes_ref" TEXT,
    "biz_gpt_ref" TEXT,
    "call_duration_sec" INTEGER,
    "recording_url" TEXT,
    "transcript_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signature_requests" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "document_id" TEXT,
    "document_name" TEXT NOT NULL,
    "signatory_email" TEXT NOT NULL,
    "signatory_name" TEXT NOT NULL,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "signature_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signature_events" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "mode" "SignatureMode" NOT NULL,
    "signature_data" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "user_agent" TEXT,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signature_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_actions" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT,
    "user_id" TEXT,
    "action" "AuditActionType" NOT NULL,
    "details" TEXT,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "assigned_staff_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_submissions" (
    "id" TEXT NOT NULL,
    "matter_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_user_id_key" ON "clients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "matters_matter_ref_key" ON "matters"("matter_ref");

-- CreateIndex
CREATE INDEX "matters_stage_idx" ON "matters"("stage");

-- CreateIndex
CREATE INDEX "matters_company_group_id_idx" ON "matters"("company_group_id");

-- CreateIndex
CREATE INDEX "members_matter_id_idx" ON "members"("matter_id");

-- CreateIndex
CREATE UNIQUE INDEX "stage_assignments_matter_id_stage_key" ON "stage_assignments"("matter_id", "stage");

-- CreateIndex
CREATE INDEX "kyc_checks_matter_id_idx" ON "kyc_checks"("matter_id");

-- CreateIndex
CREATE INDEX "documents_matter_id_idx" ON "documents"("matter_id");

-- CreateIndex
CREATE INDEX "documents_category_idx" ON "documents"("category");

-- CreateIndex
CREATE INDEX "file_notes_matter_id_idx" ON "file_notes"("matter_id");

-- CreateIndex
CREATE INDEX "audit_actions_matter_id_idx" ON "audit_actions"("matter_id");

-- CreateIndex
CREATE INDEX "audit_actions_user_id_idx" ON "audit_actions"("user_id");

-- CreateIndex
CREATE INDEX "audit_actions_action_idx" ON "audit_actions"("action");

-- CreateIndex
CREATE INDEX "tasks_matter_id_idx" ON "tasks"("matter_id");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_submissions_matter_id_key" ON "onboarding_submissions"("matter_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_company_group_id_fkey" FOREIGN KEY ("company_group_id") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matters" ADD CONSTRAINT "matters_company_group_id_fkey" FOREIGN KEY ("company_group_id") REFERENCES "company_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matters" ADD CONSTRAINT "matters_primary_contact_id_fkey" FOREIGN KEY ("primary_contact_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_assignments" ADD CONSTRAINT "stage_assignments_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_assignments" ADD CONSTRAINT "stage_assignments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_checks" ADD CONSTRAINT "kyc_checks_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_notes" ADD CONSTRAINT "file_notes_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "file_notes" ADD CONSTRAINT "file_notes_author_staff_id_fkey" FOREIGN KEY ("author_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_requests" ADD CONSTRAINT "signature_requests_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_requests" ADD CONSTRAINT "signature_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_events" ADD CONSTRAINT "signature_events_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "signature_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_actions" ADD CONSTRAINT "audit_actions_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_actions" ADD CONSTRAINT "audit_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_submissions" ADD CONSTRAINT "onboarding_submissions_matter_id_fkey" FOREIGN KEY ("matter_id") REFERENCES "matters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
