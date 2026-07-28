import {useMemo,useState} from "react";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {BookOpenCheck,History,Loader2,MessageCircle,Printer,Search,X,Users} from "lucide-react";
import {useTranslation} from "react-i18next";
import api,{errorMessage} from "../api";
import {useClients,useLedger,usePurchases} from "../hooks";
import {Client,LedgerEntry,money,Purchase} from "../types";
import {Badge,DateNavigator,DateRangeFilter,EmptyState,ErrorState,ExportButtons,MobileDataCard} from "../components/ui";
import {toast} from "../components/Toast";

type DailyRow={client:Client;previous:number;purchase:number;paid:number;remaining:number};

export default function Ledger(){
 const {t,i18n}=useTranslation();
 const qc=useQueryClient(),ledgerQ=useLedger(),clientsQ=useClients(),purchasesQ=usePurchases();
 const ledger=ledgerQ.data||[],clients=clientsQ.data||[],purchases=purchasesQ.data||[];
 const [date,setDate]=useState(new Date().toISOString().slice(0,10));
 const [search,setSearch]=useState("");
 const [payments,setPayments]=useState<Record<number,string>>({});
 const [historyClient,setHistoryClient]=useState<Client|null>(null);
 const rows=useMemo<DailyRow[]>(()=>clients
  .filter(c=>c.is_active&&(c.name+c.phone).toLowerCase().includes(search.toLowerCase()))
  .map(client=>{
   const previous=Number(client.opening_balance)+ledger.filter(x=>x.client===client.id&&x.entry_date<date).reduce((s,x)=>s+Number(x.amount),0);
   const purchase=purchases.filter(x=>x.client===client.id&&x.purchase_date===date&&x.status==="completed").reduce((s,x)=>s+Number(x.grand_total),0);
   const paid=ledger.filter(x=>x.client===client.id&&x.entry_date===date&&x.entry_type==="credit").reduce((s,x)=>s+Math.abs(Number(x.amount)),0);
   return {client,previous,purchase,paid,remaining:previous+purchase-paid};
  }),[clients,ledger,purchases,date,search]);
 const totals=rows.reduce((a,x)=>({previous:a.previous+x.previous,purchase:a.purchase+x.purchase,paid:a.paid+x.paid,remaining:a.remaining+x.remaining}),{previous:0,purchase:0,paid:0,remaining:0});
 const historyMatch=search.trim()&&rows.length===1?rows[0].client:null;
 const add=useMutation({
  mutationFn:({client,amount}:{client:number;amount:number})=>api.post("/ledger/",{client,entry_type:"credit",amount:-Math.abs(amount),entry_date:date,description:`Recovery payment on ${date}`}),
  onSuccess:(_,v)=>{
   setPayments(x=>({...x,[v.client]:""}));
   void qc.invalidateQueries({queryKey:["ledger"]});
   void qc.invalidateQueries({queryKey:["clients"]});
   void qc.invalidateQueries({queryKey:["dashboard"]});
   toast(t("Recovery payment added"));
  },
  onError:e=>toast(errorMessage(e),"error"),
 });
 const pay=(row:DailyRow)=>{
  const amount=Number(payments[row.client.id]);
  if(!amount||amount<=0)return toast(t("Enter a valid payment amount"),"error");
  if(amount>Math.max(row.remaining,0))return toast(`${t("Payment cannot exceed")} ${money(row.remaining)}`,"error");
  add.mutate({client:row.client.id,amount});
 };
 if(ledgerQ.isError||clientsQ.isError||purchasesQ.isError)return <ErrorState message={errorMessage(ledgerQ.error||clientsQ.error||purchasesQ.error)} onRetry={()=>{void ledgerQ.refetch();void clientsQ.refetch();void purchasesQ.refetch()}}/>;
 return <div className="space-y-4">
  <section className="card overflow-hidden">
   <div className="flex flex-col gap-4 bg-[var(--sidebar)] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-white/12 ring-1 ring-white/15"><BookOpenCheck className="size-6"/></span><div><h1 className="text-xl font-bold">{t("Recovery Book")}</h1><p className="mt-1 text-xs text-green-100">{t("Daily buyer purchases, collections and outstanding balances")}</p></div></div>
    <ExportButtons filename={`recovery-${date}`} rows={rows.map(x=>({name:x.client.name,previous_debit:x.previous,today_purchase:x.purchase,paid:x.paid,remaining:x.remaining}))}/>
   </div>
   <div className="grid gap-3 p-4 lg:grid-cols-[auto_minmax(260px,1fr)_auto]">
    <div><span className="label">{t("Business date")}</span><DateNavigator value={date} onChange={setDate} label="Business date" className="w-[255px]"/></div>
    <label><span className="label">{t("Find buyer")}</span><div className="relative"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-muted)]"/><input className="field ps-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder={t("Search by buyer name or phone...")}/>{search&&<button type="button" className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-[10px] font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)]" onClick={()=>setSearch("")}>{t("Clear")}</button>}</div></label>
    <div className="flex items-end gap-2"><div className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[var(--primary-soft)] px-3 text-xs font-semibold text-[var(--primary)]"><Users className="size-4"/>{rows.length} {t("buyers")}</div>{historyMatch&&<button className="btn-primary" type="button" onClick={()=>setHistoryClient(historyMatch)}><History/>{t("Open history")}</button>}</div>
   </div>
   <div className="grid grid-cols-2 border-t bg-[var(--surface-secondary)] sm:grid-cols-4"><Summary label={t("Previous debit")} value={money(totals.previous)} tone="danger"/><Summary label={t("Today’s purchase")} value={money(totals.purchase)} tone="primary"/><Summary label={t("Collected")} value={money(totals.paid)} tone="info"/><Summary label={t("Remaining")} value={money(totals.remaining)} tone={totals.remaining>0?"danger":"success"}/></div>
  </section>
  <section className="table-wrap">
   <div className="border-b px-4 py-3"><h2 className="text-sm font-bold">{t("Buyer Recovery")} — {new Date(`${date}T12:00:00`).toLocaleDateString(i18n.language==="ur"?"ur-PK":"en-PK",{day:"numeric",month:"long",year:"numeric"})}</h2><p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{t("Use Full to fill the complete remaining balance, then select Add.")}</p></div>
   <div className="desktop-table overflow-x-auto">{rows.length?<table className="data-table min-w-[980px]"><thead><tr className="bg-[var(--sidebar)]"><th className="!bg-[var(--sidebar)] !text-white">{t("Name")}</th><th className="numeric !bg-[var(--sidebar)] !text-white">{t("Debit (Previous)")}</th><th className="numeric !bg-[var(--sidebar)] !text-white">{t("Today’s Purchase")}</th><th className="numeric !bg-[var(--sidebar)] !text-white">{t("Credit / Paid")}</th><th className="numeric !bg-[var(--sidebar)] !text-white">{t("Remaining")}</th><th className="!bg-[var(--sidebar)] !text-white">{t("Add Payment")}</th></tr></thead><tbody>{rows.map(row=><tr key={row.client.id}><td><BuyerIdentity client={row.client} onClick={()=>setHistoryClient(row.client)}/></td><td className="numeric">{money(row.previous)}</td><td className="numeric font-semibold">{money(row.purchase)}</td><td className="numeric text-[var(--info)]">{money(row.paid)}</td><td className={`numeric font-bold ${row.remaining>0?"text-[var(--danger)]":"text-[var(--success)]"}`}>{money(row.remaining)} {row.remaining<=0&&<Badge tone="green">{t("Settled")}</Badge>}</td><td><Payment row={row} value={payments[row.client.id]||""} setValue={v=>setPayments(x=>({...x,[row.client.id]:v}))} full={()=>setPayments(x=>({...x,[row.client.id]:String(Math.max(row.remaining,0))}))} add={()=>pay(row)} loading={add.isPending&&add.variables?.client===row.client.id}/></td></tr>)}</tbody><tfoot><tr className="bg-[var(--surface-muted)] font-bold"><td>{t("TOTAL")}</td><td className="numeric">{money(totals.previous)}</td><td className="numeric">{money(totals.purchase)}</td><td className="numeric">{money(totals.paid)}</td><td className="numeric">{money(totals.remaining)}</td><td/></tr></tfoot></table>:<EmptyState title={t("No buyer found")} description={t("Change the search text or add a buyer from Clients.")}/>}</div>
   <div className="mobile-cards gap-3 p-3">{rows.map(row=><div key={row.client.id} className="card p-4"><MobileDataCard title={row.client.name} onTitleClick={()=>setHistoryClient(row.client)} subtitle={`${date} · ${t("Previous")} ${money(row.previous)}`} amount={money(row.remaining)} status={<Badge tone={row.remaining>0?"red":"green"}>{t(row.remaining>0?"Due":"Settled")}</Badge>}/><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Info label={t("Purchase")} value={money(row.purchase)}/><Info label={t("Paid")} value={money(row.paid)}/></div><div className="mt-3"><Payment row={row} value={payments[row.client.id]||""} setValue={v=>setPayments(x=>({...x,[row.client.id]:v}))} full={()=>setPayments(x=>({...x,[row.client.id]:String(Math.max(row.remaining,0))}))} add={()=>pay(row)} loading={add.isPending&&add.variables?.client===row.client.id}/></div></div>)}</div>
  </section>
  {historyClient&&<BuyerHistory key={historyClient.id} client={historyClient} endDate={date} purchases={purchases} ledger={ledger} onClose={()=>setHistoryClient(null)}/>}
 </div>;
}

