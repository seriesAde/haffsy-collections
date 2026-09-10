import { Link } from 'react-router'
export default function MetricCard({label,value,icon:Icon,to,tone,detail}) {
 return <Link to={to} className="rounded-xl border border-outline bg-surface p-6 transition-shadow hover:text-foreground hover:shadow-md"><span className={'mb-5 inline-flex rounded-xl p-3 '+tone}><Icon size={25}/></span><p className="text-sm text-muted">{label}</p><strong className="mt-2 block text-3xl font-bold tracking-tight">{value}</strong><p className="mt-2 text-xs text-muted">{detail}</p></Link>
}
