
// ─────────────────────────────────────────────────────────────
// src/pages/public/About.tsx
// ─────────────────────────────────────────────────────────────
export function About() {
  return (
    <>
      <Helmet><title>About Us — DevSoft BD</title></Helmet>
      <section className="bg-navy-800 py-20">
        <div className="container text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">Who We Are</p>
          <h1 className="section-headline text-white mb-4">Building the Future, One Line at a Time</h1>
        </div>
      </section>
      <section className="section">
        <div className="container max-w-4xl">
          <div className="prose-devsoft">
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              DevSoft BD is a professional software development company based in Gazipur, Dhaka, Bangladesh. Founded with a mission to deliver world-class digital solutions, we've grown to serve clients across 15+ countries.
            </p>
            <p>Our team of expert developers, designers, and strategists work together to transform your ideas into powerful digital products. From startups to enterprises, we tailor our approach to fit your unique needs and goals.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { value: '200+', label: 'Projects Delivered' },
              { value: '150+', label: 'Happy Clients' },
              { value: '15+',  label: 'Countries Served' },
              { value: '8+',   label: 'Years Experience' },
            ].map(stat => (
              <div key={stat.label} className="card p-6 text-center">
                <div className="font-display text-3xl font-800 text-brand-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
export default About
 