// 環境検出: localhost なら開発環境
const IS_LOCAL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const APPS = [
  {
    id: "talkscope",
    name: "TalkScope",
    description: "AI-Powered Terminology Mapping.",
    url: "/talkscope/", // prod: Vercel rewrite proxy
    localUrl: "http://localhost:5173", // local: Vite dev server
    icon: "🫧",
    className: "talkscope",
    whisper: "EXTRACTING INTENT FROM PACKET:%ID%...",
  },
  {
    id: "realyou",
    name: "RealYou",
    description: "自分の知識や認識を客観的に自己採点し、自己理解を深める。本当の自分に出会うための自己診断アプリ。",
    url: "/realyou/",
    localUrl: "http://localhost:3001/realyou/",
    icon: "💬",
    className: "realyou",
    whisper: "DETECTING EMOTIONAL DISSONANCE IN %ID%...",
  },
  {
    id: "growtree",
    name: "GrowTree",
    description: "Climb the tree of growth.",
    url: "/growtree/",
    localUrl: "http://localhost:3000/growtree/",
    icon: "🌳",
    className: "growtree",
    whisper: "SYNTHESIZING EXPERIENTIAL DATA %ID%...",
  },
  {
    id: "timefaker",
    name: "TimeFacker",
    description: "Manipulate the temporal flow.",
    url: "#",
    localUrl: "#",
    icon: "🕒",
    className: "timefaker",
    whisper: "TEMPORAL DRIFT DETECTED IN SESSION %ID%...",
  },
];

// 環境に応じたURLを返す
function getAppUrl(app) {
  return IS_LOCAL ? app.localUrl : app.url;
}

// 囁きの更新メッセージ
const statuses = [
  "CHIMERA_OS // USER_ID: CASHEW // AUTHENTICATED?",
  'CHIMERA_OS // PROJECT: "Streamer-io" DETECTED // MEMORY_LEAK',
  "CHIMERA_OS // PULSE: 110bpm // ADRENALINE_SPIKE",
  "CHIMERA_OS // KERNEL PANIC // SUTURE STRESS HIGH",
  "CHIMERA_OS // ANTI-REJECTION: CRITICAL // DO NOT MOVE",
];

