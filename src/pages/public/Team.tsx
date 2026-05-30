import { Helmet } from 'react-helmet-async'
// ─────────────────────────────────────────────────────────────
// src/pages/public/Team.tsx
// ─────────────────────────────────────────────────────────────
import { useTeam } from '@/hooks/useTeam'
import { Linkedin, Github, Twitter } from 'lucide-react'
import type { TeamMember } from '@/types'
 
export function Team() {
  const { data: members, isLoading } = useTeam()
 
  return (
    <>
      <Helmet><title>Our Team — DevSoft BD</title></Helmet>
      <section className="bg-navy-800 py-20">
        <div className="container text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">Our People</p>
          <h1 className="section-headline text-white mb-4">Meet the Team</h1>
          <p className="text-gray-400 max-w-xl mx-auto">The talented individuals behind every DevSoft BD project.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card p-6 text-center space-y-3">
                  <div className="skeleton w-24 h-24 rounded-full mx-auto" />
                  <div className="skeleton h-4 w-2/3 mx-auto rounded" />
                  <div className="skeleton h-3 w-1/2 mx-auto rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {(members as TeamMember[] || []).map(member => (
                <div key={member.id} className="card p-6 text-center group">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name}
                      className="w-24 h-24 rounded-full object-cover mx-auto mb-4 ring-4 ring-gray-100 group-hover:ring-brand-200 transition-all" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 text-brand-600 font-bold text-2xl">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-display font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-xs text-brand-600 font-medium mb-2">{member.designation}</p>
                  {member.department && <p className="text-xs text-gray-400 mb-3">{member.department}</p>}
                  {member.bio && <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4">{member.bio}</p>}
                  <div className="flex justify-center gap-3">
                    {member.linkedin_url && <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-600 transition-colors"><Linkedin className="h-4 w-4" /></a>}
                    {member.github_url   && <a href={member.github_url}   target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors"><Github className="h-4 w-4" /></a>}
                    {member.twitter_url  && <a href={member.twitter_url}  target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors"><Twitter className="h-4 w-4" /></a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
export default Team