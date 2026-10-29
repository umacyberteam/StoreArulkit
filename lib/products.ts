export type Product = {
  id:string; title:string; category:string; description:string; price:number;
  oldPrice?:number; badge?:string; icon:"code"|"bot"|"search"|"terminal";
  version:string; fileSize:string; featured?:boolean;
};
export const products:Product[] = [
 {id:"web-starter",title:"Website Starter Kit",category:"Website & Template",description:"Fondasi website modern dengan halaman responsif dan struktur kode yang rapi.",price:25000,oldPrice:35000,badge:"BEST SELLER",icon:"code",version:"1.0.0",fileSize:"2.4 MB",featured:true},
 {id:"telegram-bot",title:"Telegram Bot Starter",category:"Bot & Automation",description:"Kerangka bot Telegram dengan command handler dan konfigurasi environment.",price:30000,badge:"SOURCE CODE",icon:"bot",version:"1.2.0",fileSize:"1.8 MB",featured:true},
 {id:"wa-bot-kit",title:"WhatsApp Bot Toolkit",category:"Bot & Automation",description:"Struktur proyek bot WhatsApp untuk eksperimen dan pengembangan lanjutan.",price:45000,icon:"bot",version:"1.0.0",fileSize:"3.1 MB",featured:true},
 {id:"scraper-kit",title:"Web Scraper Toolkit",category:"Scraper & Tools",description:"Contoh utilitas pengambilan data publik yang diizinkan, plus dokumentasi konfigurasi.",price:35000,icon:"search",version:"1.0.0",fileSize:"1.2 MB",featured:true},
 {id:"api-dashboard",title:"API Dashboard UI",category:"Website & Template",description:"Antarmuka dashboard API dengan komponen statistik dan tampilan mobile.",price:20000,icon:"terminal",version:"1.0.0",fileSize:"1.6 MB"},
 {id:"automation-pack",title:"Automation Scripts Pack",category:"Scraper & Tools",description:"Kumpulan contoh skrip otomasi untuk workflow pengembangan yang sah.",price:15000,icon:"code",version:"1.0.0",fileSize:"900 KB"}
];
export const formatIDR=(n:number)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n);
