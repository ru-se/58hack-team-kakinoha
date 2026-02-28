const APPS = [
  {
    id: 'talkscope',
    name: 'TalkScope',
    description: 'AI-Powered Terminology Mapping.',
    url: '../TalkScope/Frontend/dist/index.html',
    icon: '🫧',
    className: 'talkscope',
    whisper: 'EXTRACTING INTENT FROM PACKET:%ID%...'
  },
  {
    id: 'realyou',
    name: 'RealYou',
    description: 'Your true self, visualized.',
    url: '../RealYou/frontend/out/index.html',
    icon: '💬',
    className: 'realyou',
    whisper: 'DETECTING EMOTIONAL DISSONANCE IN %ID%...'
  },
  {
    id: 'growtree',
    name: 'GrowTree',
    description: 'Climb the tree of growth.',
    url: '../GrowTree/frontend/out/index.html',
    icon: '🌳',
    className: 'growtree',
    whisper: 'SYNTHESIZING EXPERIENTIAL DATA %ID%...'
  },
  {
    id: 'timefaker',
    name: 'TimeFacker',
    description: 'Manipulate the temporal flow.',
    url: '#', // Placeholder or real URL if known
    icon: '🕒',
    className: 'timefaker',
    whisper: 'TEMPORAL DRIFT DETECTED IN SESSION %ID%...'
  }
];

// 囁きの更新メッセージ
const statuses = [
  'CHIMERA_OS // USER_ID: CASHEW // AUTHENTICATED?',
  'CHIMERA_OS // PROJECT: "Streamer-io" DETECTED // MEMORY_LEAK',
  'CHIMERA_OS // PULSE: 110bpm // ADRENALINE_SPIKE',
  'CHIMERA_OS // KERNEL PANIC // SUTURE STRESS HIGH',
  'CHIMERA_OS // ANTI-REJECTION: CRITICAL // DO NOT MOVE',
];

