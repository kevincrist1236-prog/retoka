/* ================= RETOKA VIDEO ================= */
const VFMT={'9:16':[1080,1920],'4:5':[1080,1350],'1:1':[1080,1080],'16:9':[1920,1080]};
const VFMTL=[['9:16','9:16 Reel'],['4:5','4:5 Post'],['1:1','1:1 Cuadrado'],['16:9','16:9 YouTube']];
const VTABS=[['vauto','1 toque'],['vedit','Editar'],['vcolor','Color'],['vfx','Efectos'],['vtext','Texto'],['vaudio','Audio']];
Object.assign(IC,{
 vauto:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
 vedit:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
 vcolor:'<path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-2 2-2h2a4 4 0 0 0 4-4c0-4-4-7.5-9-7.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7" r="1"/>',
 vfx:'<path d="m5 3 1.5 4L11 8.5 6.5 10 5 14l-1.5-4L-1 8.5 3.5 7z" transform="translate(4 1)"/><path d="M17 13l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z"/>',
 vtext:'<path d="M5 7V4h14v3M12 4v16M9 20h6"/>',
 vaudio:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'});
const VLOOK=[
 {n:'Original',a:{}},{n:'Vívido',a:{con:.12,sat:.3,exp:.04}},{n:'Cálido',a:{temp:.35,sat:.08,con:.05}},{n:'Frío',a:{temp:-.35,tint:-.05,con:.08}},
 {n:'Cine',a:{con:.15,sat:-.05,tone:[[0,.42,.5],[1,.62,.35],.22],vig:.25}},{n:'B&N',a:{bw:1,con:.25}},{n:'Retro',a:{fade:.35,temp:.25,sat:-.25,grain:.06,vig:.3}},
 {n:'Pastel',a:{fade:.4,sat:-.2,exp:.1,con:-.12}},{n:'Noche',a:{temp:-.3,con:.2,exp:-.06,sat:-.1,vig:.35}},{n:'Dorado',a:{temp:.3,tint:.05,tone:[[.35,.25,.15],[1,.85,.55],.15],sat:.1}}];
const VDEF={exp:0,con:0,sat:0,temp:0,tint:0,vig:0,fade:0,grain:0};
const VSFX=[['whoosh','Whoosh'],['riser','Subida'],['pop','Pop'],['click','Clic'],['impact','Impacto'],['drop','Bajo'],['ding','Ding'],['camera','Cámara'],['glitch','Glitch'],['notif','Notificación'],['typing','Teclado'],['swipe','Deslizar']];
const VTR=[['none','Ninguna'],['fade','Fundido'],['black','A negro'],['slide','Deslizar'],['zoom','Zoom']];
const VANIM=[['none','Ninguna'],['fade','Aparecer'],['pop','Pop'],['up','Subir'],['type','Máquina de escribir']];
let VCLIP=null,vzf=1;
let VD={fmt:'9:16',clips:[],texts:[],sfx:[],music:null,letterbox:0,t:0,sel:0,tsel:-1,vol:1},SRC={},vuid=0,vplay=false,vcur=-1,vprevT=0,vlastPerf=0,vsnap=null,vsnapFor=-1,vLastI=-1,MUS=null,actx=null,SFXB={},VHS_=[],vhi=-1,vbusy=false,vpps=60;

/* ---------- fuentes y clips ---------- */
const vLay=()=>{let s=0;return VD.clips.map(c=>{const d=Math.max(.05,(c.out-c.in)/c.speed),o={c,start:s,dur:d};s+=d;return o})};
const vTotal=()=>VD.clips.reduce((a,c)=>a+Math.max(.05,(c.out-c.in)/c.speed),0);
function vAt(t){const L=vLay();if(!L.length)return null;let i=L.findIndex(o=>t<o.start+o.dur);if(i<0)i=L.length-1;const o=L[i],e=clamp(t-o.start,0,o.dur);return{i,o,c:o.c,e,p:o.dur?e/o.dur:0,local:o.c.in+e*o.c.speed}}
const newClip=(src,inn,out)=>({id:++vuid,src,in:inn,out,speed:1,vol:1,adj:{...VDEF},look:0,fx:{zoom:'none',za:1.12,shake:0,flash:0,vhs:0,bw:0},tr:{type:'none',d:.45}});
function vThumb(el,w,h){const s=96/Math.max(w,h),c=mk(Math.max(1,Math.round(w*s)),Math.max(1,Math.round(h*s)));c.getContext('2d').drawImage(el,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.7)}
function addImageSource(canvas,name){const id='s'+(++vuid);SRC[id]={id,type:'img',el:canvas,w:canvas.width,h:canvas.height,dur:3,name,thumb:vThumb(canvas,canvas.width,canvas.height),audio:null};return id}
function addVideoFile(f){return new Promise(ok=>{const v=document.createElement('video');v.playsInline=true;v.setAttribute('playsinline','');v.preload='auto';v.muted=true;v.crossOrigin='anonymous';
 const url=URL.createObjectURL(f);v.src=url;const id='s'+(++vuid);
 v.onloadeddata=()=>{const s=SRC[id]={id,type:'video',el:v,url,file:f,w:v.videoWidth||1080,h:v.videoHeight||1920,dur:v.duration||1,name:f.name,thumb:'',audio:undefined};
  const grab=()=>{try{s.thumb=vThumb(v,s.w,s.h)}catch(e){}v.removeEventListener('seeked',grab);ok(id);decodeAudio(s)};v.addEventListener('seeked',grab);v.currentTime=Math.min(.1,s.dur/2)};
 v.onerror=()=>{toast('No pude abrir '+f.name+'. Prueba con MP4 o MOV.');ok(null)}})}
async function decodeAudio(s){if(s.audio!==undefined)return s.audio;try{const ab=await s.file.arrayBuffer();const c=new (window.OfflineAudioContext||window.webkitOfflineAudioContext)(2,48000,48000);s.audio=await c.decodeAudioData(ab)}catch(e){s.audio=null}return s.audio}
async function vLoadFiles(list){const fs=[...list];if(!fs.length)return;vbusy=true;toast('Cargando '+fs.length+' archivo(s)…');let n=0;
 if(VD.clips.length&&VD.clips.every(c=>SRC[c.src]&&SRC[c.src].sample)){VD.clips=[];VD.texts=[];VD.sfx=[]}
 for(const f of fs){if(f.type.startsWith('video/')||/\.(mp4|mov|m4v|webm)$/i.test(f.name)){const id=await addVideoFile(f);if(id){const s=SRC[id];VD.clips.push(newClip(id,0,s.dur));n++}}
  else if(f.type.startsWith('image/')){const im=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=URL.createObjectURL(f)});if(im){const k=Math.min(1,2400/Math.max(im.width,im.height)),c=mk(Math.round(im.width*k),Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);const id=addImageSource(c,f.name);const cl=newClip(id,0,3);cl.fx.zoom='in';VD.clips.push(cl);n++}}}
 vbusy=false;VD.sel=Math.max(0,VD.clips.length-1);vCommit();vRefresh();if(n)toast(n+' clip(s) añadidos');$('#chip').hidden=true}
function vSamples(){if(VD.clips.length)return;photos.filter(p=>p.sample).slice(0,4).forEach((p,i)=>{const id=addImageSource(p.src,p.name);SRC[id].sample=1;const c=newClip(id,0,2.5);c.fx.zoom=i%2?'out':'in';if(i)c.tr={type:'fade',d:.5};VD.clips.push(c)});
 VD.texts=[{font:'Anton',w:400,size:120,color:'#ffffff',up:1,sh:1,bg:'',ls:0,al:'center',text:'Tu historia',x:540,y:820,start:.3,end:4,anim:'pop'}];VD.sfx=[{t:2.5,k:'whoosh',v:.7}];vCommit()}

