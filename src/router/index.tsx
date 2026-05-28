// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import PageLoader from '@/components/shared/PageLoader'
 
// ── Public layout + pages (code-split) ─────────────────────
const PublicLayout  = lazy(() => import('@/components/layout/PublicLayout'))
const Index         = lazy(() => import('@/pages/public/Index'))
const Projects      = lazy(() => import('@/pages/public/Projects'))
const ProjectDetail = lazy(() => import('@/pages/public/ProjectDetail'))
const ServicesPage  = lazy(() => import('@/pages/public/ServicesPage'))
const ServiceDetail = lazy(() => import('@/pages/public/ServiceDetail'))
const About         = lazy(() => import('@/pages/public/About'))
const Team          = lazy(() => import('@/pages/public/Team'))
const Contact       = lazy(() => import('@/pages/public/Contact'))
const Blog          = lazy(() => import('@/pages/public/Blog'))
const BlogPost      = lazy(() => import('@/pages/public/BlogPost'))
const Events        = lazy(() => import('@/pages/public/Events'))
const NotFound      = lazy(() => import('@/pages/public/NotFound'))
 
// ── Admin pages ─────────────────────────────────────────────
const AdminLayout           = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminLogin            = lazy(() => import('@/pages/admin/Login'))
const AdminDashboard        = lazy(() => import('@/pages/admin/Dashboard'))
const AdminSiteSettings     = lazy(() => import('@/pages/admin/SiteSettings'))
const AdminHero             = lazy(() => import('@/pages/admin/HeroManager'))
const AdminProjects         = lazy(() => import('@/pages/admin/ProjectsManager'))
const AdminProjectForm      = lazy(() => import('@/pages/admin/ProjectForm'))
const AdminServices         = lazy(() => import('@/pages/admin/ServicesManager'))
const AdminTeam             = lazy(() => import('@/pages/admin/TeamManager'))
const AdminTestimonials     = lazy(() => import('@/pages/admin/TestimonialsManager'))
const AdminIndustries       = lazy(() => import('@/pages/admin/IndustriesManager'))
const AdminWhyChooseUs      = lazy(() => import('@/pages/admin/WhyChooseUsManager'))
const AdminBlog             = lazy(() => import('@/pages/admin/BlogManager'))
const AdminEvents           = lazy(() => import('@/pages/admin/EventsManager'))
const AdminInquiries        = lazy(() => import('@/pages/admin/InquiriesManager'))
const AdminMedia            = lazy(() => import('@/pages/admin/MediaLibrary'))
const AdminEmployees        = lazy(() => import('@/pages/admin/EmployeesManager'))
const AdminDepartments      = lazy(() => import('@/pages/admin/DepartmentsManager'))
const AdminInternalProjects = lazy(() => import('@/pages/admin/InternalProjectsManager'))
const AdminTaskBoard        = lazy(() => import('@/pages/admin/TaskBoard'))
const AdminLeaves           = lazy(() => import('@/pages/admin/LeaveApprovals'))
 
// ── Employee pages ──────────────────────────────────────────
const EmployeeLayout    = lazy(() => import('@/pages/employee/EmployeeLayout'))
const EmployeeLogin     = lazy(() => import('@/pages/employee/Login'))
const EmployeeDashboard = lazy(() => import('@/pages/employee/Dashboard'))
const EmployeeProfile   = lazy(() => import('@/pages/employee/Profile'))
const MyProjects        = lazy(() => import('@/pages/employee/MyProjects'))
const MyTasks           = lazy(() => import('@/pages/employee/MyTasks'))
const MyLeave           = lazy(() => import('@/pages/employee/LeaveRequests'))
 
// ── Route guards ─────────────────────────────────────────────
import AdminRoute    from './AdminRoute'
import EmployeeRoute from './EmployeeRoute'
 
const wrap = (el: JSX.Element) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
)
 
export const router = createBrowserRouter([
  // ── Public ────────────────────────────────────────────────
  {
    path: '/',
    element: wrap(<PublicLayout />),
    children: [
      { index: true,             element: wrap(<Index />) },
      { path: 'projects',        element: wrap(<Projects />) },
      { path: 'projects/:slug',  element: wrap(<ProjectDetail />) },
      { path: 'services',        element: wrap(<ServicesPage />) },
      { path: 'services/:slug',  element: wrap(<ServiceDetail />) },
      { path: 'about',           element: wrap(<About />) },
      { path: 'team',            element: wrap(<Team />) },
      { path: 'contact',         element: wrap(<Contact />) },
      { path: 'blog',            element: wrap(<Blog />) },
      { path: 'blog/:slug',      element: wrap(<BlogPost />) },
      { path: 'events',          element: wrap(<Events />) },
      { path: '*',               element: wrap(<NotFound />) },
    ],
  },
 
  // ── Admin login (no layout) ───────────────────────────────
  { path: '/admin/login', element: wrap(<AdminLogin />) },
 
  // ── Admin portal ─────────────────────────────────────────
  {
    path: '/admin',
    element: <AdminRoute>{wrap(<AdminLayout />)}</AdminRoute>,
    children: [
      { index: true,                    element: wrap(<AdminDashboard />) },
      { path: 'settings',               element: wrap(<AdminSiteSettings />) },
      { path: 'hero',                   element: wrap(<AdminHero />) },
      { path: 'projects',               element: wrap(<AdminProjects />) },
      { path: 'projects/new',           element: wrap(<AdminProjectForm />) },
      { path: 'projects/:id/edit',      element: wrap(<AdminProjectForm />) },
      { path: 'services',               element: wrap(<AdminServices />) },
      { path: 'team',                   element: wrap(<AdminTeam />) },
      { path: 'testimonials',           element: wrap(<AdminTestimonials />) },
      { path: 'industries',             element: wrap(<AdminIndustries />) },
      { path: 'why-choose-us',          element: wrap(<AdminWhyChooseUs />) },
      { path: 'blog',                   element: wrap(<AdminBlog />) },
      { path: 'events',                 element: wrap(<AdminEvents />) },
      { path: 'inquiries',              element: wrap(<AdminInquiries />) },
      { path: 'media',                  element: wrap(<AdminMedia />) },
      { path: 'employees',              element: wrap(<AdminEmployees />) },
      { path: 'departments',            element: wrap(<AdminDepartments />) },
      { path: 'internal-projects',      element: wrap(<AdminInternalProjects />) },
      { path: 'tasks',                  element: wrap(<AdminTaskBoard />) },
      { path: 'leaves',                 element: wrap(<AdminLeaves />) },
    ],
  },
 
  // ── Employee login (no layout) ────────────────────────────
  { path: '/employee/login', element: wrap(<EmployeeLogin />) },
 
  // ── Employee portal ───────────────────────────────────────
  {
    path: '/employee',
    element: <EmployeeRoute>{wrap(<EmployeeLayout />)}</EmployeeRoute>,
    children: [
      { index: true,        element: wrap(<EmployeeDashboard />) },
      { path: 'profile',    element: wrap(<EmployeeProfile />) },
      { path: 'projects',   element: wrap(<MyProjects />) },
      { path: 'tasks',      element: wrap(<MyTasks />) },
      { path: 'leave',      element: wrap(<MyLeave />) },
    ],
  },
])
 
export function AppRouter() {
  return <RouterProvider router={router} />
}