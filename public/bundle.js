(()=>{"use strict";const t="gift finder docs event",e="Terms & Conditions",s=t=>"#initiative "+t;class a extends class{constructor(t,e){var a;this.timeInterval=0,this.isMobile=navigator.userAgent.toLowerCase().includes("mobi"),this.remoteData=t,this.currency=this.remoteData.config.currency,this.config=this.remoteData.config,this.domain=null===(a=this.remoteData.config)||void 0===a?void 0:a.domain,this.fbox=e,this.el=(t,e)=>e?e.querySelector(s(t)):document.querySelector(s(t)),this.all=(t,e)=>e?e.querySelectorAll(s(t)):document.querySelectorAll(s(t)),this.pad=t=>1==t.toString().length?"0"+t:t,this.skuRow=t=>this.el((t=>'.-sku_row[data-time="'+t+'"]')(t)),this.tab=t=>this.el((t=>'.-tab[data-time="'+t+'"]')(t)),this.live=(t,e)=>t.forEach((t=>t.classList[e]("-live"))),this.skuID=t=>t.name+"-"+ +new Date(t.time),this.capitalize=t=>t[0].toUpperCase()+t.slice(1),this.digit=(t,e)=>0!==t?this.pad(t)+e:"",this.isATab=t=>t.classList.contains("-tab"),this.midnight=t=>+new Date(t).setHours(0,0,0,0)}times(t){const e=t.map((t=>this.midnight(t.time)));return Array.from(new Set(e)).sort(((t,e)=>t-e))}timeUnits(t){const e=new Date(t);return{day:e.getDay(),month:e.getMonth(),date:e.getDate(),hour:e.getHours(),mins:e.getMinutes()}}twelveHrFormat(t,e){return 12===t?`${this.pad(t)}:${this.pad(e)}pm`:t>12?`${this.pad(t-12)}:${this.pad(e)}pm`:0===t?`12:${this.pad(e)}am`:`${this.pad(t)}:${this.pad(e)}am`}dayDiff(t){const e=new Date(t).getDate();return(new Date).getDate()-e}sameMonth(t){return new Date(t).getMonth()===(new Date).getMonth()}date(t){const e=this.dayDiff(t);return 0===e&&this.sameMonth(t)?this.capitalize("today"):1===e&&this.sameMonth(t)?this.capitalize("yesterday"):-1===e&&this.sameMonth(t)?this.capitalize("tomorrow"):this.fullDate(t)}fullDate(t){const e=new Date(t),s=e.toLocaleDateString("en-US",{month:"short"});return`${e.toLocaleDateString("en-US",{weekday:"short"})} ${s} ${e.getDate()}`}toggle(t,e,s){t.forEach((t=>t.classList.remove(s))),e.classList.add(s)}price(t){const e=this.numFromStr(t);return`${this.currency} ${Number(e).toLocaleString()}`}numFromStr(t){const e=t.match(/\d/g);return e?e.join(""):0}formatPrice(t){const e=t.split(" "),s=Number(e[1].replace("₦",""));return isNaN(s)?t:"prefix"===this.config.currencyPosition?`Below ${this.currency} ${s.toLocaleString()}`:`Below ${s.toLocaleString()} ${this.currency}`}discount(t,e){const s=100*(Number(t)-Number(e))/Number(t);return isNaN(s)?"":`-${Math.round(s)}%`}replacePattern(t,e){const s=new RegExp(t,"g");return e.replace(s,"-")}id(t,e){const s=this.replacePattern("'",t),a=this.replacePattern("&",s);return this.replacePattern("%",a).toLowerCase().split(" ").join(e)}key(t,e){return t}timeFormat(t){const e=this.timeUnits(t),s=this.twelveHrFormat(e.hour,e.mins);return`${this.date(t)}'s ${s} sale`}show(){let t=new this.fbox.ImageObserver;return console.log("featurebox is",this.fbox),t=null,this}platform(){const t="ontouchstart"in window,e=this.config.mobileAppBanner,s=this.config.desktopBanner;return{banner:t?e:s}}}{constructor(t,e){super(t,e),this.tandcs=t.about,this.superblocks=t.superblocks,this.superblockMap=void 0,this.tandcsEl=this.el(".-re.-rules"),this.hiwCTA=this.el(".-how-it-works"),this.topBanner=this.el(".-banner.-top"),this.mainEl=this.el(".-main-el"),this.hiwCTA.addEventListener("click",this.toggleBanner.bind(this)),this.fbox.pubsub.subscribe("reset",this.init.bind(this)),this.init().setBanner().displayTAndCs().show().listeners()}init(){const t=[...this.superblocks].sort((()=>Math.random()-.5));return this.mainEl.innerHTML=t.map(this.buildSuperblock.bind(this)).join(""),this}listeners(){this.mainEl.addEventListener("click",this.handleClick.bind(this))}handleClick(t){const e=t.target;switch(e.getAttribute("data-type")){case"category":const t=e.getAttribute("data-category"),s=e.getAttribute("data-superblock");this.superblockMap=this.superblocks.find((t=>t.name===s)),this.updateProductFloor(t);break;case"dir-btn":const a=e.getAttribute("data-dir"),i=e.parentElement,r=this.el(".-product-scrollable",i).parentElement;console.log("scrollable",r,"direction",a),"next"===a?this.scrollTonext(r):this.scrollToprev(r);break;case"see all":const o=e.getAttribute("data-href");location.href=o}}scrollTonext(t){var e=t.scrollLeft+80,s=t.scrollLeft+300-e;t.scrollLeft=e+1*s}scrollToprev(t){var e=t.scrollLeft-80,s=t.scrollLeft-300-e;t.scrollLeft=e+1*s}buildSuperblock(t){let e=`<div class="-superblock" data-name="${t.name}">`;const s=`<div class="-title" style="background-color: ${t.lightShade};">${t.name}</div>`,a=this.buildFreelinks(t.categories,t),i=this.buildProductFloor(t);return e+=t.categories.length>=1?s:"",e+=a,e+=i,e+="</div>",t.skus.length>=7?e:""}updateProductFloor(t){var e,s;const a=this.el(`.-superblock[data-name="${null===(e=this.superblockMap)||void 0===e?void 0:e.name}"]`),i=this.el(".-productfloor",a),r=this.el(".-productfloor .-title",a),o=this.el(".-see-all-clickable",a),l=null===(s=this.superblockMap)||void 0===s?void 0:s.categories.find((e=>e.name===t));r.innerHTML=`<div class="-title-name">${t}</div><div class="-title-desc">${null==l?void 0:l.price_point}</div>`,o.setAttribute("data-href",null==l?void 0:l.url),this.el(".-skus.-actual",i).innerHTML=`<div class="-product-scrollable">${null==l?void 0:l.skus.slice(0,16).map(this.skuHtml.bind(this)).join("")}</div>`,this.show()}buildFreelinks(t,e){let s='<div class="-cats -posrel -single">';const a=t.map((t=>this.catHtml(t,e))).join("");return s+=t.length>0?`<div class="-scrollable">${a}</div>`:"",s+="</div>",s}catHtml(t,e){return this.superblockMap=e,`<div class="-cat -posrel" data-category="${t.name}" data-url="${t.url}" style="background-color: ${e.lightShade}"><span class="-posabs -preloader -loading"></span><div class="-clickable -posabs" data-type="category" data-superblock="${e.name}"  data-category="${t.name}"></div><span class="-posabs -preloader -loading" data-type="category"></span><img class="lazy-image" data-src="${t.image}" alt="${t.name}" /><div class="-posabs -name"><div class="-txt -posabs -name-el">${t.name}</div><div class="-bg -posabs -name-el" style="background-color:${e.darkShade}dd;color:white"></div></div><div class="-price-point">${this.formatPrice(t.price_point)}</div></div>`}buildProductFloor(t){const e=this.isMobile?"":'<div class="-control -prev -posabs" data-dir="prev" data-type="dir-btn"><span class="-posabs -preloader -loading"></span></div><div class="-control -next -posabs"  data-type="dir-btn" data-dir="next"><span class="-posabs -preloader -loading"></span></div>';let s=`<div class="-productfloor active -posrel" data-name="${t.name}">${e}`;return s+=`<div class="-head" style="background-color:${t.lightShade}"><div class="-title"><div class="-title-name">${t.name}</div><div class="-title-desc">top deals</div></div><div class="-see-all"><span class="-see-all-clickable"  data-href="${t.url}" data-type="see all"></span><span class="-txt">See all</span><span class="-arrow" style="border: 2px solid black"></span></div></div>`,s+=`<div class="-skus -actual"><div class="-product-scrollable">${t.skus.slice(0,16).map(this.skuHtml.bind(this)).join("")}</div></div>`,s+="</div>",s}skuHtml(t){const{sku:e,displayName:s,url:a,prices:{oldPrice:i,price:r,discount:o},image:l}=t;return`\n    <a href="${a}" data-sku="${e}" class="-posrel -sku"><div class="-img -posrel"><span class="-posabs -preloader -loading"></span><img class="lazy-image" data-src="${l}" alt="${s}"/></div>${o?`<div class="-discount -posabs">${o}</div>`:""} <div class="-details"><div class="-name">${s}</div><div class="-newPrice">${r}</div>${o?`<div class="-oldPrice">${i}</div>`:""}</div></a>\n    `}toggleBanner(){this.topBanner.classList.toggle("-show");const t=this.hiwCTA.querySelector(".-txt");t.textContent=(null==t?void 0:t.textContent)===e?"Close":e}setBanner(){return this.el(".-banner.-top img.lazy-image").setAttribute("data-src",this.platform().banner),this}displayTAndCs(){return this.tandcsEl.innerHTML=this.tandcs.map(this.tandcHTML.bind(this)).join(""),this}tandcHTML(t){return`<div class="-rule_element"><div class="-vatop -num">${t.num}</div><div class="-vatop -desc"><div class="-question">${t.question}</div><div class="-answer">${t.answer}</div></div></div>`}}const i=window.Featurebox({config:{apiKey:"AIzaSyAA8dQEt-yZnDyY3Lra8lndRJ3LWNYVW0o",authDomain:"jumia-c15a3.firebaseapp.com",databaseURL:"https://jumia-c15a3.firebaseio.com",projectId:"jumia-c15a3",storageBucket:"jumia-c15a3.appspot.com",messagingSenderId:"295115190934",appId:"1:295115190934:web:de0b33b53a514c3c"}},"about");new i.Database({apiKey:"AIzaSyCKGQw8QCq8qcxJ39QznQgarzOLP_WF1_Q",authDomain:"jumia-17681.firebaseapp.com",databaseURL:"https://jumia-17681.firebaseio.com",projectId:"jumia-17681",storageBucket:"jumia-17681.appspot.com",messagingSenderId:"472156067665",appId:"1:472156067665:web:976495829b072466"}).getAll("giftfinder",t),i.pubsub.subscribe(t,(t=>{let e={superblocks:[]};Object.keys(t).map((s=>{var a;switch(s){case"about":e.about=t[s].about;break;case"config":e.config=t[s];break;default:null===(a=e.superblocks)||void 0===a||a.push(t[s])}})),new a(e,i)})),i.pubsub.subscribe(i.FETCHED_DATA,(t=>{}))})();
//# sourceMappingURL=bundle.js.map