/* ---------- WebGL ---------- */
let GL=null;
function glInit(){if(GL)return GL;const c=document.createElement('canvas'),g=c.getContext('webgl',{premultipliedAlpha:false,preserveDrawingBuffer:true})||c.getContext('experimental-webgl');if(!g)return null;
 const vs=`attribute vec2 p;varying vec2 v;void main(){v=(p+1.)*.5;gl_Position=vec4(p,0.,1.);}`;
 const fs=`precision mediump float;varying vec2 v;uniform sampler2D t;uniform vec2 sc,off,res;uniform float zm,ex,co,sa,te,ti,vi,fa,gr,tm,bw,tn,ch,scn;uniform vec3 sh,hi;
 float rnd(vec2 q){return fract(sin(dot(q,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec2 uv=(v-.5)/(sc*zm)+.5+off;if(uv.x<0.||uv.x>1.||uv.y<0.||uv.y>1.){gl_FragColor=vec4(0.,0.,0.,1.);return;}
 vec3 c=ch>0.?vec3(texture2D(t,uv+vec2(ch,0.)).r,texture2D(t,uv).g,texture2D(t,uv-vec2(ch,0.)).b):texture2D(t,uv).rgb;
 c*=exp2(ex*1.5);c.r*=1.+te*.18;c.b*=1.-te*.18;c.g*=1.-ti*.15;c=(c-.5)*(1.+co)+.5;
 float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.+sa);if(bw>.5)c=vec3(l);
 if(tn>0.)c+=(mix(sh,hi,clamp(l,0.,1.))-.5)*tn;c=c*(1.-fa*.2)+fa*.12;
 c*=1.-vi*smoothstep(.3,.78,distance(v,vec2(.5)));
 if(scn>0.)c*=1.-scn*step(.5,fract(v.y*res.y/4.));
 if(gr>0.)c+=(rnd(v*res+tm)-.5)*gr;gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
 const sh=(ty,src)=>{const s=g.createShader(ty);g.shaderSource(s,src);g.compileShader(s);if(!g.getShaderParameter(s,g.COMPILE_STATUS))console.error(g.getShaderInfoLog(s));return s};
 const pr=g.createProgram();g.attachShader(pr,sh(g.VERTEX_SHADER,vs));g.attachShader(pr,sh(g.FRAGMENT_SHADER,fs));g.linkProgram(pr);g.useProgram(pr);
 const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);const pl=g.getAttribLocation(pr,'p');g.enableVertexAttribArray(pl);g.vertexAttribPointer(pl,2,g.FLOAT,false,0,0);
 const tx=g.createTexture();g.bindTexture(g.TEXTURE_2D,tx);['TEXTURE_WRAP_S','TEXTURE_WRAP_T'].forEach(k=>g.texParameteri(g.TEXTURE_2D,g[k],g.CLAMP_TO_EDGE));g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);
 g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,true);const U={};['t','sc','off','res','zm','ex','co','sa','te','ti','vi','fa','gr','tm','bw','tn','ch','scn','sh','hi'].forEach(k=>U[k]=g.getUniformLocation(pr,k));
 GL={c,g,U};return GL}
function vEff(c){const L=VLOOK[c.look||0].a,a=c.adj,e={};for(const k in VDEF)e[k]=(a[k]||0)+(L[k]||0);e.bw=L.bw||c.fx.bw;e.tone=L.tone||null;if(c.fx.vhs){e.fade+=.2;e.sat-=.15;e.grain+=.07;e.temp+=.1}return e}
function glDraw(s,c,e,p,t,W,H){const G=glInit();if(!G)return null;const{g,U}=G;if(G.c.width!==W||G.c.height!==H){G.c.width=W;G.c.height=H}g.viewport(0,0,W,H);
 try{g.texImage2D(g.TEXTURE_2D,0,g.RGB,g.RGB,g.UNSIGNED_BYTE,s.el)}catch(err){return null}
 const A=W/H,a=s.w/s.h,f=vEff(c);g.uniform2f(U.sc,a>A?a/A:1,a>A?1:A/a);
 let z=1,ox=0,oy=0;if(c.fx.zoom==='in')z=1+.15*p;else if(c.fx.zoom==='out')z=1.15-.15*p;else if(c.fx.zoom==='punch')z=c.fx.za||1.12;
 if(c.fx.shake&&e<.4){const k=(1-e/.4)*.018;ox=Math.sin(t*93)*k;oy=Math.cos(t*71)*k}
 g.uniform1f(U.zm,z);g.uniform2f(U.off,ox,oy);g.uniform2f(U.res,W,H);g.uniform1f(U.ex,f.exp);g.uniform1f(U.co,f.con);g.uniform1f(U.sa,f.sat);g.uniform1f(U.te,f.temp);g.uniform1f(U.ti,f.tint);g.uniform1f(U.vi,f.vig);g.uniform1f(U.fa,f.fade);g.uniform1f(U.gr,f.grain);g.uniform1f(U.tm,(t*37)%100);
 g.uniform1f(U.bw,f.bw?1:0);g.uniform1f(U.tn,f.tone?f.tone[2]:0);g.uniform3fv(U.sh,f.tone?f.tone[0]:[0,0,0]);g.uniform3fv(U.hi,f.tone?f.tone[1]:[1,1,1]);g.uniform1f(U.ch,c.fx.vhs?.0035:0);g.uniform1f(U.scn,c.fx.vhs?.12:0);
 g.drawArrays(g.TRIANGLE_STRIP,0,4);return G.c}

/* ---------- render ---------- */
function vTextDraw(x,t,tt){if(tt<t.start||tt>t.end)return;const e=tt-t.start,k=Math.min(1,e/.35),out=Math.min(1,(t.end-tt)/.25);x.save();x.globalAlpha=Math.min(out,t.anim==='none'||t.anim==='type'?1:k);
 if(t.anim==='pop'){const s=k<1?.6+.55*k-.15*k*k:1;x.translate(t.x,t.y);x.scale(s,s);x.translate(-t.x,-t.y)}else if(t.anim==='up')x.translate(0,(1-k)*60);
 const o=t.anim==='type'?{...t,text:t.text.slice(0,Math.ceil(t.text.length*Math.min(1,e/Math.max(.4,t.text.length*.05))))}:t;drawText(x,o);t._bb=o._bb;x.restore()}
function vrender(x,sc,exp,tt){const[W,H]=docSize();x.setTransform(sc,0,0,sc,0,0);x.fillStyle='#000';x.fillRect(0,0,W,H);tt=tt==null?VD.t:tt;
 const a=vAt(tt);if(!a){x.fillStyle='#888';x.font='600 46px Outfit';x.textAlign='center';x.fillText('Añade videos o fotos abajo',W/2,H/2);return}
 const s=SRC[a.c.src];if(!s)return;const gw=Math.round(W*sc),gh=Math.round(H*sc);
 if(a.i!==vLastI&&vLastI===a.i-1&&GL&&GL.c.width){vsnap=vsnap||mk(1,1);vsnap.width=GL.c.width;vsnap.height=GL.c.height;vsnap.getContext('2d').drawImage(GL.c,0,0);vsnapFor=a.i}
 vLastI=a.i;const out=glDraw(s,a.c,a.e,a.p,tt,gw,gh);if(!out)return;
 const tr=a.c.tr,inT=a.i>0&&tr&&tr.type!=='none'&&a.e<tr.d&&vsnapFor===a.i,k=inT?a.e/tr.d:1;
 if(inT){const ease=k*k*(3-2*k);if(tr.type==='fade'){x.drawImage(vsnap,0,0,W,H);x.globalAlpha=ease;x.drawImage(out,0,0,W,H);x.globalAlpha=1}
  else if(tr.type==='black'){if(k<.5){x.drawImage(vsnap,0,0,W,H);x.fillStyle=`rgba(0,0,0,${k*2})`;x.fillRect(0,0,W,H)}else{x.drawImage(out,0,0,W,H);x.fillStyle=`rgba(0,0,0,${(1-k)*2})`;x.fillRect(0,0,W,H)}}
  else if(tr.type==='slide'){x.drawImage(vsnap,-W*ease,0,W,H);x.drawImage(out,W*(1-ease),0,W,H)}
  else if(tr.type==='zoom'){x.drawImage(vsnap,0,0,W,H);x.save();const z=.6+.4*ease;x.globalAlpha=ease;x.translate(W/2,H/2);x.scale(z,z);x.drawImage(out,-W/2,-H/2,W,H);x.restore()}}
 else x.drawImage(out,0,0,W,H);
 if(a.c.fx.flash&&a.e<.3){x.fillStyle=`rgba(255,255,255,${(1-a.e/.3)*.85})`;x.fillRect(0,0,W,H)}
 if(VD.letterbox){const b=Math.max(0,(H-W/2.35)/2)*(W>H?1:.42);x.fillStyle='#000';x.fillRect(0,0,W,b);x.fillRect(0,H-b,W,b)}
 VD.texts.forEach(t=>vTextDraw(x,t,tt));
 if(!exp&&!vplay){const t=VD.texts[VD.tsel];if(t&&t._bb&&tt>=t.start&&tt<=t.end){x.setLineDash([10/V,6/V]);x.strokeStyle='#ef3b4f';x.lineWidth=2.5/V;x.strokeRect(...t._bb);x.setLineDash([])}}}

/* ---------- reproducción ---------- */
function vVideos(){return Object.values(SRC).filter(s=>s.type==='video')}
function vSeek(t){VD.t=clamp(t,0,vTotal());const a=vAt(VD.t);vLastI=-1;if(a){const s=SRC[a.c.src];if(s.type==='video'){const v=s.el;if(Math.abs(v.currentTime-a.local)>.03){v.currentTime=a.local;v.onseeked=()=>{v.onseeked=null;draw()}}}VD.sel=a.i}draw();vHead()}
function ac(){if(!actx){const C=window.AudioContext||window.webkitAudioContext;actx=C?new C():null}if(actx&&actx.state==='suspended')actx.resume();return actx}
function vPlay(){if(!VD.clips.length)return;if(VD.t>=vTotal()-.05)VD.t=0;vplay=true;vcur=-1;vprevT=VD.t;vlastPerf=performance.now();vLastI=-1;ac();vSyncMusic(true);vPlayBtn();requestAnimationFrame(vTick)}
function vPause(){vplay=false;vVideos().forEach(s=>{s.el.pause();s.el.muted=true});if(MUS)MUS.el.pause();vPlayBtn();draw()}
function vTick(now){if(!vplay)return;const L=vLay(),tot=vTotal(),dt=Math.min(.1,(now-vlastPerf)/1000);vlastPerf=now;let a=vAt(VD.t);
 if(a){const s=SRC[a.c.src],o=L[a.i];
  if(s.type==='video'){const v=s.el;if(vcur!==a.i){vVideos().forEach(z=>{if(z!==s){z.el.pause();z.el.muted=true}});v.playbackRate=a.c.speed;v.muted=false;v.volume=clamp(a.c.vol*VD.vol,0,1);v.currentTime=a.local;v.play().catch(()=>{});vcur=a.i}
   else{const tt=o.start+(v.currentTime-a.c.in)/a.c.speed;if(v.currentTime>=a.c.out-.03||v.ended)VD.t=o.start+o.dur+.001;else if(!v.seeking)VD.t=Math.max(VD.t,Math.min(tt,VD.t+.25))}}
  else{if(vcur!==a.i){vVideos().forEach(z=>{z.el.pause();z.el.muted=true});vcur=a.i}VD.t+=dt}}
 VD.sfx.forEach(f=>{if(f.t>vprevT&&f.t<=VD.t)playSfx(f.k,f.v)});vprevT=VD.t;
 if(VD.t>=tot){VD.t=tot;vPause();vHead();return}vSyncMusic(false);VD.sel=a?a.i:VD.sel;draw();vHead();requestAnimationFrame(vTick)}
function vSyncMusic(force){if(!MUS||!VD.music)return;const m=MUS.el,want=VD.t;if(want>=m.duration){m.pause();return}m.volume=clamp(VD.music.vol*(VD.music.fin&&want<1.5?want/1.5:1)*(VD.music.fout&&vTotal()-want<2?(vTotal()-want)/2:1),0,1);
 if(force||Math.abs(m.currentTime-want)>.3)m.currentTime=want;if(m.paused&&vplay)m.play().catch(()=>{})}
function vPlayBtn(){const b=$('#vplay');if(b)b.innerHTML=vplay?'<svg class="i" viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>':'<svg class="i" viewBox="0 0 24 24"><path d="M7 5v14l12-7z"/></svg>'}
const fmtT=t=>{t=Math.max(0,t);const m=Math.floor(t/60),s=t-m*60;return`${m}:${s<10?'0':''}${s.toFixed(1)}`};
function vHead(){const p=$('#vph');if(p)p.style.left=(VD.t*vpps+8)+'px';const tm=$('#vtime');if(tm)tm.textContent=fmtT(VD.t)+' / '+fmtT(vTotal());
 if(vplay){const sc=$('#vscroll');if(sc){const x=VD.t*vpps;if(x<sc.scrollLeft||x>sc.scrollLeft+sc.clientWidth-40)sc.scrollLeft=x-40}}}

/* ---------- efectos de sonido (sintetizados, propios) ---------- */
function noiseBuf(c,d){const b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;return b}
async function synth(k){if(SFXB[k])return SFXB[k];const sr=48000,D={whoosh:.7,riser:1.3,pop:.18,click:.05,impact:1,drop:1.2,ding:1.4,camera:.25,glitch:.4,notif:.4,typing:.5,swipe:.35}[k]||.5;
 const O=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new O(2,Math.ceil(sr*D),sr),out=c.createGain();out.connect(c.destination);
 const env=(g,pts)=>{g.gain.setValueAtTime(pts[0][1],0);pts.slice(1).forEach(([t,v])=>g.gain.linearRampToValueAtTime(v,t))};
 const nz=(d,f0,f1,q,pts,type='bandpass',st=0)=>{const s=c.createBufferSource();s.buffer=noiseBuf(c,d);const f=c.createBiquadFilter();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(f0,st);f.frequency.exponentialRampToValueAtTime(f1,st+d);const g=c.createGain();env(g,pts.map(([t,v])=>[st+t,v]));s.connect(f);f.connect(g);g.connect(out);s.start(st)};
 const osc=(type,f0,f1,d,pts,st=0)=>{const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,st);o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),st+d);const g=c.createGain();g.gain.value=0;env(g,pts.map(([t,v])=>[st+t,v]));o.connect(g);g.connect(out);o.start(st);o.stop(st+d)};
 if(k==='whoosh')nz(.7,250,2600,1.2,[[0,0],[.32,.9],[.7,0]]);
 else if(k==='swipe')nz(.35,1200,5000,1.5,[[0,0],[.12,.8],[.35,0]]);
 else if(k==='riser'){nz(1.3,200,7000,2,[[0,0],[1.2,.7],[1.3,0]]);osc('sawtooth',110,880,1.3,[[0,0],[1.2,.12],[1.3,0]])}
 else if(k==='pop')osc('sine',900,180,.18,[[0,0],[.01,.9],[.18,0]]);
 else if(k==='click')nz(.05,4000,3000,.7,[[0,.9],[.05,0]],'highpass');
 else if(k==='impact'){osc('sine',130,38,1,[[0,0],[.01,1],[1,0]]);nz(.5,900,120,.7,[[0,.8],[.5,0]],'lowpass')}
 else if(k==='drop')osc('sine',180,32,1.2,[[0,0],[.02,1],[1.2,0]]);
 else if(k==='ding'){[1320,1980,2640].forEach((f,i)=>osc('sine',f,f*.999,1.4,[[0,0],[.005,.4/(i+1)],[1.4,0]]))}
 else if(k==='camera'){nz(.06,2500,2000,.8,[[0,.9],[.06,0]],'bandpass',0);nz(.08,1800,1500,.8,[[0,.7],[.08,0]],'bandpass',.12)}
 else if(k==='glitch'){for(let i=0;i<10;i++){const f=200+Math.random()*1800;osc('square',f,f,.035,[[0,.25],[.035,0]],i*.035)}}
 else if(k==='notif'){osc('sine',880,880,.15,[[0,0],[.01,.5],[.15,0]]);osc('sine',1320,1320,.2,[[0,0],[.01,.5],[.2,0]],.16)}
 else if(k==='typing'){for(let i=0;i<6;i++)nz(.03,3500,3000,.9,[[0,.6],[.03,0]],'highpass',i*.075+Math.random()*.02)}
 SFXB[k]=await c.startRendering();return SFXB[k]}
async function playSfx(k,v=.8){const c=ac();if(!c)return;const b=await synth(k),s=c.createBufferSource(),g=c.createGain();s.buffer=b;g.gain.value=v;s.connect(g);g.connect(c.destination);s.start()}

/* ---------- quitar silencios ---------- */
async function speechSegs(s,inn,out){const b=await decodeAudio(s);if(!b)return null;const sr=b.sampleRate,ch=b.numberOfChannels,win=Math.round(sr*.02),i0=Math.floor(inn*sr),i1=Math.min(b.length,Math.floor(out*sr)),R=[];
 const d=[...Array(ch).keys()].map(c=>b.getChannelData(c));for(let i=i0;i<i1;i+=win){let a=0;for(let j=i;j<Math.min(i1,i+win);j+=2)for(const c of d)a+=c[j]*c[j];R.push(Math.sqrt(a/(win/2*ch)))}
 if(!R.length)return null;const so=[...R].sort((x,y)=>x-y),floor=so[Math.floor(so.length*.15)],peak=so[Math.floor(so.length*.95)],thr=Math.max(.008,floor+(peak-floor)*.12);
 const segs=[];let st=-1,quiet=0;const minQ=Math.round(.4/.02);
 R.forEach((r,k)=>{if(r>=thr){if(st<0)st=k;quiet=0}else if(st>=0){quiet++;if(quiet>=minQ){segs.push([st,k-quiet+1]);st=-1;quiet=0}}});if(st>=0)segs.push([st,R.length]);
 return segs.map(([a,z])=>[Math.max(inn,inn+a*.02-.12),Math.min(out,inn+z*.02+.15)]).filter(([a,z])=>z-a>.2)}
async function removeSilences(){let cut=0,saved=0,noA=0;const res=[];
 for(const c of VD.clips){const s=SRC[c.src];if(s.type!=='video'){res.push(c);continue}const sg=await speechSegs(s,c.in,c.out);if(!sg||!sg.length){if(!sg)noA++;res.push(c);continue}
  const before=c.out-c.in;let kept=0;sg.forEach(([a,z],k)=>{const n=JSON.parse(JSON.stringify(c));n.id=++vuid;n.in=a;n.out=z;if(k)n.tr={type:'none',d:.45};res.push(n);kept+=z-a});cut+=Math.max(0,sg.length-1);saved+=Math.max(0,before-kept)}
 VD.clips=res;return{cut,saved,noA}}

/* ---------- presets de 1 toque ---------- */
const VPRE=[
 {k:'dinamico',n:'Reel dinámico',d:'Quita silencios, alterna zooms en cada corte, añade sonidos y color vivo. Ideal para videos hablando a cámara.'},
 {k:'vlog',n:'Vlog cálido',d:'Quita silencios, color cálido, movimiento suave en las fotos y fundidos entre escenas.'},
 {k:'cine',n:'Cine',d:'Franjas de cine, color cinematográfico, grano fino y fundidos. Para viajes, eventos y bodas.'},
 {k:'retro',n:'Retro VHS',d:'Look de cámara vieja: color lavado, líneas y destellos. Divertido y llamativo.'},
 {k:'limpio',n:'Limpio profesional',d:'Solo lo esencial: quita silencios y mejora luz y color sin efectos.'}];
async function applyPreset(k){if(!VD.clips.length)return toast('Añade un video primero');vbusy=true;openPanel(cur);setStatusV('Retoka está editando tu video…');
 let r={cut:0,saved:0,noA:0};const sil=k!=='cine'&&k!=='retro';if(sil)r=await removeSilences();
 const look={dinamico:1,vlog:2,cine:4,retro:6,limpio:0}[k];VD.letterbox=k==='cine'?1:0;let sfxN=0,zooms=0;VD.sfx=VD.sfx.filter(f=>!f.auto);
 VD.clips.forEach((c,i)=>{const prev=VD.clips[i-1],newScene=!prev||prev.src!==c.src;c.look=look;c.adj={...VDEF};c.fx={zoom:'none',za:1.12,shake:0,flash:0,vhs:0,bw:0};c.tr={type:'none',d:.45};
  const img=SRC[c.src].type==='img';
  if(k==='dinamico'){c.adj={...VDEF,exp:.03,con:.05};if(img)c.fx.zoom=i%2?'out':'in';else if(i%2){c.fx.zoom='punch';c.fx.za=1.14;zooms++}if(i===0)c.fx.flash=1;if(newScene&&i)c.tr={type:'zoom',d:.35}}
  if(k==='vlog'){if(img)c.fx.zoom=i%2?'out':'in';if(newScene&&i)c.tr={type:'fade',d:.5}}
  if(k==='cine'){c.adj.grain=.035;if(img)c.fx.zoom='in';if(i)c.tr={type:newScene?'fade':'none',d:.6}}
  if(k==='retro'){c.fx.vhs=1;if(i)c.tr={type:'black',d:.4};if(i===0)c.fx.flash=1}
  if(k==='limpio'){c.adj={...VDEF,exp:.04,con:.08,sat:.06}}});
 const L=vLay();
 if(k==='dinamico'){L.forEach((o,i)=>{if(i&&i%2===0){VD.sfx.push({t:Math.max(0,o.start-.25),k:'whoosh',v:.45,auto:1});sfxN++}});VD.sfx.push({t:.02,k:'impact',v:.5,auto:1});sfxN++}
 if(k==='retro'){VD.sfx.push({t:.02,k:'glitch',v:.5,auto:1});sfxN++}
 if(k==='vlog'||k==='cine')L.forEach((o,i)=>{if(i&&o.c.tr.type!=='none'){VD.sfx.push({t:Math.max(0,o.start-.3),k:'swipe',v:.35,auto:1});sfxN++}});
 vbusy=false;VD.t=0;VD.sel=0;vCommit();vRefresh();
 const parts=[];if(sil){if(r.cut)parts.push(`quité ${r.cut} silencios (${r.saved.toFixed(1)} s)`);else if(r.noA)parts.push('no encontré audio para quitar silencios');else parts.push('no había silencios largos')}
 if(zooms)parts.push(`${zooms} zooms`);if(sfxN)parts.push(`${sfxN} sonidos`);parts.push('color '+VLOOK[look].n.toLowerCase());
 VD.last=`${VPRE.find(p=>p.k===k).n}: ${parts.join(', ')}.`;openPanel(cur);toast('Video editado con '+VPRE.find(p=>p.k===k).n)}
function setStatusV(t){const e=$('#vst');if(e)e.textContent=t}

/* ---------- historial ---------- */
const vSnap=()=>JSON.stringify({c:VD.clips,t:VD.texts.map(({_bb,...x})=>x),s:VD.sfx,m:VD.music,l:VD.letterbox,f:VD.fmt,v:VD.vol});
function vCommit(){const s=vSnap();if(VHS_[vhi]===s)return;VHS_=VHS_.slice(0,vhi+1);VHS_.push(s);if(VHS_.length>60)VHS_.shift();vhi=VHS_.length-1}
function vRestore(s){const o=JSON.parse(s);VD.clips=o.c;VD.texts=o.t;VD.sfx=o.s;VD.music=o.m;VD.letterbox=o.l;VD.fmt=o.f;VD.vol=o.v;VD.sel=clamp(VD.sel,0,Math.max(0,VD.clips.length-1));VD.tsel=-1;VD.t=Math.min(VD.t,vTotal());vRefresh()}
const vUndo=()=>{if(vhi>0){vRestore(VHS_[--vhi]);toast('Cambio deshecho')}else toast('No hay más cambios que deshacer')},vRedo=()=>{if(vhi<VHS_.length-1){vRestore(VHS_[++vhi]);toast('Cambio rehecho')}};

/* ---------- paneles ---------- */
const vClip=()=>VD.clips[VD.sel];
const vsl=(k,l,v,mn,mx,st,attr,fmt)=>`<label class="sl"><span>${l}<output>${fmt?fmt(v):Math.round(v*100)}</output></span><input type="range" min="${mn}" max="${mx}" step="${st}" value="${v}" ${attr}="${k}"></label>`;
const vnone=t=>`<h2>${t}</h2><p class="sub">Añade un video o fotos en la línea de tiempo de abajo.</p>`;
const VP={
 vauto:()=>`<h2>Edición en 1 toque</h2><p class="sub">Elige un estilo y Retoka edita tu video por ti: cortes, ritmo, color y sonido. Luego puedes ajustar lo que quieras.</p>
  <div id="vst" class="st">${vbusy?'Retoka está editando tu video…':esc(VD.last||'')}</div>
  ${VPRE.map(p=>`<div class="card"><b>${p.n}</b><p>${p.d}</p><button class="wb" data-act="vpre" data-v="${p.k}" ${vbusy?'disabled':''}>Aplicar</button></div>`).join('')}
  <div class="card"><b>Quitar silencios</b><p>Corta las pausas largas de tus videos hablando a cámara.</p><button class="gb full" data-act="vsil" ${vbusy?'disabled':''}>Quitar silencios</button></div>
  <h3>Próximamente en Retoka Pro</h3><div class="soon"><div>Subtítulos automáticos<i>Pro · pronto</i></div><div>Quitar muletillas<i>Pro · pronto</i></div></div>`,
 vedit:()=>{const c=vClip();if(!c)return vnone('Editar');const s=SRC[c.src],img=s.type==='img';
  return `<h2>Editar clip ${VD.sel+1}</h2><p class="sub">${esc(s.name||'')} · ${fmtT((c.out-c.in)/c.speed)}</p>
  <div class="row"><button class="gb" data-act="vsplit">Dividir en el cursor</button><button class="gb" data-act="vdup">Duplicar</button><button class="gb" data-act="vmove" data-v="-1">← Mover</button><button class="gb" data-act="vmove" data-v="1">Mover →</button><button class="gb" data-act="vdel" style="color:var(--acc)">Eliminar</button></div>
  ${img?`<h3>Duración</h3>${vsl('dur','Segundos',c.out-c.in,.5,10,.1,'data-vc',v=>(+v).toFixed(1)+' s')}`:`<h3>Recortar</h3>${vsl('in','Inicio',c.in,0,s.dur,.05,'data-vc',v=>fmtT(+v))}${vsl('out','Final',c.out,0,s.dur,.05,'data-vc',v=>fmtT(+v))}
  <h3>Velocidad</h3><div class="chips">${[.5,1,1.5,2,3].map(v=>`<button class="ch ${c.speed===v?'on':''}" data-act="vspeed" data-v="${v}">${v}x</button>`).join('')}</div>
  <h3>Volumen</h3>${vsl('vol','Volumen del clip',c.vol,0,2,.05,'data-vc')}`}
  ${VD.sel>0?`<h3>Transición de entrada</h3><div class="chips">${VTR.map(([k,l])=>`<button class="ch ${c.tr.type===k?'on':''}" data-act="vtr" data-v="${k}">${l}</button>`).join('')}</div>`:''}`},
 vcolor:()=>{const c=vClip();if(!c)return vnone('Color');return `<h2>Color del clip ${VD.sel+1}</h2><p class="sub">Elige un look y afínalo.</p>
  <div class="chips">${VLOOK.map((l,i)=>`<button class="ch ${c.look===i?'on':''}" data-act="vlook" data-v="${i}">${l.n}</button>`).join('')}</div>
  <h3>Ajustes</h3>${[['exp','Exposición',-1,1],['con','Contraste',-1,1],['sat','Saturación',-1,1],['temp','Temperatura',-1,1],['tint','Tono',-1,1],['vig','Viñeta',0,1],['fade','Desvanecido',0,1],['grain','Grano',0,.2]].map(([k,l,a,b])=>vsl(k,l,c.adj[k],a,b,.01,'data-vadj')).join('')}
  <button class="gb full" data-act="vcolall">Aplicar este color a todos los clips</button><button class="gb full" data-act="vcolreset">Restablecer color</button>`},
 vfx:()=>{const c=vClip();if(!c)return vnone('Efectos');return `<h2>Efectos del clip ${VD.sel+1}</h2><p class="sub">Movimiento y efectos creativos.</p>
  <h3>Movimiento</h3><div class="chips">${[['none','Ninguno'],['in','Acercar lento'],['out','Alejar lento'],['punch','Zoom fijo']].map(([k,l])=>`<button class="ch ${c.fx.zoom===k?'on':''}" data-act="vzoom" data-v="${k}">${l}</button>`).join('')}</div>
  ${c.fx.zoom==='punch'?vsl('za','Cantidad de zoom',c.fx.za,1.02,1.5,.01,'data-vfx',v=>Math.round((v-1)*100)+'%'):''}
  <h3>Efectos</h3><div class="chips">${[['shake','Sacudida'],['flash','Destello'],['vhs','Retro VHS'],['bw','Blanco y negro']].map(([k,l])=>`<button class="ch ${c.fx[k]?'on':''}" data-act="vfxt" data-v="${k}">${l}</button>`).join('')}</div>
  <h3>Todo el video</h3><div class="chips"><button class="ch ${VD.letterbox?'on':''}" data-act="vlbox">Franjas de cine</button></div>
  <button class="gb full" data-act="vfxall">Aplicar estos efectos a todos los clips</button>`},
 vtext:()=>{const t=VD.texts[VD.tsel];let h=`<h2>Texto</h2><p class="sub">Toca un estilo para añadirlo en el cursor. Arrástralo sobre el video.</p><div class="tpre">${TP.map((s,i)=>`<button data-act="vtp" data-v="${i}" style="font-family:'${s.font}';font-weight:${s.w};${s.it?'font-style:italic;':''}font-size:${clamp(s.size/4,15,26)}px">${s.l}</button>`).join('')}</div>`;
  if(VD.texts.length)h+=`<h3>Textos</h3><div class="chips">${VD.texts.map((x,i)=>`<button class="ch ${i===VD.tsel?'on':''}" data-act="vtsel" data-v="${i}">${esc(x.text.split('\n')[0].slice(0,14))}</button>`).join('')}</div>`;
  if(!t)return h;return h+`<h3>Editar texto</h3><textarea data-vt="text" aria-label="Texto">${esc(t.text)}</textarea>
  <h3>Cuándo aparece</h3>${vsl('start','Aparece',t.start,0,Math.max(.1,vTotal()),.05,'data-vt',v=>fmtT(+v))}${vsl('end','Desaparece',t.end,0,Math.max(.1,vTotal()),.05,'data-vt',v=>fmtT(+v))}
  <h3>Animación</h3><div class="chips">${VANIM.map(([k,l])=>`<button class="ch ${t.anim===k?'on':''}" data-act="vtanim" data-v="${k}">${l}</button>`).join('')}</div>
  <h3>Fuente</h3><div class="fonts">${FONTS.map(f=>`<button class="${t.font===f?'on':''}" data-act="vtfont" data-v="${f}" style="font-family:'${f}'">${f}</button>`).join('')}</div>
  ${vsl('size','Tamaño',t.size,20,320,1,'data-vt',v=>Math.round(v))}
  <h3>Color</h3><div class="sw">${SWC.map(c=>`<button data-act="vtcol" data-v="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}</div>
  <div class="row" style="margin-top:14px"><button class="ch ${t.sh?'on':''}" data-act="vttog" data-v="sh">Sombra</button><button class="ch ${t.bg?'on':''}" data-act="vtbg">Fondo</button><button class="ch ${t.up?'on':''}" data-act="vttog" data-v="up">MAYÚSCULAS</button><button class="ch" data-act="vtdel" style="color:var(--acc)">Eliminar</button></div>`},
 vaudio:()=>{const m=VD.music;return `<h2>Audio</h2><p class="sub">Música, volumen y efectos de sonido.</p>
  <div class="card"><b>Música</b>${m?`<p>${esc(m.name)}</p>${vsl('mvol','Volumen de la música',m.vol,0,1,.05,'data-vm')}<div class="chips"><button class="ch ${m.fin?'on':''}" data-act="vmt" data-v="fin">Entrada suave</button><button class="ch ${m.fout?'on':''}" data-act="vmt" data-v="fout">Salida suave</button><button class="ch" data-act="vmdel" style="color:var(--acc)">Quitar</button></div>`
   :`<p>Sube una canción o pista desde tu teléfono (usa música con permiso de uso).</p><label class="wb" style="cursor:pointer"><input type="file" id="vmusic" accept="audio/*" style="display:none">Añadir música</label>`}</div>
  ${vsl('vvol','Volumen de los videos',VD.vol,0,1.5,.05,'data-vg')}
  <h3>Efectos de sonido</h3><p class="hint">▶ para escuchar, + para ponerlo donde está el cursor.</p>
  <div class="sfx">${VSFX.map(([k,l])=>`<div><span>${l}</span><button class="ib2" data-act="vsfxp" data-v="${k}" aria-label="Escuchar ${l}">▶</button><button class="ib2" data-act="vsfxa" data-v="${k}" aria-label="Añadir ${l}">+</button></div>`).join('')}</div>
  ${VD.sfx.length?`<h3>En tu video</h3><div class="chips">${VD.sfx.map((f,i)=>`<button class="ch" data-act="vsfxd" data-v="${i}">${fmtT(f.t)} · ${(VSFX.find(z=>z[0]===f.k)||[0,f.k])[1]} ✕</button>`).join('')}</div>`:''}`}};
Object.assign(P,VP);

/* ---------- línea de tiempo ---------- */
function vfilm(){const tot=vTotal(),el=$('#film'),avail=Math.max(200,el.clientWidth-24);vpps=clamp(avail/Math.max(tot,1),24,140)*vzf;const L=vLay(),W=Math.max(avail,tot*vpps+20);
 const ticks=[];const step=tot>60?10:tot>20?5:1;for(let s=0;s<=tot;s+=step)ticks.push(`<span style="left:${s*vpps+8}px">${fmtT(s).replace(/\.\d$/,'')}</span>`);
 el.innerHTML=`<div class="tl"><div class="tlbar"><button class="ib" id="vplay" aria-label="Reproducir"></button><span id="vtime" class="hint"></span><span style="flex:1"></span>
  ${[['split','Dividir (S)','<path d="M12 3v18M8 7l-4 5 4 5M16 7l4 5-4 5"/>'],['cut','Cortar (Ctrl+X)','<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>'],['copy','Copiar (Ctrl+C)','<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>'],['paste','Pegar (Ctrl+V)','<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V2h6v2M9 11h6M9 15h4"/>'],['dup','Duplicar (Ctrl+D)','<rect x="3" y="7" width="12" height="12" rx="2"/><path d="M9 3h10a2 2 0 0 1 2 2v10"/>'],['del','Eliminar (Supr)','<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'],['zout','Alejar línea de tiempo','<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6"/>'],['zin','Acercar línea de tiempo','<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6M11 8v6"/>']].map(([k,l,ic])=>`<button class="ib ${k==='paste'&&!VCLIP?'dim':''}" data-vt2="${k}" title="${l}" aria-label="${l}"><svg class="i" viewBox="0 0 24 24">${ic}</svg></button>`).join('')}
  <label class="ib" title="Añadir" aria-label="Añadir videos o fotos" style="cursor:pointer"><input type="file" id="vfile" accept="video/*,image/*" multiple style="display:none"><svg class="i" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></label></div>
  <div class="tls" id="vscroll"><div class="tlt" id="vtrack" style="width:${W}px"><div class="ruler">${ticks.join('')}</div>
  <div class="trow">${L.map((o,i)=>`<div class="clip ${i===VD.sel?'on':''}" data-ci="${i}" style="left:${o.start*vpps+8}px;width:${Math.max(6,o.dur*vpps-2)}px;background-image:url(${SRC[o.c.src]?SRC[o.c.src].thumb:''})">${o.c.tr.type!=='none'&&i?'<i class="trm"></i>':''}<b>${o.dur.toFixed(1)}s</b></div>`).join('')}</div>
  <div class="trow aux">${VD.texts.map((t,i)=>`<div class="tchip ${i===VD.tsel?'on':''}" data-ti="${i}" style="left:${t.start*vpps+8}px;width:${Math.max(16,(t.end-t.start)*vpps)}px">T ${esc(t.text.split('\n')[0].slice(0,12))}</div>`).join('')}
   ${VD.sfx.map(f=>`<i class="sdot" style="left:${f.t*vpps+8}px" title="${f.k}"></i>`).join('')}${VD.music?`<div class="mbar" style="left:8px;width:${tot*vpps}px">♪ ${esc(VD.music.name)}</div>`:''}</div>
  <div class="ph" id="vph"></div></div></div></div>`;
 $('#vfile').onchange=e=>vLoadFiles(e.target.files);vPlayBtn();vHead()}
function vRefresh(){refresh()}
function vTrackT(e){const tr=$('#vtrack'),r=tr.getBoundingClientRect();return clamp((e.clientX-r.left-8)/vpps,0,vTotal())}
document.addEventListener('pointerdown',e=>{if(S.mode!=='video')return;const tr=e.target.closest('#vtrack');if(!tr)return;
 const ti=e.target.closest('[data-ti]');if(ti){VD.tsel=+ti.dataset.ti;cur='vtext';vSeek(VD.texts[VD.tsel].start+.01);refresh();return}
 if(vplay)vPause();vSeek(vTrackT(e));const ci=e.target.closest('[data-ci]');if(ci){VD.sel=+ci.dataset.ci;if(!['vedit','vcolor','vfx'].includes(cur))cur='vedit'}refresh();
 const mv=ev=>{vSeek(vTrackT(ev))},up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)});
