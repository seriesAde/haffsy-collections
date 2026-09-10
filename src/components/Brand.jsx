import { Link } from 'react-router'

export default function Brand({ to = '/' }) {
  return <Link className="inline-flex items-center gap-[13px] text-[21px] font-[650] tracking-[-.45px] hover:text-accent max-[600px]:gap-[9px] max-[600px]:text-base max-[360px]:text-sm" to={to}><span className="grid size-9 place-items-center rounded-[5px] bg-foreground text-[22px] text-surface max-[600px]:size-[31px] max-[600px]:text-[19px]">H</span><span>Haf_siyy Collection</span></Link>
}
