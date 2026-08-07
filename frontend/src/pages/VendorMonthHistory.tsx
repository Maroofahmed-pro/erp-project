import {useMemo} from "react";
import {useQuery} from "@tanstack/react-query";
import {CalendarDays,FileText,Loader2} from "lucide-react";
import {Link,useParams} from "react-router-dom";
import api,{errorMessage} from "../api";
import {EmptyState,ErrorState} from "../components/ui";
import {money,unwrap,Vendor,VendorDailyExpense,VendorEntry,VendorPayment} from "../types";
import {VendorHeader} from "../components/VendorHeader";

const safeHtml=(value:unknown)=>String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]!));
const createMobilePrintWindow=()=>{
 const frame=document.createElement("iframe");
 frame.setAttribute("title","Monthly report print");
 frame.style.cssText="position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;background:white";
 document.body.appendChild(frame);
 const target=frame.contentWindow;
 if(!target){frame.remove();return null}
 const cleanup=()=>{if(document.body.contains(frame))frame.remove()};
 target.addEventListener("afterprint",cleanup,{once:true});
 window.setTimeout(cleanup,60000);
 return target;
};

export default function VendorMonthHistory(){
 const {id,month=""}=useParams(),vendorId=Number(id),validMonth=/^\d{4}-\d{2}$/.test(month);
 const vendorQ=useQuery({queryKey:["vendor",vendorId],queryFn:async()=>(await api.get<Vendor>(`/vendors/${vendorId}/`)).data,enabled:Number.isFinite(vendorId)});
 const entriesQ=useQuery({queryKey:["vendor-entries",vendorId],queryFn:async()=>unwrap<VendorEntry>((await api.get(`/vendor-entries/?vendor=${vendorId}`)).data),enabled:Number.isFinite(vendorId)});
 const paymentsQ=useQuery({queryKey:["vendor-payments",vendorId],queryFn:async()=>unwrap<VendorPayment>((await api.get(`/vendor-payments/?vendor=${vendorId}`)).data),enabled:Number.isFinite(vendorId)});
 const expensesQ=useQuery({queryKey:["vendor-daily-expenses",vendorId],queryFn:async()=>unwrap<VendorDailyExpense>((await api.get(`/vendor-daily-expenses/?vendor=${vendorId}`)).data),enabled:Number.isFinite(vendorId)});
 const rows=useMemo(()=>{const entries=(entriesQ.data||[]).filter(x=>x.entry_date.startsWith(month)),payments=(paymentsQ.data||[]).filter(x=>x.payment_date.startsWith(month)),expenses=(expensesQ.data||[]).filter(x=>x.expense_date.startsWith(month));const dates=new Set([...entries.map(x=>x.entry_date),...payments.map(x=>x.payment_date),...expenses.map(x=>x.expense_date)]);return [...dates].sort((a,b)=>b.localeCompare(a)).map(date=>{const amount=entries.filter(x=>x.entry_date===date).reduce((sum,x)=>sum+Number(x.vendor_amount),0),expense=expenses.find(x=>x.expense_date===date),payment=payments.filter(x=>x.payment_date===date).reduce((sum,x)=>sum+Number(x.amount),0);return {date,finalBalance:expense?Number(expense.final_amount):amount,payment}})},[entriesQ.data,paymentsQ.data,expensesQ.data,month]);
 const previousMonth=useMemo(()=>{const date=new Date(`${month}-01T12:00:00`);date.setMonth(date.getMonth()-1);return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`},[month]);
 const previousBalance=useMemo(()=>{const entries=(entriesQ.data||[]).filter(x=>x.entry_date.startsWith(previousMonth)).reduce((sum,x)=>sum+Number(x.vendor_amount),0),expenses=(expensesQ.data||[]).filter(x=>x.expense_date.startsWith(previousMonth)).reduce((sum,x)=>sum+Number(x.total_deductions),0);return entries-expenses},[entriesQ.data,expensesQ.data,previousMonth]);
 const previousPayment=useMemo(()=>(paymentsQ.data||[]).filter(x=>x.payment_date.startsWith(previousMonth)).reduce((sum,x)=>sum+Number(x.amount),0),[paymentsQ.data,previousMonth]);
 const previousLastDate=useMemo(()=>new Date(`${previousMonth}-01T12:00:00`).toLocaleDateString("en-PK",{month:"long",year:"numeric"}),[previousMonth]);
 const monthEntries=rows.reduce((sum,row)=>sum+row.finalBalance,0),totalPayment=rows.reduce((sum,row)=>sum+row.payment,0),allPayments=previousPayment+totalPayment;
 // Carry the previous balance into the month total. Current-month payments
 // remain a separate figure and must not reduce this amount.
 const closingBalance=previousBalance+monthEntries;
 const combinedPayment=previousPayment+totalPayment;
 const remainingAmount=closingBalance-combinedPayment;
 const loading=vendorQ.isLoading||entriesQ.isLoading||paymentsQ.isLoading||expensesQ.isLoading;
 const failed=vendorQ.isError||entriesQ.isError||paymentsQ.isError||expensesQ.isError;
 if(!validMonth)return <ErrorState message="Invalid history month."/>;
 if(failed)return <ErrorState message={errorMessage(vendorQ.error||entriesQ.error||paymentsQ.error||expensesQ.error)}/>;
 if(loading||!vendorQ.data)return <div className="card p-8"><Loader2 className="mx-auto animate-spin text-[var(--primary)]"/></div>;
 const monthLabel=new Date(`${month}-01T12:00:00`).toLocaleDateString("en-PK",{month:"long",year:"numeric"});
 const exportDetailedMonth=()=>{const popup=window.open("","_blank");if(!popup)return;const detailRows=rows.map(row=>`<tr><td>${row.date}</td><td class="num">${money(row.finalBalance)}</td><td class="num payment">${row.payment?money(row.payment):"—"}</td></tr>`).join("");popup.document.write(`<!doctype html><html><head><title>${vendorQ.data.name} - ${monthLabel}</title><style>@page{size:A4 portrait;margin:14mm}*{box-sizing:border-box}body{margin:0;color:#17231d;font-family:Arial,sans-serif}header{border-bottom:3px solid #0f8a55;padding-bottom:14px;margin-bottom:18px}h1{margin:0;font-size:24px}p{margin:6px 0 0;color:#66776e;font-size:12px}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 18px}.summary div{border:1px solid #d6e0da;border-radius:9px;padding:11px}.summary small{display:block;color:#66776e;margin-bottom:5px}.summary b{font-size:15px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d6e0da;padding:10px 12px}th{background:#eaf3ee;text-align:left;text-transform:uppercase;font-size:10px;letter-spacing:.06em}.num{text-align:right;font-variant-numeric:tabular-nums}.payment{color:#dc2626;font-weight:800}tfoot td{background:#f4f7f5;font-weight:900;border-top:2px solid #82958a}.print{position:fixed;right:18px;bottom:18px;border:0;border-radius:10px;background:#0f8a55;color:white;padding:11px 16px;font-weight:700}@media print{.print{display:none}}</style></head><body><button class="print" onclick="window.print()">Print / Save PDF</button><header><h1>${vendorQ.data.name} — ${monthLabel}</h1><p>Detailed date-wise monthly history</p></header><div class="summary"><div><small>Previous month total</small><b>${money(previousBalance)}</b></div><div><small>Current month amount</small><b>${money(monthEntries)}</b></div><div><small>Total including previous</small><b>${money(closingBalance)}</b></div></div><table><thead><tr><th>Date</th><th class="num">Final amount</th><th class="num">Payment</th></tr></thead><tbody><tr><td><b>${previousLastDate}</b></td><td class="num"><b>${money(previousBalance)}</b></td><td class="num payment">${previousPayment?money(previousPayment):"—"}</td></tr>${detailRows}</tbody><tfoot><tr><td>Month totals</td><td class="num">${money(closingBalance)}</td><td class="num payment">${money(totalPayment)}</td></tr></tfoot></table><script>window.addEventListener("load",()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);popup.document.close()};
 const exportDetailedMonthUrdu=()=>{
  const popup=window.open("","_blank");if(!popup)return;
  const detailRows=rows.map(row=>`<tr><td>${safeHtml(row.date)}</td><td class="num">${safeHtml(money(row.finalBalance))}</td><td class="num payment">${row.payment?safeHtml(money(row.payment)):"—"}</td></tr>`).join("");
  popup.document.write(`<!doctype html><html lang="ur" dir="rtl"><head><meta charset="utf-8"><title>${safeHtml(vendorQ.data.name_ur||vendorQ.data.name)} - ${safeHtml(monthLabel)}</title><style>@page{size:A4 portrait;margin:14mm}*{box-sizing:border-box}body{margin:0;color:#17231d;font-family:"Noto Nastaliq Urdu","Noto Naskh Arabic",Arial,sans-serif;direction:rtl}header{border-bottom:3px solid #0f8a55;padding-bottom:14px;margin-bottom:18px}h1{margin:0;font-size:24px;line-height:1.8}p{margin:6px 0 0;color:#66776e;font-size:12px}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 18px}.summary div{border:1px solid #d6e0da;border-radius:9px;padding:11px}.summary small{display:block;color:#66776e;margin-bottom:5px}.summary b{font:700 15px Arial,sans-serif;direction:ltr;display:block;text-align:right}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d6e0da;padding:10px 12px}th{background:#eaf3ee;text-align:right;font-size:11px}.num{text-align:left;font-family:Arial,sans-serif;direction:ltr;font-variant-numeric:tabular-nums}.payment{color:#dc2626;font-weight:800}tfoot td{background:#f4f7f5;font-weight:900;border-top:2px solid #82958a}.print{position:fixed;left:18px;bottom:18px;border:0;border-radius:10px;background:#0f8a55;color:white;padding:11px 16px;font-weight:700}@media print{.print{display:none}}</style></head><body><button class="print" onclick="window.print()">پرنٹ / پی ڈی ایف محفوظ کریں</button><header><h1>${safeHtml(vendorQ.data.name_ur||vendorQ.data.name)} — ${safeHtml(monthLabel)}</h1><p>تاریخ وار تفصیلی ماہانہ حساب</p></header><div class="summary"><div><small>پچھلے مہینے کی کل رقم</small><b>${safeHtml(money(previousBalance))}</b></div><div><small>موجودہ مہینے کی رقم</small><b>${safeHtml(money(monthEntries))}</b></div><div><small>پچھلی رقم سمیت کل</small><b>${safeHtml(money(closingBalance))}</b></div></div><table><thead><tr><th>تاریخ</th><th class="num">آخری رقم</th><th class="num">ادائیگی</th></tr></thead><tbody><tr><td><b>${safeHtml(previousLastDate)}</b></td><td class="num"><b>${safeHtml(money(previousBalance))}</b></td><td class="num payment">${previousPayment?safeHtml(money(previousPayment)):"—"}</td></tr>${detailRows}</tbody><tfoot><tr><td>مہینے کا کل حساب</td><td class="num">${safeHtml(money(closingBalance))}</td><td class="num payment">${safeHtml(money(totalPayment))}</td></tr></tfoot></table><script>window.addEventListener("load",()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);
  popup.document.close();
 };
 const exportDetailedMonthUrduWithBalance=()=>{
  const popup=createMobilePrintWindow();if(!popup)return;
  const detailRows=rows.map(row=>`<tr><td>${safeHtml(row.date)}</td><td class="num">${safeHtml(money(row.finalBalance))}</td><td class="num payment">${row.payment?safeHtml(money(row.payment)):"—"}</td></tr>`).join("");
  popup.document.write(`<!doctype html>
<html lang="ur" dir="rtl"><head><meta charset="utf-8"><title>${safeHtml(vendorQ.data.name_ur||vendorQ.data.name)} - ${safeHtml(monthLabel)}</title>
<style>
@page{size:A4 portrait;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#17231d;font-family:"Noto Nastaliq Urdu","Noto Naskh Arabic",Arial,sans-serif;direction:rtl}
header{border-bottom:3px solid #0f8a55;padding-bottom:12px;margin-bottom:16px}h1{margin:0;font-size:23px;line-height:1.8}p{margin:5px 0 0;color:#66776e;font-size:12px}
.summary{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin:0 0 16px}.summary div{border:1px solid #d6e0da;border-radius:9px;padding:9px;min-width:0}.summary small{display:block;color:#66776e;margin-bottom:5px;font-size:10px;white-space:nowrap}.summary b{font:700 13px Arial,sans-serif;direction:ltr;display:block;text-align:right;white-space:nowrap}
.paid{background:#eefbf4;border-color:#b9e5cb!important}.remaining{background:#fff5f5;border-color:#fecaca!important}.remaining b{color:#dc2626}
table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #d6e0da;padding:9px 11px}th{background:#eaf3ee;text-align:right;font-size:11px}.num{text-align:left;font-family:Arial,sans-serif;direction:ltr;font-variant-numeric:tabular-nums}.payment{color:#dc2626;font-weight:800}tfoot td{background:#f4f7f5;font-weight:900;border-top:2px solid #82958a}
.print{position:fixed;left:18px;bottom:18px;border:0;border-radius:10px;background:#0f8a55;color:white;padding:11px 16px;font-weight:700}@media print{.print{display:none}}
</style></head><body>
<button class="print" onclick="window.print()">پرنٹ / پی ڈی ایف محفوظ کریں</button>
<header><h1>${safeHtml(vendorQ.data.name_ur||vendorQ.data.name)} — ${safeHtml(monthLabel)}</h1><p>تاریخ وار تفصیلی ماہانہ حساب</p></header>
<div class="summary">
 <div><small>پچھلے مہینے کی کل رقم</small><b>${safeHtml(money(previousBalance))}</b></div>
 <div><small>موجودہ مہینے کی رقم</small><b>${safeHtml(money(monthEntries))}</b></div>
 <div><small>پچھلی رقم سمیت کل</small><b>${safeHtml(money(closingBalance))}</b></div>
 <div class="paid"><small>کل ادائیگی</small><b>${safeHtml(money(combinedPayment))}</b></div>
 <div class="remaining"><small>باقی رقم</small><b>${safeHtml(money(remainingAmount))}</b></div>
</div>
<table><thead><tr><th>تاریخ</th><th class="num">آخری رقم</th><th class="num">ادائیگی</th></tr></thead>
<tbody><tr><td><b>${safeHtml(previousLastDate)}</b></td><td class="num"><b>${safeHtml(money(previousBalance))}</b></td><td class="num payment">${previousPayment?safeHtml(money(previousPayment)):"—"}</td></tr>${detailRows}</tbody>
<tfoot><tr><td>مہینے کا کل حساب</td><td class="num">${safeHtml(money(closingBalance))}</td><td class="num payment">${safeHtml(money(combinedPayment))}</td></tr><tr><td>باقی رقم</td><td class="num" colspan="2">${safeHtml(money(remainingAmount))}</td></tr></tfoot></table>
<script>window.addEventListener("load",()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);
  popup.document.close();
 };
 return <div className="space-y-4">
  <VendorHeader title={`${monthLabel} History`} subtitle={`${vendorQ.data.name} · Date-wise monthly history`} backTo={`/vendors/${vendorId}?tab=history`}><button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-[var(--sidebar)] hover:bg-green-50" onClick={exportDetailedMonthUrduWithBalance}><FileText className="size-4"/>تفصیلی رپورٹ</button></VendorHeader>
  <section className="table-wrap">
   <div className="flex items-center gap-3 border-b p-4"><span className="grid size-10 place-items-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]"><CalendarDays className="size-5"/></span><div><h2 className="font-bold">{monthLabel}</h2><p className="text-xs text-[var(--text-muted)]">{rows.length} business dates</p></div></div>
   {rows.length?<><div className="desktop-table overflow-x-auto"><table className="data-table"><thead><tr><th>Date</th><th className="numeric">Final balance</th><th className="numeric">Payment</th></tr></thead><tbody><tr className="bg-[var(--danger-soft)]"><td className="font-black text-[var(--danger)]">{previousLastDate}</td><td className="numeric font-black text-[var(--danger)]">{money(previousBalance)}</td><td className="numeric font-black text-[var(--danger)]">{money(previousPayment)}</td></tr>{rows.map(row=><tr key={row.date}><td className="font-semibold">{row.date}</td><td className="numeric font-bold">{money(row.finalBalance)}</td><td className="numeric font-bold text-[var(--danger)]">{row.payment?money(row.payment):"—"}</td></tr>)}</tbody><tfoot><tr className="bg-[var(--surface-secondary)]"><td className="font-black">Month totals</td><td className="numeric font-black">{money(closingBalance)}</td><td className="numeric font-black text-[var(--danger)]">{money(allPayments)}</td></tr></tfoot></table></div><div className="mobile-cards gap-2 p-3"><div className="rounded-xl border border-red-200 bg-[var(--danger-soft)] p-4"><b className="mb-3 block text-[var(--danger)]">{previousLastDate}</b><div className="grid grid-cols-2 gap-3"><span><small className="font-bold text-[var(--danger)]">Previous balance</small><b className="mt-1 block text-[var(--danger)]">{money(previousBalance)}</b></span><span className="text-end"><small className="font-bold text-[var(--danger)]">Previous payment</small><b className="mt-1 block text-[var(--danger)]">{money(previousPayment)}</b></span></div></div>{rows.map(row=><article className="card p-4" key={row.date}><b>{row.date}</b><div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3"><span><small>Final balance</small><b className="block">{money(row.finalBalance)}</b></span><span className="text-end"><small>Payment</small><b className="block text-[var(--danger)]">{row.payment?money(row.payment):"—"}</b></span></div></article>)}<div className="grid grid-cols-2 gap-3 rounded-xl bg-[var(--surface-secondary)] p-4"><span><small>Total amount</small><b className="block">{money(closingBalance)}</b></span><span className="text-end"><small>Total payment</small><b className="block text-[var(--danger)]">{money(allPayments)}</b></span></div></div></>:<EmptyState/>}
  </section>
 </div>
}
