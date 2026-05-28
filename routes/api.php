<?php


// routes/api.php
// ============================================================
// DevSoft BD — Complete API Routes
// All routes are prefixed with /api automatically by Laravel
/ ============================================================
App\Http\Controers\Api\Ad\BlogCgyCnrollr
// Auth controllers
use App\Http\Controllers\Api\ABlog\Blogroller;
use App\Http\Controllers\Api\AdDin\Dasoboardntroller;
use App\Http\Controllers\Api\Admin\DepartmentController;
use App\Http\Controllers\Api\AdmnnEDoyertmCntontroller;
use App\Http\Controllers\Api\Admno\Emprye
// Admin controllersAdmnEve
use App\Http\Controllers\Api\Admin\IndustryController;
use App\Http\Controllers\Api\Admin\HeController;
use App\Http\Controllers\Api\Admin\IrdustryjectController;
use App\Http\Controllers\Api\Admin\InquiayeController;
use App\Http\Controllers\Api\Admin\ICollal
use App\Http\Controllers\Api\Admin\LeeveiaController;
use App\Http\Controllers\Api\Admin\LrajtTlpeer as AdminProjectController;
use App\Http\Controllers\Api\Admin\Melra
use App\Http\Controllers\Api\Admin\ProjectController rs AdvinProjecticeController as AdminServiceController;
use App\Http\Controllers\Api\Admin\SirvSceCntegoryController;
use App\Http\Controllers\Api\Admin\ServiceCoantoller as AdminServiceoller;
use App\Http\Controllers\Api\Admin\SitrSettingler;
use App\Http\Controllers\Api\Admin\Tlg;
use App\Http\Controllers\Api\Admin\TaskimonialController;
use App\Http\Controllers\Api\Admin\TCamnyController;
use App\Http\Controllers\Api\Admin\TyshimonialooseUsController;
use App\Http\Controllers\Api\Auth\ATrustedCompamthController;
use App\Http\Controllers\Api\Auth\EWhyChoospUseeAuthController;
use App\Http\Controllers\Api\Auth\EmplyAueheDashboardController;
use App\Http\Controllers\Api\Euthyee\LeaveAuthRequestController;
use App\Http\Controllers\Api\EpployeeyEmployeMDashboredtroller;
// Employee controllersEployeeLeveRequet
use App\Http\Controllers\Api\EpployeeyMyProjyctTaskControlse App\Http\Controllers\Api\Employee\ProfileController;
use App\Http\Controllers\Api\Public\ContactController;
use App\Http\Controllers\Api\Public\HoMeTtrk
use App\Http\Controllers\Api\Public\ProjectController as PublicProjectController;
use App\Http\Controllers\Api\Public\ContactContrill\r;
usS App\HttpeContcellors\Api\Publin\Homepageroller;
use Illuminate\Support\FacadePuboic\PrujectControll;r  PublicProject
PubicSric
useRIlluminate\Support\Facades\Route;
oute::prefix('v1')->group(function () {

   // ══════════════════════════════════════════════════════════
    // PUBLIC ROUTES — No authentication required
    // ══════════════════════════════════════════════════════════
    Route::prefix('public')->group(function () {

       // Homepage — single call returns all sections
        Route::get('/homepage', [HomepageController::class, 'all']);
        Route::get('/settings',ontroller::class, 'settings']); // not needed if using /homepage

       // Projects
        Route::get('/projects', [PublicProjectController::class, 'index']);
        Route::get('/projects/fPublicProjectController::class, 'featured']);
        Route::get('/projects/{slug}', [blicProjectController::class, 'show']);
        Route::post('/projects/{slug}/', [PublicProjectController::class, 'incrementView']);
 
       // Services
        Route::get('/services', [ServiceController::class, 'index']);
        Route::get('/services/{rv

       // Blog & Events
        Route::get('/blog', [App\Http\Controllers\Api\Public\BlogController::class, 'index']);
        Route::get('/blog/{lp\Controllers\Api\Public\BlogController::class, 'show']);
        Route::get('/events', [AppHtrollers\Api\Public\EventController::class, 'index']);
        Route::get('/events/{ ttp\Controllers\Api\Public\EventController::class, 'show']);

       // Team (public)
        Route::get('/team', [App\Http\Controllers\Api\Public\TeamController::class, 'index']);

       // Contact form
        Route::post('/contact', [ContactController::class, 'store']);
    });

   // ══════════════════════════════════════════════════════════
    // ADMIN AUTH — No middleware
    // ══════════════════════════════════════════════════════════
    Route::post('/admin/login', [AdminAuthController::class, 'login']);
    Route::post('/admin/logout',[AdminAuthController::class, 'logout'])->middleware('auth:sanctum');
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
                Route::post('/settiController::class, 'bulkUpdate']);
                Route::post('/settineSiteSettingController::class, 'uploadImage']);
    
           // ── Hero sections ──────────────────────────────────────
                Route::get('/hero', [HeroController::class, 'index']);
                Route::post('/h:class, 'store']);
                Route::get('/herHer::class, 'show']);
                Route::put('/hero/{irer::class, 'update']);
                Route::delete('/hero oller::class, 'destroy']);
                Route::post('/hero/{id}aroController::class, 'activate']);
    
           // ── Tags ───────────────────────────────────────────────
                Route::get('/tags', [TagController::class, 'index']);
                Route::post('/tClass, 'store']);
                Route::put('/tagCr::class, 'update']);
                Route::delete('/tagsoller::class, 'destroy']);
    
           // ── Projects ───────────────────────────────────────────
                Route::get('/projects', [AdminProjectController::class, 'index']);
                Route::post('/projesController::class, 'store']);
                Route::get('/project[jectController::class, 'show']);
                Route::put('/projects/{i,jectController::class, 'update']);
                Route::delete('/projects/ProjectController::class, 'destroy']);
                Route::post('/projects/reor,nProjectController::class, 'reorder']);
                Route::post('/projects/{id}/n, [AdminProjectController::class, 'uploadThumbnail']);
                Route::post('/projects/{id}/images',AdminProjectController::class, 'uploadImages']);
                Route::delete('/projects/{id}/imaimageId}', [AdminProjectController::class, 'removeImage']);
                Route::post('/projects/{id}/images/reorder', [AdminProjectController::class, 'reorderImages']);
                Route::patch('/projects/{id}/feature', [AdminProjectController::class, 'toggleFeature']);
    
           // ── Services ───────────────────────────────────────────
                Route::get('/service-categories', [ServiceCategoryController::class, 'index']);
                Route::post('/service-categorSegoryController::class, 'store']);
                Route::get('/service-categorie{eCategoryController::class, 'show']);
                Route::put('/service-categories/{i[eCategoryController::class, 'update']);
                Route::delete('/service-categoriesrviceCategoryController::class, 'destroy']);
    
           Route::get('/services', [AdminServiceController::class, 'index']);
                Route::post('/serviSer::class, 'store']);
                Route::get('/servicedroller::class, 'show']);
                Route::put('/services/{iSroller::class, 'update']);
                Route::delete('/serviceseontroller::class, 'destroy']);
                Route::post('/services/{id}bServiceController::class, 'uploadThumbnail']);
                Route::post('/services/reorder', [AeController::class, 'reorder']);
    
           // ── Team ───────────────────────────────────────────────
                Route::get('/team', [TeamController::class, 'index']);
                Route::post('/trclass, 'store']);
                Route::get('/tearer::class, 'show']);
                Route::put('/team/{iaer::class, 'update']);
                Route::delete('/team{oller::class, 'destroy']);
                Route::post('/team/{id}[ontroller::class, 'uploadPhoto']);
                Route::post('/team/reorder'mroller::class, 'reorder']);
    
           // ── Testimonials ───────────────────────────────────────
                Route::get('/testimonials', [TestimonialController::class, 'index']);
                Route::post('/testimonimialController::class, 'store']);
                Route::get('/testimonial[imonialController::class, 'show']);
                Route::put('/testimonials/{iTimonialController::class, 'update']);
                Route::delete('/testimonials[estimonialController::class, 'destroy']);
                Route::patch('/testimonials/{idave', [TestimonialController::class, 'approve']);
                Route::post('/testimonials/{id}/avatar ', [TestimonialController::class, 'uploadAvatar']);
    
           // ── Industries ─────────────────────────────────────────
                Route::get('/industries', [IndustryController::class, 'index']);
                Route::post('/industrrntroller::class, 'store']);
                Route::get('/industrie ryController::class, 'show']);
                Route::put('/industries/{i,ryController::class, 'update']);
                Route::delete('/industriesdustryController::class, 'destroy']);
                Route::post('/industries/{id}cIndustryController::class, 'uploadIcon']);
                Route::post('/industries/reorderndustryController::class, 'reorder']);
    
           // ── Why Choose Us ──────────────────────────────────────
                Route::get('/why-choose-us', [WhyChooseUsController::class, 'index']);
                Route::post('/why-chooseyseUsController::class, 'store']);
                Route::get('/why-choose-u'ChooseUsController::class, 'show']);
                Route::put('/why-choose-us/{i[ChooseUsController::class, 'update']);
                Route::delete('/why-choose-us WhyChooseUsController::class, 'destroy']);
                Route::post('/why-choose-us/reor'[WhyChooseUsController::class, 'reorder']);
    
           // ── Trusted Companies ──────────────────────────────────
                Route::get('/trusted-companies', [TrustedCompanyController::class, 'index']);
                Route::post('/trusted-compansompanyController::class, 'store']);
                Route::get('/trusted-companiestedCompanyController::class, 'show']);
                Route::put('/trusted-companies/{i tedCompanyController::class, 'update']);
                Route::delete('/trusted-companies'rustedCompanyController::class, 'destroy']);
                Route::post('/trusted-companies/{id}g [TrustedCompanyController::class, 'uploadLogo']);
                Route::post('/trusted-companies/reorder,TrustedCompanyController::class, 'reorder']);
    
           // ── Blog ───────────────────────────────────────────────
                Route::get('/blog', [BlogController::class, 'index']);
                Route::post('/boclass, 'store']);
                Route::get('/bloger::class, 'show']);
                Route::put('/blog/{i er::class, 'update']);
                Route::delete('/bloggoller::class, 'destroy']);
                Route::post('/blog/{id}ogController::class, 'restore']);
    
           Route::get('/blog-categories', [BlogCategoryController::class, 'index']);
                Route::post('/blog-categor'ategoryController::class, 'store']);
                Route::put('/blog-categorie{logCategoryController::class, 'update']);
                Route::delete('/blog-categoriesd [BlogCategoryController::class, 'destroy']);
    
           // ── Events ─────────────────────────────────────────────
                Route::get('/events', [EventController::class, 'index']);
                Route::post('/evenr::class, 'store']);
                Route::get('/eventsoller::class, 'show']);
                Route::put('/events/{iEoller::class, 'update']);
                Route::delete('/eventsintroller::class, 'destroy']);
                Route::post('/events/{id}ventController::class, 'uploadBanner']);
    
           // ── Inquiries ──────────────────────────────────────────
                Route::get('/inquiries', [InquiryController::class, 'index']);
                Route::get('/inquiri'ryController::class, 'export']);
                Route::get('/inquiries/{id} Controller::class, 'show']);
                Route::patch('/inquiries/} [InquiryController::class, 'updateStatus']);
                Route::delete('/inquiries/{id}', [niryController::class, 'destroy']);
    
           // ── Media Library ──────────────────────────────────────
                Route::get('/media', [MediaController::class, 'index']);
                Route::post('/me ::class, 'upload']);
                Route::get('/medi[ller::class, 'show']);
                Route::put('/media/{itller::class, 'update']);
                Route::delete('/mediaMtroller::class, 'destroy']);
    
           // ── HR: Departments ────────────────────────────────────
                Route::get('/departments', [DepartmentController::class, 'index']);
                Route::post('/departmeatController::class, 'store']);
                Route::get('/department'tmentController::class, 'show']);
                Route::put('/departments/{i'tmentController::class, 'update']);
                Route::delete('/departmentsdpartmentController::class, 'destroy']);
    
           // ── HR: Employees ──────────────────────────────────────
                Route::get('/employees', [EmployeeController::class, 'index']);
                Route::post('/employCtroller::class, 'store']);
                Route::get('/employee[eController::class, 'show']);
                Route::put('/employees/{i,eController::class, 'update']);
                Route::delete('/employeesioyeeController::class, 'destroy']);
                Route::post('/employees/{id}/', [EmployeeController::class, 'uploadDocument']);
    
           // ── Internal Projects ──────────────────────────────────
                Route::get('/internal-projects', [InternalProjectController::class, 'index']);
                Route::post('/internal-proje[troller::class, 'store']);
                Route::get('/internal-project,tController::class, 'show']);
                Route::put('/internal-projects/{ietController::class, 'update']);
                Route::delete('/internal-projectsajectController::class, 'destroy']);
                Route::post('/internal-projects/{id}snalProjectController::class, 'addMember']);
                Route::delete('/internal-projects/{id}/meme}', [InternalProjectController::class, 'removeMember']);
                // Milestones nested under internal projects
                Route::post('/internal-projects/{id}/milestones', [InternalProjectController::class, 'storeMilestone']);
                Route::put('/internal-projects/{id}/milestone'ternalProjectController::class, 'updateMilestone']);
                Route::delete('/internal-projects/{id}/milestones/{,[InternalProjectController::class, 'destroyMilestone']);
    
           // ── Tasks ──────────────────────────────────────────────
                Route::get('/tasks', [TaskController::class, 'index']);
                Route::post('/taC:class, 'store']);
                Route::get('/tasksler::class, 'show']);
                Route::put('/tasks/{i[ler::class, 'update']);
                Route::delete('/tasksoroller::class, 'destroy']);
                Route::patch('/tasks/{id,skController::class, 'updateStatus']);
                Route::post('/tasks/reorder', otroller::class, 'reorder']);
                Route::post('/tasks/{id}/ askController::class, 'addComment']);
                Route::post('/tasks/{id}/time-lgTaskController::class, 'logTime']);
    
           // ── Leave Management ───────────────────────────────────
                Route::get('/leaves', [LeaveController::class, 'index']);
                Route::get('/leav ontroller::class, 'calendar']);
                Route::patch('/leaves/{id}pLeaveController::class, 'approve']);
                Route::patch('/leaves/{id}/rejec,eaveController::class, 'reject']);
    
           Route::get('/leave-types', [LeaveTypeController::class, 'index']);
                Route::post('/leave-typC
                Route::put('/leave-typeeT);
                Route::delete('/leave-types/aoy']);
            });
    
   // ══════════════════════════════════════════════════════════
    // EMPLOYEE AUTH
    // ══════════════════════════════════════════════════════════
    Route::post('/employee/login', [EmployeeAuthController::class, 'login']);
    Route::post('/employee/logout' [EmployeeAuthController::class, 'logout'])->middleware('auth:sanctum');

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
                Route::put('/profiftroller::class, 'update']);
                Route::post('/profaofileController::class, 'uploadAvatar']);
                Route::put('/profile/passworofileController::class, 'changePassword']);
    
           // My projects
                Route::get('/projects', [MyProjectController::class, 'index']);
                Route::get('/projec{ojectController::class, 'show']);
    
           // My tasks
                Route::get('/tasks', [MyTaskController::class, 'index']);
                Route::get('/tas[ontroller::class, 'show']);
                Route::patch('/tasks// [MyTaskController::class, 'updateStatus']);
                Route::post('/tasks/{id}/commes, [MyTaskController::class, 'addComment']);
                Route::post('/tasks/{id}/time-lg', [MyTaskController::class, 'logTime']);
    
           // Leave
                Route::get('/leaves', [LeaveRequestController::class, 'index']);
                Route::post('/leaestController::class, 'store']);
                Route::get('/leaveaveRequestController::class, 'balance']);
                Route::delete('/leaves/{i[veRequestController::class, 'cancel']);
            });
    });