document.addEventListener('click',e=>{if(S.mode!=='video')return;if(e.target.closest('#vplay')){vplay?vPause():vPlay();return}const b=e.target.closest('[data-vt2]');if(b){const k=b.dataset.vt2;if(k==='zin'||k==='zout'){vzf=clamp(vzf*(k==='zin'?1.5:1/1.5),.4,12);film();return}vAct('v'+k)}});

/* ---------- acciones ---------- */
function vAct(a,v,el){const c=vClip(),t=VD.texts[VD.tsel];let keep=false;
 const A={
  vpre:()=>{applyPreset(v);keep=true},vsil:async()=>{keep=true;vbusy=true;openPanel(cur);const r=await removeSilences();vbusy=false;vCommit();VD.last=r.cut?`Quité ${r.cut} silencios (${r.saved.toFixed(1)} s).`:r.noA?'No encontré audio en los videos.':'No había silencios largos.';vRefresh();toast(VD.last)},
  vsplit:()=>{const at=vAt(VD.t);if(!at)return;const x=at.c,loc=at.local;if(loc-x.in<.1||x.out-loc<.1)return toast('Mueve el cursor dentro del clip para dividir');const n=JSON.parse(JSON.stringify(x));n.id=++vuid;n.in=loc;x.out=loc;n.tr={type:'none',d:.45};VD.clips.splice(at.i+1,0,n);VD.sel=at.i+1;toast('Clip dividido')},
  vcopy:()=>{const tx=cur==='vtext'&&t;if(tx){const{_bb,...z}=t;VCLIP={k:'text',d:JSON.parse(JSON.stringify(z))}}else if(c)VCLIP={k:'clip',d:JSON.parse(JSON.stringify(c))};else return;keep=true;film();toast(tx?'Texto copiado':'Clip copiado')},
  vcut:()=>{const tx=cur==='vtext'&&t;if(tx){const{_bb,...z}=t;VCLIP={k:'text',d:JSON.parse(JSON.stringify(z))};VD.texts.splice(VD.tsel,1);VD.tsel=-1;toast('Texto cortado')}else if(c){VCLIP={k:'clip',d:JSON.parse(JSON.stringify(c))};VD.clips.splice(VD.sel,1);VD.sel=clamp(VD.sel,0,Math.max(0,VD.clips.length-1));VD.t=Math.min(VD.t,vTotal());toast('Clip cortado')}},
  vpaste:()=>{if(!VCLIP)return toast('Primero copia o corta un clip o texto');if(VCLIP.k==='text'){const n=JSON.parse(JSON.stringify(VCLIP.d)),d=n.end-n.start;n.start=VD.t;n.end=VD.t+d;VD.texts.push(n);VD.tsel=VD.texts.length-1;cur='vtext';toast('Texto pegado en '+fmtT(VD.t))}
   else{const n=JSON.parse(JSON.stringify(VCLIP.d));n.id=++vuid;if(!SRC[n.src])return toast('Ese clip ya no está disponible');const at=vAt(VD.t),pos=at?at.i+1:VD.clips.length;VD.clips.splice(pos,0,n);VD.sel=pos;vSeek(vLay()[pos].start);toast('Clip pegado')}},
  vdup:()=>{if(cur==='vtext'&&t){const{_bb,...z}=t,n=JSON.parse(JSON.stringify(z));n.x+=30;n.y+=30;VD.texts.push(n);VD.tsel=VD.texts.length-1;return}if(!c)return;const n=JSON.parse(JSON.stringify(c));n.id=++vuid;VD.clips.splice(VD.sel+1,0,n);VD.sel++},
  vmove:()=>{const j=VD.sel+(+v);if(!c||j<0||j>=VD.clips.length)return;VD.clips.splice(VD.sel,1);VD.clips.splice(j,0,c);VD.sel=j},
  vdel:()=>{if(cur==='vtext'&&t){VD.texts.splice(VD.tsel,1);VD.tsel=-1;return}if(!c)return;VD.clips.splice(VD.sel,1);VD.sel=clamp(VD.sel,0,Math.max(0,VD.clips.length-1));VD.t=Math.min(VD.t,vTotal())},
  vspeed:()=>{if(c)c.speed=+v},vtr:()=>{if(c)c.tr={type:v,d:v==='slide'?.35:.45}},
  vlook:()=>{if(c)c.look=+v},vcolall:()=>{if(c)VD.clips.forEach(x=>{x.look=c.look;x.adj={...c.adj}})},vcolreset:()=>{if(c){c.look=0;c.adj={...VDEF}}},
  vzoom:()=>{if(c)c.fx.zoom=v},vfxt:()=>{if(c)c.fx[v]=c.fx[v]?0:1},vlbox:()=>{VD.letterbox=VD.letterbox?0:1},vfxall:()=>{if(c)VD.clips.forEach(x=>{x.fx={...c.fx}})},
  vtp:()=>{const s=TP[+v],[W,H]=docSize();VD.texts.push({font:s.font,w:s.w,it:s.it||0,size:s.size,color:s.color,up:s.up||0,sh:s.sh||0,bg:s.bg||'',ls:s.ls||0,al:'center',text:s.text,x:W/2,y:H*.42,start:VD.t,end:Math.min(vTotal(),VD.t+3)||3,anim:'pop'});VD.tsel=VD.texts.length-1;fontLoad(VD.texts[VD.tsel])},
  vtsel:()=>{VD.tsel=+v;vSeek(VD.texts[VD.tsel].start+.01)},vtanim:()=>{if(t)t.anim=v},vtfont:()=>{if(t){t.font=v;fontLoad(t)}},vtcol:()=>{if(t)t.color=v},vttog:()=>{if(t){t[v]=t[v]?0:1;fontLoad(t)}},vtbg:()=>{if(t)t.bg=t.bg?'':'#18161d'},vtdel:()=>{if(t){VD.texts.splice(VD.tsel,1);VD.tsel=-1}},
  vmt:()=>{if(VD.music)VD.music[v]=VD.music[v]?0:1},vmdel:()=>{VD.music=null;if(MUS){MUS.el.pause();MUS=null}},
  vsfxp:()=>{playSfx(v);keep=true},vsfxa:()=>{VD.sfx.push({t:VD.t,k:v,v:.8});VD.sfx.sort((a,b)=>a.t-b.t);toast('Sonido añadido en '+fmtT(VD.t))},vsfxd:()=>{VD.sfx.splice(+v,1)}};
 if(A[a]){const r=A[a]();if(!keep&&!(r instanceof Promise)){vCommit();refresh()}}}
