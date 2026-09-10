import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'

export default function PasswordInput({ password, onChange, signup }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="flex min-h-[51px] items-center gap-3.5 rounded-[9px] border border-outline px-[13px] text-left text-muted focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/12 [&>svg]:shrink-0">
      <span className="sr-only">Password</span>
      <LockKeyhole size={18} aria-hidden="true" />
      <input className="w-full min-w-0 border-0 bg-transparent py-3.5 text-[15px] text-foreground outline-none placeholder:text-subtle placeholder:opacity-100" name="password" type={visible ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder="Enter your password" value={password} onChange={event => onChange(event.target.value)} required aria-describedby={signup ? 'password-help' : undefined} />
      <button className="-mr-1.5 grid h-9 w-8 shrink-0 place-items-center rounded bg-transparent text-muted" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible}>
        {visible ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </label>
  )
}
