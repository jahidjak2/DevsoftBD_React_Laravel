
// ─────────────────────────────────────────────────────────────
// src/pages/public/Contact.tsx
// ─────────────────────────────────────────────────────────────
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
// Update the import path below to the correct location of useSubmitContact
import { useSubmitContact } from '@/hooks/useContact'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import type { ContactFormData } from '@/types'
import { Helmet } from 'react-helmet-async'
import { cn } from '@/lib/utils'
 
const schema = z.object({
  name:             z.string().min(2, 'Name must be at least 2 characters'),
  email:            z.string().email('Please enter a valid email'),
  phone:            z.string().optional(),
  company:          z.string().optional(),
  subject:          z.string().optional(),
  message:          z.string().min(10, 'Message must be at least 10 characters'),
  service_interest: z.string().optional(),
  budget_range:     z.string().optional(),
})
 
export function Contact() {
  const { mutate, isPending } = useSubmitContact()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
  })
 
  function onSubmit(data: ContactFormData) {
    mutate(data, {
      onSuccess: () => {
        toast.success('Message sent! We\'ll be in touch within 24 hours.')
        reset()
      },
      onError: () => toast.error('Failed to send. Please try again.'),
    })
  }
 
  return (
    <>
      <Helmet><title>Contact Us — DevSoft BD</title></Helmet>
 
      <section className="bg-navy-800 py-20">
        <div className="container text-center">
          <p className="text-brand-400 text-xs font-semibold uppercase tracking-widest mb-4">Get In Touch</p>
          <h1 className="section-headline text-white mb-4">Let's Build Something Great</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Have a project in mind? We'd love to hear about it. Send us a message and we'll respond within 24 hours.</p>
        </div>
      </section>
 
      <section className="section">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-14">
 
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input {...register('name')} placeholder="John Doe"
                      className={cn('w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-brand-400 transition-colors',
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50')} />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input {...register('email')} type="email" placeholder="john@company.com"
                      className={cn('w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-brand-400 transition-colors',
                        errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50')} />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input {...register('phone')} placeholder="+1 234 567 8900"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input {...register('company')} placeholder="Your Company Ltd"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Interest</label>
                    <select {...register('service_interest')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 transition-colors">
                      <option value="">Select a service</option>
                      {['Web Development','Mobile App','AI & ML','ERP System','Cloud Solutions','Cyber Security','Other'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <select {...register('budget_range')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 transition-colors">
                      <option value="">Select budget</option>
                      {['Under $1,000','$1,000–$5,000','$5,000–$15,000','$15,000–$50,000','$50,000+'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input {...register('subject')} placeholder="Project inquiry"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-brand-400 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea {...register('message')} rows={5} placeholder="Tell us about your project…"
                    className={cn('w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-brand-400 transition-colors resize-none',
                      errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50')} />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isPending}
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed">
                  {isPending ? 'Sending…' : <><Send className="h-4 w-4" /> Send Message</>}
                </button>
              </form>
            </div>
 
            {/* Info sidebar */}
            <aside className="space-y-6">
              {[
                { icon: Phone,   title: 'Phone',   lines: ['+8801571244650', '+8801616401375'] },
                { icon: Mail,    title: 'Email',   lines: ['info@devsoftbd.com'] },
                { icon: MapPin,  title: 'Address', lines: ['Gazipur, Dhaka, Bangladesh'] },
                { icon: Clock,   title: 'Working Hours', lines: ['Sun–Thu: 9:00 AM – 6:00 PM', 'Fri–Sat: Closed'] },
              ].map(({ icon: Icon, title, lines }) => (
                <div key={title} className="card p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h4>
                    {lines.map(l => <p key={l} className="text-sm text-gray-500">{l}</p>)}
                  </div>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
export default Contact