document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("app-grid");
  const portalView = document.getElementById("portal-view");
  const appView = document.getElementById("app-view");
  const appFrame = document.getElementById("app-frame");
  const backButton = document.getElementById("back-button");
  const whisperBar = document.getElementById("whisper-bar");

  // ======== 共通演出システム ========

  // 1. ステータス囁きの更新
  let statusIndex = 0;
  const updateStatus = () => {
    if (!whisperBar) return;
    whisperBar.textContent = statuses[statusIndex];
    statusIndex = (statusIndex + 1) % statuses.length;
  };
  setInterval(updateStatus, 5000);
  updateStatus();

  // 2. フラッシュ演出
  const triggerFlash = () => {
    document.body.classList.add("flash-active");
    setTimeout(() => document.body.classList.remove("flash-active"), 200);
  };

  // 3. マウス・トレイル（神経系）
  document.addEventListener("mousemove", (e) => {
    if (Math.random() > 0.9) {
      const trail = document.createElement("div");
      trail.className = "nerve-trail";
      trail.style.left = e.clientX + "px";
      trail.style.top = e.clientY + "px";
      trail.style.transform = `rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(trail);

      trail.animate(
        [
          {
            opacity: 1,
            transform: `scale(1) rotate(${trail.style.transform})`,
          },
          {
            opacity: 0,
            transform: `scale(1.5) rotate(${trail.style.transform})`,
          },
        ],
        { duration: 600, easing: "ease-out" },
      );

      setTimeout(() => trail.remove(), 600);
    }
  });

  // 4. ランダムな画面の揺れ（極小）
  setInterval(() => {
    if (Math.random() > 0.95) {
      document.body.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
      setTimeout(() => (document.body.style.transform = ""), 50);
    }
  }, 3000);

  // ======== Auth Mock Logic ========
  const authOverlay = document.getElementById("auth-overlay");
  const loadingOverlay = document.getElementById("loading-overlay");
  const authUsernameInput = document.getElementById("auth-username");
  const authConfirmBtn = document.getElementById("auth-confirm-btn");
  const loadingProgress = document.getElementById("loading-progress");
  const loadingText = document.getElementById("loading-text");

  const savedUser = localStorage.getItem("chimera_username");
  if (savedUser) {
    portalView.classList.remove("hidden");
  } else {
    if (authOverlay) authOverlay.classList.remove("hidden");
  }

  if (authConfirmBtn) {
    authConfirmBtn.addEventListener("click", () => {
      const userVal = authUsernameInput.value.trim() || "ANONYMOUS";
      const authUrl = `${BACKEND_URL}/api/register/chimera`;

      const enterPortal = () => {
        localStorage.setItem("chimera_username", userVal);
        loadingOverlay.classList.add("hidden");
        portalView.classList.remove("hidden");
        triggerFlash();
        document.body.style.animation = "terminalShake 0.4s";
        setTimeout(() => (document.body.style.animation = ""), 400);
      };

      authOverlay.classList.add("hidden");
      loadingOverlay.classList.remove("hidden");
      loadingText.textContent = "AUTHENTICATING...";
      loadingText.style.color = "#fff";
      loadingProgress.style.width = "20%";

      fetch(authUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userVal,
          auth_type: "dummy",
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(`APIエラー: ${response.status}`);
          }
        })
        .then((data) => {
          console.log("APIレスポンス:", data.message);
          if (!data.user_id) {
            throw new Error("user_id が返却されませんでした");
          }

          localStorage.setItem("chimera_user_id", data.user_id);
          loadingProgress.style.width = "100%";
          loadingText.textContent = "ACCESS GRANTED.";
          loadingText.style.color = "#0f0";

          setTimeout(() => {
            enterPortal();
          }, 300);
        })
        .catch((error) => {
          console.error("通信エラー:", error);
          loadingProgress.style.width = "0%";
          loadingText.textContent = "AUTH FAILED.";
          loadingText.style.color = "#f00";

          setTimeout(() => {
            loadingOverlay.classList.add("hidden");
            authOverlay.classList.remove("hidden");
          }, 1200);
        });
    });
  }
  // ===================================

  // 動的背景の要素群
  const bgElements = {
    talkscope: document.querySelector(".bg-talkscope"),
    realyou: document.querySelector(".bg-realyou"),
    growtree: document.querySelector(".bg-growtree"),
    timefaker: document.querySelector(".bg-timefaker"),
  };

  const stitch1 = document.createElement("div");
  stitch1.className = "patch-stitch stitch-1";
  document.body.appendChild(stitch1);

  const stitch2 = document.createElement("div");
  stitch2.className = "patch-stitch stitch-2";
  document.body.appendChild(stitch2);

  APPS.forEach((app, index) => {
    const card = document.createElement("div");
    card.className = `app-card ${app.className}`;

    const tape = document.createElement("div");
    tape.className = "duct-tape card-tape";
    if (Math.random() > 0.5) {
      tape.style.top = Math.random() > 0.5 ? "-15px" : "auto";
      tape.style.bottom = tape.style.top === "auto" ? "-15px" : "auto";
      tape.style.left = Math.random() > 0.5 ? "-15px" : "auto";
      tape.style.right = tape.style.left === "auto" ? "-15px" : "auto";
      tape.style.transform = `rotate(${Math.floor(Math.random() * 90 - 45)}deg)`;
      card.appendChild(tape);
    }

    // --- Radical Card Architecture Generation ---
    let cardHTML = "";

    if (app.id === "talkscope") {
      // BUBBLE ARCHITECTURE
      cardHTML = `
        <div class="bubble-layout">
          <div class="main-bubble">${app.name}</div>
          <div class="sub-bubble info">${app.description}</div>
          <div class="sub-bubble icon">${app.icon}</div>
          <div class="ts-bubble-cloud"></div>
        </div>
      `;
    } else if (app.id === "realyou") {
      // CHAT UI ARCHITECTURE
      cardHTML = `
        <div class="chat-layout">
          <div class="chat-header"><span>RealYou Messenger</span><span class="chat-status"></span></div>
          <div class="chat-body">
            <div class="chat-bubble user">すごいアプリ見つけた！</div>
            <div class="chat-bubble user large">${app.name}</div>
            <div class="chat-bubble app">なにこれ</div>
            <div class="chat-bubble user emphasized">${app.description}</div>
            <div class="chat-bubble app">えー！めっちゃすごーい！！</div>
          </div>
        </div>
      `;
    } else if (app.id === "growtree") {
      // TREE ARCHITECTURE
      cardHTML = `
        <div class="tree-layout">
          <svg class="tree-svg" viewBox="0 0 200 200" preserveAspectRatio="xMidYMax meet">
            <!-- 幹と枝 (Trunk & Branches) -->
            <path class="tree-trunk" d="M100,200 C95,150 80,120 70,80 C80,100 95,95 100,120 C105,95 120,100 130,80 C120,120 105,150 100,200 Z" fill="currentColor" opacity="0.8"/>
            <path class="tree-branch" d="M70,80 C60,60 40,50 20,40 M70,80 C65,55 50,30 35,20 M100,120 C110,90 130,60 145,35 M130,80 C140,60 160,50 180,40 M130,80 C135,55 150,30 165,20 M100,120 C95,90 85,60 70,35" stroke="currentColor" fill="none" stroke-width="4" stroke-linecap="round"/>
            <!-- 葉の繁み (Foliage) -->
            <path class="tree-leaves" d="M20,40 Q30,20 50,30 Q60,10 80,20 Q100,0 120,20 Q140,10 150,30 Q170,20 180,40 Q160,55 165,75 Q140,70 130,90 Q110,80 100,100 Q90,80 70,90 Q60,70 35,75 Q40,55 20,40 Z" fill="currentColor" opacity="0.3"/>
            <path class="tree-leaves" d="M35,20 Q50,0 70,10 Q85,-5 100,10 Q115,-5 130,10 Q150,0 165,20 Q145,35 145,55 Q125,50 115,70 Q95,65 100,85 Q85,65 65,70 Q55,50 35,55 Q55,35 35,20 Z" fill="currentColor" opacity="0.4"/>
          </svg>
          <div class="tree-content">
            <h2 class="card-title">${app.name}</h2>
            <p class="card-desc">${app.description}</p>
            <div class="gt-xp-bar"><div class="gt-xp-fill"></div></div>
          </div>
        </div>
      `;
    } else if (app.id === "timefaker") {
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
    if (app.id === "talkscope") {
      const tsCloud = card.querySelector(".ts-bubble-cloud");
      const TS_KEYWORDS = [
        "AI", "Intent", "Vector", "Context", "Graph", "Semantic", "Node",
        "Token", "LLM", "Data", "Retrieval", "Prompt", "Agent", "DB",
        "Embedding", "Search", "Match", "Chunk", "Index", "Query",
        "NLP", "Generate", "Model", "Train", "Weights"
      ];
      TS_KEYWORDS.forEach((word, i) => {
        const b = document.createElement("div");
        b.className = "ts-bubble";
        b.textContent = word;
        // バブルサイズをさらにランダム化 (大小まぜこぜ)
        const size = 20 + Math.random() * 70;
        b.style.width = size + "px";
        b.style.height = size + "px";
        b.style.left = Math.random() * 80 + 10 + "%";
        b.style.top = Math.random() * 80 + 10 + "%";
        b.style.animationDelay = (i * 0.4) + "s";
        tsCloud.appendChild(b);
      });
    }

    if (app.id === "timefaker") {
      const clock = card.querySelector(".digital-clock");
      app.timer = setInterval(() => {
        // Store interval ID on app object
        const now = new Date();
        clock.textContent = now.toTimeString().split(" ")[0];
      }, 1000);
    }

    // ======== ホバー時の背景変化イベント ========
    card.addEventListener("mouseenter", () => {
      // 一旦すべての背景を非アクティブ化
      Object.keys(bgElements).forEach((key) => {
        if (bgElements[key]) bgElements[key].classList.remove("active");
      });
      // 該当アプリの背景をアクティブ化
      if (bgElements[app.id === "timefaker" ? "settings" : app.id]) {
        bgElements[app.id === "timefaker" ? "settings" : app.id].classList.add(
          "active",
        );
      }
      // グリッド全体にカードホバー中であることを通知
      gridContainer.classList.add("is-card-hovered");

      // 囁きの個別化
      if (app.whisper && whisperBar) {
        whisperBar.textContent = app.whisper.replace(
          "%ID%",
          Math.random().toString(16).substring(2, 8).toUpperCase(),
        );
      }

      if (app.id === "realyou") {
        const status = card.querySelector(".chat-status");
        if (status) status.textContent = "Typing...";
      }

      // 動的タイマー開始 (moved from original)
      if (app.id === "talkscope") {
        app.liveTextTimer = setInterval(() => {
          // Renamed to avoid conflict with timefaker's app.timer
          const liveText = card.querySelector(".ts-live-text");
          if (liveText)
            liveText.textContent = `Live: "${["Terminology...", "AI mapping...", "Data stream...", "Packet capture..."][Math.floor(Math.random() * 4)]}"`;
        }, 1000);
      }
      if (app.id === "settings") {
        app.logTimer = setInterval(() => {
          const logArea = card.querySelector(".sys-log");
          if (logArea)
            logArea.innerHTML = `LOG: ${Math.random().toString(16).slice(2, 10).toUpperCase()} <span class="blink">_</span>`;
        }, 1200);
      }
    });

    card.addEventListener("mouseleave", () => {
      // マウスが外れたら背景を元に戻す
      const bgId = app.id === "timefaker" ? "settings" : app.id;
      if (bgElements[bgId]) {
        bgElements[bgId].classList.remove("active");
      }
      // グリッド全体のカードホバー状態を解除
      gridContainer.classList.remove("is-card-hovered");
      updateStatus();
      if (app.id === "realyou") {
        const status = card.querySelector(".chat-status");
        if (status) status.textContent = "Online";
      }
      // Clear dynamic timers
      if (app.liveTextTimer) clearInterval(app.liveTextTimer);
      if (app.logTimer) clearInterval(app.logTimer);
    });
    // ======== URL Parameter Handling ========
    const urlParams = new URLSearchParams(window.location.search);
    const queryUserId = urlParams.get("user_id");
    if (queryUserId) {
      localStorage.setItem("chimera_user_id", queryUserId);
    }

    // クリックイベント
    card.addEventListener("click", () => {
      if (app.id === "timefaker") {
        const modal = document.getElementById("timefaker-modal");
        if (modal) {
          triggerFlash();
          document.body.style.animation = "terminalShake 0.2s";
          setTimeout(() => (document.body.style.animation = ""), 200);
          modal.classList.add("active");

          // Pre-fill current time
          const now = new Date();
          document.getElementById("tf-hours").value = String(
            now.getHours(),
          ).padStart(2, "0");
          document.getElementById("tf-minutes").value = String(
            now.getMinutes(),
          ).padStart(2, "0");
          document.getElementById("tf-status-msg").textContent =
            "AWAITING INPUT...";
          document.getElementById("tf-status-msg").style.color = "#fff";
        }
        return;
      }

      let targetUrl = getAppUrl(app);

      if (targetUrl === "#") {
        triggerFlash();
        alert(
          "CRITICAL ERROR 0x000F: CANNOT MOUNT VOLUME.\nSYSTEM INSTABILITY DETECTED.",
        );
        return;
      }

      // Appends user_id to targetUrl
      const currentUserId = localStorage.getItem("chimera_user_id");
      if (currentUserId && ["talkscope", "realyou", "growtree"].includes(app.id)) {
        const connector = targetUrl.includes("?") ? "&" : "?";
        targetUrl += `${connector}user_id=${currentUserId}`;
      }

      triggerFlash();
      document.body.style.animation = "terminalShake 0.2s";
      setTimeout(() => (document.body.style.animation = ""), 200);

      // 別タブで各アプリを開く
      setTimeout(() => {
        window.open(targetUrl, "_blank");
      }, 200);
    });

    gridContainer.appendChild(card);
  });

  backButton.addEventListener("click", () => {
    appView.classList.add("hidden");

    setTimeout(() => {
      portalView.classList.remove("fade-out");
      setTimeout(() => {
        appFrame.src = "";
      }, 500);
    }, 400);
  });

  // TimeFaker Modal Logic
  const tfModal = document.getElementById("timefaker-modal");
  const tfCancelBtn = document.getElementById("tf-cancel-btn");
  const tfSetBtn = document.getElementById("tf-set-btn");
  const tfStatusMsg = document.getElementById("tf-status-msg");

  // Date Elements
  const tfDateInput = document.getElementById("tf-date-input");
  const tfDatePrev = document.getElementById("tf-date-prev");
  const tfDateNext = document.getElementById("tf-date-next");

  // Time Elements
  const tfHoursInput = document.getElementById("tf-hours");
  const tfMinutesInput = document.getElementById("tf-minutes");
  const tfHourUp = document.getElementById("tf-hour-up");
  const tfHourDown = document.getElementById("tf-hour-down");

  // Quick Action Elements
  const tfBtnNow = document.getElementById("tf-btn-now");
  const tfBtn24h = document.getElementById("tf-btn-24h");
  const tfBtn3d = document.getElementById("tf-btn-3d");

  let currentTemporalState = new Date();

  const syncStateToUI = () => {
    currentTemporalState.setMinutes(0);
    currentTemporalState.setSeconds(0);

    if (!tfDateInput || !tfHoursInput || !tfMinutesInput) return;

    const y = currentTemporalState.getFullYear();
    const m = String(currentTemporalState.getMonth() + 1).padStart(2, "0");
    const d = String(currentTemporalState.getDate()).padStart(2, "0");
    tfDateInput.value = `${y}-${m}-${d}`;

    tfHoursInput.value = String(currentTemporalState.getHours()).padStart(
      2,
      "0",
    );
    tfMinutesInput.textContent = "00";

    // Flash inputs to show change
    [tfHoursInput, tfMinutesInput].forEach((el) => {
      el.style.textShadow = "0 0 20px #fff, 0 0 30px #0ff";
      el.style.color = "#fff";
      setTimeout(() => {
        el.style.textShadow = "";
        el.style.color = "";
      }, 150);
    });
  };

  const syncUIToState = () => {
    const dateParts = tfDateInput.value.split("-");
    if (dateParts.length === 3) {
      currentTemporalState.setFullYear(parseInt(dateParts[0]));
      currentTemporalState.setMonth(parseInt(dateParts[1]) - 1);
      currentTemporalState.setDate(parseInt(dateParts[2]));
    }
    currentTemporalState.setHours(parseInt(tfHoursInput.value) || 0);
    currentTemporalState.setMinutes(0);
  };

  if (tfModal && tfCancelBtn && tfSetBtn) {
    // Modifiers
    tfDatePrev.addEventListener("click", () => {
      currentTemporalState.setDate(currentTemporalState.getDate() - 1);
      syncStateToUI();
    });
    tfDateNext.addEventListener("click", () => {
      currentTemporalState.setDate(currentTemporalState.getDate() + 1);
      syncStateToUI();
    });

    tfHourUp.addEventListener("click", () => {
      currentTemporalState.setHours((currentTemporalState.getHours() + 1) % 24);
      syncStateToUI();
    });
    tfHourDown.addEventListener("click", () => {
      currentTemporalState.setHours(
        (currentTemporalState.getHours() - 1 + 24) % 24,
      );
      syncStateToUI();
    });

    // Quick Actions
    tfBtnNow.addEventListener("click", () => {
      currentTemporalState = new Date();
      syncStateToUI();
      tfStatusMsg.textContent = "SYNCED TO PRESENT HOUR";
    });
    tfBtn24h.addEventListener("click", () => {
      currentTemporalState.setHours(currentTemporalState.getHours() + 24);
      syncStateToUI();
      tfStatusMsg.textContent = "FAST FORWARD 24H";
    });
    tfBtn3d.addEventListener("click", () => {
      currentTemporalState.setDate(currentTemporalState.getDate() + 3);
      syncStateToUI();
      tfStatusMsg.textContent = "FAST FORWARD 3 DAYS";
    });

    // Manual Inputs
    tfDateInput.addEventListener("change", syncUIToState);

    const inputs = [tfHoursInput];
    inputs.forEach((input) => {
      input.addEventListener("change", (e) => {
        let val = parseInt(e.target.value) || 0;
        let max = parseInt(e.target.max);
        if (val > max) val = max;
        if (val < 0) val = 0;
        e.target.value = String(val).padStart(2, "0");
        syncUIToState();
      });
    });

    // Base Modal interactions
    tfCancelBtn.addEventListener("click", () => {
      tfModal.classList.remove("active");
    });

    tfSetBtn.addEventListener("click", () => {
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
        days_after: daysAfter,
        hour_24: hour24,
      };
      console.log("送信するデータ:", payload);

      fetch("http://100.79.200.97:8000/api/config/review-delay", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTPエラー: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("API送信成功:", data);

          tfStatusMsg.textContent = `OVERRIDE ACCEPTED: ${formattedDate} ${h}:00`;
          tfStatusMsg.style.color = "#0ff";

          triggerFlash();
          document.body.style.animation = "terminalShake 0.4s";
          setTimeout(() => (document.body.style.animation = ""), 400);

          setTimeout(() => {
            tfModal.classList.remove("active");
          }, 1500);
        })
        .catch((error) => {
          console.error("API送信エラー:", error);
          tfStatusMsg.textContent = `ERROR: CONNECTION FAILED`;
          tfStatusMsg.style.color = "#f00";
        });
    });
  }
});
