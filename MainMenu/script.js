// 環境検出: localhost なら開発環境
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const APPS = [
  {
    id: 'talkscope',
    name: 'TalkScope',
    description: 'AI-Powered Terminology Mapping.',
    url: '/talkscope/',              // prod: Vercel rewrite proxy
    localUrl: 'http://localhost:5173', // local: Vite dev server
    icon: '🫧',
    className: 'talkscope',
    whisper: 'EXTRACTING INTENT FROM PACKET:%ID%...'
  },
  {
    id: 'realyou',
    name: 'RealYou',
    description: 'Your true self, visualized.',
    url: '/realyou/',
    localUrl: 'http://localhost:3001',
    icon: '💬',
    className: 'realyou',
    whisper: 'DETECTING EMOTIONAL DISSONANCE IN %ID%...'
  },
  {
    id: 'growtree',
    name: 'GrowTree',
    description: 'Climb the tree of growth.',
    url: '/growtree/',
    localUrl: 'http://localhost:3000',
    icon: '🌳',
    className: 'growtree',
    whisper: 'SYNTHESIZING EXPERIENTIAL DATA %ID%...'
  },
  {
    id: 'timefaker',
    name: 'TimeFacker',
    description: 'Manipulate the temporal flow.',
    url: '#',
    localUrl: '#',
    icon: '🕒',
    className: 'timefaker',
    whisper: 'TEMPORAL DRIFT DETECTED IN SESSION %ID%...'
  }
];

