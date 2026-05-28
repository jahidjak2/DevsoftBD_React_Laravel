
// ─────────────────────────────────────────────────────────────
// src/pages/public/Blog.tsx
// ─────────────────────────────────────────────────────────────
import { useBlogPosts } from '@/hooks/all_hooks'
import type { BlogPost } from '@/types'
 
export function Blog() {
  const { data, isLoading } = useBlogPosts()
  const posts: BlogPost[] = data?.data || []
 
  return (
    <>
      <Helmet><title>Blog — DevSoft BD</title></Helmet>
      <section className="bg-navy-800 py-20">
        <div className="container text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">Insights</p>
          <h1 className="section-headline text-white mb-4">From Our Blog</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Tech insights, project stories, and development tips from our team.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <Link key={post.id} to={`/blog/${post.slug}`} className="card group overflow-hidden">
                  {post.featured_image_url && (
                    <div className="aspect-project overflow-hidden">
                      <img src={post.featured_image_url} alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && <span className="text-xs text-brand-600 font-semibold uppercase tracking-widest">{post.category}</span>}
                    <h3 className="font-display font-semibold text-gray-900 mt-2 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">{post.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{post.published_at}</span>
                      <span>{post.read_time} min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
export default Blog
 