panel.addEventListener('click',e=>{if(S.mode!=='video')return;const b=e.target.closest('[data-act]');if(!b||b.disabled||!b.dataset.act.startsWith('v'))return;e.preventDefault();e.stopImmediatePropagation();vAct(b.dataset.act,b.dataset.v,b)},true);
panel.addEventListener('input',e=>{if(S.mode!=='video')return;const el=e.target,v=+el.value,c=vClip(),t=VD.texts[VD.tsel],o=el.parentElement.querySelector('output');
 if(el.dataset.vc&&c){const k=el.dataset.vc,s=SRC[c.src];if(k==='dur'){c.out=c.in+v}else if(k==='in'){c.in=Math.min(v,c.out-.1)}else if(k==='out'){c.out=Math.max(v,c.in+.1)}else c[k]=v;if(o)o.textContent=k==='dur'?v.toFixed(1)+' s':k==='vol'?Math.round(v*100):fmtT(v);if(k==='in'||k==='out')vSeek(vLay()[VD.sel].start+(k==='out'?vLay()[VD.sel].dur-.05:0))}
 else if(el.dataset.vadj&&c){c.adj[el.dataset.vadj]=v;if(o)o.textContent=Math.round(v*100)}
 else if(el.dataset.vfx&&c){c.fx[el.dataset.vfx]=v;if(o)o.textContent=Math.round((v-1)*100)+'%'}
 else if(el.dataset.vt&&t){const k=el.dataset.vt;t[k]=k==='text'?el.value:v;if(o)o.textContent=k==='size'?Math.round(v):fmtT(v);if(k==='start'||k==='end')vSeek(t[k]-(k==='end'?.05:-.01))}
 else if(el.dataset.vm&&VD.music){VD.music.vol=v;if(o)o.textContent=Math.round(v*100);vSyncMusic(false)}
 else if(el.dataset.vg){VD.vol=v;if(o)o.textContent=Math.round(v*100)}else return;e.stopImmediatePropagation();draw()},true);