function BuyerHistory({client,endDate,purchases,ledger,onClose}:{client:Client;endDate:string;purchases:Purchase[];ledger:LedgerEntry[];onClose:()=>void}){
 const {t}=useTranslation();
 const initialFrom=(()=>{const d=new Date(`${endDate}T12:00:00`);d.setDate(d.getDate()-9);return d.toISOString().slice(0,10)})();
 const [mode,setMode]=useState<"day"|"range">("day");
 const [singleDate,setSingleDate]=useState(endDate);
 const [rangeFrom,setRangeFrom]=useState(initialFrom),[rangeTo,setRangeTo]=useState(endDate);
 const from=mode==="day"?singleDate:rangeFrom,to=mode==="day"?singleDate:rangeTo;
 const buyerPurchases=purchases.filter(x=>x.client===client.id&&x.status==="completed"&&x.purchase_date>=from&&x.purchase_date<=to);
 const buyerCredits=ledger.filter(x=>x.client===client.id&&x.entry_type==="credit"&&x.entry_date>=from&&x.entry_date<=to);
 const opening=Number(client.opening_balance)+ledger.filter(x=>x.client===client.id&&x.entry_date<from).reduce((sum,x)=>sum+Number(x.amount),0);
 const dates=[...new Set([...buyerPurchases.map(x=>x.purchase_date),...buyerCredits.map(x=>x.entry_date)])].sort();
 let running=opening;
 const days=dates.map(date=>{const bought=buyerPurchases.filter(x=>x.purchase_date===date).reduce((s,x)=>s+Number(x.grand_total),0);const paid=buyerCredits.filter(x=>x.entry_date===date).reduce((s,x)=>s+Math.abs(Number(x.amount)),0);running+=bought-paid;return {date,bought,paid,balance:running}});
 const totalBought=buyerPurchases.reduce((s,x)=>s+Number(x.grand_total),0),totalPaid=buyerCredits.reduce((s,x)=>s+Math.abs(Number(x.amount)),0),closing=opening+totalBought-totalPaid;
 const lines=buyerPurchases.flatMap(p=>p.items.map(item=>({date:p.purchase_date,reference:p.reference_number,item})));
 const sendWhatsApp=()=>{
  const digits=(client.phone||"").replace(/\D/g,"");
  const phone=digits.startsWith("0")?`92${digits.slice(1)}`:digits;
  if(phone.length<10)return toast(t("A valid buyer phone number is required"),"error");
  const message=[
   "*SABZI MANDI ERP*",
   "Buyer Account Statement",
   "",
   `Buyer: ${client.name}`,
   `Period: ${from} to ${to}`,
   "",
   `Previous Debit: ${money(opening)}`,
   `Purchase: ${money(totalBought)}`,
   `Collected: ${money(totalPaid)}`,
   `Remaining: *${money(closing)}*`,
   "",
   "Thank you for your business",
  ].join("\n");
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
 };
 const printStatement=()=>{
  const source=document.querySelector<HTMLElement>(".history-modal .statement-print");
  if(!source)return;
  const clone=source.cloneNode(true) as HTMLElement;
  clone.classList.add("print-clone");
  document.body.appendChild(clone);
  document.body.classList.add("print-statement");
  let finished=false;
  const cleanup=()=>{
   if(finished)return;
   finished=true;
   document.body.classList.remove("print-statement");
   clone.remove();
   window.removeEventListener("afterprint",cleanup);
   printMedia.removeEventListener?.("change",onPrintChange);
   clearTimeout(fallback);
  };
  const onPrintChange=(event:MediaQueryListEvent)=>{if(!event.matches)cleanup()};
  const printMedia=window.matchMedia("print");
  window.addEventListener("afterprint",cleanup,{once:true});
  printMedia.addEventListener?.("change",onPrintChange);
  // Mobile browsers can take several seconds to build the native print preview.
  // Keep the cloned statement alive until the browser reports that printing ended.
  const fallback=window.setTimeout(cleanup,120000);
  try{window.print()}catch(error){cleanup();throw error}
 };
 return <div className="history-modal fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]" onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
  <div className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] bg-[var(--surface)] shadow-[0_30px_90px_rgba(0,0,0,.28)]">
   <div className="no-print relative overflow-hidden bg-gradient-to-r from-[#063f2d] via-[#087249] to-[#0f8f58] px-5 py-5 text-white"><div className="absolute -end-12 -top-16 size-44 rounded-full bg-white/10"/><div className="absolute end-28 top-8 size-20 rounded-full bg-emerald-300/10"/><div className="relative flex items-center justify-between"><div className="flex items-center gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/20"><History className="size-6"/></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-100">{t("Customer statement")}</p><h2 className="mt-1 text-xl font-bold">{client.name}</h2><p className="mt-0.5 text-xs text-emerald-100">{client.phone||t("No phone")} · {client.address||t("No address")}</p></div></div><button className="grid size-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15 hover:bg-white/20" onClick={onClose}><X/></button></div></div>
   <div className="no-print flex-1 overflow-y-auto">
    <div className="border-b bg-[var(--surface-secondary)] p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><h3 className="font-bold">{t("View account activity")}</h3><p className="mt-1 text-xs text-[var(--text-muted)]">{mode==="day"?t("Review purchases and payments for one day."):t("Compare activity across a custom date range.")}</p><div className="mt-3 inline-flex rounded-xl bg-[var(--surface-muted)] p-1"><button className={`h-9 rounded-lg px-4 text-xs font-bold transition ${mode==="day"?"bg-[var(--surface)] text-[var(--primary)] shadow-sm":"text-[var(--text-muted)]"}`} onClick={()=>setMode("day")}>{t("Single day")}</button><button className={`h-9 rounded-lg px-4 text-xs font-bold transition ${mode==="range"?"bg-[var(--surface)] text-[var(--primary)] shadow-sm":"text-[var(--text-muted)]"}`} onClick={()=>setMode("range")}>{t("Date range")}</button></div></div><div className="animate-[fadeIn_.18s_ease-out]">{mode==="day"?<div><span className="label">{t("Select date")}</span><DateNavigator value={singleDate} onChange={setSingleDate} label="History date" className="w-[270px]"/></div>:<div><span className="label">{t("Select range")}</span><DateRangeFilter from={rangeFrom} to={rangeTo} onFrom={setRangeFrom} onTo={setRangeTo}/></div>}</div></div></div>
    <div className="grid grid-cols-2 gap-3 bg-[var(--surface)] p-4 lg:grid-cols-4"><HistoryMetric label={t("Previous debit")} value={money(opening)} tone="red"/><HistoryMetric label={t("Today’s purchase")} value={money(totalBought)} tone="green"/><HistoryMetric label={t("Collected")} value={money(totalPaid)} tone="blue"/><HistoryMetric label={t("Remaining")} value={money(closing)} tone={closing>0?"red":"green"}/></div>
    <div className="grid gap-4 p-4">
     <HistoryTable title={t("Daily account summary")} empty={t("No activity found in this date range.")} hasRows={days.length>0}><table className="data-table"><thead><tr><th>{t("Date")}</th><th className="numeric">{t("Purchase")}</th><th className="numeric">{t("Paid")}</th><th className="numeric">{t("Balance")}</th></tr></thead><tbody>{days.map(x=><tr key={x.date}><td>{new Date(`${x.date}T12:00:00`).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"})}</td><td className="numeric">{money(x.bought)}</td><td className="numeric text-[var(--info)]">{money(x.paid)}</td><td className="numeric font-bold">{money(x.balance)}</td></tr>)}</tbody></table></HistoryTable>
     <HistoryTable title={t("Products purchased")} empty={t("No purchases found in this date range.")} hasRows={lines.length>0}><table className="data-table"><thead><tr><th>{t("Date")}</th><th>{t("Product")}</th><th className="numeric">{t("Quantity")}</th><th className="numeric">{t("Rate (PKR)")}</th><th className="numeric">{t("Line total")}</th></tr></thead><tbody>{lines.map(({date,reference,item},i)=><tr key={`${reference}-${i}`}><td>{new Date(`${date}T12:00:00`).toLocaleDateString(undefined,{day:"2-digit",month:"short"})}</td><td><b>{item.item_name}</b><small className="block text-[var(--text-muted)]">{reference}</small></td><td className="numeric">{item.quantity} {item.unit}</td><td className="numeric">{money(item.rate)}</td><td className="numeric font-bold text-[var(--primary)]">{money(item.total)}</td></tr>)}</tbody></table></HistoryTable>
    </div>
   </div>
   <div className="no-print flex flex-col gap-3 border-t bg-[var(--surface-secondary)] p-4 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-[var(--text-muted)]">{t("Statement period")}: {from} — {to}</span><div className="flex flex-wrap gap-2"><button className="btn-secondary" onClick={onClose}>{t("Close")}</button><button className="btn-secondary !border-[#25D366] !text-[#128C4A]" onClick={sendWhatsApp}><MessageCircle/>{t("Send on WhatsApp")}</button><button className="btn-primary" onClick={printStatement}><Printer/>{t("Print statement")}</button></div></div>
   <StatementPrint client={client} from={from} to={to} opening={opening} bought={totalBought} paid={totalPaid} closing={closing} days={days} lines={lines}/>
  </div>
 </div>;
}

function HistoryTable({title,empty,hasRows,children}:{title:string;empty:string;hasRows:boolean;children:React.ReactNode}){return <section className="history-table overflow-hidden rounded-2xl border bg-[var(--surface)] shadow-[0_1px_2px_rgba(15,35,25,.04)]"><div className="flex items-center justify-between border-b bg-[var(--surface-secondary)] px-4 py-3"><h3 className="text-sm font-bold">{title}</h3><span className="rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-[10px] font-bold text-[var(--primary)]">{hasRows?"●":"—"}</span></div><div className="max-h-[300px] overflow-y-auto overflow-x-hidden">{hasRows?children:<div className="p-8 text-center text-sm text-[var(--text-muted)]">{empty}</div>}</div></section>}
function HistoryMetric({label,value,tone}:{label:string;value:string;tone:"green"|"blue"|"amber"|"red"}){const styles={green:"border-emerald-200 bg-emerald-50 text-emerald-700",blue:"border-blue-200 bg-blue-50 text-blue-700",amber:"border-amber-200 bg-amber-50 text-amber-700",red:"border-red-200 bg-red-50 text-red-700"};return <div className={`rounded-2xl border p-4 ${styles[tone]}`}><p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p><p className="mt-2 text-xl font-extrabold tabular-nums">{value}</p></div>}

function StatementPrint({client,from,to,opening,bought,paid,closing,days,lines}:{client:Client;from:string;to:string;opening:number;bought:number;paid:number;closing:number;days:{date:string;bought:number;paid:number;balance:number}[];lines:{date:string;reference:string;item:Purchase["items"][number]}[]}){
 return <div className="statement-print print-only"><div className="receipt-head"><h1>SABZI MANDI ERP</h1><p>Buyer Account Statement</p><p>{new Date().toLocaleString("en-PK")}</p></div><div className="receipt-rule"/><p><b>Buyer:</b> {client.name}</p><p><b>Phone:</b> {client.phone||"—"}</p><p><b>Period:</b> {from} to {to}</p><div className="receipt-rule"/><div className="receipt-totals"><span>Previous Debit</span><b>{money(opening)}</b><span>Purchase</span><b>{money(bought)}</b><span>Collected</span><b>{money(paid)}</b><span>Remaining</span><b>{money(closing)}</b></div><div className="receipt-rule"/><h3>DAILY SUMMARY</h3>{days.map(x=><div className="receipt-row" key={x.date}><span>{x.date}<small>Purchase {money(x.bought)} · Paid {money(x.paid)}</small></span><b>{money(x.balance)}</b></div>)}{lines.length>0&&<><div className="receipt-rule"/><h3>ITEM DETAILS</h3>{lines.map((x,i)=><div className="receipt-item" key={i}><b>{x.item.item_name}</b><span>{x.date}</span><small>{x.item.quantity} {x.item.unit} × {money(x.item.rate)}</small><strong>{money(x.item.total)}</strong></div>)}</>}<div className="receipt-rule"/><div className="receipt-final"><span>FINAL BALANCE</span><b>{money(closing)}</b></div><p className="receipt-thanks">Thank you for your business</p></div>;
}

function Payment({row,value,setValue,full,add,loading}:{row:DailyRow;value:string;setValue:(v:string)=>void;full:()=>void;add:()=>void;loading:boolean}){
 const {t}=useTranslation();
 return <div className="flex min-w-[250px] gap-2"><div className="relative flex-1"><span className="absolute start-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">Rs</span><input aria-label={`${t("Payment for")} ${row.client.name}`} min="0" max={Math.max(row.remaining,0)} step="0.01" type="number" className="field h-9 ps-9" value={value} onChange={e=>setValue(e.target.value)} placeholder="0"/></div><button type="button" className="btn-secondary h-9 px-3 text-xs" disabled={row.remaining<=0} onClick={full}>{t("Full")}</button><button type="button" className="btn-primary h-9 px-3 text-xs" disabled={row.remaining<=0||loading} onClick={add}>{loading?<Loader2 className="size-4 animate-spin"/>:t("Add")}</button></div>;
}
function BuyerIdentity({client,onClick}:{client:Client;onClick:()=>void}){
 const {t}=useTranslation();
 const palettes=["bg-emerald-100 text-emerald-700","bg-blue-100 text-blue-700","bg-violet-100 text-violet-700","bg-amber-100 text-amber-700","bg-rose-100 text-rose-700","bg-cyan-100 text-cyan-700"];
 const initials=client.name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join("").toUpperCase();
 return <button type="button" className="group flex w-full items-center gap-3 text-start" title={t("Open history")} onClick={onClick}><span className={`grid size-10 shrink-0 place-items-center rounded-xl text-xs font-extrabold ring-1 ring-black/5 ${palettes[client.id%palettes.length]}`}>{initials}</span><span className="min-w-0"><b className="flex items-center gap-1.5 truncate text-sm text-[var(--text-primary)] transition group-hover:text-[var(--primary)]"><span className="truncate">{client.name}</span><History className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100"/></b><small className="mt-0.5 block tracking-wide text-[var(--text-muted)]" dir="ltr">{client.phone||t("No phone")}</small></span></button>;
}
function Summary({label,value,tone}:{label:string;value:string;tone:"primary"|"danger"|"info"|"success"}){const colors={primary:"text-[var(--primary)]",danger:"text-[var(--danger)]",info:"text-[var(--info)]",success:"text-[var(--success)]"};return <div className="border-e p-3 last:border-e-0 sm:px-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</p><p className={`mt-1 text-base font-bold tabular-nums ${colors[tone]}`}>{value}</p></div>}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-lg bg-[var(--surface-secondary)] p-2"><span className="text-[var(--text-muted)]">{label}</span><b className="mt-1 block">{value}</b></div>}
