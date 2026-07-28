import {BarChart3,Boxes,CalendarDays,ChevronRight,FileBarChart,Receipt,ShoppingBasket,Users,WalletCards} from "lucide-react";
import {Link} from "react-router-dom";
import {ModuleHeader} from "../components/ui";
import {useTranslation} from "react-i18next";

const reports=[
 {slug:"purchase",title:"Purchase report",desc:"Review buyer purchases, invoices and product value.",hint:"Invoices · products · value",icon:ShoppingBasket,color:"from-emerald-500 to-teal-600",soft:"bg-emerald-50 text-emerald-700"},
 {slug:"recovery",title:"Recovery report",desc:"Track collections and see who paid during a period.",hint:"Payments · buyers · dates",icon:WalletCards,color:"from-blue-500 to-indigo-600",soft:"bg-blue-50 text-blue-700"},
 {slug:"client-ledger",title:"Client ledger",desc:"Inspect account debits, credits and running activity.",hint:"Debits · credits · accounts",icon:Users,color:"from-violet-500 to-purple-600",soft:"bg-violet-50 text-violet-700"},
 {slug:"outstanding",title:"Outstanding report",desc:"Identify buyers with unpaid balances and credit exposure.",hint:"Balances · limits · status",icon:FileBarChart,color:"from-amber-500 to-orange-600",soft:"bg-amber-50 text-amber-700"},
 {slug:"inventory",title:"Inventory report",desc:"Understand stock value and items requiring attention.",hint:"Stock · valuation · alerts",icon:Boxes,color:"from-cyan-500 to-sky-600",soft:"bg-cyan-50 text-cyan-700"},
 {slug:"expense",title:"Expense report",desc:"Analyze operating costs by category, date and payee.",hint:"Costs · categories · methods",icon:Receipt,color:"from-rose-500 to-red-600",soft:"bg-rose-50 text-rose-700"},
 {slug:"daily",title:"Daily summary",desc:"See purchases, recoveries and expenses for one day.",hint:"Today · cash flow · activity",icon:CalendarDays,color:"from-lime-500 to-green-600",soft:"bg-lime-50 text-lime-700"},
 {slug:"monthly",title:"Monthly summary",desc:"Review this month’s financial and operational activity.",hint:"Trends · totals · performance",icon:BarChart3,color:"from-indigo-500 to-blue-600",soft:"bg-indigo-50 text-indigo-700"},
];

export default function Reports(){
 const {t}=useTranslation();
 return <div className="space-y-5">
  <ModuleHeader title="Reports" description="Financial and operational insights for better mandi decisions." icon={BarChart3}/>
  <div className="rounded-2xl border bg-[var(--primary-soft)] p-4"><h2 className="text-sm font-bold text-[var(--primary)]">{t("Choose the question you want to answer")}</h2><p className="mt-1 text-xs text-[var(--text-secondary)]">{t("Each report includes filters, summary totals, charts, detailed records and export options.")}</p></div>
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   {reports.map(({slug,title,desc,hint,icon:Icon,color,soft})=><Link to={`/reports/${slug}`} key={slug} className="card group relative overflow-hidden p-5 transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_12px_30px_rgba(15,80,50,.12)]">
    <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${color}`}/>
    <div className="flex items-start gap-4"><div className={`grid size-12 shrink-0 place-items-center rounded-2xl ${soft}`}><Icon className="size-6"/></div><div className="min-w-0 flex-1"><h2 className="font-bold text-[var(--text-primary)]">{t(title)}</h2><p className="mt-1.5 min-h-10 text-sm leading-5 text-[var(--text-secondary)]">{t(desc)}</p><div className="mt-4 flex items-center justify-between gap-3"><span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)]">{t(hint)}</span><span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)]">{t("Open report")}<ChevronRight className="size-4 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"/></span></div></div></div>
   </Link>)}
  </div>
 </div>;
}
