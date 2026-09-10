import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useInventory } from '../../inventory/InventoryContext'

export default function MobileNavigation({ name }) {
  const dialog = useRef(null)
  const trigger = useRef(null)
  const { categories } = useInventory()
  const [expanded, setExpanded] = useState(false)
  const [open, setOpen] = useState(false)

  function close() { dialog.current.close(); setOpen(false); trigger.current?.focus() }
  function show() { dialog.current.showModal(); setOpen(true) }
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const media = window.matchMedia('(min-width: 768px)')
    function resize() { if (media.matches) { dialog.current.close(); setOpen(false) } }
    media.addEventListener('change', resize)
    return () => { document.body.style.overflow = previous; media.removeEventListener('change', resize) }
  }, [open])

  return <>
    <button ref={trigger} type="button" className="grid size-10 shrink-0 place-items-center rounded-lg hover:bg-background md:hidden" aria-label="Open menu" aria-expanded={open} aria-controls="store-mobile-menu" onClick={show}><Menu size={23}/></button>
    <dialog ref={dialog} id="store-mobile-menu" aria-labelledby="mobile-menu-title" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) close() }} className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(85vw,340px)] max-w-none border-r border-outline bg-surface p-0 text-foreground backdrop:bg-black/50">
      <div className="flex min-h-full flex-col" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-outline p-5"><h2 id="mobile-menu-title" className="font-bold">{name}</h2><button type="button" className="grid size-10 place-items-center rounded-lg" onClick={close} aria-label="Close menu"><X size={22}/></button></div>
        <nav aria-label="Mobile storefront" className="space-y-2 p-4">
          <Link className="block rounded-lg px-3 py-3 hover:bg-background" to="/" onClick={close}>Home</Link>
          <Link className="block rounded-lg px-3 py-3 hover:bg-background" to="/shop" onClick={close}>All products</Link>
          <button type="button" className="flex w-full items-center justify-between rounded-lg px-3 py-3 hover:bg-background" aria-expanded={expanded} aria-controls="mobile-categories" onClick={() => setExpanded(value => !value)}>Categories<ChevronDown size={18} className={expanded ? 'rotate-180' : ''}/></button>
          <div id="mobile-categories" hidden={!expanded} className="ml-3 border-l border-outline pl-3">
            <Link className="block px-3 py-3 text-sm text-accent" to="/categories" onClick={close}>View all categories</Link>
            {categories.map(category => <Link key={category} className="block rounded-lg px-3 py-3 text-sm hover:bg-background" to={'/categories/' + encodeURIComponent(category)} onClick={close}>{category}</Link>)}
            {!categories.length && <p className="px-3 py-2 text-sm text-muted">No categories yet.</p>}
          </div>
          {[['Wishlist','/wishlist'],['Profile & orders','/profile'],['Cart','/cart'],['Contact','/contact']].map(([label,path]) => <Link key={path} className="block rounded-lg px-3 py-3 hover:bg-background" to={path} onClick={close}>{label}</Link>)}
        </nav>
      </div>
    </dialog>
  </>
}
