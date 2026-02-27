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
    className: 'settings'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('app-grid');
  const portalView = document.getElementById('portal-view');
  const appView = document.getElementById('app-view');
  const appFrame = document.getElementById('app-frame');
  const backButton = document.getElementById('back-button');
  const currentAppTitle = document.getElementById('current-app-title');

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
    content.innerHTML = `
      <span class="card-icon">${app.icon}</span>
      <h2 class="card-title">${app.name}</h2>
      <p class="card-desc">${app.id === 'settings' ? app.description + '<span class="cursor"></span>' : app.description}</p>
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
    });

    card.addEventListener('mouseleave', () => {
      // マウスが外れたら背景を元に戻す
      if(bgElements[app.id]) {
        bgElements[app.id].classList.remove('active');
      }
    });
    // ===========================================

    // クリックイベント
    card.addEventListener('click', () => {
      if (app.url === '#') {
        alert("CRITICAL ERROR 0x000F: CANNOT MOUNT VOLUME.\nSYSTEM INSTABILITY DETECTED.");
        return; 
      }

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
