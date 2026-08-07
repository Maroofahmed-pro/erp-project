import {ArrowLeft,Store} from "lucide-react";
import {Link} from "react-router-dom";

export function VendorHeader({title,subtitle,backTo,children}:{title:string;subtitle:string;backTo?:string;children?:React.ReactNode}){
 return <section className="card overflow-hidden">
  <div className="flex flex-col gap-3 bg-[var(--sidebar)] px-4 py-3.5 text-white sm:flex-row sm:items-center sm:justify-between">
   <div className="flex items-center gap-3">
    {backTo&&<Link to={backTo} aria-label="Back" className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 transition-colors hover:bg-white/20"><ArrowLeft className="size-4 rtl:rotate-180"/></Link>}
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/15"><Store className="size-5"/></span>
    <div><h1 className="text-lg font-bold">{title}</h1><p className="mt-0.5 text-[11px] text-green-100">{subtitle}</p></div>
   </div>
   {children&&<div className="vendor-header-actions grid grid-cols-3 items-center gap-2 sm:flex sm:flex-wrap">{children}</div>}
  </div>
 </section>
}
