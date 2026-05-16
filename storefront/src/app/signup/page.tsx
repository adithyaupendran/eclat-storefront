'use client'

import { useActionState } from 'react'
import { signup } from '@/actions/auth'
import Link from 'next/link'
import { EclatNav } from '@/components/eclat/EclatNav'

export default function SignupPage() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await signup(formData)
    if (result.success) {
      alert('Account created! Please check your email to verify or simply sign in.')
      window.location.href = '/login'
    }
    return result
  }, null)

  return (
    <>
      <EclatNav />
      <main className="pt-24 min-h-screen flex items-center justify-center eclat-surface">
        <div className="w-full max-w-md p-8 bg-white/50 backdrop-blur-md border border-[rgba(0,0,0,0.06)]">
          <h1 className="text-3xl mb-8 text-center" style={{ fontFamily: "var(--font-noto-serif)" }}>Create Account</h1>
          
          <form action={action} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="eclat-label text-xs tracking-widest text-gray-500 uppercase">Email</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="border-b border-gray-300 bg-transparent py-2 outline-none focus:border-black transition-colors"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="eclat-label text-xs tracking-widest text-gray-500 uppercase">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                minLength={8}
                className="border-b border-gray-300 bg-transparent py-2 outline-none focus:border-black transition-colors"
              />
            </div>

            {state?.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}

            <button 
              disabled={isPending}
              className="eclat-btn-primary mt-4 py-3"
            >
              {isPending ? 'CREATING...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm text-gray-500 hover:text-black underline-offset-4 hover:underline">
              Already have an account? Sign in.
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
