<?php

// database/migrations/2024_01_01_000008_create_project_management_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Internal projects ──────────────────────────────────────────────
        Schema::create('internal_projects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 500);
            $table->string('code', 50)->unique();               // PROJ-023
            $table->text('description')->nullable();
            $table->string('client_name', 255)->nullable();
            $table->string('client_contact', 255)->nullable();
            $table->foreignId('manager_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->date('start_date');
            $table->date('deadline')->nullable();
            $table->date('completed_at')->nullable();
            $table->enum('status', ['planning', 'active', 'on_hold', 'completed', 'cancelled'])
                ->default('planning');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->decimal('budget', 15, 2)->nullable();
            $table->string('currency', 10)->default('BDT');
            $table->json('technologies')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_billable')->default(true);
            // Link to public portfolio project (optional)
            $table->foreignId('portfolio_project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('code');
        });

        // ── Internal project members ───────────────────────────────────────
        Schema::create('internal_project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internal_project_id')->constrained('internal_projects')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('role', 100)->nullable();            // "Lead Dev", "QA"
            $table->date('joined_at')->nullable();
            $table->date('left_at')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->timestamps();

            $table->unique(['internal_project_id', 'employee_id']);
        });

        // ── Project milestones ─────────────────────────────────────────────
        Schema::create('milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internal_project_id')->constrained('internal_projects')->cascadeOnDelete();
            $table->string('title', 300);
            $table->text('description')->nullable();
            $table->date('due_date');
            $table->date('completed_at')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // ── Project ↔ Employee pivot (for public portfolio project team display)
        Schema::create('project_team_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('role_on_project', 100)->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'employee_id']);
        });

        // ── Tasks ──────────────────────────────────────────────────────────
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internal_project_id')->constrained('internal_projects')->cascadeOnDelete();
            $table->foreignId('milestone_id')->nullable()->constrained('milestones')->nullOnDelete();
            $table->string('title', 500);
            $table->text('description')->nullable();
            $table->foreignId('assigned_to')->nullable()->constrained('employees')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['todo', 'in_progress', 'in_review', 'done', 'cancelled'])
                ->default('todo');
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->date('due_date')->nullable();
            $table->decimal('estimated_hours', 5, 2)->nullable();
            $table->unsignedInteger('sort_order')->default(0); // Kanban position within column
            $table->json('tags')->nullable();                  // ["frontend","bug","feature"]
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('assigned_to');
            $table->index(['internal_project_id', 'status']);
        });

        // ── Task comments ──────────────────────────────────────────────────
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('comment');
            $table->json('attachments')->nullable();            // [media_id, ...]
            $table->timestamps();

            $table->index('task_id');
        });

        // ── Task time logs ─────────────────────────────────────────────────
        Schema::create('task_time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->decimal('hours', 5, 2);
            $table->date('date');
            $table->string('note', 500)->nullable();
            $table->timestamps();

            $table->index(['task_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_time_logs');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('project_team_members');
        Schema::dropIfExists('milestones');
        Schema::dropIfExists('internal_project_members');
        Schema::dropIfExists('internal_projects');
    }
};
