(function(){'use strict';
var data=window.P034_STOCK||{},cars=[],index=0,started=Date.now(),duration=14000,photoIndex=-1;
function el(id){return document.getElementById(id);}function text(id,value){el(id).textContent=value;}
function fit(){var s=Math.min(window.innerWidth/1080,window.innerHeight/1920);el('screen').style.transform='scale('+s+')';el('screen').style.left=((window.innerWidth-1080*s)/2)+'px';el('screen').style.top=((window.innerHeight-1920*s)/2)+'px';}
function valid(){var age=Date.now()-Date.parse(data.updated_at);return isFinite(age)&&age>=-300000&&age<24*3600000;}
function empty(){el('content').style.display='none';el('empty').style.display='block';}
function number(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
function showPhoto(n){var c=cars[index],images=c.images&&c.images.length?c.images:[c.image];n=n%images.length;if(n===photoIndex){return;}photoIndex=n;el('photo').src=images[n];el('photo').alt=c.title+' — fotografia '+(n+1);var dots=[];for(var j=0;j<images.length;j++){dots.push(j===n?'●':'○');}text('photo-count',dots.join(' '));el('photo-count').style.display=images.length>1?'block':'none';}
function show(){if(!valid()||!cars.length){empty();return;}var c=cars[index];el('content').style.display='block';el('empty').style.display='none';text('title',c.title);text('version',c.version);text('year',c.year);text('km',number(c.km)+' km');text('fuel',c.fuel);text('price',c.price?number(c.price)+' €':'Sob consulta');photoIndex=-1;showPhoto(0);el('qr').src=c.qr;el('link').href=c.url;text('count',('0'+(index+1)).slice(-2)+' / '+cars.length);text('status','Stock de '+new Date(data.updated_at).toLocaleString('pt-PT')+' · Sujeito a confirmação');started=Date.now();}
function load(){cars=(data.cars||[]).filter(function(c){return c.sold===false&&c.reserved===false;});index=0;show();}
el('photo').onerror=function(){el('photo').removeAttribute('src');el('photo').alt='Fotografia indisponível';};
window.onresize=fit;fit();load();
setInterval(function(){if(!valid()){empty();return;}var elapsed=Date.now()-started;el('bar').style.width=Math.min(100,elapsed/duration*100)+'%';if(elapsed>=duration&&cars.length){index=(index+1)%cars.length;show();}else if(cars.length){var count=cars[index].images&&cars[index].images.length?cars[index].images.length:1;showPhoto(Math.min(count-1,Math.floor(elapsed/(duration/count))));}},200);
setInterval(function(){var x=new XMLHttpRequest();x.open('GET','stock.json?t='+Date.now(),true);x.timeout=15000;x.onload=function(){if(x.status===200){try{var next=JSON.parse(x.responseText);if(next.updated_at!==data.updated_at){data=next;load();}}catch(e){}}};x.send();},300000);
}());