// 環境に応じたURLを返す
function getAppUrl(app) {
  return IS_LOCAL ? app.localUrl : app.url;
}

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

  // ======== Auth Mock Logic ========
  const authOverlay = document.getElementById('auth-overlay');
  const loadingOverlay = document.getElementById('loading-overlay');
  const authUsernameInput = document.getElementById('auth-username');
  const authConfirmBtn = document.getElementById('auth-confirm-btn');
  const loadingProgress = document.getElementById('loading-progress');
  const loadingText = document.getElementById('loading-text');

  const savedUser = localStorage.getItem('chimera_username');
  if (savedUser) {
      portalView.classList.remove('hidden');
  } else {
      if (authOverlay) authOverlay.classList.remove('hidden');
  }

  if (authConfirmBtn) {
      authConfirmBtn.addEventListener('click', () => {
        const userVal = authUsernameInput.value.trim() || 'ANONYMOUS';

        const enterPortal = () => {
          localStorage.setItem('chimera_username', userVal);
          loadingOverlay.classList.add('hidden');
          portalView.classList.remove('hidden');
          triggerFlash();
          document.body.style.animation = 'terminalShake 0.4s';
          setTimeout(() => document.body.style.animation = '', 400);
        };

        authOverlay.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');
        loadingText.textContent = 'AUTHENTICATING...';
        loadingText.style.color = '#fff';
        loadingProgress.style.width = '20%';

        fetch('http://127.0.0.1:3001/api/register/chimera', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: userVal,
                auth_type: 'dummy'
            })
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error(`APIエラー: ${response.status}`);
            }
        })
        .then(data => {
            console.log('APIレスポンス:', data.message);
          if (!data.user_id) {
            throw new Error('user_id が返却されませんでした');
          }

          localStorage.setItem('chimera_user_id', data.user_id);
          loadingProgress.style.width = '100%';
          loadingText.textContent = 'ACCESS GRANTED.';
          loadingText.style.color = '#0f0';

          setTimeout(() => {
            enterPortal();
          }, 300);
        })
        .catch(error => {
            console.error('通信エラー:', error);
          loadingProgress.style.width = '0%';
          loadingText.textContent = 'AUTH FAILED.';
          loadingText.style.color = '#f00';

          setTimeout(() => {
            loadingOverlay.classList.add('hidden');
            authOverlay.classList.remove('hidden');
          }, 1200);
        });
    });
  }
  // ===================================

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
            <div class="chat-bubble app">hey, connection is unstable again.</div>
            <div class="chat-bubble user">I know... the glitching is getting worse.</div>
            <div class="chat-bubble app">Did you see the new TimeFaker module?</div>
            <div class="chat-bubble user">${app.description}</div>
            <div class="chat-bubble app emoji">✨🌈💖</div>
            <div class="chat-bubble user">We need to find the root node...</div>
            <div class="chat-bubble app">${app.name} initialization complete.</div>
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
      const TS_KEYWORDS = ['AI', 'Intent', 'Vector', 'Context', 'Graph', 'Semantic', 'Node'];
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
      if (app.id === 'timefaker') {
         const modal = document.getElementById('timefaker-modal');
         if (modal) {
             triggerFlash();
             document.body.style.animation = 'terminalShake 0.2s';
             setTimeout(() => document.body.style.animation = '', 200);
             modal.classList.add('active');
             
             // Pre-fill current time
             const now = new Date();
             document.getElementById('tf-hours').value = String(now.getHours()).padStart(2, '0');
             document.getElementById('tf-minutes').value = String(now.getMinutes()).padStart(2, '0');
             document.getElementById('tf-status-msg').textContent = 'AWAITING INPUT...';
             document.getElementById('tf-status-msg').style.color = '#fff';
         }
         return;
      }

      const targetUrl = getAppUrl(app);

      if (targetUrl === '#') {
        triggerFlash();
        alert("CRITICAL ERROR 0x000F: CANNOT MOUNT VOLUME.\nSYSTEM INSTABILITY DETECTED.");
        return;
      }

      triggerFlash();
      document.body.style.animation = 'terminalShake 0.2s';
      setTimeout(() => document.body.style.animation = '', 200);

      // 別タブで各アプリを開く
      setTimeout(() => {
        window.open(targetUrl, '_blank');
      }, 200);
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

  // TimeFaker Modal Logic
  const tfModal = document.getElementById('timefaker-modal');
  const tfCancelBtn = document.getElementById('tf-cancel-btn');
  const tfSetBtn = document.getElementById('tf-set-btn');
  const tfStatusMsg = document.getElementById('tf-status-msg');
  
  // Date Elements
  const tfDateInput = document.getElementById('tf-date-input');
  const tfDatePrev = document.getElementById('tf-date-prev');
  const tfDateNext = document.getElementById('tf-date-next');
  
  // Time Elements
  const tfHoursInput = document.getElementById('tf-hours');
  const tfMinutesInput = document.getElementById('tf-minutes');
  const tfHourUp = document.getElementById('tf-hour-up');
  const tfHourDown = document.getElementById('tf-hour-down');

  // Quick Action Elements
  const tfBtnNow = document.getElementById('tf-btn-now');
  const tfBtn24h = document.getElementById('tf-btn-24h');
  const tfBtn3d = document.getElementById('tf-btn-3d');

  let currentTemporalState = new Date();

  const syncStateToUI = () => {
      currentTemporalState.setMinutes(0);
      currentTemporalState.setSeconds(0);
      
      if(!tfDateInput || !tfHoursInput || !tfMinutesInput) return;
      
      const y = currentTemporalState.getFullYear();
      const m = String(currentTemporalState.getMonth() + 1).padStart(2, '0');
      const d = String(currentTemporalState.getDate()).padStart(2, '0');
      tfDateInput.value = `${y}-${m}-${d}`;

      tfHoursInput.value = String(currentTemporalState.getHours()).padStart(2, '0');
      tfMinutesInput.textContent = '00';
      
      // Flash inputs to show change
      [tfHoursInput, tfMinutesInput].forEach(el => {
          el.style.textShadow = '0 0 20px #fff, 0 0 30px #0ff';
          el.style.color = '#fff';
          setTimeout(() => {
              el.style.textShadow = '';
              el.style.color = '';
          }, 150);
      });
  };

  const syncUIToState = () => {
      const dateParts = tfDateInput.value.split('-');
      if(dateParts.length === 3) {
          currentTemporalState.setFullYear(parseInt(dateParts[0]));
          currentTemporalState.setMonth(parseInt(dateParts[1]) - 1);
          currentTemporalState.setDate(parseInt(dateParts[2]));
      }
      currentTemporalState.setHours(parseInt(tfHoursInput.value) || 0);
      currentTemporalState.setMinutes(0);
  };

  if (tfModal && tfCancelBtn && tfSetBtn) {
      // Modifiers
      tfDatePrev.addEventListener('click', () => { currentTemporalState.setDate(currentTemporalState.getDate() - 1); syncStateToUI(); });
      tfDateNext.addEventListener('click', () => { currentTemporalState.setDate(currentTemporalState.getDate() + 1); syncStateToUI(); });
      
      tfHourUp.addEventListener('click', () => { currentTemporalState.setHours((currentTemporalState.getHours() + 1) % 24); syncStateToUI(); });
      tfHourDown.addEventListener('click', () => { currentTemporalState.setHours((currentTemporalState.getHours() - 1 + 24) % 24); syncStateToUI(); });

      // Quick Actions
      tfBtnNow.addEventListener('click', () => { currentTemporalState = new Date(); syncStateToUI(); tfStatusMsg.textContent = 'SYNCED TO PRESENT HOUR'; });
      tfBtn24h.addEventListener('click', () => { currentTemporalState.setHours(currentTemporalState.getHours() + 24); syncStateToUI(); tfStatusMsg.textContent = 'FAST FORWARD 24H'; });
      tfBtn3d.addEventListener('click', () => { currentTemporalState.setDate(currentTemporalState.getDate() + 3); syncStateToUI(); tfStatusMsg.textContent = 'FAST FORWARD 3 DAYS'; });

      // Manual Inputs
      tfDateInput.addEventListener('change', syncUIToState);
      
      const inputs = [tfHoursInput];
      inputs.forEach(input => {
          input.addEventListener('change', (e) => {
              let val = parseInt(e.target.value) || 0;
              let max = parseInt(e.target.max);
              if (val > max) val = max;
              if (val < 0) val = 0;
              e.target.value = String(val).padStart(2, '0');
              syncUIToState();
          });
      });

      // Base Modal interactions
      tfCancelBtn.addEventListener('click', () => {
          tfModal.classList.remove('active');
      });

      tfSetBtn.addEventListener('click', () => {
          const formattedDate = tfDateInput.value;
          const h = tfHoursInput.value;

          console.log("取得した日付:", formattedDate);
          console.log("取得した時間:", h);
          
          const hour24 = Number(h); // 時間を文字列から数値に変換

          const today = new Date();
          today.setHours(0, 0, 0, 0); // 時間をリセットして日付のみで比較
          const targetDate = new Date(formattedDate);
          targetDate.setHours(0, 0, 0, 0);
          
          const diffTime = targetDate.getTime() - today.getTime();
          const daysAfter = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          const payload = {
              "days_after": daysAfter,
              "hour_24": hour24
          };
          console.log("送信するデータ:", payload);

          fetch('http://127.0.0.1:8000/api/config/review-delay', {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
          })
          .then(response => {
              if (!response.ok) {
                  throw new Error(`HTTPエラー: ${response.status}`);
              }
              return response.json();
          })
          .then(data => {
              console.log("API送信成功:", data);
              
              tfStatusMsg.textContent = `OVERRIDE ACCEPTED: ${formattedDate} ${h}:00`;
              tfStatusMsg.style.color = '#0ff';
              
              triggerFlash();
              document.body.style.animation = 'terminalShake 0.4s';
              setTimeout(() => document.body.style.animation = '', 400);

              setTimeout(() => {
                  tfModal.classList.remove('active');
              }, 1500);
          })
          .catch(error => {
              console.error("API送信エラー:", error);
              tfStatusMsg.textContent = `ERROR: CONNECTION FAILED`;
              tfStatusMsg.style.color = '#f00';
          });
      });
  }
});
