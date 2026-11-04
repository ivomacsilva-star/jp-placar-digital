(function(){'use strict';
var data=window.P034_STOCK||{},cars=[],index=0,started=Date.now(),duration=14000,photoIndex=-1;
function el(id){return document.getElementById(id);}function text(id,value){el(id).textContent=value;}
function fit(){var s=Math.min(window.innerWidth/1080,window.innerHeight/1920);el('screen').style.transform='scale('+s+')';el('screen').style.left=((window.innerWidth-1080*s)/2)+'px';el('screen').style.top=((window.innerHeight-1920*s)/2)+'px';}
function valid(){var age=Date.now()-Date.parse(data.updated_at);return isFinite(age)&&age>=-300000&&age<24*3600000;}
function empty(){el('content').style.display='none';el('empty').style.display='block';}
function number(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');}
// Each assignment owns its handlers and timer. Late errors cannot clear a newer image.
var mediaErrors=[],mediaLoads=0,boot=Date.now(),probes={},probeResults=[];
var test8=window.location.hash==='#test8';
function debugging(){return test8||/[?&]debug=1(?:&|$)/.test(window.location.search);}
function probe(kind,url){
    if(!debugging()||probes[kind]){return;}probes[kind]=true;
    var x=new XMLHttpRequest(),done=false;
    function finish(reason){if(done){return;}done=true;probeResults.push(kind+' GET: '+reason+' · '+url);diagnostic();}
    try{x.open('GET',url,true);x.timeout=8000;
        x.onload=function(){finish('HTTP '+x.status+' · '+(x.getResponseHeader('Content-Type')||'?')+' · '+x.responseText.length+' caracteres');};
        x.onerror=function(){finish('erro de rede · status '+x.status);};
        x.ontimeout=function(){finish('tempo excedido · status '+x.status);};x.send();
    }catch(e){finish(String(e.message||e));}
}
function report(kind,url,reason){
    mediaErrors.push(kind+': '+reason+' · '+url);if(mediaErrors.length>8){mediaErrors.shift();}
    if(window.console&&window.console.warn){window.console.warn('P034',kind,url,reason);}
    diagnostic();
}
function diagnostic(){
    if(!debugging()){return;}
    var box=el('diagnostic');if(!box){box=document.createElement('div');box.id='diagnostic';box.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:999;background:#000;color:#fff;padding:12px;font:16px monospace;white-space:pre-wrap';document.body.appendChild(box);}
    box.textContent='P034 media-v4-8 · '+(index+1)+' / '+cars.length+' · carregadas: '+mediaLoads+' · '+Math.floor((Date.now()-boot)/1000)+' s'+(test8?' · INICIO 8':'')+'\n'+probeResults.concat(mediaErrors).join('\n');
}
function mediaLoader(id){
    var serial=0,active=null;
    function cancel(){if(active){clearTimeout(active.timer);active.node.onload=null;active.node.onerror=null;active=null;}}
    return function(url,alt){
        var token=++serial;cancel();
        var previous=el(id);previous.style.visibility='hidden';previous.removeAttribute('src');
        if(!url){report(id,'','URL em falta');return;}
        function attempt(retry){
            if(token!==serial){return;}
            var node=previous.cloneNode(false),done=false;
            node.alt=alt;node.style.visibility='hidden';node.removeAttribute('src');
            previous.parentNode.replaceChild(node,previous);previous=node;
            active={node:node,timer:null};
            function finish(ok,reason){
                if(done||token!==serial){return;}done=true;cancel();
                if(ok){node.style.visibility='visible';mediaLoads++;diagnostic();return;}
                node.removeAttribute('src');report(id,url,reason);probe(id,url);
                if(retry<1){attempt(retry+1);}
                else{node.alt=id==='photo'?'Fotografia indisponível':'QR indisponível';}
            }
            node.onload=function(){finish(true);};
            node.onerror=function(){finish(false,'erro de carregamento');};
            active.timer=setTimeout(function(){finish(false,'tempo excedido');},5000);
            node.src=url+(retry?(url.indexOf('?')<0?'?':'&')+'p034_retry='+Date.now():'');
        }
        attempt(0);
    };
}
var loadPhoto=mediaLoader('photo'),loadQR=mediaLoader('qr');
function showPhoto(n){var c=cars[index],images=c.images&&c.images.length?c.images:[c.image];n=n%images.length;if(n===photoIndex){return;}photoIndex=n;loadPhoto(images[n],c.title+' — fotografia '+(n+1));var dots=[];for(var j=0;j<images.length;j++){dots.push(j===n?'●':'○');}text('photo-count',dots.join(' '));el('photo-count').style.display=images.length>1?'block':'none';}
function show(){if(!valid()||!cars.length){empty();return;}var c=cars[index];el('content').style.display='block';el('empty').style.display='none';text('title',c.title);text('version',c.version);text('year',c.year);text('km',number(c.km)+' km');text('fuel',c.fuel);text('price',c.price?number(c.price)+' €':'Sob consulta');photoIndex=-1;showPhoto(0);loadQR(c.qr,'QR code do anúncio');el('link').href=c.url;text('count',('0'+(index+1)).slice(-2)+' / '+cars.length);text('status','Stock de '+new Date(data.updated_at).toLocaleString('pt-PT')+' · Sujeito a confirmação');started=Date.now();}
function load(){cars=(data.cars||[]).filter(function(c){return c.sold===false&&c.reserved===false;});if(!test8){cars=cars.slice(0,8);}index=test8&&cars.length>7?7:0;show();}
window.onresize=fit;fit();load();
setInterval(function(){if(!valid()){empty();return;}var elapsed=Date.now()-started;el('bar').style.width=Math.min(100,elapsed/duration*100)+'%';if(elapsed>=duration&&cars.length){index=(index+1)%cars.length;show();}else if(cars.length){var count=cars[index].images&&cars[index].images.length?cars[index].images.length:1;showPhoto(Math.min(count-1,Math.floor(elapsed/(duration/count))));}},200);
setInterval(function(){var x=new XMLHttpRequest();x.open('GET','stock.json?t='+Date.now(),true);x.timeout=15000;x.onload=function(){if(x.status===200){try{var next=JSON.parse(x.responseText);if(next.updated_at!==data.updated_at){data=next;load();}}catch(e){}}};x.send();},300000);
}());
