(function(){const d=document.createElement("link").relList;if(d&&d.supports&&d.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))m(s);new MutationObserver(s=>{for(const i of s)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&m(c)}).observe(document,{childList:!0,subtree:!0});function v(s){const i={};return s.integrity&&(i.integrity=s.integrity),s.referrerPolicy&&(i.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?i.credentials="include":s.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function m(s){if(s.ep)return;s.ep=!0;const i=v(s);fetch(s.href,i)}})();const N=[{id:"talkscope",name:"TalkScope",description:"AI-Powered Terminology Mapping.",url:"../TalkScope/Frontend/dist/index.html",icon:"🫧",className:"talkscope",whisper:"EXTRACTING INTENT FROM PACKET:%ID%..."},{id:"realyou",name:"RealYou",description:"Your true self, visualized.",url:"../RealYou/frontend/out/index.html",icon:"💬",className:"realyou",whisper:"DETECTING EMOTIONAL DISSONANCE IN %ID%..."},{id:"growtree",name:"GrowTree",description:"Climb the tree of growth.",url:"../GrowTree/frontend/out/index.html",icon:"🌳",className:"growtree",whisper:"SYNTHESIZING EXPERIENTIAL DATA %ID%..."},{id:"timefaker",name:"TimeFacker",description:"Manipulate the temporal flow.",url:"#",icon:"🕒",className:"timefaker",whisper:"TEMPORAL DRIFT DETECTED IN SESSION %ID%..."}],I=["CHIMERA_OS // USER_ID: CASHEW // AUTHENTICATED?",'CHIMERA_OS // PROJECT: "Streamer-io" DETECTED // MEMORY_LEAK',"CHIMERA_OS // PULSE: 110bpm // ADRENALINE_SPIKE","CHIMERA_OS // KERNEL PANIC // SUTURE STRESS HIGH","CHIMERA_OS // ANTI-REJECTION: CRITICAL // DO NOT MOVE"];document.addEventListener("DOMContentLoaded",()=>{const b=document.getElementById("app-grid"),d=document.getElementById("portal-view"),v=document.getElementById("app-view"),m=document.getElementById("app-frame"),s=document.getElementById("back-button"),i=document.getElementById("current-app-title"),c=document.getElementById("whisper-bar");let f=0;const y=()=>{c&&(c.textContent=I[f],f=(f+1)%I.length)};setInterval(y,5e3),y();const E=()=>{document.body.classList.add("flash-active"),setTimeout(()=>document.body.classList.remove("flash-active"),200)};document.addEventListener("mousemove",e=>{if(Math.random()>.9){const a=document.createElement("div");a.className="nerve-trail",a.style.left=e.clientX+"px",a.style.top=e.clientY+"px",a.style.transform=`rotate(${Math.random()*360}deg)`,document.body.appendChild(a),a.animate([{opacity:1,transform:`scale(1) rotate(${a.style.transform})`},{opacity:0,transform:`scale(1.5) rotate(${a.style.transform})`}],{duration:600,easing:"ease-out"}),setTimeout(()=>a.remove(),600)}}),setInterval(()=>{Math.random()>.95&&(document.body.style.transform=`translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`,setTimeout(()=>document.body.style.transform="",50))},3e3);const l={talkscope:document.querySelector(".bg-talkscope"),realyou:document.querySelector(".bg-realyou"),growtree:document.querySelector(".bg-growtree"),timefaker:document.querySelector(".bg-timefaker")},T=document.createElement("div");T.className="patch-stitch stitch-1",document.body.appendChild(T);const g=document.createElement("div");g.className="patch-stitch stitch-2",document.body.appendChild(g),N.forEach((e,a)=>{const o=document.createElement("div");o.className=`app-card ${e.className}`;const r=document.createElement("div");r.className="duct-tape card-tape",Math.random()>.5&&(r.style.top=Math.random()>.5?"-15px":"auto",r.style.bottom=r.style.top==="auto"?"-15px":"auto",r.style.left=Math.random()>.5?"-15px":"auto",r.style.right=r.style.left==="auto"?"-15px":"auto",r.style.transform=`rotate(${Math.floor(Math.random()*90-45)}deg)`,o.appendChild(r));let u="";if(e.id==="talkscope"?u=`
        <div class="bubble-layout">
          <div class="main-bubble">${e.name}</div>
          <div class="sub-bubble info">${e.description}</div>
          <div class="sub-bubble icon">${e.icon}</div>
          <div class="ts-bubble-cloud"></div>
        </div>
      `:e.id==="realyou"?u=`
        <div class="chat-layout">
          <div class="chat-header"><span>RealYou Messenger</span><span class="chat-status"></span></div>
          <div class="chat-body">
            <div class="chat-bubble app">hey, connection is unstable again.</div>
            <div class="chat-bubble user">I know... the glitching is getting worse.</div>
            <div class="chat-bubble app">Did you see the new TimeFaker module?</div>
            <div class="chat-bubble user">${e.description}</div>
            <div class="chat-bubble app emoji">✨🌈💖</div>
            <div class="chat-bubble user">We need to find the root node...</div>
            <div class="chat-bubble app">${e.name} initialization complete.</div>
          </div>
        </div>
      `:e.id==="growtree"?u=`
        <div class="tree-layout">
          <svg class="tree-svg" viewBox="0 0 100 100">
            <path d="M50,80 Q50,50 50,20 M50,50 Q30,40 20,30 M50,40 Q70,30 80,20" stroke="currentColor" fill="none" stroke-width="2"/>
          </svg>
          <div class="tree-content">
            <h2 class="card-title">${e.name}</h2>
            <p class="card-desc">${e.description}</p>
            <div class="gt-xp-bar"><div class="gt-xp-fill"></div></div>
          </div>
        </div>
      `:e.id==="timefaker"&&(u=`
        <div class="clock-layout">
          <div class="digital-clock">00:00:00</div>
          <div class="clock-details">
            <h2 class="card-title">${e.name}</h2>
            <p class="card-desc">${e.description}</p>
          </div>
        </div>
      `),o.innerHTML=u,e.id==="talkscope"){const t=o.querySelector(".ts-bubble-cloud");["AI","Intent","Vector","Context","Graph","Semantic","Node"].forEach((p,S)=>{const n=document.createElement("div");n.className="ts-bubble",n.textContent=p,n.style.width=30+Math.random()*20+"px",n.style.height=n.style.width,n.style.left=Math.random()*80+10+"%",n.style.top=Math.random()*80+10+"%",n.style.animationDelay=S*.8+"s",t.appendChild(n)})}if(e.id==="timefaker"){const t=o.querySelector(".digital-clock");e.timer=setInterval(()=>{const h=new Date;t.textContent=h.toTimeString().split(" ")[0]},1e3)}o.addEventListener("mouseenter",()=>{if(Object.keys(l).forEach(t=>{l[t]&&l[t].classList.remove("active")}),l[e.id==="timefaker"?"settings":e.id]&&l[e.id==="timefaker"?"settings":e.id].classList.add("active"),e.whisper&&c&&(c.textContent=e.whisper.replace("%ID%",Math.random().toString(16).substring(2,8).toUpperCase())),e.id==="realyou"){const t=o.querySelector(".chat-status");t&&(t.textContent="Typing...")}e.id==="talkscope"&&(e.liveTextTimer=setInterval(()=>{const t=o.querySelector(".ts-live-text");t&&(t.textContent=`Live: "${["Terminology...","AI mapping...","Data stream...","Packet capture..."][Math.floor(Math.random()*4)]}"`)},1e3)),e.id==="settings"&&(e.logTimer=setInterval(()=>{const t=o.querySelector(".sys-log");t&&(t.innerHTML=`LOG: ${Math.random().toString(16).slice(2,10).toUpperCase()} <span class="blink">_</span>`)},1200))}),o.addEventListener("mouseleave",()=>{const t=e.id==="timefaker"?"settings":e.id;if(l[t]&&l[t].classList.remove("active"),y(),e.id==="realyou"){const h=o.querySelector(".chat-status");h&&(h.textContent="Online")}e.liveTextTimer&&clearInterval(e.liveTextTimer),e.logTimer&&clearInterval(e.logTimer)}),o.addEventListener("click",()=>{if(e.url==="#"){E(),alert(`CRITICAL ERROR 0x000F: CANNOT MOUNT VOLUME.
SYSTEM INSTABILITY DETECTED.`);return}E(),document.body.style.animation="terminalShake 0.2s",setTimeout(()=>document.body.style.animation="",200),d.classList.add("fade-out"),m.src=e.url,i.textContent=`>>> MOUNTING: ${e.name} >>> CAUTION: INTEGRATION UNSTABLE >>> `,setTimeout(()=>{v.classList.remove("hidden")},300)}),b.appendChild(o)}),s.addEventListener("click",()=>{v.classList.add("hidden"),setTimeout(()=>{d.classList.remove("fade-out"),setTimeout(()=>{m.src=""},500)},400)})});
