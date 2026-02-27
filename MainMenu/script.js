const APPS = [
  {
    id: 'talkscope',
    name: 'TalkScope',
    icon: '🎙️',
    description: '専門用語のリアルタイム解説と音声の自動文字起こし',
    url: 'http://localhost:3000', // バックエンドのポートにあわせて変更可能
    className: 'talkscope'
  },
  {
    id: 'realyou',
    name: 'RealYou',
    icon: '🎭',
    description: 'あなたの「空気読み」スキルを診断・チェックするゲーム',
    url: 'http://localhost:3001',
    className: 'realyou'
  },
  {
    id: 'growtree',
    name: 'GrowTree',
    icon: '🌳',
    description: 'GitHubの活動履歴からあなたのエンジニアとしての成長を可視化',
    url: 'http://localhost:3002',
    className: 'growtree'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    description: 'アプリの全体設定やAPIキー、外部連携を構成する',
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

  // メニューカードの生成
  APPS.forEach((app, index) => {
    const card = document.createElement('div'); // aタグからdivに変更し、デフォルトの遷移を防ぐ
    card.className = `app-card ${app.className}`;
    
    // アニメーションのディレイ
    card.style.animationDelay = `${(index + 1) * 0.1}s`;

    card.innerHTML = `
      <span class="card-icon">${app.icon}</span>
      <h2 class="card-title">${app.name}</h2>
      <p class="card-desc">${app.description}</p>
    `;

    // クリックイベント: 別タブではなく、同じ画面内にシームレスに表示する
    card.addEventListener('click', () => {
      if (app.url === '#') return; // 実装待ちのSettingsなどは何もしない

      // 1. ポータルをフェードアウト
      portalView.classList.add('fade-out');
      
      // 2. iframeにURLをセットし、タイトルを更新
      appFrame.src = app.url;
      currentAppTitle.textContent = app.name;

      // 3. アプリビューをフェードイン
      setTimeout(() => {
        appView.classList.remove('hidden');
      }, 200); // わずかに遅らせてから表示
    });

    gridContainer.appendChild(card);
  });

  // 戻るボタンの処理: アプリを閉じてメニューに戻る
  backButton.addEventListener('click', () => {
    // 1. アプリビューをフェードアウト
    appView.classList.add('hidden');
    
    // 2. ポータルをフェードイン
    setTimeout(() => {
      portalView.classList.remove('fade-out');
      // 3. メモリ解放のためiframeのsrcをクリア（通信も切断される）
      setTimeout(() => {
        appFrame.src = '';
      }, 400);
    }, 200);
  });
});
