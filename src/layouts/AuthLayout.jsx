import { Link, Outlet, useLocation } from 'react-router'
import Brand from '../components/Brand'
import SiteFooter from '../components/SiteFooter'
import ThemeToggle from '../features/theme/ThemeToggle'

export default function AuthLayout() {
  const isLogin = useLocation().pathname === '/login'
  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex min-h-[88px] items-center justify-between gap-5 bg-surface px-8 py-[22px] max-[600px]:min-h-[74px] max-[600px]:px-5 max-[600px]:py-4 max-[360px]:px-3">
        <Brand to="/signup" />
        <div className="flex items-center gap-[25px] max-[600px]:gap-2.5">
          <ThemeToggle />
          <span className="flex gap-2.5 text-base text-muted [&>a]:font-[650] [&>a]:text-foreground [&>a:hover]:text-accent max-[600px]:text-sm max-[600px]:[&>span]:hidden"><span>{isLogin ? 'New here?' : 'Have an account?'}</span><Link to={isLogin ? '/signup' : '/login'}>{isLogin ? 'Sign Up' : 'Login'}</Link></span>
        </div>
      </header>
      <main className="grid flex-1 place-items-center px-6 py-20 max-[600px]:px-[18px] max-[600px]:py-9"><Outlet /></main>
      <SiteFooter />
    </div>
  )
}
