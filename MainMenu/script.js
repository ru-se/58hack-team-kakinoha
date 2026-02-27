const APPS = [
  {
    id: 'talkscope',
    name: 'TalkScope',
    icon: '🎙️',
    description: '専門用語のリアルタイム解説と音声の自動文字起こし',
    url: 'http://localhost:3000', // TalkScopeのローカルサーバーURLに変更可能
    className: 'talkscope'
  },
  {
    id: 'realyou',
    name: 'RealYou',
    icon: '🎭',
    description: 'あなたの「空気読み」スキルを診断・チェックするゲーム',
    url: 'http://localhost:3001', // RealYouのローカルサーバーURLに変更可能
    className: 'realyou'
  },
  {
    id: 'growtree',
    name: 'GrowTree',
    icon: '🌳',
    description: 'GitHubの活動履歴からあなたのエンジニアとしての成長を可視化',
    url: 'http://localhost:3002', // GrowTreeのローカルサーバーURLに変更可能
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

  APPS.forEach((app, index) => {
    // aタグの作成
    const card = document.createElement('a');
    card.href = app.url;
    card.className = `app-card ${app.className}`;
    card.target = app.url !== '#' ? '_blank' : '_self';
    card.rel = 'noreferrer';
    
    // アニメーションのディレイをJSで付与
    card.style.animationDelay = `${(index + 1) * 0.1}s`;

    // 内部HTMLの生成
    card.innerHTML = `
      <span class="card-icon">${app.icon}</span>
      <h2 class="card-title">${app.name}</h2>
      <p class="card-desc">${app.description}</p>
    `;

    // グリッドに追加
    gridContainer.appendChild(card);
  });
});
