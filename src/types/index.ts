// src/types/index.ts
// ============================================================
// Complete TypeScript interfaces for DevSoft BD frontend
// ============================================================

// ── Site Settings ────────────────────────────────────────────
export interface SiteSettings {
  site_name: string
  site_tagline: string
  logo_light: string | null
  logo_dark: string | null
  favicon: string | null
  primary_color: string
  phone_primary: string
  phone_secondary: string
  email_primary: string
  address: string
  working_hours: string
  google_maps_embed: string
  facebook_url: string
  twitter_url: string
  linkedin_url: string
  github_url: string
  instagram_url: string
  youtube_url: string
  footer_copyright: string
  footer_about_text: string
  meta_description: string
  og_image: string | null
  google_analytics: string
}

// ── Hero ─────────────────────────────────────────────────────
export interface HeroStat {
  label: string
  value: string
}

export interface Hero {
  headline: string
  subheadline: string
  cta_primary_text: string
  cta_primary_link: string
  cta_secondary_text: string | null
  cta_secondary_link: string | null
  background_type: 'image' | 'video' | 'gradient'
  background_image_url: string | null
  background_video_url: string | null
  overlay_opacity: number
  badge_text: string | null
  stats: HeroStat[]
}

// ── Tags ─────────────────────────────────────────────────────
export interface Tag {
  id: number
  name: string
  slug: string
  type: 'tech' | 'category' | 'industry'
  color: string
}

// ── Projects ─────────────────────────────────────────────────
export interface Project {
  id: number
  title: string
  slug: string
  short_description: string
  thumbnail_url: string | null
  thumb_url: string | null
  live_url: string | null
  is_featured: boolean
  completion_date: string | null
  category_tags: Tag[]
  tech_tags: Tag[]
}


export interface ProjectImage {
  id: number
  image_url: string
  thumb_url: string | null
  caption: string | null
}

export interface ProjectMember {
  id: number
  name: string
  avatar_url: string | null
  role_on_project: string | null
}

export interface ProjectDetail extends Project {
  description: string | null
  challenge: string | null
  solution: string | null
  outcome: string | null
  client_name: string | null
  client_country: string | null
  client_logo_url: string | null
  images: ProjectImage[]
  github_url: string | null
  case_study_url: string | null
  duration: string | null
  team_size: number | null
  views_count: number
  all_tags: Tag[]
  industry_tags: Tag[]
  team_members: ProjectMember[]
  related_projects: Project[]
  meta_title: string | null
  meta_description: string | null
}

export interface ProjectFilters {
  category?: string
  tech?: string
  industry?: string
  search?: string
  page?: number
}

export interface PaginatedProjects {
  data: Project[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}

// ── Services ─────────────────────────────────────────────────
export interface ServiceItem {
  id: number
  title: string
  slug: string
  icon: string | null
  short_description: string | null
  thumbnail_url: string | null
  is_featured: boolean
}

export interface ServiceCategory {
  id: number
  name: string
  icon: string | null
  services: ServiceItem[]
}

export interface ServiceDetail {
  id: number
  title: string
  slug: string
  icon: string | null
  category: string | null
  short_description: string | null
  description: string | null
  features: string[]
  technologies: string[]
  process_steps: { step: number; title: string; desc: string }[]
  faq: { q: string; a: string }[]
  thumbnail_url: string | null
  cta_text: string | null
  cta_link: string | null
  meta_title: string | null
  meta_description: string | null
}

// ── Team ─────────────────────────────────────────────────────
export interface TeamMember {
  id: number
  name: string
  designation: string
  department: string | null
  bio: string | null
  photo_url: string | null
  skills: string[]
  linkedin_url: string | null
  github_url: string | null
  twitter_url: string | null
}

// ── Testimonials ─────────────────────────────────────────────
export interface Testimonial {
  id: number
  client_name: string
  client_designation: string | null
  client_company: string | null
  client_avatar_url: string | null
  rating: number
  review_text: string
  source: string
  source_url: string | null
  project_title: string | null
  project_slug: string | null
}

// ── Industries ───────────────────────────────────────────────
export interface Industry {
  id: number
  name: string
  slug: string
  icon_url: string | null
  short_description: string | null
  color: string
}

// ── Why Choose Us ─────────────────────────────────────────────
export interface WhyReason {
  id: number
  icon: string | null
  icon_color: string
  title: string
  description: string
  stat_value: string | null
  stat_label: string | null
}

// ── Trusted Companies ────────────────────────────────────────
export interface TrustedCompany {
  id: number
  name: string
  logo_url: string | null
  website_url: string | null
}

// ── Blog ─────────────────────────────────────────────────────
export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  thumb_url: string | null
  category: string | null
  author: string | null
  read_time: number
  published_at: string | null
  tags: string[]
}

export interface BlogPostDetail extends BlogPost {
  content: string
  views_count: number
  meta_title: string | null
  meta_description: string | null
}

// ── Events ───────────────────────────────────────────────────
export interface EventItem {
  id: number
  title: string
  slug: string
  event_type: string
  banner_url: string | null
  starts_at: string | null
  starts_at_time: string | null
  ends_at: string | null
  timezone: string
  location: string | null
  is_online: boolean
  registration_url: string | null
  status: string
  is_featured: boolean
}

// ── Inquiry / Contact ─────────────────────────────────────────
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  subject?: string
  message: string
  service_interest?: string
  budget_range?: string
}

// ── Homepage data (all-in-one) ────────────────────────────────
export interface HomepageData {
  settings: SiteSettings
  hero: Hero | null
  services: ServiceItem[]
  featured_projects: Project[]
  trusted_companies: TrustedCompany[]
  testimonials: Testimonial[]
  industries: Industry[]
  why_choose_us: WhyReason[]
}

// ── Auth ──────────────────────────────────────────────────────
export interface AdminUser {
  id: number
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'manager'
  avatar: string | null
}

export interface EmployeeUser {
  id: number
  name: string
  email: string
  role: 'employee' | 'intern'
  avatar: string | null
  employee_id: number | null
  employee_code: string | null
  designation: string | null
  department: string | null
}

// ── Employee portal ───────────────────────────────────────────
export interface MyTask {
  id: number
  title: string
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  due_date: string | null
  is_overdue: boolean
  estimated_hours: number | null
  logged_hours: number
  project_name: string | null
  project_code: string | null
  milestone: string | null
  comment_count: number
  tags: string[]
}

export interface LeaveBalance {
  leave_type: string
  color: string
  is_paid: boolean
  total_days: number
  used_days: number
  remaining_days: number
  year: number
}

export interface LeaveRequest {
  id: number
  leave_type_id: number
  start_date: string
  end_date: string
  days_count: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  admin_note: string | null
  responded_at: string | null
  created_at: string
}

// ── API Response wrappers ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    per_page: number
    current_page: number
    last_page: number
  }
}