panel.addEventListener('change',e=>{if(S.mode!=='video')return;if(e.target.id==='vmusic'){const f=e.target.files[0];if(!f)return;const el=new Audio(URL.createObjectURL(f));el.preload='auto';MUS={el,file:f,buffer:null};VD.music={name:f.name,vol:.6,fin:1,fout:1};vCommit();refresh();toast('Música añadida');e.stopImmediatePropagation();return}
 e.stopImmediatePropagation();vCommit();if(e.target.dataset.vt==='start'||e.target.dataset.vt==='end'||e.target.dataset.vc)film()},true);

/* ---------- arrastrar texto en el video ---------- */
let vdrag=null;
cv.addEventListener('pointerdown',e=>{if(S.mode!=='video')return;e.stopImmediatePropagation();const[X,Y]=pt(e);for(let i=VD.texts.length-1;i>=0;i--){const t=VD.texts[i],b=t._bb;if(b&&VD.t>=t.start&&VD.t<=t.end&&X>=b[0]&&X<=b[0]+b[2]&&Y>=b[1]&&Y<=b[1]+b[3]){VD.tsel=i;vdrag={i,dx:X-t.x,dy:Y-t.y};cv.setPointerCapture(e.pointerId);if(vplay)vPause();cur='vtext';refresh();return}}
 VD.tsel=-1;vplay?vPause():vPlay()},true);
