(()=>{"use strict";const t=t=>"#initiative "+t;class i{constructor(i){this.timeInterval=0,this.remoteData=i,this.minutesDuration=Number(this.remoteData.config.minute_duration_campaign_calendar),this.currency=this.remoteData.config.currency,this.config=this.remoteData.config,this.domain=this.remoteData.domain,this.el=i=>document.querySelector(t(i)),this.all=i=>document.querySelectorAll(t(i)),this.pad=t=>1==t.toString().length?"0"+t:t,this.endTime=t=>t+60*this.minutesDuration*1e3,this.skuRow=t=>this.el((t=>'.-sku_row[data-time="'+t+'"]')(t)),this.skuRows=()=>this.all(".-sku_row"),this.tab=t=>this.el((t=>'.-tab[data-time="'+t+'"]')(t)),this.live=(t,i)=>t.forEach((t=>t.classList[i]("-live"))),this.skuID=t=>t.name+"-"+ +new Date(t.time),this.capitalize=t=>t[0].toUpperCase()+t.slice(1),this.oosByTime=t=>t.map((t=>{var i;return null===(i=this.skuRow(t))||void 0===i?void 0:i.classList.add("-oos")})),this.isItMyTime=(t,i)=>+new Date(t.time)===i,this.isPast=t=>Date.now()>t&&Date.now()>this.endTime(t),this.isFuture=(t,i)=>-1===i.indexOf(t),this.digit=(t,i)=>0!==t?this.pad(t)+i:"",this.isATab=t=>t.classList.contains("-tab"),this.midnight=t=>+new Date(t).setHours(0,0,0,0)}getData(t){return this.remoteData.json_list.filter((i=>i.initiative===t))}times(t){const i=t.map((t=>this.midnight(t.time)));return Array.from(new Set(i)).sort(((t,i)=>t-i))}group(t,i){return i.map((i=>{const e=t.filter((t=>this.isItMyTime(t,i)));return{time:i,skus:e}}))}pastAndFutureTimes(t){const i=t.filter(this.isPast),e=t.filter((t=>this.isFuture(t,i)));return{past:i,future:e}}additionalTimes(t){const i=t.future,e=t.past,s=this.addition(i,e);return i.length<12?s:[]}addition(t,i){const e=[];for(let s=12-t.length;s>-1;s--){const t=i.length-1-s;e.push(i[t])}return e}}const e=window.Featurebox({config:{apiKey:"AIzaSyAA8dQEt-yZnDyY3Lra8lndRJ3LWNYVW0o",authDomain:"jumia-c15a3.firebaseapp.com",databaseURL:"https://jumia-c15a3.firebaseio.com",projectId:"jumia-c15a3",storageBucket:"jumia-c15a3.appspot.com",messagingSenderId:"295115190934",appId:"1:295115190934:web:de0b33b53a514c3c"}});let s;e.pubsub.subscribe(e.FETCHED_DATA,(t=>{s=new i(t);const e=s.getData("Campaign Calendar"),a=s.times(e);console.log("times",a)}))})();
//# sourceMappingURL=bundle.js.map