import { Moon, Sun } from 'lucide-react'
import { useTheme } from './useTheme'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const label = 'Switch to ' + (theme === 'light' ? 'dark' : 'light') + ' mode'
  return <button className="grid size-[38px] place-items-center rounded-full bg-transparent text-muted hover:bg-avatar hover:text-foreground" type="button" onClick={toggleTheme} aria-label={label} title={label}>{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
}