cv.addEventListener('pointermove',e=>{if(S.mode!=='video'||!vdrag)return;e.stopImmediatePropagation();const[X,Y]=pt(e),t=VD.texts[vdrag.i];t.x=X-vdrag.dx;t.y=Y-vdrag.dy;draw()},true);
cv.addEventListener('pointerup',e=>{if(S.mode!=='video')return;if(vdrag){vdrag=null;vCommit()}},true);

/* ---------- exportar ---------- */
function seekTo(v,t){return new Promise(r=>{if(Math.abs(v.currentTime-t)<.002&&v.readyState>=2)return r();let done=false;const h=()=>{if(done)return;done=true;v.removeEventListener('seeked',h);r()};v.addEventListener('seeked',h);v.currentTime=t;setTimeout(h,2500)})}
async function mixAudio(tot){const sr=48000,O=window.OfflineAudioContext||window.webkitOfflineAudioContext,c=new O(2,Math.max(1,Math.ceil(tot*sr)),sr);let any=false;
 for(const o of vLay()){const s=SRC[o.c.src];if(s.type!=='video')continue;const b=await decodeAudio(s);if(!b)continue;const n=c.createBufferSource();n.buffer=b;n.playbackRate.value=o.c.speed;const g=c.createGain();g.gain.value=o.c.vol*VD.vol;n.connect(g);g.connect(c.destination);n.start(o.start,o.c.in,o.c.out-o.c.in);any=true}
 if(VD.music&&MUS){try{if(!MUS.buffer)MUS.buffer=await c.decodeAudioData(await MUS.file.arrayBuffer());const n=c.createBufferSource();n.buffer=MUS.buffer;const g=c.createGain(),m=VD.music;g.gain.setValueAtTime(m.fin?0:m.vol,0);if(m.fin)g.gain.linearRampToValueAtTime(m.vol,1.5);g.gain.setValueAtTime(m.vol,Math.max(1.5,tot-2));if(m.fout)g.gain.linearRampToValueAtTime(0,tot);n.connect(g);g.connect(c.destination);n.start(0);any=true}catch(e){}}
 for(const f of VD.sfx){if(f.t>tot)continue;const b=await synth(f.k),n=c.createBufferSource(),g=c.createGain();n.buffer=b;g.gain.value=f.v;n.connect(g);g.connect(c.destination);n.start(f.t);any=true}
 return any?await c.startRendering():null}
