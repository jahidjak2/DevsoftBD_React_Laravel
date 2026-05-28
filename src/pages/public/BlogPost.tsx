
// ─────────────────────────────────────────────────────────────
// src/pages/public/BlogPost.tsx
// ─────────────────────────────────────────────────────────────
import { useBlogPost } from '@/hooks/all_hooks'
 
export function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading } = useBlogPost(slug!)
 
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!post) return <div className="container py-20 text-center"><h2 className="text-xl font-bold">Post not found</h2><Link to="/blog" className="btn-primary mt-4">Back to Blog</Link></div>
 
  return (
    <>
      <Helmet>
        <title>{post.meta_title || `${post.title} | DevSoft BD`}</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
      </Helmet>
      <div className="container max-w-3xl py-16">
        <Link to="/blog" className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        {post.category && <span className="text-xs text-brand-600 font-semibold uppercase tracking-widest">{post.category}</span>}
        <h1 className="font-display text-4xl font-bold text-gray-900 mt-3 mb-5 leading-tight">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
          <span>By {post.author}</span>
          <span>·</span>
          <span>{post.published_at}</span>
          <span>·</span>
          <span>{post.read_time} min read</span>
        </div>
        {post.featured_image_url && (
          <img src={post.featured_image_url} alt={post.title} className="w-full rounded-2xl mb-10 aspect-video object-cover" />
        )}
        <div className="prose-devsoft" dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </>
  )
}
export default BlogPost
 