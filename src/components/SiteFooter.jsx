import { Globe } from 'lucide-react'

export default function SiteFooter() {
  return <footer className="flex min-h-[69px] items-center justify-between gap-4 bg-surface px-8 py-5 text-[13px] text-subtle max-[600px]:px-5 max-[600px]:text-[11px]"><span>&copy; {new Date().getFullYear()} Haf_siyy Collection</span><span className="inline-flex items-center gap-[5px] text-muted"><Globe size={16} aria-hidden="true" /> ENG</span></footer>
}
