'use client'

import { useActionState } from 'react'
import { login } from '@/actions/auth'
import Link from 'next/link'
import { EclatNav } from '@/components/eclat/EclatNav'

export default function LoginPage() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    const result = await login(formData)
    if (result.success) {
      const email = formData.get('email') as string
      // Redirect admin to admin panel, others to homepage
      window.location.href = email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? '/admin' : '/'
    }
    return result
  }, null)

  return (
    <>
      <EclatNav />
      <main className="pt-24 min-h-screen flex items-center justify-center eclat-surface">
        <div className="w-full max-w-md p-8 bg-white/50 backdrop-blur-md border border-[rgba(0,0,0,0.06)]">
          <h1 className="text-3xl mb-8 text-center" style={{ fontFamily: "var(--font-noto-serif)" }}>Sign In</h1>
          
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
              {isPending ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/signup" className="text-sm text-gray-500 hover:text-black underline-offset-4 hover:underline">
              Don't have an account? Sign up.
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
