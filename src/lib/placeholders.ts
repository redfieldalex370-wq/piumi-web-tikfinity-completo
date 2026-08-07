import type { CommissionType, PortfolioItem } from "@/types/commission";

export const PLACEHOLDER_COMMISSION_TYPES: CommissionType[] = [
  { id:"placeholder-icon-sketch",category:"Icon",style:"Sketch",name:"Icon · Sketch",description:"Retrato compacto en boceto.",price_from:100,price_to:null,currency:"MXN",image_url:"/gallery/icon.webp",sort_order:10,active:true },
  { id:"placeholder-icon-color",category:"Icon",style:"Full color",name:"Icon · Full color",description:"Icon terminado a color.",price_from:300,price_to:null,currency:"MXN",image_url:"/gallery/icon.webp",sort_order:20,active:true },
  { id:"placeholder-half-color",category:"Half Body",style:"Full color",name:"Half Body · Full color",description:"Medio cuerpo terminado a color.",price_from:400,price_to:null,currency:"MXN",image_url:"/gallery/half-body.webp",sort_order:30,active:true },
  { id:"placeholder-full-color",category:"Full Body",style:"Full color",name:"Full Body · Full color",description:"Cuerpo completo terminado a color.",price_from:500,price_to:null,currency:"MXN",image_url:"/gallery/full-body.webp",sort_order:40,active:true },
  { id:"placeholder-animation",category:"Animación",style:"Loop sencillo",name:"Animación · Loop sencillo",description:"Movimiento corto de 3 a 5 segundos.",price_from:350,price_to:500,currency:"MXN",image_url:"/gallery/twitch-emotes.webp",sort_order:50,active:true },
];

export const PLACEHOLDER_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {id:"placeholder-icon",title:"Icons",description:"Ejemplo de comisión tipo icon.",image_url:"/gallery/icon.webp",thumbnail_url:"/gallery/icon.webp",artist_name:null,artist_url:null,featured:true,sort_order:1,active:true,tags:["Icon","Full color"]},
  {id:"placeholder-half",title:"Half Body",description:"Ejemplo de medio cuerpo.",image_url:"/gallery/half-body.webp",thumbnail_url:"/gallery/half-body.webp",artist_name:null,artist_url:null,featured:false,sort_order:2,active:true,tags:["Half Body","Full color"]},
  {id:"placeholder-full",title:"Full Body",description:"Ejemplo de cuerpo completo.",image_url:"/gallery/full-body.webp",thumbnail_url:"/gallery/full-body.webp",artist_name:null,artist_url:null,featured:false,sort_order:3,active:true,tags:["Full Body","Full color"]},
  {id:"placeholder-emotes",title:"Emotes",description:"Set de emotes para stream.",image_url:"/gallery/twitch-emotes.webp",thumbnail_url:"/gallery/twitch-emotes.webp",artist_name:null,artist_url:null,featured:false,sort_order:4,active:true,tags:["Icon","VTuber"]},
  {id:"placeholder-banner",title:"Banner",description:"Pantalla para stream.",image_url:"/gallery/twitch-banner.webp",thumbnail_url:"/gallery/twitch-banner.webp",artist_name:null,artist_url:null,featured:false,sort_order:5,active:true,tags:["VTuber"]},
  {id:"placeholder-extra",title:"Comisión",description:"Otro ejemplo de trabajo terminado.",image_url:"/gallery/ejemplo-extra.webp",thumbnail_url:"/gallery/ejemplo-extra.webp",artist_name:null,artist_url:null,featured:false,sort_order:6,active:true,tags:["Full color"]},
];
