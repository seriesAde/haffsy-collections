import { cn } from '../../../lib/utils'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowLeft, LockKeyhole, Mail, Plus, User } from 'lucide-react'
import PasswordInput from '../components/PasswordInput'

const pages = {
  signup: { title: 'Create a new account', subtitle: 'Enter your details to register.', button: 'Sign Up' },
  login: { title: 'Welcome back', subtitle: 'Enter your details to sign in.', button: 'Login' },
  reset: { title: 'Forgot your password?', subtitle: 'Enter your email to request a reset link.', button: 'Send reset link' },
}

export default function AuthPage({ mode }) {
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')
  const page = pages[mode]
  const signup = mode === 'signup'
  const reset = mode === 'reset'
  const strength = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length

  useEffect(() => { document.title = `${page.title} | Haf_siyy Collection` }, [page.title])

  function submit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (signup && !String(data.get('name')).trim()) {
      setNotice('Please enter your full name.')
      return
    }
    if (signup && (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
      setNotice('Use at least 8 characters, including an uppercase letter and a number.')
      return
    }
    setNotice(reset
      ? 'Password reset is not available yet. No email has been sent.'
      : 'Your details are valid. Account services are not connected yet, so you have not been signed in or registered.')
  }

  return (
    <section className="w-full max-w-[492px] rounded-[14px] bg-surface p-[35px] text-center shadow-card max-[600px]:px-[23px] max-[600px]:py-[30px] max-[360px]:px-[18px]" aria-labelledby="auth-title">
      <div className="relative mx-auto mb-[27px] grid size-[88px] place-items-center rounded-full bg-avatar text-avatar-foreground" aria-hidden="true">
        {reset ? <LockKeyhole size={30} /> : <User size={34} fill="currentColor" strokeWidth={1.5} />}
        {signup && <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-2 border-surface bg-foreground text-surface"><Plus size={19} /></span>}
      </div>
      <h1 className="text-[27px] leading-[1.3] font-bold tracking-[-.6px] max-[600px]:text-2xl" id="auth-title">{page.title}</h1>
      <p className="mt-2.5 mb-[35px] text-base leading-[1.6] text-muted max-[600px]:mb-7 max-[600px]:text-sm">{page.subtitle}</p>
      <form onSubmit={submit} onChange={() => setNotice('')}>
        <div className="grid gap-[21px]">
          {signup && <label className="flex min-h-[51px] items-center gap-3.5 rounded-[9px] border border-outline px-[13px] text-left text-muted focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/12 [&>svg]:shrink-0">
            <span className="sr-only">Full name</span><User size={18} aria-hidden="true" />
            <input className="w-full min-w-0 border-0 bg-transparent py-3.5 text-[15px] text-foreground outline-none placeholder:text-subtle placeholder:opacity-100" name="name" autoComplete="name" placeholder="Ex: John Doe" required maxLength={100} />
          </label>}
          <label className="flex min-h-[51px] items-center gap-3.5 rounded-[9px] border border-outline px-[13px] text-left text-muted focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/12 [&>svg]:shrink-0">
            <span className="sr-only">Email address</span><Mail size={18} aria-hidden="true" />
            <input className="w-full min-w-0 border-0 bg-transparent py-3.5 text-[15px] text-foreground outline-none placeholder:text-subtle placeholder:opacity-100" name="email" type="email" autoComplete="email" placeholder="Ex: johndoe@email.com" required />
          </label>
          {!reset && <PasswordInput password={password} onChange={setPassword} signup={signup} />}

        </div>
        {signup && <div className="text-left text-[13px] leading-[1.6] text-subtle">
          <p className="my-5" id="password-help">Must contain 1 uppercase letter, 1 number, min. 8 characters</p>
          <div className="mb-2 flex justify-between text-muted"><span>Password Strength</span><span>{password ? ['Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength] : ''}</span></div>
          <div className="flex gap-[5px]" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={strength}>
            {[1, 2, 3, 4].map(level => <span key={level} className={cn('h-2 flex-1 rounded-lg', strength >= level ? 'bg-emerald-500' : 'bg-avatar')} />)}
          </div>
        </div>}
        {mode === 'login' && <div className="mt-5 flex justify-between gap-3 text-[13px] text-muted [&>label]:flex [&>label]:items-center [&>label]:gap-1.5 [&_input]:size-[15px] [&_input]:accent-accent max-[360px]:text-[11px]"><label><input type="checkbox" name="remember" /> Remember me</label><Link to="/forgot-password">Forgot password?</Link></div>}
        {notice && <p className="mt-5 rounded-[7px] border border-outline bg-background p-3 text-left text-[13px] leading-[1.6]" role="status">{notice}</p>}
        <button className="mt-[22px] block w-full rounded-[9px] bg-accent px-5 py-[15px] text-[17px] font-semibold text-white hover:bg-accent-hover" type="submit">{page.button}</button>
      </form>
      {signup ? <p className="mt-[23px] text-[13px] leading-[1.8] text-subtle [&>a]:ml-1 [&>a]:font-semibold [&>a]:text-foreground [&>a:hover]:text-accent">Already have an account? <Link to="/login">Login</Link></p> : reset ? <Link className="mt-[25px] inline-flex items-center gap-[7px] text-sm text-muted hover:text-accent" to="/login"><ArrowLeft size={16} /> Back to login</Link> : <p className="mt-[23px] text-[13px] leading-[1.8] text-subtle [&>a]:ml-1 [&>a]:font-semibold [&>a]:text-foreground [&>a:hover]:text-accent">New to Haf_siyy Collection? <Link to="/signup">Create an account</Link></p>}
    </section>
  )
}
