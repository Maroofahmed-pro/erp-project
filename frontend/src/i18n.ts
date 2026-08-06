import i18n from "i18next";import {initReactI18next} from "react-i18next";
const en={appName:"Sabzi Mandi ERP",dashboard:"Dashboard",clients:"Clients",purchases:"Purchases",sortingPurchase:"Sorting / Purchase",recovery:"Recovery Book",inventory:"Inventory",expenses:"Expenses",reports:"Reports",usersRoles:"Users & Roles",settings:"Settings",helpSupport:"Help & Support",logout:"Logout",profile:"Profile",language:"Language",administrator:"Administrator",create:"Create",more:"More",quickCreate:"Quick create",searchAnything:"Search...",welcome:"Welcome",dashboardDesc:"A live view of today's mandi operations.",todayPurchase:"Today's Purchase",todayRecovery:"Today's Recovery",todayExpenses:"Today's Expenses",cashInHand:"Cash in Hand",totalOutstanding:"Remaining Balance",totalClients:"Total Clients",inventoryValue:"Inventory Value",lowStockAlerts:"Low Stock Items",lastSevenDays:"Last seven days",purchaseVsRecovery:"Purchase vs Recovery",expenseTrend:"Expense Trend",cashFlow:"Cash Flow",recoveryLessExpenses:"Recovery less expenses",liveTransactions:"Completed today",paymentsReceived:"Payments received",operatingCosts:"Operating costs",netCashToday:"Net cash today",clientReceivables:"Client remaining balances",activeAccounts:"Active accounts",currentValuation:"Current valuation",needsAttention:"Needs attention",newPurchase:"New Purchase",addPayment:"Add Recovery",addClient:"Add Client",addExpense:"Add Expense",stockAdjustment:"Stock Adjustment",viewReports:"View Reports",recentPurchases:"Recent Purchases",recentRecoveries:"Recent Recovery",recentExpenses:"Recent Expenses",alertsNotifications:"Alerts & Notifications",username:"Username",password:"Password",welcomeBack:"Welcome back",signInAccount:"Sign in to your account",loginSubtitle:"Enter your credentials to access the ERP dashboard.",rememberMe:"Remember me",signIn:"Sign in securely",secureLogin:"Encrypted and secure authentication",invalidCredentials:"Invalid username or password. Please try again."};
const ur:Record<keyof typeof en,string>={appName:"سبزی منڈی ای آر پی",dashboard:"ڈیش بورڈ",clients:"کلائنٹس",purchases:"خریداری",sortingPurchase:"چھانٹی / خریداری",recovery:"ریکوری بک",inventory:"انوینٹری",expenses:"اخراجات",reports:"رپورٹس",usersRoles:"صارفین اور کردار",settings:"ترتیبات",helpSupport:"مدد اور معاونت",logout:"لاگ آؤٹ",profile:"پروفائل",language:"زبان",administrator:"منتظم",create:"بنائیں",more:"مزید",quickCreate:"فوری اندراج",searchAnything:"تلاش کریں...",welcome:"خوش آمدید",dashboardDesc:"آج کی منڈی کی سرگرمیوں کا تازہ جائزہ۔",todayPurchase:"آج کی خریداری",todayRecovery:"آج کی ریکوری",todayExpenses:"آج کے اخراجات",cashInHand:"نقد رقم",totalOutstanding:"کل بقایا",totalClients:"کل کلائنٹس",inventoryValue:"انوینٹری کی قیمت",lowStockAlerts:"کم اسٹاک اشیاء",lastSevenDays:"گزشتہ سات دن",purchaseVsRecovery:"خریداری بمقابلہ ریکوری",expenseTrend:"اخراجات کا رجحان",cashFlow:"نقد بہاؤ",recoveryLessExpenses:"ریکوری منفی اخراجات",liveTransactions:"آج مکمل",paymentsReceived:"موصول ادائیگیاں",operatingCosts:"کاروباری اخراجات",netCashToday:"آج کی خالص نقدی",clientReceivables:"کلائنٹ سے قابل وصول",activeAccounts:"فعال اکاؤنٹس",currentValuation:"موجودہ قیمت",needsAttention:"توجہ درکار",newPurchase:"نئی خریداری",addPayment:"ریکوری شامل کریں",addClient:"کلائنٹ شامل کریں",addExpense:"خرچ شامل کریں",stockAdjustment:"اسٹاک ایڈجسٹمنٹ",viewReports:"رپورٹس دیکھیں",recentPurchases:"حالیہ خریداریاں",recentRecoveries:"حالیہ ریکوری",recentExpenses:"حالیہ اخراجات",alertsNotifications:"الرٹس اور اطلاعات",username:"صارف نام",password:"پاس ورڈ",welcomeBack:"خوش آمدید",signInAccount:"اپنے اکاؤنٹ میں سائن ان کریں",loginSubtitle:"ای آر پی ڈیش بورڈ تک رسائی کے لیے معلومات درج کریں۔",rememberMe:"مجھے یاد رکھیں",signIn:"محفوظ سائن ان",secureLogin:"محفوظ اور خفیہ تصدیق",invalidCredentials:"صارف نام یا پاس ورڈ غلط ہے۔"};
const urPages:Record<string,string>={
"Management Suite":"انتظامی نظام","No records found":"کوئی ریکارڈ نہیں ملا","Try changing the filters or add a new record.":"فلٹر تبدیل کریں یا نیا ریکارڈ شامل کریں۔","Unable to load data":"ڈیٹا لوڈ نہیں ہو سکا","Try again":"دوبارہ کوشش کریں","Delete record?":"ریکارڈ حذف کریں؟","This action cannot be undone.":"یہ عمل واپس نہیں کیا جا سکتا۔","Cancel":"منسوخ کریں","Delete":"حذف کریں","Print":"پرنٹ","CSV export":"CSV برآمد","Excel export":"Excel برآمد","PDF export":"PDF برآمد","of":"میں سے",
"Clients":"کلائنٹس","Manage customer accounts, credit and ledgers.":"خریداروں کے اکاؤنٹس، کریڈٹ اور کھاتے منظم کریں۔","Add Client":"کلائنٹ شامل کریں","Total Clients":"کل کلائنٹس","Active Accounts":"فعال اکاؤنٹس","Outstanding":"بقایا","Search clients...":"کلائنٹس تلاش کریں...","All statuses":"تمام حالتیں","Active":"فعال","Inactive":"غیر فعال","Client":"کلائنٹ","Phone":"فون","Address":"پتہ","Opening":"ابتدائی","Balance":"بیلنس","Credit limit":"کریڈٹ حد","Status":"حالت","Actions":"کارروائیاں","Edit client":"کلائنٹ میں ترمیم","Add client":"کلائنٹ شامل کریں","All financial amounts are in PKR.":"تمام مالی رقوم پاکستانی روپے میں ہیں۔","Full name":"پورا نام","Opening balance":"ابتدائی بیلنس","Notes":"نوٹس","Active account":"فعال اکاؤنٹ","Save client":"کلائنٹ محفوظ کریں","Complete client ledger":"مکمل کلائنٹ کھاتہ","Limit":"حد","Date":"تاریخ","Description":"تفصیل","Type":"قسم","Amount":"رقم","No phone":"فون نہیں","No address":"پتہ نہیں",
"Sorting / Purchase":"چھانٹی / خریداری","Record buyer purchases using client accounts and update inventory automatically.":"خریدار کے اکاؤنٹ سے فروخت درج کریں اور انوینٹری خودکار کم کریں۔","Today's lots":"آج کی لاٹس","Purchase value":"خریداری کی قیمت","Completed":"مکمل","Buyer purchase information":"خریدار کی خریداری کی معلومات","Buyer / client":"خریدار / کلائنٹ","Select buyer from clients":"کلائنٹس میں سے خریدار منتخب کریں","Purchase date":"خریداری کی تاریخ","Vehicle number":"گاڑی نمبر","Reference number":"حوالہ نمبر","Products":"مصنوعات","Choose an inventory product or type a new product name.":"انوینٹری سے مصنوعات منتخب کریں یا نیا نام لکھیں۔","Add row":"قطار شامل کریں","Grand total":"کل رقم","Complete purchase":"خریداری مکمل کریں","Search buyer purchase history...":"خریدار کی خریداری تلاش کریں...","Reference":"حوالہ","Vehicle":"گاڑی","Total":"کل","Product":"مصنوعات","Quantity":"مقدار","Unit":"اکائی","Rate (PKR)":"ریٹ (روپے)","Line total":"قطار کا کل","Available":"دستیاب","Select or type product name":"مصنوعات منتخب کریں یا نام لکھیں","No inventory match. Continue typing to use a custom product.":"انوینٹری میں مماثلت نہیں؛ نیا نام لکھنا جاری رکھیں۔","Reduce the highlighted quantity to the available stock range before completing.":"مکمل کرنے سے پہلے مقدار دستیاب اسٹاک تک کم کریں۔",
"Recovery Book":"ریکوری بک","Daily buyer recovery workspace":"روزانہ خریدار ریکوری ورک اسپیس","Daily buyer purchases, collections and outstanding balances":"خریداروں کی روزانہ خریداری، وصولیاں اور بقایا جات","Business date":"کاروباری تاریخ","Find buyer":"خریدار تلاش کریں","Search by buyer name or phone...":"خریدار کے نام یا فون سے تلاش کریں...","Clear":"صاف کریں","Previous day":"پچھلا دن","Next day":"اگلا دن"," buyers":" خریدار","Previous debit":"پچھلا ڈیبٹ","Today's purchase":"آج کی خریداری","Today’s purchase":"آج کی خریداری","Collected":"وصول شدہ","Credit / Paid":"کریڈٹ / ادا شدہ","Remaining":"بقایا","Buyer Recovery — ":"خریدار ریکوری — ","Use Full to fill the complete remaining balance, then select Add.":"مکمل بقایا رقم درج کرنے کے لیے مکمل دبائیں، پھر شامل کریں منتخب کریں۔","Debit (Previous)":"پچھلا ڈیبٹ","Today’s Purchase":"آج کی خریداری","Add Payment":"ادائیگی شامل کریں","Add payment":"ادائیگی شامل کریں","Full":"مکمل","Add":"شامل کریں","Settled":"تصفیہ شدہ","Due":"واجب الادا","Purchase":"خریداری","Paid":"ادا شدہ","Previous ":"پچھلا ","TOTAL":"کل","No buyer found":"کوئی خریدار نہیں ملا","Change the search text or add a buyer from Clients.":"تلاش کا متن تبدیل کریں یا کلائنٹس میں نیا خریدار شامل کریں۔","No buyers found for this date.":"اس تاریخ کے لیے کوئی خریدار نہیں ملا۔",
"Inventory":"انوینٹری","Manage stock levels, rates and reorder thresholds.":"اسٹاک، ریٹس اور دوبارہ آرڈر کی حد منظم کریں۔","Add item":"آئٹم شامل کریں","Stock value":"اسٹاک کی قیمت","Low stock":"کم اسٹاک","Search inventory...":"انوینٹری تلاش کریں...","All categories":"تمام اقسام","Item":"آئٹم","Category":"قسم","Current stock":"موجودہ اسٹاک","Minimum stock":"کم از کم اسٹاک","Purchase rate":"خریداری ریٹ","Value":"قیمت","In stock":"اسٹاک میں","Adjust":"ایڈجسٹ","Add inventory item":"انوینٹری آئٹم شامل کریں","Edit inventory item":"انوینٹری آئٹم میں ترمیم","Name":"نام","Save item":"آئٹم محفوظ کریں","Update stock":"اسٹاک اپ ڈیٹ کریں",
"Expenses":"اخراجات","Record operating costs and payment methods.":"کاروباری اخراجات اور ادائیگی کے طریقے درج کریں۔","Today":"آج","This month":"اس ماہ","All recorded":"تمام ریکارڈ","Search expenses...":"اخراجات تلاش کریں...","Expense":"خرچ","Paid to":"ادا کیا گیا","Method":"طریقہ","Edit expense":"خرچ میں ترمیم","Add expense":"خرچ شامل کریں","Title":"عنوان","Amount (PKR)":"رقم (روپے)","Payment method":"ادائیگی کا طریقہ","Cash":"نقد","Bank transfer":"بینک ٹرانسفر","Cheque":"چیک","Mobile wallet":"موبائل والٹ","Save expense":"خرچ محفوظ کریں","Select or type expense category":"خرچ کی قسم منتخب کریں یا لکھیں","No matching category. Continue typing to use your custom category.":"مماثل قسم نہیں؛ اپنی قسم لکھنا جاری رکھیں۔",
"Reports":"رپورٹس","Financial and operational insights for better mandi decisions.":"بہتر منڈی فیصلوں کے لیے مالی اور کاروباری معلومات۔","Open report":"رپورٹ کھولیں","Purchase Report":"خریداری رپورٹ","Recovery Report":"ریکوری رپورٹ","Client Ledger":"کلائنٹ کھاتہ","Outstanding Report":"بقایا رپورٹ","Inventory Report":"انوینٹری رپورٹ","Expense Report":"اخراجات رپورٹ","Daily Summary":"روزانہ خلاصہ","Monthly Summary":"ماہانہ خلاصہ","Clear filters":"فلٹر صاف کریں","Total value":"کل قیمت","Records":"ریکارڈز","Average":"اوسط","Performance":"کارکردگی",
"Users & Roles":"صارفین اور کردار","ERP access and responsibility assignments.":"ERP رسائی اور ذمہ داریوں کی تقسیم۔","Total users":"کل صارفین","Administrators":"منتظمین","Active roles":"فعال کردار","User":"صارف","Email":"ای میل","Role":"کردار","Language":"زبان","Settings":"ترتیبات","Configure the ERP workspace.":"ERP ورک اسپیس ترتیب دیں۔","Business profile":"کاروباری پروفائل","Receipt and report defaults.":"رسید اور رپورٹ کی طے شدہ ترتیبات۔","Business name":"کاروباری نام","Market address":"منڈی کا پتہ","Currency":"کرنسی","Default unit":"طے شدہ اکائی","Save settings":"ترتیبات محفوظ کریں","Help & Support":"مدد اور معاونت","Need assistance?":"مدد چاہیے؟"
};
urPages["Name in Urdu"]="اردو میں نام";
Object.assign(urPages,{
 "buyers":"خریدار",
 "Buyer Recovery":"خریدار ریکوری",
 "Previous":"پچھلا",
 "Payment for":"ادائیگی برائے",
 "Recovery payment added":"ریکوری کی ادائیگی شامل کر دی گئی",
 "Enter a valid payment amount":"درست ادائیگی کی رقم درج کریں",
 "Payment cannot exceed":"ادائیگی اس رقم سے زیادہ نہیں ہو سکتی",
 "Buyer purchase and payment history":"خریدار کی خریداری اور ادائیگی کی تفصیل",
 "Choose a date to view purchases, payments and balance.":"خریداری، ادائیگی اور بقایا دیکھنے کے لیے تاریخ منتخب کریں۔",
 "History date":"تفصیل کی تاریخ",
 "Previous balance":"پچھلا بقایا",
 "Purchased on date":"اس تاریخ کی خریداری",
 "Paid on date":"اس تاریخ کی ادائیگی",
 "Remaining balance":"باقی بقایا",
 "No purchases found for this buyer on the selected date.":"منتخب تاریخ پر اس خریدار کی کوئی خریداری نہیں ملی۔"
 ,"Open history":"تفصیل کھولیں"
 ,"Buyer account history":"خریدار کے کھاتے کی تفصیل"
 ,"Select history range":"تفصیل کی مدت منتخب کریں"
 ,"Choose any period to review purchases, payments and running balance.":"خریداری، ادائیگی اور چلتا ہوا بقایا دیکھنے کے لیے کوئی بھی مدت منتخب کریں۔"
 ,"Opening balance":"ابتدائی بقایا"
 ,"Total purchases":"کل خریداری"
 ,"Total paid":"کل ادا شدہ"
 ,"Closing balance":"اختتامی بقایا"
 ,"Daily account summary":"روزانہ کھاتے کا خلاصہ"
 ,"Products purchased":"خریدی گئی اشیاء"
 ,"No activity found in this date range.":"اس مدت میں کوئی سرگرمی نہیں ملی۔"
 ,"No purchases found in this date range.":"اس مدت میں کوئی خریداری نہیں ملی۔"
 ,"Statement period":"تفصیل کی مدت"
 ,"Close":"بند کریں"
 ,"Print statement":"تفصیل پرنٹ کریں","Send on WhatsApp":"واٹس ایپ پر بھیجیں","Send text":"متن بھیجیں","Share bill image":"بل کی تصویر شیئر کریں","A valid buyer phone number is required":"خریدار کا درست فون نمبر ضروری ہے","Unable to create bill image":"بل کی تصویر نہیں بن سکی","Unable to share bill image":"بل کی تصویر شیئر نہیں ہو سکی","Bill image downloaded. Attach it in WhatsApp.":"بل کی تصویر ڈاؤن لوڈ ہو گئی۔ اسے واٹس ایپ میں منسلک کریں۔"
 ,"Customer statement":"خریدار کے کھاتے کی تفصیل"
 ,"View account activity":"کھاتے کی سرگرمی دیکھیں"
 ,"Review purchases and payments for one day.":"ایک دن کی خریداری اور ادائیگیاں دیکھیں۔"
 ,"Compare activity across a custom date range.":"اپنی منتخب مدت کی سرگرمی کا جائزہ لیں۔"
 ,"Single day":"ایک دن"
 ,"Date range":"تاریخوں کی مدت"
 ,"Select date":"تاریخ منتخب کریں"
 ,"Select range":"مدت منتخب کریں"
 });
