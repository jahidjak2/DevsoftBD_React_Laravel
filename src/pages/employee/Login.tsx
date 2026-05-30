// src/pages/employee/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, Mail, UserCheck, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useEmployeeStore } from '@/store/employeeStore'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password required'),
})
type FormData = z.infer<typeof schema>

export default function EmployeeLogin() {
  const navigate = useNavigate()
  const setAuth  = useEmployeeStore((s: any) => s.setAuth)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    try {
      const res = await authApi.post('/employee/login', data)
      setAuth(res.data.token, res.data.user)
      toast.success(`Welcome, ${res.data.user.name}!`)
      navigate('/employee', { replace: true })
    } catch (err: any) {
      toast.error(
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        'Invalid credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-5 shadow-lg shadow-blue-500/30">
            <UserCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">Employee Portal</h1>
          <p className="text-slate-400 text-sm">DevSoft BD — Team Access</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@devsoftbd.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/8 transition-colors"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500 focus:bg-white/8 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-2">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                : 'Sign In to Portal'
              }
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Admin?{' '}
          <a href="/admin/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Admin Portal →
          </a>
        </p>
      </div>
    </div>
  )
}