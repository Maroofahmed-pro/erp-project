import {RefObject,useEffect} from "react";
import i18n from "./i18n";

const ur:Record<string,string>={
 "Vendors":"فروخت کنندگان","Vendor Details":"فروخت کنندہ کی تفصیلات","Dashboard":"ڈیش بورڈ","Export":"برآمد کریں","Import":"درآمد کریں","Add Vendor":"فروخت کنندہ شامل کریں",
 "Total Vendors":"کل فروخت کنندگان","Active Vendors":"فعال فروخت کنندگان","Inactive Vendors":"غیر فعال فروخت کنندگان","Total Payable":"کل قابل ادائیگی",
 "All registered vendors":"تمام رجسٹرڈ فروخت کنندگان","Currently active":"اس وقت فعال","Not active":"غیر فعال","Unpaid dues":"غیر ادا شدہ واجبات",
 "Status":"حالت","City":"شہر","Category":"قسم","All Status":"تمام حالتیں","All Cities":"تمام شہر","All Categories":"تمام اقسام","Clear Filters":"فلٹر صاف کریں",
 "Vendor":"فروخت کنندہ","Contact":"رابطہ","Credit Limit":"کریڈٹ حد","Payable":"قابل ادائیگی","Joined On":"شمولیت کی تاریخ","Actions":"کارروائیاں",
 "No phone":"فون موجود نہیں","No city":"شہر موجود نہیں","Uncategorized":"بغیر قسم","Active":"فعال","Inactive":"غیر فعال",
 "Retailer":"پرچون فروش","Wholesaler":"تھوک فروش","Farmer":"کاشتکار","Distributor":"تقسیم کار","Other":"دیگر",
 "No vendors found":"کوئی فروخت کنندہ نہیں ملا","Try clearing the filters or add a new vendor.":"فلٹر صاف کریں یا نیا فروخت کنندہ شامل کریں۔",
 "Add new vendor":"نیا فروخت کنندہ شامل کریں","Create or update the vendor directory and account details.":"فروخت کنندہ کی ڈائریکٹری اور اکاؤنٹ کی معلومات درج یا تبدیل کریں۔",
 "Vendor name":"فروخت کنندہ کا نام","Name in Urdu":"اردو میں نام","Phone / WhatsApp":"فون / واٹس ایپ","Phone":"فون","Credit limit":"کریڈٹ حد",
 "Opening payable":"ابتدائی قابل ادائیگی","Opening balance":"ابتدائی بیلنس","Address":"پتہ","Notes":"نوٹس","Active vendor account":"فعال فروخت کنندہ اکاؤنٹ",
 "Save Vendor":"فروخت کنندہ محفوظ کریں","Update Vendor":"فروخت کنندہ اپ ڈیٹ کریں","Cancel":"منسوخ کریں","Delete":"حذف کریں",
 "Edit Vendor":"فروخت کنندہ میں ترمیم","Statement":"بل / کھاتہ","Print Bill":"بل پرنٹ کریں","Print / Save PDF":"پرنٹ / پی ڈی ایف محفوظ کریں","New Transaction":"نیا لین دین","No phone number":"فون نمبر موجود نہیں","No address provided":"پتہ درج نہیں",
 "Current Balance":"موجودہ بیلنس","Total Purchases":"کل خریداری","Total Payments":"کل ادائیگیاں","Last Transaction":"آخری لین دین",
 "Overview":"جائزہ","Transactions":"لین دین","Payments":"ادائیگیاں","Activity Log":"سرگرمی ریکارڈ",
 "No street address provided.":"گلی کا پتہ درج نہیں۔","City not provided":"شہر درج نہیں","Vendor Information":"فروخت کنندہ کی معلومات",
 "Preferred vendor":"ترجیحی فروخت کنندہ","Yes":"ہاں","No":"نہیں","Account Information":"اکاؤنٹ کی معلومات","Available credit":"دستیاب کریڈٹ",
 "Urdu name":"اردو نام","Account Summary":"اکاؤنٹ کا خلاصہ","Opening Balance":"ابتدائی بیلنس","Record Payment":"ادائیگی درج کریں",
 "Recent Transactions":"حالیہ لین دین","No transactions yet.":"ابھی کوئی لین دین نہیں","View all transactions":"تمام لین دین دیکھیں",
 "Payment History":"ادائیگیوں کی تفصیل","Date":"تاریخ","Item":"آئٹم","Method":"طریقہ","Reference":"حوالہ","Amount":"رقم","Action":"کارروائی","Payment":"ادائیگی",
 "Vendor Notes":"فروخت کنندہ کے نوٹس","No notes have been added for this vendor.":"اس فروخت کنندہ کے لیے کوئی نوٹ شامل نہیں کیا گیا۔","Edit Notes":"نوٹس میں ترمیم",
 "Update this vendor's directory and account information.":"فروخت کنندہ کی ڈائریکٹری اور اکاؤنٹ کی معلومات تبدیل کریں۔","Active vendor":"فعال فروخت کنندہ",
 "Item name":"آئٹم کا نام","Quantity":"مقدار","Vendor amount":"فروخت کنندہ کی رقم","Add Daily Entry":"روزانہ اندراج شامل کریں","Update Entry":"اندراج اپ ڈیٹ کریں",
 "Enter the item quantity and complete amount.":"آئٹم کی مقدار اور مکمل رقم درج کریں۔","Total amount":"کل رقم","Kiraya":"کرایہ","Mazdori":"مزدوری",
 "Commission (%)":"کمیشن (%)","Total deductions":"کل کٹوتیاں","Commission amount":"کمیشن کی رقم","Payment value":"ادائیگی کی رقم",
 "Payment = Total amount − Kiraya − Mazdori − Commission":"ادائیگی = کل رقم − کرایہ − مزدوری − کمیشن","Payment method":"ادائیگی کا طریقہ",
 "Cash":"نقد","Bank transfer":"بینک ٹرانسفر","Cheque":"چیک","Mobile wallet":"موبائل والٹ","Record Installment":"قسط درج کریں","Update Payment":"ادائیگی اپ ڈیٹ کریں",
 "Detail":"تفصیل","Balance":"بیلنس","Update entry":"اندراج اپ ڈیٹ کریں","Delete entry":"اندراج حذف کریں","Total remaining":"کل بقایا",
 "From date":"ابتدائی تاریخ","To date":"آخری تاریخ","No records found":"کوئی ریکارڈ نہیں ملا","Try changing the filters or add a new record.":"فلٹر تبدیل کریں یا نیا ریکارڈ شامل کریں۔",
 "Delete payment?":"ادائیگی حذف کریں؟","This action cannot be undone.":"یہ عمل واپس نہیں کیا جا سکتا۔","Confirm Delete":"حذف کرنے کی تصدیق",
 "cash":"نقد","bank":"بینک ٹرانسفر","cheque":"چیک","wallet":"موبائل والٹ"
};