Object.assign(urPages,{
 "Pakistan produce business platform":"پاکستانی اجناس کا کاروباری پلیٹ فارم",
 "Fresh produce.":"تازہ اجناس۔","Clear business control.":"کاروبار پر مکمل کنٹرول۔",
 "Manage purchases, recovery, inventory and expenses from one secure Sabzi Mandi workspace.":"خریداری، ریکوری، انوینٹری اور اخراجات ایک محفوظ سبزی منڈی نظام سے چلائیں۔",
 "Business access":"کاروباری رسائی","Ledger clarity":"شفاف کھاتہ","Local accounting":"مقامی حساب کتاب",
 "Secure ERP access · Business data remains protected":"محفوظ ای آر پی رسائی · کاروباری ڈیٹا محفوظ رہتا ہے",
 "English":"انگریزی","Toggle password visibility":"پاس ورڈ دکھائیں یا چھپائیں","Toggle theme":"تھیم تبدیل کریں",
 "Dashboard date":"ڈیش بورڈ کی تاریخ","Summarize":"خلاصہ دیکھیں","Business Performance":"کاروباری کارکردگی",
 "Performance report":"کارکردگی رپورٹ","Choose your reporting period":"رپورٹ کی مدت منتخب کریں",
 "Debit / Bills":"ڈیبٹ / بل","Recovery":"ریکوری","Cash in Hand":"دستی نقدی",
 "Daily Cash Movement":"روزانہ نقدی کی نقل و حرکت","Recovery compared with operating expenses":"ریکوری کا کاروباری اخراجات سے موازنہ",
 "Expense Breakdown":"اخراجات کی تفصیل","Where money was spent":"رقم کہاں خرچ ہوئی","Total expenses":"کل اخراجات",
 "Business Health":"کاروباری حالت","Key indicators for the selected range":"منتخب مدت کے اہم اشاریے",
 "Collection Rate":"وصولی کی شرح","Closing Inventory":"اختتامی انوینٹری","Profit Margin":"منافع کی شرح","Loss Margin":"نقصان کی شرح",
 "Positive cash result":"مثبت نقد نتیجہ","Negative cash result":"منفی نقد نتیجہ",
 "Quick actions":"فوری کارروائیاں","Create entries and open daily workflows":"اندراج کریں اور روزانہ کے کام کھولیں",
 "Create produce lot":"اجناس کی لاٹ بنائیں","Record client cash":"کلائنٹ کی رقم درج کریں","Open new account":"نیا اکاؤنٹ کھولیں",
 "Record operating cost":"کاروباری خرچ درج کریں","Correct stock level":"اسٹاک کی مقدار درست کریں","Analyze performance":"کارکردگی کا تجزیہ کریں",
 "Purchase activity":"خریداری کی سرگرمی","Explore buyer transactions and products sold.":"خریدار کے لین دین اور فروخت شدہ اشیاء دیکھیں۔",
 "Selected date":"منتخب تاریخ","All history":"تمام سابقہ ریکارڈ","Find a buyer...":"خریدار تلاش کریں...",
 "Buyers":"خریدار","Combined value":"مجموعی قیمت","Complete purchase details":"خریداری کی مکمل تفصیل",
 "transaction":"لین دین","transactions":"لین دین","product":"شے","products":"اشیاء","Mixed":"مخلوط",
 "No purchase activity found":"خریداری کی کوئی سرگرمی نہیں ملی","No purchases were recorded on the selected date.":"منتخب تاریخ پر کوئی خریداری درج نہیں ہوئی۔",
 "Try a different buyer name.":"خریدار کا دوسرا نام آزمائیں۔","Open product list":"اشیاء کی فہرست کھولیں",
 "Use a value from":"اس مقدار سے استعمال کریں","to":"تا","available":"دستیاب",
 "Inventory items":"انوینٹری اشیاء","Monitor stock, valuation and reorder thresholds.":"اسٹاک، قیمت اور دوبارہ آرڈر کی حدود دیکھیں۔",
 "Search stock...":"اسٹاک تلاش کریں...","Current":"موجودہ","Minimum":"کم از کم","Rate":"ریٹ",
 "Update":"تبدیل کریں","Update item":"آئٹم تبدیل کریں","Delete item":"آئٹم حذف کریں","Urdu name":"اردو نام",
 "Current stock":"موجودہ اسٹاک","Minimum stock":"کم از کم اسٹاک","Active inventory item":"فعال انوینٹری آئٹم",
 "Inventory item updated":"انوینٹری آئٹم تبدیل ہو گیا","Inventory item added":"انوینٹری آئٹم شامل ہو گیا",
 "Daily operating costs and payments.":"روزانہ کاروباری اخراجات اور ادائیگیاں۔",
 "Expense date":"خرچ کی تاریخ","Payee":"وصول کنندہ","Add Expense":"خرچ شامل کریں",
 "No expenses found":"کوئی خرچ نہیں ملا","Expense updated":"خرچ تبدیل ہو گیا","Expense added":"خرچ شامل ہو گیا",
 "Financial and operational insights for better mandi decisions.":"بہتر منڈی فیصلوں کے لیے مالی اور کاروباری معلومات۔",
 "Purchase report":"خریداری رپورٹ","Recovery report":"ریکوری رپورٹ","Client ledger":"کلائنٹ کھاتہ",
 "Outstanding report":"بقایا رپورٹ","Inventory report":"انوینٹری رپورٹ","Expense report":"اخراجات رپورٹ",
 "Daily summary":"روزانہ خلاصہ","Monthly summary":"ماہانہ خلاصہ","Open report":"رپورٹ کھولیں",
 "All reports":"تمام رپورٹس","How to use:":"استعمال کا طریقہ:","Search records":"ریکارڈ تلاش کریں",
 "Search name, category or status...":"نام، قسم یا حالت تلاش کریں...","Report period":"رپورٹ کی مدت",
 "Quick period:":"فوری مدت:","Last 7 days":"گزشتہ 7 دن","Activity overview":"سرگرمی کا جائزہ",
 "Value grouped across the latest visible records.":"نظر آنے والے تازہ ریکارڈز کے مطابق مجموعی قیمت۔",
 "Detailed records":"تفصیلی ریکارڈ","Current position":"موجودہ صورتحال","Category / Detail":"قسم / تفصیل",
 "Status / Reference":"حالت / حوالہ","No matching report data":"متعلقہ رپورٹ ڈیٹا نہیں ملا",
 "Try another date period or clear the search text.":"دوسری مدت منتخب کریں یا تلاش صاف کریں۔",
 "ERP access and responsibility assignments.":"ای آر پی رسائی اور ذمہ داریوں کی تقسیم۔",
 "Total users":"کل صارفین","Administrators":"منتظمین","Active roles":"فعال کردار",
 "Configure the ERP workspace.":"ای آر پی نظام کی ترتیب کریں۔","Business profile":"کاروباری پروفائل",
 "Receipt and report defaults.":"رسید اور رپورٹ کی بنیادی ترتیبات۔","Business name":"کاروبار کا نام",
 "Market address":"منڈی کا پتہ","Currency":"کرنسی","Default unit":"بنیادی اکائی","Save settings":"ترتیبات محفوظ کریں",
 "Need assistance?":"مدد درکار ہے؟","Contact your system administrator for account, data or access support.":"اکاؤنٹ، ڈیٹا یا رسائی کی مدد کے لیے نظام کے منتظم سے رابطہ کریں۔",
 "Print data":"ڈیٹا پرنٹ کریں","Print / Save PDF":"پرنٹ / پی ڈی ایف محفوظ کریں","Close":"بند کریں",
 "No phone":"فون موجود نہیں","No address":"پتہ موجود نہیں","No notes":"کوئی نوٹ نہیں",
 "Update client":"کلائنٹ تبدیل کریں","Client updated":"کلائنٹ تبدیل ہو گیا","Client added":"کلائنٹ شامل ہو گیا",
 "View":"دیکھیں","Edit":"ترمیم","Save":"محفوظ کریں","Search...":"تلاش کریں..."
 ,"Choose the question you want to answer":"وہ سوال منتخب کریں جس کا جواب آپ چاہتے ہیں"
 ,"Each report includes filters, summary totals, charts, detailed records and export options.":"ہر رپورٹ میں فلٹر، مجموعی خلاصہ، چارٹس، تفصیلی ریکارڈ اور برآمد کے اختیارات شامل ہیں۔"
 ,"Review buyer purchases, invoices and product value.":"خریدار کی خریداری، بل اور اشیاء کی قیمت دیکھیں۔"
 ,"Track collections and see who paid during a period.":"مدت کے دوران وصولیاں اور ادائیگی کرنے والے خریدار دیکھیں۔"
 ,"Inspect account debits, credits and running activity.":"اکاؤنٹ کے ڈیبٹ، کریڈٹ اور جاری سرگرمی دیکھیں۔"
 ,"Identify buyers with unpaid balances and credit exposure.":"غیر ادا شدہ بقایا اور کریڈٹ والے خریدار شناخت کریں۔"
 ,"Understand stock value and items requiring attention.":"اسٹاک کی قیمت اور توجہ طلب اشیاء دیکھیں۔"
 ,"Analyze operating costs by category, date and payee.":"قسم، تاریخ اور وصول کنندہ کے لحاظ سے اخراجات کا تجزیہ کریں۔"
 ,"See purchases, recoveries and expenses for one day.":"ایک دن کی خریداری، ریکوری اور اخراجات دیکھیں۔"
 ,"Review this month’s financial and operational activity.":"اس ماہ کی مالی اور کاروباری سرگرمی دیکھیں۔"
 ,"Invoices · products · value":"بل · اشیاء · قیمت","Payments · buyers · dates":"ادائیگیاں · خریدار · تاریخیں"
 ,"Debits · credits · accounts":"ڈیبٹ · کریڈٹ · اکاؤنٹس","Balances · limits · status":"بقایا · حدود · حالت"
 ,"Stock · valuation · alerts":"اسٹاک · قیمت · انتباہات","Costs · categories · methods":"اخراجات · اقسام · طریقے"
 ,"Today · cash flow · activity":"آج · نقد بہاؤ · سرگرمی","Trends · totals · performance":"رجحانات · کل · کارکردگی"
 ,"Guidance for your Sabzi Mandi ERP workspace.":"سبزی منڈی ای آر پی کے استعمال کی رہنمائی۔"
 ,"Contact your ERP administrator for account access, data corrections, or operational support.":"اکاؤنٹ رسائی، ڈیٹا کی درستگی یا کاروباری مدد کے لیے ای آر پی منتظم سے رابطہ کریں۔"
 ,"No contact":"رابطہ موجود نہیں","Settings saved locally":"ترتیبات مقامی طور پر محفوظ ہو گئیں"
 ,"PKR — Pakistani Rupee":"پاکستانی روپیہ","crate":"کریٹ","bag":"بوری","piece":"عدد"
 ,"General":"عام","Labour / Wages":"مزدوری / اجرت","Loading / Unloading":"لوڈنگ / اَن لوڈنگ"
 ,"Transport / Freight":"ٹرانسپورٹ / مال برداری","Market Fee":"منڈی فیس","Commission":"کمیشن","Rent":"کرایہ"
 ,"Electricity / Utilities":"بجلی / یوٹیلیٹیز","Fuel":"ایندھن","Repairs / Maintenance":"مرمت / دیکھ بھال"
 ,"Packaging":"پیکنگ","Food / Refreshment":"کھانا / تواضع","Office Supplies":"دفتری سامان","Salaries":"تنخواہیں"
 ,"Taxes / Government Fee":"ٹیکس / سرکاری فیس","Cleaning":"صفائی","Security":"سیکیورٹی","Bank Charges":"بینک چارجز"
 ,"Miscellaneous":"متفرق","Expense deleted":"خرچ حذف ہو گیا","No expenses for this day":"اس دن کوئی خرچ نہیں"
 ,"Choose another date or add today’s first expense.":"دوسری تاریخ منتخب کریں یا آج کا پہلا خرچ شامل کریں۔"
 ,"Delete expense":"خرچ حذف کریں","No matching category. Continue typing to use your custom category.":"مماثل قسم نہیں ملی؛ اپنی قسم لکھنا جاری رکھیں۔"
 ,"Notifications":"اطلاعات","Search pages":"صفحات تلاش کریں","Open an ERP module quickly":"ای آر پی کا حصہ فوراً کھولیں"
 ,"No matching page found":"متعلقہ صفحہ نہیں ملا","Low stock needs attention":"کم اسٹاک پر توجہ درکار ہے"
 ,"Everything looks good":"سب کچھ درست ہے","No notifications":"کوئی اطلاع نہیں","remaining":"باقی","Vendors":"سپلائرز"
 });
const lang=localStorage.getItem("lang")||"en";void i18n.use(initReactI18next).init({resources:{en:{translation:en},ur:{translation:{...ur,...urPages}}},lng:lang,fallbackLng:"en",interpolation:{escapeValue:false}});document.documentElement.dir=lang==="ur"?"rtl":"ltr";document.documentElement.lang=lang;export default i18n;
