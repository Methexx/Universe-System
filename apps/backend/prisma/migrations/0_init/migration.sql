-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'pending',
    "requested_role" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "phone_number" TEXT,
    "fcm_token" TEXT,
    "user_id_no" TEXT,
    "gender" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_grades" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "school_grade_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "teacher_id" UUID,
    "subject" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "photo_url" TEXT,
    "student_id_no" TEXT NOT NULL,
    "qr_code" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "class_id" UUID,
    "gender" TEXT,
    "parent_email" TEXT,
    "parent_mobile" TEXT,
    "parent_name" TEXT,
    "fcm_token" TEXT,
    "is_parent_linked" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_students" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parent_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "relation" TEXT,
    "verified_via" TEXT,
    "linked_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parent_students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_events" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID NOT NULL,
    "scanned_by_id" UUID,
    "direction" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'qr',
    "manual_reason" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gate_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "student_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'absent',
    "marked_by_id" UUID,
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "author_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'school_wide',
    "target" TEXT NOT NULL DEFAULT 'all',
    "class_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "student_id" UUID,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parent_id" UUID NOT NULL,
    "student_id" UUID,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "assigned_to_id" UUID,
    "assigned_at" TIMESTAMPTZ,
    "reply_note" TEXT,
    "resolved_by_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_found_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "posted_by" UUID NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT,
    "photo_url" TEXT,
    "found_at" TEXT,
    "found_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'unclaimed',
    "collected_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lost_found_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lost_found_reports" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parent_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "item_name" TEXT NOT NULL,
    "description" TEXT,
    "photo_url" TEXT,
    "date_lost" DATE,
    "status" TEXT NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lost_found_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_documents" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "uploaded_by" UUID NOT NULL,
    "file_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "file_hash" TEXT,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "document_id" UUID NOT NULL,
    "chunk_text" TEXT NOT NULL,
    "embedding" vector(768) NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluation_logs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "query" TEXT NOT NULL,
    "retrieved_chunks" JSONB NOT NULL,
    "generated_answer" TEXT NOT NULL,
    "confidence_score" DOUBLE PRECISION,
    "sources" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_id_no_key" ON "users"("user_id_no");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE INDEX "otp_verifications_email_idx" ON "otp_verifications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "school_grades_name_key" ON "school_grades"("name");

-- CreateIndex
CREATE INDEX "classes_teacher_id_idx" ON "classes"("teacher_id");

-- CreateIndex
CREATE INDEX "classes_school_grade_id_idx" ON "classes"("school_grade_id");

-- CreateIndex
CREATE UNIQUE INDEX "classes_school_grade_id_name_key" ON "classes"("school_grade_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_id_no_key" ON "students"("student_id_no");

-- CreateIndex
CREATE UNIQUE INDEX "students_qr_code_key" ON "students"("qr_code");

-- CreateIndex
CREATE INDEX "students_class_id_idx" ON "students"("class_id");

-- CreateIndex
CREATE INDEX "students_is_active_idx" ON "students"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "parent_students_student_id_key" ON "parent_students"("student_id");

-- CreateIndex
CREATE INDEX "parent_students_parent_id_idx" ON "parent_students"("parent_id");

-- CreateIndex
CREATE INDEX "parent_students_student_id_idx" ON "parent_students"("student_id");

-- CreateIndex
CREATE INDEX "gate_events_student_id_idx" ON "gate_events"("student_id");

-- CreateIndex
CREATE INDEX "gate_events_direction_idx" ON "gate_events"("direction");

-- CreateIndex
CREATE INDEX "gate_events_timestamp_idx" ON "gate_events"("timestamp");

-- CreateIndex
CREATE INDEX "gate_events_student_id_timestamp_idx" ON "gate_events"("student_id", "timestamp");

-- CreateIndex
CREATE INDEX "attendance_records_date_idx" ON "attendance_records"("date");

-- CreateIndex
CREATE INDEX "attendance_records_status_idx" ON "attendance_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_student_id_date_key" ON "attendance_records"("student_id", "date");

-- CreateIndex
CREATE INDEX "announcements_author_id_idx" ON "announcements"("author_id");

-- CreateIndex
CREATE INDEX "announcements_class_id_idx" ON "announcements"("class_id");

-- CreateIndex
CREATE INDEX "announcements_scope_idx" ON "announcements"("scope");

-- CreateIndex
CREATE INDEX "announcements_created_at_idx" ON "announcements"("created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_receiver_id_idx" ON "messages"("receiver_id");

-- CreateIndex
CREATE INDEX "messages_student_id_idx" ON "messages"("student_id");

-- CreateIndex
CREATE INDEX "complaints_parent_id_idx" ON "complaints"("parent_id");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_assigned_to_id_idx" ON "complaints"("assigned_to_id");

-- CreateIndex
CREATE INDEX "lost_found_items_posted_by_idx" ON "lost_found_items"("posted_by");

-- CreateIndex
CREATE INDEX "lost_found_items_status_idx" ON "lost_found_items"("status");

-- CreateIndex
CREATE INDEX "lost_found_reports_parent_id_idx" ON "lost_found_reports"("parent_id");

-- CreateIndex
CREATE INDEX "lost_found_reports_status_idx" ON "lost_found_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "policy_documents_file_hash_key" ON "policy_documents"("file_hash");

-- CreateIndex
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks"("document_id");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_grade_id_fkey" FOREIGN KEY ("school_grade_id") REFERENCES "school_grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_students" ADD CONSTRAINT "parent_students_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_events" ADD CONSTRAINT "gate_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_events" ADD CONSTRAINT "gate_events_scanned_by_id_fkey" FOREIGN KEY ("scanned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_marked_by_id_fkey" FOREIGN KEY ("marked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_found_items" ADD CONSTRAINT "lost_found_items_posted_by_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_found_reports" ADD CONSTRAINT "lost_found_reports_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lost_found_reports" ADD CONSTRAINT "lost_found_reports_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_documents" ADD CONSTRAINT "policy_documents_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_chunks" ADD CONSTRAINT "document_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "policy_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

