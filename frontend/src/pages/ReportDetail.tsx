import {useMemo,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from "recharts";
import {ArrowLeft,FileText,Search,TrendingUp,Wallet} from "lucide-react";
import {useClients,useExpenses,useInventory,useLedger,usePurchases} from "../hooks";
import {money} from "../types";
import {Badge,DateRangeFilter,EmptyState,ExportButtons,MobileDataCard,ModuleHeader,StatCard} from "../components/ui";

type Row={date:string;name:string;category:string;amount:number;status:string};
const today=new Date().toISOString().slice(0,10);
const firstOfMonth=`${today.slice(0,7)}-01`;
const daysAgo=(days:number)=>{const d=new Date(`${today}T12:00:00`);d.setDate(d.getDate()-days);return d.toISOString().slice(0,10)};
const configs:Record<string,{title:string;description:string;guide:string;snapshot?:boolean}>={
 purchase:{title:"Purchase Report",description:"Buyer invoices and product sales recorded in the selected period.",guide:"Use this report to verify sales volume and compare purchase activity by date."},
 recovery:{title:"Recovery Report",description:"Payments collected from buyers during the selected period.",guide:"Use this report to understand collection performance and cash received."},
 "client-ledger":{title:"Client Ledger Report",description:"All debit, purchase, credit and adjustment entries by buyer.",guide:"Search a buyer to review the movement in their account."},
 outstanding:{title:"Outstanding Report",description:"Current unpaid buyer balances and account status.",guide:"Focus recovery efforts on buyers with the largest outstanding balances.",snapshot:true},
 inventory:{title:"Inventory Report",description:"Current stock valuation and low-stock position.",guide:"Items marked Low stock require replenishment or stock verification.",snapshot:true},
 expense:{title:"Expense Report",description:"Operating costs recorded by date and category.",guide:"Use categories and dates to understand where business cash is being spent."},
 daily:{title:"Daily Summary Report",description:"Purchases, recoveries and expenses for a selected day.",guide:"This is the quickest way to reconcile one business day."},
 monthly:{title:"Monthly Summary Report",description:"Purchases, recoveries and expenses for the current month.",guide:"Use this view to understand monthly cash movement and operating performance."},
};

export default function ReportDetail(){
 const {type="daily"}=useParams(),config=configs[type]||configs.daily;
 const initialFrom=type==="daily"?today:type==="monthly"?firstOfMonth:daysAgo(29);
 const [from,setFrom]=useState(initialFrom),[to,setTo]=useState(today),[search,setSearch]=useState("");
 const purchases=usePurchases().data||[],ledger=useLedger().data||[],expenses=useExpenses().data||[],clients=useClients().data||[],inventory=useInventory().data||[];
 const all=useMemo<Row[]>(()=>{
  if(type==="purchase")return purchases.filter(x=>x.status==="completed").map(x=>({date:x.purchase_date,name:x.client_name,category:"Buyer purchase",amount:Number(x.grand_total),status:x.reference_number||x.status}));
  if(type==="recovery")return ledger.filter(x=>x.entry_type==="credit").map(x=>({date:x.entry_date,name:x.client_name,category:"Recovery",amount:Math.abs(Number(x.amount)),status:"Collected"}));
  if(type==="expense")return expenses.map(x=>({date:x.expense_date,name:x.title,category:x.category,amount:Number(x.amount),status:x.payment_method}));
  if(type==="inventory")return inventory.map(x=>({date:"—",name:x.name,category:`${x.current_stock} ${x.unit}`,amount:Number(x.current_stock)*Number(x.purchase_rate),status:Number(x.current_stock)<=Number(x.minimum_stock)?"Low stock":"In stock"}));
  if(type==="outstanding")return clients.filter(x=>Number(x.balance)>0).map(x=>({date:"—",name:x.name,category:`Limit ${money(x.credit_limit)}`,amount:Number(x.balance),status:x.is_active?"Active":"Inactive"}));
  if(type==="client-ledger")return ledger.map(x=>({date:x.entry_date,name:x.client_name,category:x.entry_type,amount:Number(x.amount),status:x.description||x.entry_type}));
  const purchaseRows=purchases.filter(x=>x.status==="completed").map(x=>({date:x.purchase_date,name:x.client_name,category:"Purchase",amount:Number(x.grand_total),status:"Completed"}));
  const recoveryRows=ledger.filter(x=>x.entry_type==="credit").map(x=>({date:x.entry_date,name:x.client_name,category:"Recovery",amount:Math.abs(Number(x.amount)),status:"Collected"}));
  const expenseRows=expenses.map(x=>({date:x.expense_date,name:x.title,category:"Expense",amount:Number(x.amount),status:x.category}));
  return [...purchaseRows,...recoveryRows,...expenseRows];
 },[type,purchases,ledger,expenses,clients,inventory]);
 const rows=all.filter(x=>(config.snapshot||(!from||x.date>=from))&&(config.snapshot||(!to||x.date<=to))&&(x.name+x.category+x.status).toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.date.localeCompare(a.date));
 const total=rows.reduce((s,x)=>s+x.amount,0),average=rows.length?total/rows.length:0;
 const chart=Object.entries(rows.reduce<Record<string,number>>((a,x)=>{const key=x.date==="—"?x.category:x.date;a[key]=(a[key]||0)+Math.abs(x.amount);return a},{})).slice(-14).map(([name,value])=>({name:name.length>10?name.slice(5):name,value}));
 const setPreset=(preset:"today"|"7"|"month")=>{setTo(today);setFrom(preset==="today"?today:preset==="7"?daysAgo(6):firstOfMonth)};
 return <div className="space-y-4">
  <ModuleHeader title={config.title} description={config.description} icon={FileText}><Link to="/reports" className="btn border border-white/20 bg-white text-[var(--primary)]"><ArrowLeft className="size-4 rtl:rotate-180"/>All reports</Link><ExportButtons filename={`${type}-report`} rows={rows}/></ModuleHeader>
  <div className="report-guide rounded-xl border px-4 py-3 text-sm"><b>How to use:</b> {config.guide}</div>
  <div className="card p-3"><div className={`grid gap-3 ${config.snapshot?"lg:grid-cols-[1fr_auto]":"lg:grid-cols-[1fr_auto]"} lg:items-end`}><label><span className="label">Search records</span><div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"/><input className="field ps-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, category or status..."/></div></label>{!config.snapshot&&<div><span className="label">Report period</span><DateRangeFilter from={from} to={to} onFrom={setFrom} onTo={setTo}/></div>}</div>{!config.snapshot&&<div className="mt-3 flex flex-wrap gap-2 border-t pt-3"><span className="self-center text-xs font-semibold text-[var(--text-muted)]">Quick period:</span><button className="btn-secondary h-8 px-3 text-xs" onClick={()=>setPreset("today")}>Today</button><button className="btn-secondary h-8 px-3 text-xs" onClick={()=>setPreset("7")}>Last 7 days</button><button className="btn-secondary h-8 px-3 text-xs" onClick={()=>setPreset("month")}>This month</button></div>}</div>
  <div className="metric-grid grid gap-3 sm:grid-cols-3"><StatCard title={type==="recovery"?"Total collected":type==="expense"?"Total expenses":type==="outstanding"?"Total outstanding":"Total value"} value={money(total)} icon={Wallet}/><StatCard title="Matching records" value={rows.length} icon={FileText}/><StatCard title="Average record" value={money(average)} icon={TrendingUp}/></div>
  {chart.length>0&&<section className="card p-4"><div className="mb-4"><h2 className="text-sm font-bold">Activity overview</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Value grouped across the latest visible records.</p></div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false}/><XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/><YAxis hide/><Tooltip formatter={(value:number)=>money(value)}/><Bar dataKey="value" fill="var(--primary)" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div></section>}
  <section className="table-wrap"><div className="flex items-center justify-between border-b bg-[var(--surface-secondary)] px-4 py-3"><div><h2 className="text-sm font-bold">Detailed records</h2><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{config.snapshot?"Current position":`${from} to ${to}`} · {rows.length} records</p></div></div><div className="desktop-table overflow-x-auto">{rows.length?<table className="data-table"><thead><tr><th>Date</th><th>Name</th><th>Category / Detail</th><th className="numeric">Amount</th><th>Status / Reference</th></tr></thead><tbody>{rows.map((x,i)=><tr key={`${x.name}-${x.date}-${i}`}><td>{x.date}</td><td className="font-semibold text-[var(--text-primary)]">{x.name}</td><td className="capitalize">{x.category}</td><td className={`numeric font-bold ${x.amount<0?"text-[var(--danger)]":"text-[var(--primary)]"}`}>{money(x.amount)}</td><td><Badge tone={x.status.toLowerCase().includes("low")?"amber":x.status.toLowerCase().includes("inactive")?"gray":"green"}>{x.status||"—"}</Badge></td></tr>)}</tbody></table>:<EmptyState title="No matching report data" description="Try another date period or clear the search text."/>}</div><div className="mobile-cards gap-2 p-3">{rows.map((x,i)=><MobileDataCard key={i} title={x.name} subtitle={`${x.date} · ${x.category}`} amount={money(x.amount)} status={<Badge>{x.status}</Badge>}/>)}</div></section>
 </div>;
}
