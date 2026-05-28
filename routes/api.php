<?php

// routes/api.php
// ============================================================
// DevSoft BD — Complete API Routes
// All routes are prefixed with /api automatically by Laravel
// ============================================================

use App\Http\Controllers\Api\Admin\BlogCategoryController;
// Auth controllers
use App\Http\Controllers\Api\Admin\BlogController;
use App\Http\Controllers\Api\Admin\DashboardController;
// Public controllers
use App\Http\Controllers\Api\Admin\DepartmentController;
use App\Http\Controllers\Api\Admin\EmployeeController;
use App\Http\Controllers\Api\Admin\EventController;
// Admin controllers
use App\Http\Controllers\Api\Admin\HeroController;
use App\Http\Controllers\Api\Admin\IndustryController;
use App\Http\Controllers\Api\Admin\InquiryController;
use App\Http\Controllers\Api\Admin\InternalProjectController;
use App\Http\Controllers\Api\Admin\LeaveController;
use App\Http\Controllers\Api\Admin\LeaveTypeController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\ProjectController as AdminProjectController;
use App\Http\Controllers\Api\Admin\ServiceCategoryController;
use App\Http\Controllers\Api\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\Admin\SiteSettingController;
use App\Http\Controllers\Api\Admin\TagController;
use App\Http\Controllers\Api\Admin\TaskController;
use App\Http\Controllers\Api\Admin\TeamController;
use App\Http\Controllers\Api\Admin\TestimonialController;
use App\Http\Controllers\Api\Admin\TrustedCompanyController;
use App\Http\Controllers\Api\Admin\WhyChooseUsController;
use App\Http\Controllers\Api\Auth\AdminAuthController;
use App\Http\Controllers\Api\Auth\EmployeeAuthController;
use App\Http\Controllers\Api\Employee\EmployeeDashboardController;
use App\Http\Controllers\Api\Employee\LeaveRequestController;
use App\Http\Controllers\Api\Employee\MyProjectController;
// Employee controllers
use App\Http\Controllers\Api\Employee\MyTaskController;
use App\Http\Controllers\Api\Employee\ProfileController;
use App\Http\Controllers\Api\Public\ContactController;
use App\Http\Controllers\Api\Public\HomepageController;
use App\Http\Controllers\Api\Public\ProjectController as PublicProjectController;
use App\Http\Controllers\Api\Public\ServiceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // ══════════════════════════════════════════════════════════
    // PUBLIC ROUTES — No authentication required
    // ══════════════════════════════════════════════════════════
    Route::prefix('public')->group(function () {

        // Homepage — single call returns all sections
        Route::get('/homepage', [HomepageController::class, 'all']);
        Route::get('/settings', [HomepageController::class, 'settings']); // not needed if using /homepage

        // Projects
        Route::get('/projects', [PublicProjectController::class, 'index']);
        Route::get('/projects/featured', [PublicProjectController::class, 'featured']);
        Route::get('/projects/{slug}', [PublicProjectController::class, 'show']);
        Route::post('/projects/{slug}/view', [PublicProjectController::class, 'incrementView']);

        // Services
        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/{slug}', [ServiceController::class, 'show']);

        // Blog & Events
        Route::get('/blog', [App\Http\Controllers\Api\Public\BlogController::class, 'index']);
        Route::get('/blog/{slug}', [App\Http\Controllers\Api\Public\BlogController::class, 'show']);
        Route::get('/events', [App\Http\Controllers\Api\Public\EventController::class, 'index']);
        Route::get('/events/{slug}', [App\Http\Controllers\Api\Public\EventController::class, 'show']);

        // Team (public)
        Route::get('/team', [App\Http\Controllers\Api\Public\TeamController::class, 'index']);

        // Contact form
        Route::post('/contact', [ContactController::class, 'store']);
    });

    // ══════════════════════════════════════════════════════════
    // ADMIN AUTH — No middleware
    // ══════════════════════════════════════════════════════════
    Route::post('/admin/login', [AdminAuthController::class, 'login']);
    Route::post('/admin/logout', [AdminAuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/admin/me', [AdminAuthController::class, 'me'])->middleware('auth:sanctum');

    // ══════════════════════════════════════════════════════════
    // ADMIN PROTECTED ROUTES
    // ══════════════════════════════════════════════════════════
    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'admin'])
        ->group(function () {

            // Dashboard
            Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

            // ── Site Settings ──────────────────────────────────────
            Route::get('/settings', [SiteSettingController::class, 'index']);
            Route::post('/settings', [SiteSettingController::class, 'bulkUpdate']);
            Route::post('/settings/{key}/image', [SiteSettingController::class, 'uploadImage']);

            // ── Hero sections ──────────────────────────────────────
            Route::get('/hero', [HeroController::class, 'index']);
            Route::post('/hero', [HeroController::class, 'store']);
            Route::get('/hero/{id}', [HeroController::class, 'show']);
            Route::put('/hero/{id}', [HeroController::class, 'update']);
            Route::delete('/hero/{id}', [HeroController::class, 'destroy']);
            Route::post('/hero/{id}/activate', [HeroController::class, 'activate']);

            // ── Tags ───────────────────────────────────────────────
            Route::get('/tags', [TagController::class, 'index']);
            Route::post('/tags', [TagController::class, 'store']);
            Route::put('/tags/{id}', [TagController::class, 'update']);
            Route::delete('/tags/{id}', [TagController::class, 'destroy']);

            // ── Projects ───────────────────────────────────────────
            Route::get('/projects', [AdminProjectController::class, 'index']);
            Route::post('/projects', [AdminProjectController::class, 'store']);
            Route::get('/projects/{id}', [AdminProjectController::class, 'show']);
            Route::put('/projects/{id}', [AdminProjectController::class, 'update']);
            Route::delete('/projects/{id}', [AdminProjectController::class, 'destroy']);
            Route::post('/projects/reorder', [AdminProjectController::class, 'reorder']);
            Route::post('/projects/{id}/thumbnail', [AdminProjectController::class, 'uploadThumbnail']);
            Route::post('/projects/{id}/images', [AdminProjectController::class, 'uploadImages']);
            Route::delete('/projects/{id}/images/{imageId}', [AdminProjectController::class, 'removeImage']);
            Route::post('/projects/{id}/images/reorder', [AdminProjectController::class, 'reorderImages']);
            Route::patch('/projects/{id}/feature', [AdminProjectController::class, 'toggleFeature']);

            // ── Services ───────────────────────────────────────────
            Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
            Route::post('/service-categories', [ServiceCategoryController::class, 'store']);
            Route::get('/service-categories/{id}', [ServiceCategoryController::class, 'show']);
            Route::put('/service-categories/{id}', [ServiceCategoryController::class, 'update']);
            Route::delete('/service-categories/{id}', [ServiceCategoryController::class, 'destroy']);

            Route::get('/services', [AdminServiceController::class, 'index']);
            Route::post('/services', [AdminServiceController::class, 'store']);
            Route::get('/services/{id}', [AdminServiceController::class, 'show']);
            Route::put('/services/{id}', [AdminServiceController::class, 'update']);
            Route::delete('/services/{id}', [AdminServiceController::class, 'destroy']);
            Route::post('/services/{id}/thumbnail', [AdminServiceController::class, 'uploadThumbnail']);
            Route::post('/services/reorder', [AdminServiceController::class, 'reorder']);

            // ── Team ───────────────────────────────────────────────
            Route::get('/team', [TeamController::class, 'index']);
            Route::post('/team', [TeamController::class, 'store']);
            Route::get('/team/{id}', [TeamController::class, 'show']);
            Route::put('/team/{id}', [TeamController::class, 'update']);
            Route::delete('/team/{id}', [TeamController::class, 'destroy']);
            Route::post('/team/{id}/photo', [TeamController::class, 'uploadPhoto']);
            Route::post('/team/reorder', [TeamController::class, 'reorder']);

            // ── Testimonials ───────────────────────────────────────
            Route::get('/testimonials', [TestimonialController::class, 'index']);
            Route::post('/testimonials', [TestimonialController::class, 'store']);
            Route::get('/testimonials/{id}', [TestimonialController::class, 'show']);
            Route::put('/testimonials/{id}', [TestimonialController::class, 'update']);
            Route::delete('/testimonials/{id}', [TestimonialController::class, 'destroy']);
            Route::patch('/testimonials/{id}/approve', [TestimonialController::class, 'approve']);
            Route::post('/testimonials/{id}/avatar', [TestimonialController::class, 'uploadAvatar']);

            // ── Industries ─────────────────────────────────────────
            Route::get('/industries', [IndustryController::class, 'index']);
            Route::post('/industries', [IndustryController::class, 'store']);
            Route::get('/industries/{id}', [IndustryController::class, 'show']);
            Route::put('/industries/{id}', [IndustryController::class, 'update']);
            Route::delete('/industries/{id}', [IndustryController::class, 'destroy']);
            Route::post('/industries/{id}/icon', [IndustryController::class, 'uploadIcon']);
            Route::post('/industries/reorder', [IndustryController::class, 'reorder']);

            // ── Why Choose Us ──────────────────────────────────────
            Route::get('/why-choose-us', [WhyChooseUsController::class, 'index']);
            Route::post('/why-choose-us', [WhyChooseUsController::class, 'store']);
            Route::get('/why-choose-us/{id}', [WhyChooseUsController::class, 'show']);
            Route::put('/why-choose-us/{id}', [WhyChooseUsController::class, 'update']);
            Route::delete('/why-choose-us/{id}', [WhyChooseUsController::class, 'destroy']);
            Route::post('/why-choose-us/reorder', [WhyChooseUsController::class, 'reorder']);

            // ── Trusted Companies ──────────────────────────────────
            Route::get('/trusted-companies', [TrustedCompanyController::class, 'index']);
            Route::post('/trusted-companies', [TrustedCompanyController::class, 'store']);
            Route::get('/trusted-companies/{id}', [TrustedCompanyController::class, 'show']);
            Route::put('/trusted-companies/{id}', [TrustedCompanyController::class, 'update']);
            Route::delete('/trusted-companies/{id}', [TrustedCompanyController::class, 'destroy']);
            Route::post('/trusted-companies/{id}/logo', [TrustedCompanyController::class, 'uploadLogo']);
            Route::post('/trusted-companies/reorder', [TrustedCompanyController::class, 'reorder']);

            // ── Blog ───────────────────────────────────────────────
            Route::get('/blog', [BlogController::class, 'index']);
            Route::post('/blog', [BlogController::class, 'store']);
            Route::get('/blog/{id}', [BlogController::class, 'show']);
            Route::put('/blog/{id}', [BlogController::class, 'update']);
            Route::delete('/blog/{id}', [BlogController::class, 'destroy']);
            Route::post('/blog/{id}/restore', [BlogController::class, 'restore']);

            Route::get('/blog-categories', [BlogCategoryController::class, 'index']);
            Route::post('/blog-categories', [BlogCategoryController::class, 'store']);
            Route::put('/blog-categories/{id}', [BlogCategoryController::class, 'update']);
            Route::delete('/blog-categories/{id}', [BlogCategoryController::class, 'destroy']);

            // ── Events ─────────────────────────────────────────────
            Route::get('/events', [EventController::class, 'index']);
            Route::post('/events', [EventController::class, 'store']);
            Route::get('/events/{id}', [EventController::class, 'show']);
            Route::put('/events/{id}', [EventController::class, 'update']);
            Route::delete('/events/{id}', [EventController::class, 'destroy']);
            Route::post('/events/{id}/banner', [EventController::class, 'uploadBanner']);

            // ── Inquiries ──────────────────────────────────────────
            Route::get('/inquiries', [InquiryController::class, 'index']);
            Route::get('/inquiries/export', [InquiryController::class, 'export']);
            Route::get('/inquiries/{id}', [InquiryController::class, 'show']);
            Route::patch('/inquiries/{id}/status', [InquiryController::class, 'updateStatus']);
            Route::delete('/inquiries/{id}', [InquiryController::class, 'destroy']);

            // ── Media Library ──────────────────────────────────────
            Route::get('/media', [MediaController::class, 'index']);
            Route::post('/media', [MediaController::class, 'upload']);
            Route::get('/media/{id}', [MediaController::class, 'show']);
            Route::put('/media/{id}', [MediaController::class, 'update']);
            Route::delete('/media/{id}', [MediaController::class, 'destroy']);

            // ── HR: Departments ────────────────────────────────────
            Route::get('/departments', [DepartmentController::class, 'index']);
            Route::post('/departments', [DepartmentController::class, 'store']);
            Route::get('/departments/{id}', [DepartmentController::class, 'show']);
            Route::put('/departments/{id}', [DepartmentController::class, 'update']);
            Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

            // ── HR: Employees ──────────────────────────────────────
            Route::get('/employees', [EmployeeController::class, 'index']);
            Route::post('/employees', [EmployeeController::class, 'store']);
            Route::get('/employees/{id}', [EmployeeController::class, 'show']);
            Route::put('/employees/{id}', [EmployeeController::class, 'update']);
            Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
            Route::post('/employees/{id}/documents', [EmployeeController::class, 'uploadDocument']);

            // ── Internal Projects ──────────────────────────────────
            Route::get('/internal-projects', [InternalProjectController::class, 'index']);
            Route::post('/internal-projects', [InternalProjectController::class, 'store']);
            Route::get('/internal-projects/{id}', [InternalProjectController::class, 'show']);
            Route::put('/internal-projects/{id}', [InternalProjectController::class, 'update']);
            Route::delete('/internal-projects/{id}', [InternalProjectController::class, 'destroy']);
            Route::post('/internal-projects/{id}/members', [InternalProjectController::class, 'addMember']);
            Route::delete('/internal-projects/{id}/members/{empId}', [InternalProjectController::class, 'removeMember']);
            // Milestones nested under internal projects
            Route::post('/internal-projects/{id}/milestones', [InternalProjectController::class, 'storeMilestone']);
            Route::put('/internal-projects/{id}/milestones/{msId}', [InternalProjectController::class, 'updateMilestone']);
            Route::delete('/internal-projects/{id}/milestones/{msId}', [InternalProjectController::class, 'destroyMilestone']);

            // ── Tasks ──────────────────────────────────────────────
            Route::get('/tasks', [TaskController::class, 'index']);
            Route::post('/tasks', [TaskController::class, 'store']);
            Route::get('/tasks/{id}', [TaskController::class, 'show']);
            Route::put('/tasks/{id}', [TaskController::class, 'update']);
            Route::delete('/tasks/{id}', [TaskController::class, 'destroy']);
            Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
            Route::post('/tasks/reorder', [TaskController::class, 'reorder']);
            Route::post('/tasks/{id}/comments', [TaskController::class, 'addComment']);
            Route::post('/tasks/{id}/time-logs', [TaskController::class, 'logTime']);

            // ── Leave Management ───────────────────────────────────
            Route::get('/leaves', [LeaveController::class, 'index']);
            Route::get('/leaves/calendar', [LeaveController::class, 'calendar']);
            Route::patch('/leaves/{id}/approve', [LeaveController::class, 'approve']);
            Route::patch('/leaves/{id}/reject', [LeaveController::class, 'reject']);

            Route::get('/leave-types', [LeaveTypeController::class, 'index']);
            Route::post('/leave-types', [LeaveTypeController::class, 'store']);
            Route::put('/leave-types/{id}', [LeaveTypeController::class, 'update']);
            Route::delete('/leave-types/{id}', [LeaveTypeController::class, 'destroy']);
        });

    // ══════════════════════════════════════════════════════════
    // EMPLOYEE AUTH
    // ══════════════════════════════════════════════════════════
    Route::post('/employee/login', [EmployeeAuthController::class, 'login']);
    Route::post('/employee/logout', [EmployeeAuthController::class, 'logout'])->middleware('auth:sanctum');

    // ══════════════════════════════════════════════════════════
    // EMPLOYEE PROTECTED ROUTES
    // ══════════════════════════════════════════════════════════
    Route::prefix('employee')
        ->middleware(['auth:sanctum', 'employee'])
        ->group(function () {

            // Dashboard
            Route::get('/dashboard', [EmployeeDashboardController::class, 'index']);

            // Profile
            Route::get('/profile', [ProfileController::class, 'show']);
            Route::put('/profile', [ProfileController::class, 'update']);
            Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
            Route::put('/profile/password', [ProfileController::class, 'changePassword']);

            // My projects
            Route::get('/projects', [MyProjectController::class, 'index']);
            Route::get('/projects/{id}', [MyProjectController::class, 'show']);

            // My tasks
            Route::get('/tasks', [MyTaskController::class, 'index']);
            Route::get('/tasks/{id}', [MyTaskController::class, 'show']);
            Route::patch('/tasks/{id}/status', [MyTaskController::class, 'updateStatus']);
            Route::post('/tasks/{id}/comments', [MyTaskController::class, 'addComment']);
            Route::post('/tasks/{id}/time-logs', [MyTaskController::class, 'logTime']);

            // Leave
            Route::get('/leaves', [LeaveRequestController::class, 'index']);
            Route::post('/leaves', [LeaveRequestController::class, 'store']);
            Route::get('/leaves/balance', [LeaveRequestController::class, 'balance']);
            Route::delete('/leaves/{id}', [LeaveRequestController::class, 'cancel']);
        });
});