function translated(value:string){
 const clean=value.trim();
 if(ur[clean])return value.replace(clean,ur[clean]);
 let match=clean.match(/^(\d+) recorded payments$/);
 if(match)return value.replace(clean,`${match[1]} درج شدہ ادائیگیاں`);
 match=clean.match(/^(\d+) records$/);
 if(match)return value.replace(clean,`${match[1]} ریکارڈ`);
 if(clean.startsWith("Edit "))return value.replace(clean,`ترمیم کریں: ${clean.slice(5)}`);
 if(clean.startsWith("Daily goods — "))return value.replace(clean,`روزانہ مال — ${clean.slice(14)}`);
 if(clean.startsWith("Pay installment — "))return value.replace(clean,`قسط ادا کریں — ${clean.slice(18)}`);
 if(clean.startsWith("Current payable:"))return value.replace("Current payable:","موجودہ قابل ادائیگی:");
 if(clean.startsWith("Goods entry added:"))return value.replace("Goods entry added:","مال کا اندراج شامل:");
 if(clean.startsWith("Payment recorded:"))return value.replace("Payment recorded:","ادائیگی درج:");
 return value;
}

function localize(root:HTMLElement){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node:Node|null;
 while((node=walker.nextNode()))if(node.nodeValue?.trim())node.nodeValue=translated(node.nodeValue);
 root.querySelectorAll<HTMLElement>("[placeholder],[aria-label],[title]").forEach(element=>{
  for(const attr of ["placeholder","aria-label","title"]){const value=element.getAttribute(attr);if(value)element.setAttribute(attr,translated(value))}
 });
}

export function useVendorUrdu(ref:RefObject<HTMLElement|null>){
 useEffect(()=>{
  if(i18n.language!=="ur"||!ref.current)return;
  const root=ref.current;
  localize(root);
  const observer=new MutationObserver(()=>localize(root));
  observer.observe(root,{childList:true,subtree:true});
  return()=>observer.disconnect();
 },[ref]);
}
