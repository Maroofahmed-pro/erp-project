import {useEffect,useMemo,useState} from "react";
import {createPortal} from "react-dom";
import {Boxes,LayoutDashboard,Receipt,ShoppingBasket,Users,WalletCards} from "lucide-react";
import {useLocation,useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useInventory} from "../hooks";

const modules=[
 {label:"Dashboard",to:"/",icon:LayoutDashboard},
 {label:"Recovery Book",to:"/ledger",icon:WalletCards},
 {label:"Sorting / Purchase",to:"/purchases",icon:ShoppingBasket},
 {label:"Clients",to:"/clients",icon:Users},
 {label:"Inventory",to:"/inventory",icon:Boxes},
 {label:"Expenses",to:"/expenses",icon:Receipt},
];
type Position={top:number;right:number;width:number};
export default function HeaderTools(){return localStorage.getItem("access")?<AuthenticatedHeaderTools/>:null}
function AuthenticatedHeaderTools(){
 const {t}=useTranslation(),navigate=useNavigate(),location=useLocation(),inventory=useInventory().data||[];
 const [query,setQuery]=useState(""),[searchOpen,setSearchOpen]=useState(false),[alertsOpen,setAlertsOpen]=useState(false),[position,setPosition]=useState<Position>({top:60,right:20,width:300});
 const low=useMemo(()=>inventory.filter(x=>Number(x.current_stock)<=Number(x.minimum_stock)),[inventory]);
 const results=modules.filter(x=>t(x.label).toLowerCase().includes(query.toLowerCase())||x.label.toLowerCase().includes(query.toLowerCase()));
 useEffect(()=>{
  const inputs=[...document.querySelectorAll<HTMLInputElement>('header input[placeholder]')].filter(x=>x.placeholder.toLowerCase().includes("search")||x.placeholder.includes("تلاش"));
  const bells=[...document.querySelectorAll<SVGElement>("header svg.lucide-bell")].map(x=>x.closest("button")).filter(Boolean) as HTMLButtonElement[];
  const cleanups:(()=>void)[]=[];
  for(const input of inputs){
   const focus=()=>{const r=input.getBoundingClientRect();setPosition({top:r.bottom+8,right:Math.max(12,window.innerWidth-r.right),width:r.width});setQuery(input.value);setSearchOpen(true);setAlertsOpen(false)};
   const change=()=>{setQuery(input.value);focus()};
   input.addEventListener("focus",focus);input.addEventListener("input",change);
   cleanups.push(()=>{input.removeEventListener("focus",focus);input.removeEventListener("input",change)});
  }
  for(const button of bells){
   const click=(event:Event)=>{event.preventDefault();event.stopPropagation();const r=button.getBoundingClientRect();setPosition({top:r.bottom+8,right:Math.max(12,window.innerWidth-r.right),width:320});setAlertsOpen(x=>!x);setSearchOpen(false)};
   button.addEventListener("click",click);button.setAttribute("aria-label",t("Notifications"));
   const dot=button.querySelector<HTMLElement>("span");if(dot)dot.style.display=low.length?"":"none";
   cleanups.push(()=>button.removeEventListener("click",click));
  }
  return()=>cleanups.forEach(x=>x());
 },[location.pathname,low.length,t]);
 useEffect(()=>{const close=()=>{setSearchOpen(false);setAlertsOpen(false)};window.addEventListener("resize",close);document.addEventListener("click",close);return()=>{window.removeEventListener("resize",close);document.removeEventListener("click",close)}},[]);
 const go=(to:string)=>{setSearchOpen(false);setAlertsOpen(false);navigate(to)};
 if(!searchOpen&&!alertsOpen)return null;
 return createPortal(<div className="fixed z-[90] overflow-hidden rounded-xl border bg-[var(--surface)] shadow-[0_16px_45px_rgba(0,0,0,.24)]" style={{top:position.top,right:position.right,width:`min(${position.width}px,calc(100vw - 24px))`}} onClick={e=>e.stopPropagation()}>
  {searchOpen?<div><div className="border-b px-4 py-3"><b className="text-xs">{t("Search pages")}</b><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{t("Open an ERP module quickly")}</p></div><div className="max-h-72 overflow-y-auto p-2">{results.length?results.map(({label,to,icon:Icon})=><button key={to} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-start hover:bg-[var(--surface-muted)]" onClick={()=>go(to)}><Icon className="size-4 text-[var(--primary)]"/><span className="text-sm font-semibold">{t(label)}</span></button>):<p className="p-5 text-center text-xs text-[var(--text-muted)]">{t("No matching page found")}</p>}</div></div>:
  <div><div className="flex items-center justify-between border-b px-4 py-3"><div><b className="text-sm">{t("Notifications")}</b><p className="text-[10px] text-[var(--text-muted)]">{low.length?t("Low stock needs attention"):t("Everything looks good")}</p></div><span className="rounded-full bg-[var(--danger-soft)] px-2 py-1 text-xs font-bold text-[var(--danger)]">{low.length}</span></div><div className="max-h-72 overflow-y-auto p-2">{low.length?low.map(item=><button key={item.id} className="flex w-full items-center gap-3 rounded-lg p-3 text-start hover:bg-[var(--surface-muted)]" onClick={()=>go("/inventory")}><span className="grid size-9 place-items-center rounded-lg bg-[var(--warning-soft)] text-[var(--warning)]"><Boxes className="size-4"/></span><span className="min-w-0 flex-1"><b className="block truncate text-sm">{item.name}</b><small className="text-[var(--text-muted)]">{item.current_stock} {item.unit} {t("remaining")} · {t("Minimum")} {item.minimum_stock}</small></span></button>):<p className="p-6 text-center text-xs text-[var(--text-muted)]">{t("No notifications")}</p>}</div></div>}
 </div>,document.body);
}
