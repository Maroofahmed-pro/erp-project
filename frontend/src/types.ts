export interface Client { id:number; name:string; phone:string; address:string; opening_balance:string; balance:string; credit_limit:string; is_active:boolean; notes:string }
export interface InventoryItem { id:number; name:string; name_ur:string; category:string; unit:string; current_stock:string; minimum_stock:string; purchase_rate:string; is_active:boolean }
export interface PurchaseItem { id?:number; inventory_item?:number|string|null; item_name:string; unit:string; rate:string; quantity:string; total?:string }
export interface Purchase { id:number; client:number; client_name:string; purchase_date:string; reference_number:string; vehicle_number:string; grand_total:string; status:string; notes:string; items:PurchaseItem[] }
export interface LedgerEntry { id:number; client:number; client_name:string; entry_type:string; amount:string; entry_date:string; description:string }
export interface Expense { id:number; category:string; title:string; amount:string; expense_date:string; paid_to:string; payment_method:string; notes:string }
export interface User { id:number; username:string; first_name:string; last_name:string; email:string; phone:string; role:string; language:string }
export const unwrap = <T,>(data:T[]|{results:T[]}) => Array.isArray(data) ? data : data.results;
export const money = (value:unknown) => `Rs ${Number(value || 0).toLocaleString("en-PK", {maximumFractionDigits:0})}`;