async function pickCfg(W,H){const vc=[['avc1.640028','avc'],['avc1.4d0028','avc'],['avc1.42e028','avc'],['vp09.00.40.08','vp9']];let V0=null;
 for(const[codec,m]of vc){try{const s=await VideoEncoder.isConfigSupported({codec,width:W,height:H,bitrate:9e6,framerate:30});if(s.supported){V0={cfg:{codec,width:W,height:H,bitrate:9e6,framerate:30},m};break}}catch(e){}}
 let A0=null;if(window.AudioEncoder)for(const[codec,m]of[['mp4a.40.2','aac'],['opus','opus']]){try{const s=await AudioEncoder.isConfigSupported({codec,sampleRate:48000,numberOfChannels:2,bitrate:160000});if(s.supported){A0={cfg:{codec,sampleRate:48000,numberOfChannels:2,bitrate:160000},m};break}}catch(e){}}
 return{V0,A0}}
let muxLib=null;const loadMux=()=>muxLib||(muxLib=new Promise((ok,no)=>{const s=document.createElement('script');s.src='mux.js';s.onload=()=>ok(window.RetokaMux);s.onerror=()=>{muxLib=null;no(new Error('mux'))};document.head.appendChild(s)}));
async function vExport(){if(!VD.clips.length)return toast('Añade un video primero');if(vplay)vPause();const[W,H]=docSize(),tot=vTotal(),fps=30,N=Math.max(1,Math.round(tot*fps));
 if(!window.VideoEncoder)return toast('Tu navegador no puede crear MP4. Actualiza Chrome o Safari.');
 const{V0,A0}=await pickCfg(W,H);if(!V0)return toast('Tu navegador no puede codificar video en este formato.');
 $('#outs').innerHTML=`<div style="grid-column:1/-1"><p id="vxp">Preparando…</p><div class="prog"><i id="vxb"></i></div><button class="gb" id="vxc" style="margin-top:10px">Cancelar</button></div>`;$('#mod').hidden=false;
 let cancel=false;$('#vxc').onclick=()=>{cancel=true};const st=(t,p)=>{$('#vxp').textContent=t;if(p!=null)$('#vxb').style.width=p+'%'};
 try{const lib=await loadMux();st('Mezclando el audio…',2);const mixed=await mixAudio(tot);
  const tgt=new lib.ArrayBufferTarget(),mux=new lib.Muxer({target:tgt,video:{codec:V0.m,width:W,height:H,frameRate:fps},audio:mixed&&A0?{codec:A0.m,numberOfChannels:2,sampleRate:48000}:undefined,fastStart:'in-memory',firstTimestampBehavior:'offset'});
  let err=null;const ve=new VideoEncoder({output:(ch,meta)=>mux.addVideoChunk(ch,meta),error:e=>err=e});ve.configure(V0.cfg);
  const oc=mk(W,H),ox=oc.getContext('2d');vLastI=-1;vsnapFor=-1;
  for(let f=0;f<N;f++){if(cancel||err)break;const t=Math.min(tot-.001,f/fps),a=vAt(t),s=SRC[a.c.src];if(s.type==='video')await seekTo(s.el,Math.min(a.local,s.dur-.01));
   vrender(ox,1,true,t);const fr=new VideoFrame(oc,{timestamp:Math.round(f*1e6/fps),duration:Math.round(1e6/fps)});ve.encode(fr,{keyFrame:f%60===0});fr.close();
   while(ve.encodeQueueSize>8)await new Promise(r=>setTimeout(r,5));if(f%5===0)st(`Creando video… ${Math.round(f/N*100)}%`,5+f/N*85)}
  if(cancel){ve.close();$('#mod').hidden=true;return toast('Exportación cancelada')}if(err)throw err;await ve.flush();
  if(mixed&&A0){st('Añadiendo el audio…',92);let aerr=null;const ae=new AudioEncoder({output:(ch,meta)=>mux.addAudioChunk(ch,meta),error:e=>aerr=e});ae.configure(A0.cfg);const n=mixed.length,L0=mixed.getChannelData(0),R0=mixed.numberOfChannels>1?mixed.getChannelData(1):L0;
   for(let i=0;i<n;i+=1024){const m=Math.min(1024,n-i),d=new Float32Array(m*2);d.set(L0.subarray(i,i+m),0);d.set(R0.subarray(i,i+m),m);const ad=new AudioData({format:'f32-planar',sampleRate:48000,numberOfFrames:m,numberOfChannels:2,timestamp:Math.round(i/48000*1e6),data:d});ae.encode(ad);ad.close()}
   await ae.flush();if(aerr)throw aerr}
  mux.finalize();const blob=new Blob([tgt.buffer],{type:'video/mp4'}),url=URL.createObjectURL(blob),name=`retoka-video-${Date.now()}.mp4`;st('¡Listo!',100);
  $('#outs').innerHTML=`<figure style="grid-column:1/-1;max-width:360px"><video src="${url}" controls playsinline style="width:100%;border-radius:10px;background:#000"></video>
   ${dl?`<button class="wb" id="vxdl">Descargar video (${(blob.size/1048576).toFixed(1)} MB)</button>`:`<a class="wb" href="${url}" download="${name}">Descargar video (${(blob.size/1048576).toFixed(1)} MB)</a>`}
   ${!mixed||!A0?'<p class="hint">Este video se exportó sin audio'+(mixed&&!A0?' porque tu navegador no puede codificarlo':'')+'.</p>':''}</figure>`;
  const b=$('#vxdl');if(b)b.onclick=async()=>{try{await dl.save({filename:name,data:blob});toast('Video guardado')}catch(e){if(e&&e.code!=='declined')toast('No se pudo descargar aquí')}}}
 catch(e){console.error(e);st('No se pudo exportar el video: '+(e&&e.message||e),0)}finally{vLastI=-1;draw()}}

/* ---------- integración con la app ---------- */
document.addEventListener('keydown',e=>{if(S.mode!=='video')return;const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);if(typing)return;const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey;
 const go=a=>{e.preventDefault();e.stopImmediatePropagation();vAct(a)};
 if(e.code==='Space'){e.preventDefault();vplay?vPause():vPlay()}else if(m&&k==='x')go('vcut');else if(m&&k==='c')go('vcopy');else if(m&&k==='v')go('vpaste');else if(m&&k==='d')go('vdup');
 else if(!m&&k==='s')go('vsplit');else if(k==='delete'||k==='backspace')go('vdel');else if(k==='arrowleft'||k==='arrowright'){e.preventDefault();vSeek(VD.t+(k==='arrowleft'?-1:1)*(e.shiftKey?1:1/30))}},true);
