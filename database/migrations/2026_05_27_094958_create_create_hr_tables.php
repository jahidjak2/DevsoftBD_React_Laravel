<?php

// database/migrations/2024_01_01_000007_create_hr_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Departments ────────────────────────────────────────────────────
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Employees ──────────────────────────────────────────────────────
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('employee_code', 50)->unique();          // DSB-0042
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('designation', 200);                     // job title
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'intern'])
                ->default('full_time');
            $table->date('join_date');
            $table->date('end_date')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('emergency_contact_name', 200)->nullable();
            $table->string('emergency_contact_phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->string('nid_number', 100)->nullable();
            $table->decimal('salary', 12, 2)->nullable();           // private
            $table->string('bank_account', 100)->nullable();        // private
            $table->foreignId('avatar_id')->nullable()->constrained('media')->nullOnDelete();
            $table->text('bio')->nullable();
            $table->json('skills')->nullable();                     // ["Laravel","React"]
            $table->string('linkedin_url', 500)->nullable();
            $table->string('github_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('employee_code');
            $table->index('is_active');
        });

        // Add head_employee_id to departments (deferred — employees must exist first)
        Schema::table('departments', function (Blueprint $table) {
            $table->foreignId('head_employee_id')
                ->nullable()
                ->after('name')
                ->constrained('employees')
                ->nullOnDelete();
        });

        // Add employee_id to users (deferred — employees must exist first)
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('employee_id')
                ->nullable()
                ->after('role')
                ->constrained('employees')
                ->nullOnDelete();
        });

        // ── Employee documents ─────────────────────────────────────────────
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->enum('document_type', ['nda', 'contract', 'id_card', 'certificate', 'other'])
                ->default('other');
            $table->string('title', 200);
            $table->text('notes')->nullable();
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });

        // ── Leave types ────────────────────────────────────────────────────
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);                    // "Annual Leave"
            $table->unsignedInteger('days_allowed');        // per year
            $table->boolean('is_paid')->default(true);
            $table->boolean('carry_forward')->default(false);
            $table->string('color', 20)->default('#3B82F6');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Leave balances ─────────────────────────────────────────────────
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->year('year');
            $table->unsignedInteger('total_days');
            $table->decimal('used_days', 4, 1)->default(0);
            $table->timestamps();

            $table->unique(['employee_id', 'leave_type_id', 'year']);
        });

        // ── Leave requests ─────────────────────────────────────────────────
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('leave_type_id')->constrained('leave_types')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('days_count', 4, 1);            // excludes weekends
            $table->text('reason');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_note')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index(['employee_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
        });
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_balances');
        Schema::dropIfExists('leave_types');
        Schema::dropIfExists('employee_documents');
        Schema::table('departments', function (Blueprint $table) {
            $table->dropForeign(['head_employee_id']);
            $table->dropColumn('head_employee_id');
        });
        Schema::dropIfExists('employees');
        Schema::dropIfExists('departments');
    }
};