document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('app-grid');
  const portalView = document.getElementById('portal-view');
  const appView = document.getElementById('app-view');
  const appFrame = document.getElementById('app-frame');
  const backButton = document.getElementById('back-button');
  const currentAppTitle = document.getElementById('current-app-title');
  const whisperBar = document.getElementById('whisper-bar');

  // ======== 共通演出システム ========

  // 1. ステータス囁きの更新
  let statusIndex = 0;
  const updateStatus = () => {
    if(!whisperBar) return;
    whisperBar.textContent = statuses[statusIndex];
    statusIndex = (statusIndex + 1) % statuses.length;
  };
  setInterval(updateStatus, 5000);
  updateStatus();

  // 2. フラッシュ演出
  const triggerFlash = () => {
    document.body.classList.add('flash-active');
    setTimeout(() => document.body.classList.remove('flash-active'), 200);
  };

  // 3. マウス・トレイル（神経系）
  document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.9) { 
        const trail = document.createElement('div');
        trail.className = 'nerve-trail';
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
        trail.style.transform = `rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(trail);

        trail.animate([
            { opacity: 1, transform: `scale(1) rotate(${trail.style.transform})` },
            { opacity: 0, transform: `scale(1.5) rotate(${trail.style.transform})` }
        ], { duration: 600, easing: 'ease-out' });

        setTimeout(() => trail.remove(), 600);
    }
  });

  // 4. ランダムな画面の揺れ（極小）
  setInterval(() => {
    if (Math.random() > 0.95) {
        document.body.style.transform = `translate(${Math.random()*4-2}px, ${Math.random()*4-2}px)`;
        setTimeout(() => document.body.style.transform = '', 50);
    }
  }, 3000);

  // 動的背景の要素群
  const bgElements = {
    talkscope: document.querySelector('.bg-talkscope'),
    realyou: document.querySelector('.bg-realyou'),
    growtree: document.querySelector('.bg-growtree'),
    timefaker: document.querySelector('.bg-timefaker'),
  };

  const stitch1 = document.createElement('div');
  stitch1.className = 'patch-stitch stitch-1';
  document.body.appendChild(stitch1);

  const stitch2 = document.createElement('div');
  stitch2.className = 'patch-stitch stitch-2';
  document.body.appendChild(stitch2);

  APPS.forEach((app, index) => {
    const card = document.createElement('div');
    card.className = `app-card ${app.className}`;
    
    const tape = document.createElement('div');
    tape.className = 'duct-tape card-tape';
    if(Math.random() > 0.5) {
      tape.style.top = Math.random() > 0.5 ? '-15px' : 'auto';
      tape.style.bottom = tape.style.top === 'auto' ? '-15px' : 'auto';
      tape.style.left = Math.random() > 0.5 ? '-15px' : 'auto';
      tape.style.right = tape.style.left === 'auto' ? '-15px' : 'auto';
      tape.style.transform = `rotate(${Math.floor(Math.random() * 90 - 45)}deg)`;
      card.appendChild(tape);
    }

    // --- Radical Card Architecture Generation ---
    let cardHTML = '';
    
    if (app.id === 'talkscope') {
      // BUBBLE ARCHITECTURE
      cardHTML = `
        <div class="bubble-layout">
          <div class="main-bubble">${app.name}</div>
          <div class="sub-bubble info">${app.description}</div>
          <div class="sub-bubble icon">${app.icon}</div>
          <div class="ts-bubble-cloud"></div>
        </div>
      `;
    } else if (app.id === 'realyou') {
      // CHAT UI ARCHITECTURE
      cardHTML = `
        <div class="chat-layout">
          <div class="chat-header"><span>RealYou Messenger</span><span class="chat-status"></span></div>
          <div class="chat-body">
            <div class="chat-bubble app">${app.name}</div>
            <div class="chat-bubble user">${app.description} ${app.icon}</div>
            <div class="chat-bubble app emoji">✨🌈💖</div>
          </div>
        </div>
      `;
    } else if (app.id === 'growtree') {
      // TREE ARCHITECTURE
      cardHTML = `
        <div class="tree-layout">
          <svg class="tree-svg" viewBox="0 0 100 100">
            <path d="M50,80 Q50,50 50,20 M50,50 Q30,40 20,30 M50,40 Q70,30 80,20" stroke="currentColor" fill="none" stroke-width="2"/>
          </svg>
          <div class="tree-content">
            <h2 class="card-title">${app.name}</h2>
            <p class="card-desc">${app.description}</p>
            <div class="gt-xp-bar"><div class="gt-xp-fill"></div></div>
          </div>
        </div>
      `;
    } else if (app.id === 'timefaker') {
      // CLOCK ARCHITECTURE
      cardHTML = `
        <div class="clock-layout">
          <div class="digital-clock">00:00:00</div>
          <div class="clock-details">
            <h2 class="card-title">${app.name}</h2>
            <p class="card-desc">${app.description}</p>
          </div>
        </div>
      `;
    }

    card.innerHTML = cardHTML;

    // --- Dynamic Behaviors ---
    if (app.id === 'talkscope') {
      const tsCloud = card.querySelector('.ts-bubble-cloud');
      const TS_KEYWORDS = ['AI', 'Intent', 'Vector', 'Context', 'Graph'];
      TS_KEYWORDS.forEach((word, i) => {
          const b = document.createElement('div');
          b.className = 'ts-bubble';
          b.textContent = word;
          b.style.width = (30 + Math.random() * 20) + 'px';
          b.style.height = b.style.width;
          b.style.left = (Math.random() * 80 + 10) + '%';
          b.style.top = (Math.random() * 80 + 10) + '%';
          b.style.animationDelay = (i * 0.8) + 's';
          tsCloud.appendChild(b);
      });
    }

    if (app.id === 'timefaker') {
       const clock = card.querySelector('.digital-clock');
       app.timer = setInterval(() => { // Store interval ID on app object
         const now = new Date();
         clock.textContent = now.toTimeString().split(' ')[0];
       }, 1000);
    }

    // ======== ホバー時の背景変化イベント ========
    card.addEventListener('mouseenter', () => {
      // 一旦すべての背景を非アクティブ化
      Object.keys(bgElements).forEach(key => {
        if(bgElements[key]) bgElements[key].classList.remove('active');
      });
      // 該当アプリの背景をアクティブ化
      if(bgElements[app.id === 'timefaker' ? 'settings' : app.id]) {
        bgElements[app.id === 'timefaker' ? 'settings' : app.id].classList.add('active');
      }

      // 囁きの個別化
      if(app.whisper && whisperBar) {
          whisperBar.textContent = app.whisper.replace('%ID%', Math.random().toString(16).substring(2, 8).toUpperCase());
      }
      
      if(app.id === 'realyou') {
          const status = card.querySelector('.chat-status');
          if(status) status.textContent = 'Typing...';
      }

      // 動的タイマー開始 (moved from original)
      if(app.id === 'talkscope') {
          app.liveTextTimer = setInterval(() => { // Renamed to avoid conflict with timefaker's app.timer
              const liveText = card.querySelector('.ts-live-text');
              if(liveText) liveText.textContent = `Live: "${['Terminology...', 'AI mapping...', 'Data stream...', 'Packet capture...'][Math.floor(Math.random()*4)]}"`;
          }, 1000);
      }
      if(app.id === 'settings') {
          app.logTimer = setInterval(() => {
              const logArea = card.querySelector('.sys-log');
              if(logArea) logArea.innerHTML = `LOG: ${Math.random().toString(16).slice(2, 10).toUpperCase()} <span class="blink">_</span>`;
          }, 1200);
      }
    });

    card.addEventListener('mouseleave', () => {
      // マウスが外れたら背景を元に戻す
      const bgId = app.id === 'timefaker' ? 'settings' : app.id;
      if(bgElements[bgId]) {
        bgElements[bgId].classList.remove('active');
      }
      updateStatus();
      if(app.id === 'realyou') {
        const status = card.querySelector('.chat-status');
        if(status) status.textContent = 'Online';
      }
      // Clear dynamic timers
      if(app.liveTextTimer) clearInterval(app.liveTextTimer);
      if(app.logTimer) clearInterval(app.logTimer);
    });
    // ===========================================

    // クリックイベント
    card.addEventListener('click', () => {
      if (app.url === '#') {
        triggerFlash();
        alert("CRITICAL ERROR 0x000F: CANNOT MOUNT VOLUME.\nSYSTEM INSTABILITY DETECTED.");
        return; 
      }

      triggerFlash();
      document.body.style.animation = 'terminalShake 0.2s';
      setTimeout(() => document.body.style.animation = '', 200);

      portalView.classList.add('fade-out');
      
      appFrame.src = app.url;
      currentAppTitle.textContent = `>>> MOUNTING: ${app.name} >>> CAUTION: INTEGRATION UNSTABLE >>> `;

      setTimeout(() => {
        appView.classList.remove('hidden');
      }, 300);
    });

    gridContainer.appendChild(card);
  });

  backButton.addEventListener('click', () => {
    appView.classList.add('hidden');
    
    setTimeout(() => {
      portalView.classList.remove('fade-out');
      setTimeout(() => {
        appFrame.src = '';
      }, 500);
    }, 400);
  });
});
