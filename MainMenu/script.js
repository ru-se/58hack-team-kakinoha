const APPS = [
  {
    id: 'talkscope',
    name: 'TalkScope_v3.1.4',
    icon: '🗣️',
    description: 'Real-time Terminology AI. Clean, Glassmorphic, Perfection.',
    url: 'http://localhost:3000', 
    className: 'talkscope'
  },
  {
    id: 'realyou',
    name: 'REAL YOU!!!',
    icon: '🎭',
    description: 'POP! BRUTAL! DETECT YOUR SOCIAL SKILLS NOW!',
    url: 'http://localhost:3001',
    className: 'realyou'
  },
  {
    id: 'growtree',
    name: 'GrowTree - Quest Log',
    icon: '🌳',
    description: '[Lv.99] A visualization of your Github grinding history. Retro vibes only.',
    url: 'http://localhost:3002',
    className: 'growtree'
  },
  {
    id: 'settings',
    name: 'sys_config.exe',
    icon: '⚙️',
    description: 'WARN: UNSTABLE MODULE. ACCESS AT OWN RISK. \n root@chimera:~# _',
    url: '#',
    className: 'settings',
    whisper: 'Kernel access granted. Trace ID: %ID%'
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
    settings: document.querySelector('.bg-settings'),
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

    const content = document.createElement('div');
    content.className = 'card-inner';
    
    // アプリ固有の装飾HTML
    let extraHTML = '';
    if(app.id === 'talkscope') {
        extraHTML = `<div class="ts-live-text">Live: Processing audio...</div>
                     <div class="ts-waveform">${'<div class="ts-wave-bar"></div>'.repeat(12)}</div>`;
    } else if(app.id === 'growtree') {
        extraHTML = `<div class="gt-xp-bar"><div class="gt-xp-fill"></div></div>`;
    } else if(app.id === 'settings') {
        extraHTML = `<div class="sys-log">TRACING KERNEL... <span class="blink">_</span></div>`;
    }

    content.innerHTML = `
      <span class="card-icon">${app.icon}</span>
      <h2 class="card-title">${app.name}</h2>
      <p class="card-desc">${app.id === 'settings' ? app.description : app.description}</p>
      ${extraHTML}
    `;
    card.appendChild(content);

    // ======== ホバー時の背景変化イベント ========
    card.addEventListener('mouseenter', () => {
      // 一旦すべての背景を非アクティブ化
      Object.keys(bgElements).forEach(key => {
        if(bgElements[key]) bgElements[key].classList.remove('active');
      });
      // 該当アプリの背景をアクティブ化
      if(bgElements[app.id]) {
        bgElements[app.id].classList.add('active');
      }

      // 囁きの個別化
      if(app.whisper && whisperBar) {
          whisperBar.textContent = app.whisper.replace('%ID%', Math.random().toString(16).substring(2, 8).toUpperCase());
      }

      // 動的タイマー開始
      if(app.id === 'talkscope') {
          app.timer = setInterval(() => {
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
      if(bgElements[app.id]) {
        bgElements[app.id].classList.remove('active');
      }
      updateStatus();
      if(app.timer) clearInterval(app.timer);
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
