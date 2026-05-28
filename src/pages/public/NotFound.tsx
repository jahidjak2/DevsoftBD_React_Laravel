
// ─────────────────────────────────────────────────────────────
// src/pages/public/NotFound.tsx
// ─────────────────────────────────────────────────────────────
export function NotFound() {
  return (
    <>
      <Helmet><title>404 Not Found — DevSoft BD</title></Helmet>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="font-display text-9xl font-900 text-gray-100 mb-4 leading-none">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
          <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/contact" className="btn-secondary">Contact Us</Link>
          </div>
        </div>
      </div>
    </>
  )
}
export default NotFound
 