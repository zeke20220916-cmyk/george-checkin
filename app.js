const STORAGE_KEY = "george-growth-assistant-v1";
const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const today = new Date();
const todayKey = toDateKey(today);
let selectedHistoryDate = todayKey;
let statsRange = "week";

const TASKS = [
  { id: "school-homework", name: "学校作业", type: "study", points: 2, bonusLabel: "全对 +1", weekdays: [1, 2, 3, 4, 5] },
  { id: "olympiad", name: "奥数作业", type: "study", points: 2, bonusLabel: "常规题全对 +1", weekdays: [2, 4] },
  { id: "coding", name: "编程作业", type: "study", points: 2, bonusLabel: "独立全对 +1", weekdays: [6] },
  { id: "english-homework", name: "英语作业", type: "study", points: 2, bonusLabel: "检查正确 +1", weekdays: [1, 3, 5] },
  { id: "piano-practice", name: "钢琴练习", type: "study", points: 2, bonusLabel: "达到效果 +1", weekdays: [1, 2, 3, 4, 5, 6] },
  { id: "go-game", name: "下围棋", type: "study", points: 2, bonusLabel: "获胜 +1", weekdays: [3, 6] },
  { id: "english-review", name: "英语复习", type: "study", points: 2, bonusLabel: "抽查通过 +1", weekdays: [2, 4] },
  { id: "chinese-practice", name: "语文练习", type: "study", points: 2, bonusLabel: "基础题正确 +1", weekdays: [1, 3, 5] },
  { id: "chinese-reading", name: "语文阅读", type: "study", points: 2, bonusLabel: "能复述 +1", weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "english-reading", name: "英语阅读", type: "study", points: 2, bonusLabel: "说出新词句 +1", weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "hand-wash", name: "回家/饭前洗手", type: "habit", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "fold-clothes", name: "回家叠衣服", type: "habit", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "slippers", name: "穿拖鞋", type: "habit", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "desk-bag", name: "收拾书桌/书包", type: "habit", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "sleep-routine", name: "按时洗漱睡觉", type: "habit", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "english-class", name: "英语课", type: "class", points: 1, bonusLabel: "老师表扬 +1", weekdays: [6] },
  { id: "math-class", name: "数学课", type: "class", points: 1, bonusLabel: "老师表扬 +1", weekdays: [0] },
  { id: "piano-class", name: "钢琴课", type: "class", points: 1, bonusLabel: "老师表扬 +1", weekdays: [5] },
  { id: "go-class", name: "围棋课", type: "class", points: 1, bonusLabel: "老师表扬 +1", weekdays: [0] },
  { id: "diary", name: "写日记", type: "bonus", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "mistake-book", name: "写错题本", type: "bonus", points: 2, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "help-family", name: "主动帮忙", type: "bonus", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "extra-reading", name: "额外阅读 15 分钟", type: "bonus", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "clean-meal", name: "吃饭干净且收拾碗筷", type: "bonus", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "make-bed", name: "起床后整理床铺", type: "bonus", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "prepare-clothes", name: "准备第二天衣物", type: "bonus", points: 1, weekdays: [1, 2, 3, 4, 5, 6, 0] },
  { id: "other-bonus", name: "其他", type: "bonus", points: 1, customPoints: true, weekdays: [1, 2, 3, 4, 5, 6, 0] },
];

const REWARDS = [
  { id: "video", name: "10 分钟正经视频", cost: 20, detail: "内容需家长认可，例如科普、纪录片、学习类视频。" },
  { id: "stationery", name: "5 元以内文具", cost: 50, detail: "橡皮、铅笔、贴纸、小本子等。" },
  { id: "movie", name: "看一部电影", cost: 150, detail: "家长确认时间和影片。" },
  { id: "flex", name: "灵活兑换", cost: 0, detail: "默认 1 元 = 10 积分，家长确认时可调整。", flexible: true },
];

const BADGES = [
  { id: "streak-3", name: "三日小火苗", title: "小火苗", condition: "连续达标 3 天", test: (s) => s.streak >= 3 },
  { id: "streak-7", name: "一周自律星", title: "自律星", condition: "连续达标 7 天", test: (s) => s.streak >= 7 },
  { id: "streak-21", name: "二十一天坚持者", title: "坚持者", condition: "连续达标 21 天", test: (s) => s.streak >= 21 },
  { id: "excellent-10", name: "优秀学习者", title: "优秀学习者", condition: "学习任务优秀累计 10 次", test: (s) => countExcellent(s) >= 10 },
  { id: "homework-10", name: "作业全对王", title: "全对王", condition: "学校作业优秀累计 10 次", test: (s) => countTaskStatus(s, "school-homework", "excellent") >= 10 },
  { id: "coder-5", name: "小小程序员", title: "小程序员", condition: "编程作业优秀累计 5 次", test: (s) => countTaskStatus(s, "coding", "excellent") >= 5 },
  { id: "reader-20", name: "阅读小书虫", title: "小书虫", condition: "阅读累计完成 20 次", test: (s) => countReadingDone(s) >= 20 },
  { id: "go-10", name: "围棋小棋手", title: "小棋手", condition: "围棋累计 10 盘", test: (s) => countTaskDone(s, "go-game") >= 10 },
  { id: "go-win-5", name: "胜利小棋手", title: "胜利棋手", condition: "围棋获胜 5 盘", test: (s) => countGoWins(s) >= 5 },
  { id: "piano-10", name: "钢琴练习家", title: "练习家", condition: "钢琴练习 10 次", test: (s) => countTaskDone(s, "piano-practice") >= 10 },
  { id: "habit-10", name: "自理小能手", title: "自理能手", condition: "习惯达标 10 天", test: (s) => countHabitQualifiedDays(s) >= 10 },
  { id: "box-3", name: "宝箱猎人", title: "宝箱猎人", condition: "奖励宝箱触发 3 次", test: (s) => countRewardBoxes(s) >= 3 },
  { id: "perfect-day", name: "满格能量日", title: "满格能量", condition: "隐藏条件", hidden: true, test: (s) => hasPerfectEnergyDay(s) },
  { id: "comeback", name: "逆风翻盘", title: "翻盘小将", condition: "隐藏条件", hidden: true, test: (s) => s.flags.comeback },
  { id: "all-rounder", name: "全能小达人", title: "全能达人", condition: "隐藏条件", hidden: true, test: (s) => hasAllRounderWeek(s) },
];

const elements = {
  todayTitle: document.querySelector("#todayTitle"),
  profileLine: document.querySelector("#profileLine"),
  totalPoints: document.querySelector("#totalPoints"),
  estimatedPoints: document.querySelector("#estimatedPoints"),
  streakDays: document.querySelector("#streakDays"),
  multiplierText: document.querySelector("#multiplierText"),
  climbingStatus: document.querySelector("#climbingStatus"),
  climbingHint: document.querySelector("#climbingHint"),
  treasureBanner: document.querySelector("#treasureBanner"),
  studyProgress: document.querySelector("#studyProgress"),
  habitProgress: document.querySelector("#habitProgress"),
  taskSections: document.querySelector("#taskSections"),
  settlementPanel: document.querySelector("#settlementPanel"),
  rewardGrid: document.querySelector("#rewardGrid"),
  redemptionList: document.querySelector("#redemptionList"),
  badgeGrid: document.querySelector("#badgeGrid"),
  scheduleEditor: document.querySelector("#scheduleEditor"),
  cloudPanel: document.querySelector("#cloudPanel"),
  resetButton: document.querySelector("#resetButton"),
  dataTransferText: document.querySelector("#dataTransferText"),
  exportDataButton: document.querySelector("#exportDataButton"),
  importDataButton: document.querySelector("#importDataButton"),
  historyPanel: document.querySelector("#historyPanel"),
  climbingPanel: document.querySelector("#climbingPanel"),
  climbingCard: document.querySelector("#climbingCard"),
  statsPanel: document.querySelector("#statsPanel"),
  toast: document.querySelector("#toast"),
};

let state = loadState();
const cloud = {
  configured: Boolean(window.GEORGE_FIREBASE_CONFIG),
  ready: false,
  applyingRemote: false,
  conflict: false,
  remoteActivity: 0,
  saveTimer: null,
  user: null,
  auth: null,
  db: null,
  unsubscribe: null,
};

elements.todayTitle.textContent = `${today.getMonth() + 1} 月 ${today.getDate()} 日 ${WEEKDAYS[today.getDay()]}`;
elements.todayTitle.addEventListener("click", () => {
  selectedHistoryDate = todayKey;
  setView("history");
  renderHistory();
});
elements.climbingCard.addEventListener("click", () => {
  setView("climbing");
  renderClimbingPanel();
});
elements.climbingCard.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    setView("climbing");
    renderClimbingPanel();
  }
});

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});
document.querySelectorAll("[data-stats-range]").forEach((button) => {
  button.addEventListener("click", () => {
    statsRange = button.dataset.statsRange;
    document.querySelectorAll("[data-stats-range]").forEach((item) => {
      item.classList.toggle("active", item.dataset.statsRange === statsRange);
    });
    renderStats();
  });
});
elements.resetButton.addEventListener("click", resetData);
elements.exportDataButton.addEventListener("click", exportLocalData);
elements.importDataButton.addEventListener("click", importLocalData);

ensureToday();
initCloudSync();
render();

function defaultState() {
  const schedules = {};
  TASKS.forEach((task) => {
    schedules[task.id] = [...task.weekdays];
  });
  return {
    points: 0,
    streak: 0,
    missStreak: 0,
    records: {},
    settlements: {},
    schedules,
    redemptions: [],
    unlockedBadges: [],
    currentTitle: "",
    treasureBoxes: {},
    flags: { hadMissStreak: false, comeback: false },
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultState();
  try {
    const parsed = JSON.parse(stored);
    const base = defaultState();
    return {
      ...base,
      ...parsed,
      schedules: { ...base.schedules, ...(parsed.schedules || {}) },
      flags: { ...base.flags, ...(parsed.flags || {}) },
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return defaultState();
  }
}

function saveState() {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  queueCloudSave();
}

function ensureToday() {
  if (!state.records[todayKey]) state.records[todayKey] = { tasks: {}, leave: false };
  TASKS.forEach((task) => {
    if (!state.records[todayKey].tasks[task.id]) state.records[todayKey].tasks[task.id] = initialTaskRecord(task);
  });
  ensureTreasureMonth(monthKey(today));
  saveState();
}

function initialTaskRecord(task) {
  return {
    status: "pending",
    duration: "",
    note: "",
    title: "",
    progress: "",
    won: false,
    level: "",
    selfLevel: "",
    pieces: [],
    customName: "",
    customPoints: task.customPoints ? task.points : "",
    makeup: false,
  };
}

function render() {
  updateBadges();
  renderHeader();
  renderTasks();
  renderSettlement();
  renderRewards();
  renderBadges();
  renderScheduleEditor();
  renderCloudPanel();
  renderHistory();
  renderClimbingPanel();
  renderStats();
  saveState();
}

function initCloudSync() {
  if (!cloud.configured) return;
  if (!window.firebase?.initializeApp) {
    cloud.configured = false;
    return;
  }
  try {
    firebase.initializeApp(window.GEORGE_FIREBASE_CONFIG);
    cloud.auth = firebase.auth();
    cloud.db = firebase.firestore();
    cloud.auth
      .getRedirectResult()
      .catch((error) => {
        if (!error?.code) return;
        console.error("Google redirect sign-in failed", error);
        toast(`Google 登录失败：${error.code}`);
        renderCloudError(error.code, error.message || "");
      });
    cloud.auth.onAuthStateChanged((user) => {
      cloud.user = user;
      if (cloud.unsubscribe) {
        cloud.unsubscribe();
        cloud.unsubscribe = null;
      }
      if (!user) {
        cloud.ready = false;
        renderCloudPanel();
        return;
      }
      subscribeCloudState();
    });
  } catch (error) {
    console.error("Firebase initialization failed", error);
    cloud.configured = false;
  }
}

function subscribeCloudState() {
  const ref = cloudStateRef();
  cloud.unsubscribe = ref.onSnapshot(
    (snapshot) => {
      cloud.ready = true;
      if (!snapshot.exists) {
        queueCloudSave({ immediate: true });
        renderCloudPanel();
        return;
      }
      const remoteState = snapshot.data()?.state;
      if (!remoteState) return;
      cloud.remoteActivity = stateActivityScore(remoteState);
      const remoteTime = Date.parse(remoteState.updatedAt || "");
      const localTime = Date.parse(state.updatedAt || "");
      if (Number.isNaN(remoteTime) || remoteTime <= localTime) {
        renderCloudPanel();
        return;
      }
      const localActivity = stateActivityScore(state);
      if (localActivity > cloud.remoteActivity) {
        cloud.conflict = true;
        renderCloudPanel();
        toast("检测到本机数据比云端更多，请先确认上传本机数据。");
        return;
      }
      cloud.applyingRemote = true;
      cloud.conflict = false;
      state = mergeState(remoteState);
      ensureToday();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      cloud.applyingRemote = false;
      render();
    },
    (error) => {
      console.error("Firestore subscription failed", error);
      cloud.ready = false;
      renderCloudPanel();
      toast("云端同步连接失败，请检查 Firebase 权限。");
    },
  );
}

function queueCloudSave(options = {}) {
  if (!cloud.configured || !cloud.user || !cloud.db || cloud.applyingRemote) return;
  window.clearTimeout(cloud.saveTimer);
  const delay = options.immediate ? 0 : 700;
  cloud.saveTimer = window.setTimeout(() => {
    cloudStateRef()
      .set(
        {
          state,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedBy: cloud.user.uid,
        },
        { merge: true },
      )
      .catch((error) => {
        console.error("Cloud save failed", error);
        toast("云端保存失败，已保存在本机。");
      });
  }, delay);
}

function cloudStateRef() {
  const path = window.GEORGE_FIREBASE_DATA_PATH || "families/george/state/current";
  return cloud.db.doc(path);
}

function mergeState(remoteState) {
  const base = defaultState();
  return {
    ...base,
    ...remoteState,
    schedules: { ...base.schedules, ...(remoteState.schedules || {}) },
    flags: { ...base.flags, ...(remoteState.flags || {}) },
  };
}

function renderCloudPanel() {
  if (!elements.cloudPanel) return;
  if (!cloud.configured) {
    elements.cloudPanel.innerHTML = `
      <div class="cloud-status offline">
        <strong>云同步未配置</strong>
        <p>填写 <code>firebase-config.js</code> 后，可启用 Firebase 多终端同步。</p>
      </div>
    `;
    return;
  }
  if (!cloud.user) {
    elements.cloudPanel.innerHTML = `
      <div class="cloud-status">
        <strong>云同步待登录</strong>
        <p>登录 Google 账号后，数据会同步到 Firestore。</p>
        <button id="googleSignInButton" class="primary-button" type="button">使用 Google 登录</button>
      </div>
    `;
    document.querySelector("#googleSignInButton")?.addEventListener("click", signInWithGoogle);
    return;
  }
  elements.cloudPanel.innerHTML = `
    <div class="cloud-status ${cloud.conflict ? "offline" : "online"}">
      <strong>${cloud.conflict ? "发现本机数据未上传" : "云同步已开启"}</strong>
      <p>${escapeHtml(cloud.user.email || cloud.user.displayName || cloud.user.uid)} · ${cloud.ready ? "已连接" : "连接中"}</p>
      ${cloud.conflict ? `<p>本机记录比云端更多。请在保存了完整数据的设备上点击“上传本机数据到云端”。</p>` : ""}
      <div class="cloud-actions">
        <button id="uploadLocalButton" class="primary-button" type="button">上传本机数据到云端</button>
        <button id="downloadCloudButton" class="ghost-button" type="button">从云端同步到本机</button>
      </div>
      <button id="googleSignOutButton" class="ghost-button" type="button">退出登录</button>
    </div>
  `;
  document.querySelector("#uploadLocalButton")?.addEventListener("click", uploadLocalStateToCloud);
  document.querySelector("#downloadCloudButton")?.addEventListener("click", downloadCloudStateToLocal);
  document.querySelector("#googleSignOutButton")?.addEventListener("click", () => cloud.auth.signOut());
}

function uploadLocalStateToCloud() {
  if (!cloud.user || !cloud.db) {
    toast("请先登录 Google。");
    return;
  }
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  cloudStateRef()
    .set(
      {
        state,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedBy: cloud.user.uid,
      },
      { merge: true },
    )
    .then(() => {
      cloud.conflict = false;
      toast("本机数据已上传到云端。");
      renderCloudPanel();
    })
    .catch((error) => {
      console.error("Manual cloud upload failed", error);
      toast("上传失败，请检查网络和登录账号。");
    });
}

function downloadCloudStateToLocal() {
  if (!cloud.user || !cloud.db) {
    toast("请先登录 Google。");
    return;
  }
  cloudStateRef()
    .get()
    .then((snapshot) => {
      const remoteState = snapshot.data()?.state;
      if (!snapshot.exists || !remoteState) {
        toast("云端还没有数据。");
        return;
      }
      cloud.applyingRemote = true;
      state = mergeState(remoteState);
      ensureToday();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      cloud.applyingRemote = false;
      cloud.conflict = false;
      toast("已从云端同步到本机。");
      render();
    })
    .catch((error) => {
      console.error("Manual cloud download failed", error);
      toast("拉取失败，请检查网络和登录账号。");
    });
}

function stateActivityScore(value) {
  if (!value) return 0;
  let score = Number(value.points || 0) ? 5 : 0;
  score += Object.keys(value.settlements || {}).length * 10;
  Object.values(value.records || {}).forEach((day) => {
    if (day.leave) score += 2;
    Object.values(day.tasks || {}).forEach((record) => {
      if (!record) return;
      if (record.status && record.status !== "pending") score += 2;
      if (record.makeup) score += 1;
      if (record.duration || record.note || record.title || record.progress || record.level || record.selfLevel || record.customName) score += 1;
      if (Array.isArray(record.pieces) && record.pieces.some((piece) => piece.name || piece.progress || piece.note)) score += 1;
    });
  });
  return score;
}

function signInWithGoogle() {
  if (!cloud.auth) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  if (shouldUseRedirectSignIn()) {
    cloud.auth.signInWithRedirect(provider).catch((error) => {
      console.error("Google redirect start failed", error);
      const code = error?.code || "unknown";
      const message = error?.message || "";
      toast(`Google 登录失败：${code}`);
      renderCloudError(code, message);
    });
    return;
  }
  cloud.auth.signInWithPopup(provider).catch((error) => {
    console.error("Google sign-in failed", error);
    const code = error?.code || "unknown";
    const message = error?.message || "";
    if (code === "auth/cancelled-popup-request" || code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
      cloud.auth.signInWithRedirect(provider);
      return;
    }
    toast(`Google 登录失败：${code}`);
    renderCloudError(code, message);
  });
}

function shouldUseRedirectSignIn() {
  const userAgent = navigator.userAgent || "";
  const isiOS = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
  return isiOS || standalone;
}

function exportLocalData() {
  const payload = {
    exportedAt: new Date().toISOString(),
    storageKey: STORAGE_KEY,
    state,
  };
  elements.dataTransferText.value = JSON.stringify(payload, null, 2);
  elements.dataTransferText.focus();
  elements.dataTransferText.select();
  navigator.clipboard?.writeText(elements.dataTransferText.value).then(
    () => toast("本机数据已导出并复制。"),
    () => toast("本机数据已导出，请手动复制文本框内容。"),
  );
}

function importLocalData() {
  const raw = elements.dataTransferText.value.trim();
  if (!raw) {
    toast("请先粘贴导出的数据。");
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    const importedState = parsed.state || parsed;
    if (!importedState || typeof importedState !== "object" || !importedState.records) {
      toast("导入内容不是有效的成长助理数据。");
      return;
    }
    state = mergeState(importedState);
    state.updatedAt = new Date().toISOString();
    ensureToday();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    toast("数据已导入本机。需要同步到其他设备时，请再点击上传本机数据到云端。");
    render();
  } catch (error) {
    console.error("Import failed", error);
    toast("导入失败，请检查复制内容是否完整。");
  }
}

function renderCloudError(code, message) {
  if (!elements.cloudPanel) return;
  elements.cloudPanel.innerHTML = `
    <div class="cloud-status offline">
      <strong>Google 登录失败</strong>
      <p><code>${escapeHtml(code)}</code></p>
      <p>${escapeHtml(message)}</p>
      <button id="googleSignInButton" class="primary-button" type="button">重新使用 Google 登录</button>
    </div>
  `;
  document.querySelector("#googleSignInButton")?.addEventListener("click", signInWithGoogle);
}

function renderHeader() {
  const currentTitle = state.currentTitle || "成长任务新手";
  const estimate = calculateToday({ preview: true });
  const climbing = calculateClimbingStatus();
  const box = getTreasureBox(todayKey);

  elements.profileLine.textContent = `George · ${currentTitle}`;
  elements.totalPoints.textContent = state.points;
  elements.estimatedPoints.textContent = estimate.total;
  elements.streakDays.textContent = `${state.streak} 天`;
  elements.multiplierText.textContent = `今日倍率 ${getMultiplier(state.streak).toFixed(1)} 倍`;
  elements.climbingStatus.textContent = `${climbing.done} / ${climbing.total}`;
  elements.climbingHint.textContent = climbing.qualified ? "本周已获得攀岩课资格" : `还差 ${climbing.remaining} 项学习任务`;
  elements.treasureBanner.classList.toggle("hidden", !box);

  const todayTasks = todaysTasks();
  const studyTasks = todayTasks.filter((task) => task.type === "study");
  const habitTasks = todayTasks.filter((task) => task.type === "habit");
  const studyDone = studyTasks.filter((task) => isDone(recordFor(todayKey, task.id))).length;
  const habitDone = habitTasks.filter((task) => isDone(recordFor(todayKey, task.id))).length;
  const habitPercent = habitTasks.length ? Math.round((habitDone / habitTasks.length) * 100) : 100;
  elements.studyProgress.textContent = `${studyDone} / ${studyTasks.length}`;
  elements.habitProgress.textContent = `${habitPercent}%`;
}

function renderTasks() {
  const groups = [
    { type: "study", title: "学习任务" },
    { type: "habit", title: "生活习惯" },
    { type: "class", title: "课外班" },
    { type: "bonus", title: "加分任务" },
  ];
  const todayTasks = todaysTasks();
  elements.taskSections.innerHTML = groups
    .map((group) => {
      const tasks = todayTasks.filter((task) => task.type === group.type);
      if (!tasks.length) return "";
      return `
        <section>
          <h2>${group.title}</h2>
          <div class="task-grid">
            ${tasks.map(renderTaskCard).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  elements.taskSections.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", () => setTaskStatus(button.dataset.task, button.dataset.status));
  });
  elements.taskSections.querySelectorAll("[data-field]").forEach((input) => {
    input.addEventListener("input", () => updateTaskField(input.dataset.task, input.dataset.field, input.value, input.type));
  });
  elements.taskSections.querySelectorAll("[data-won]").forEach((button) => {
    button.addEventListener("click", () => setGoWin(button.dataset.task, button.dataset.won === "true"));
  });
  elements.taskSections.querySelectorAll("[data-piece-field]").forEach((input) => {
    input.addEventListener("input", () => updatePianoPiece(Number(input.dataset.pieceIndex), input.dataset.pieceField, input.value));
  });
  elements.taskSections.querySelectorAll("[data-piece-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePianoPiece(Number(button.dataset.pieceDelete)));
  });
  elements.taskSections.querySelectorAll("[data-piece-add]").forEach((button) => {
    button.addEventListener("click", addPianoPiece);
  });
}

function renderTaskCard(task) {
  const record = recordFor(todayKey, task.id);
  const statusClass = record.status === "excellent" ? "excellent" : isDone(record) ? "completed" : "";
  return `
    <article class="task-card ${statusClass}">
      <div class="task-title-row">
        <h3>${escapeHtml(displayTaskName(task, record))}</h3>
        <span class="point-pill">+${displayTaskPoints(task, record)}</span>
      </div>
      <p class="task-meta">${taskTypeText(task.type)}${task.bonusLabel ? ` · ${task.bonusLabel}` : ""}</p>
      ${renderTaskControls(task, record)}
    </article>
  `;
}

function renderTaskControls(task, record) {
  if (task.type === "study") {
    return `
      <div class="field-grid">
        <div class="field-row">
          <label>用时（分钟）<input data-task="${task.id}" data-field="duration" type="number" min="0" value="${escapeAttr(record.duration)}" /></label>
          ${renderSpecialField(task, record)}
        </div>
        ${renderSecondSpecialField(task, record)}
        <label>备注<textarea data-task="${task.id}" data-field="note">${escapeHtml(record.note)}</textarea></label>
        <div class="segmented">
          ${statusButton(task.id, "completed", "完成", record.status === "completed", "done")}
          ${statusButton(task.id, "excellent", "优秀完成", record.status === "excellent", "excellent")}
        </div>
      </div>
    `;
  }
  if (task.type === "habit") {
    return `
      <div class="segmented">
        ${statusButton(task.id, "completed", record.status === "completed" ? "取消完成" : "完成", record.status === "completed", "done")}
      </div>
    `;
  }
  if (task.type === "class") {
    return `
      <div class="segmented">
        ${statusButton(task.id, "completed", "已参加", record.status === "completed", "done")}
        ${statusButton(task.id, "excellent", "老师表扬", record.status === "excellent", "excellent")}
      </div>
    `;
  }
  return `
    <div class="field-grid">
      ${task.customPoints ? `
        <div class="field-row">
          <label>内容<input data-task="${task.id}" data-field="customName" value="${escapeAttr(record.customName)}" placeholder="做了什么" /></label>
          <label>积分<input data-task="${task.id}" data-field="customPoints" type="number" min="1" max="20" value="${escapeAttr(record.customPoints || task.points)}" /></label>
        </div>
      ` : ""}
      <div class="segmented">
        ${statusButton(task.id, "completed", record.status === "completed" ? "取消完成" : "完成", record.status === "completed", "done")}
      </div>
    </div>
  `;
}

function renderSpecialField(task, record) {
  if (task.id === "piano-practice") {
    return `<span></span>`;
  }
  if (task.id === "go-game") {
    return `<label>George 级别<input data-task="${task.id}" data-field="selfLevel" value="${escapeAttr(record.selfLevel)}" placeholder="例如：20级、1段" /></label>`;
  }
  if (task.id === "chinese-reading" || task.id === "english-reading") {
    return `<label>书名<input data-task="${task.id}" data-field="title" value="${escapeAttr(record.title)}" placeholder="正在读的书" /></label>`;
  }
  return `<span></span>`;
}

function renderSecondSpecialField(task, record) {
  if (task.id === "piano-practice") {
    return renderPianoPieces(record);
  }
  if (task.id === "chinese-reading" || task.id === "english-reading") {
    return `<label>书籍阅读进度（%）<input data-task="${task.id}" data-field="progress" type="number" min="0" max="100" value="${escapeAttr(record.progress)}" /></label>`;
  }
  if (task.id === "go-game") {
    return `
      <label>对手级别<input data-task="${task.id}" data-field="level" value="${escapeAttr(record.level)}" placeholder="例如：20级、1段" /></label>
      <div>
        <p class="field-hint">是否获胜</p>
        <div class="segmented">
          <button class="action-button ${record.won ? "active excellent" : ""}" data-task="${task.id}" data-won="true" type="button">获胜</button>
          <button class="action-button ${!record.won ? "active" : ""}" data-task="${task.id}" data-won="false" type="button">未获胜</button>
        </div>
      </div>
    `;
  }
  return "";
}

function renderPianoPieces(record) {
  const pieces = normalizedPianoPieces(record);
  return `
    <div class="piece-list">
      <div class="piece-list-header">
        <strong>练习曲目</strong>
        <button class="ghost-button" data-piece-add="true" type="button">添加曲目</button>
      </div>
      ${pieces.map((piece, index) => `
        <div class="piece-item">
          <label>曲目名称<input data-piece-index="${index}" data-piece-field="name" value="${escapeAttr(piece.name)}" placeholder="例如：小奏鸣曲" /></label>
          <label>进度（%）<input data-piece-index="${index}" data-piece-field="progress" type="number" min="0" max="100" value="${escapeAttr(piece.progress)}" /></label>
          <label>曲目备注<input data-piece-index="${index}" data-piece-field="note" value="${escapeAttr(piece.note)}" placeholder="可选" /></label>
          <button class="ghost-button danger" data-piece-delete="${index}" type="button">删除</button>
        </div>
      `).join("")}
    </div>
  `;
}

function normalizedPianoPieces(record) {
  if (Array.isArray(record.pieces) && record.pieces.length) {
    return record.pieces.map((piece) => ({
      name: piece.name || "",
      progress: piece.progress || "",
      note: piece.note || "",
    }));
  }
  if (record.title || record.progress) {
    return [{ name: record.title || "", progress: record.progress || "", note: "" }];
  }
  return [{ name: "", progress: "", note: "" }];
}

function setPianoPieces(record, pieces) {
  record.pieces = pieces;
  const first = pieces[0] || { name: "", progress: "" };
  record.title = first.name || "";
  record.progress = first.progress || "";
}

function updatePianoPiece(index, field, value) {
  const record = recordFor(todayKey, "piano-practice");
  const pieces = normalizedPianoPieces(record);
  pieces[index] = { ...(pieces[index] || { name: "", progress: "", note: "" }), [field]: value };
  setPianoPieces(record, pieces);
  saveState();
  renderHeader();
  renderSettlement();
  renderStats();
}

function addPianoPiece() {
  const record = recordFor(todayKey, "piano-practice");
  const pieces = normalizedPianoPieces(record);
  pieces.push({ name: "", progress: "", note: "" });
  setPianoPieces(record, pieces);
  render();
}

function deletePianoPiece(index) {
  const record = recordFor(todayKey, "piano-practice");
  const pieces = normalizedPianoPieces(record).filter((_, itemIndex) => itemIndex !== index);
  setPianoPieces(record, pieces.length ? pieces : [{ name: "", progress: "", note: "" }]);
  render();
}

function statusButton(taskId, status, label, active, kind) {
  return `<button class="action-button ${active ? `active ${kind}` : ""}" data-task="${taskId}" data-status="${status}" type="button">${label}</button>`;
}

function setTaskStatus(taskId, status) {
  setTaskStatusForDate(todayKey, taskId, status, { respectSettlementLock: true });
}

function setTaskStatusForDate(dateKey, taskId, status, options = {}) {
  if (isTodaySettled()) {
    if (dateKey === todayKey && options.respectSettlementLock) {
      toast("今天已结算，请先在晚间结算页撤销结算。");
      return;
    }
  }
  const record = recordFor(dateKey, taskId);
  if (record.status === status) {
    record.status = "pending";
  } else {
    record.status = status;
    if (status === "completed" || status === "excellent") record.makeup = false;
  }
  render();
}

function toggleMakeup(dateKey, taskId) {
  const record = recordFor(dateKey, taskId);
  if (isDone(record)) {
    toast("已完成的任务不需要补做。");
    return;
  }
  record.makeup = !record.makeup;
  toast(record.makeup ? "已标记补做，计入攀岩资格但不加积分。" : "已取消补做标记。");
  render();
}

function setGoWin(taskId, won) {
  const record = recordFor(todayKey, taskId);
  record.won = won;
  if (won) record.status = "excellent";
  render();
}

function updateTaskField(taskId, field, value, inputType) {
  const record = recordFor(todayKey, taskId);
  record[field] = inputType === "number" ? String(value) : value;
  saveState();
  renderHeader();
  renderSettlement();
}

function renderSettlement() {
  const calc = calculateToday({ preview: true });
  const settled = state.settlements[todayKey];
  const record = state.records[todayKey];
  elements.settlementPanel.innerHTML = `
    <div class="settlement-grid">
      <div>
        <div class="calc-panel">
          <div class="calc-line"><span>结算状态</span><strong>${settled ? "已结算" : "待结算"}</strong></div>
          <div class="calc-line"><span>学习任务</span><strong>${calc.studyDone} / ${calc.studyTotal}</strong></div>
          <div class="calc-line"><span>生活习惯</span><strong>${calc.habitPercent}%</strong></div>
          <div class="calc-line"><span>今日达标</span><strong>${record.leave ? "请假/特殊日" : calc.qualified ? "达标" : "未达标"}</strong></div>
          <div class="calc-line"><span>神秘宝箱</span><strong>${calc.boxLabel}</strong></div>
        </div>
        <h2 style="margin-top:18px">今日记录</h2>
        <div class="list-panel">${todaysTasks().map(renderSettlementTask).join("")}</div>
      </div>
      <div>
        <div class="calc-panel">
          <div class="calc-line"><span>核心基础分</span><strong>${calc.coreBase}</strong></div>
          <div class="calc-line"><span>连续倍率</span><strong>${calc.multiplier.toFixed(1)}</strong></div>
          <div class="calc-line"><span>倍率后核心分</span><strong>${calc.coreWithMultiplier}</strong></div>
          <div class="calc-line"><span>课外班积分</span><strong>${calc.classPoints}</strong></div>
          <div class="calc-line"><span>加分任务积分</span><strong>${calc.bonusPoints}</strong></div>
          <div class="calc-line"><span>质量奖励</span><strong>${calc.qualityBonus}</strong></div>
          <div class="calc-line"><span>宝箱积分</span><strong>${calc.boxPoints}</strong></div>
          <div class="calc-line"><span>连续未达标惩罚</span><strong>-${calc.missPenalty}</strong></div>
          <div class="calc-line total"><span>今日最终积分</span><strong>${calc.total}</strong></div>
        </div>
        <label style="margin:14px 0">
          <span><input id="leaveToggle" type="checkbox" ${record.leave ? "checked" : ""} /> 标记为请假/特殊日</span>
        </label>
        <button id="settleButton" class="primary-button" type="button" ${settled ? "disabled" : ""}>${settled ? "今日已结算" : "确认结算"}</button>
        ${settled ? `<button id="undoSettleButton" class="ghost-button danger full-width" type="button">撤销今日结算并修改</button>` : ""}
      </div>
    </div>
  `;
  document.querySelector("#leaveToggle")?.addEventListener("change", (event) => {
    state.records[todayKey].leave = event.target.checked;
    render();
  });
  document.querySelector("#settleButton")?.addEventListener("click", settleToday);
  document.querySelector("#undoSettleButton")?.addEventListener("click", undoTodaySettlement);
  elements.settlementPanel.querySelectorAll("[data-settle-status]").forEach((button) => {
    button.addEventListener("click", () => setTaskStatus(button.dataset.task, button.dataset.settleStatus));
  });
}

function renderSettlementTask(task) {
  const record = recordFor(todayKey, task.id);
  const detail = [
    statusText(record.status, task.type),
    record.duration ? `${record.duration} 分钟` : "",
    record.title ? `《${escapeHtml(record.title)}》` : "",
    record.progress ? `${record.progress}%` : "",
    record.level ? `对手 ${escapeHtml(record.level)}` : "",
    task.id === "go-game" ? (record.won ? "获胜" : "未获胜") : "",
    record.note ? `备注：${escapeHtml(record.note)}` : "",
  ].filter(Boolean).join(" · ");
  return `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(displayTaskName(task, record))}</strong>
        <p class="muted" style="margin:6px 0 0">${detail || "未填写"}</p>
        <div class="weekday-row">
          ${settlementButtons(task, record)}
        </div>
      </div>
      <span class="point-pill">+${earnedRawPoints(task, record)}</span>
    </div>
  `;
}

function settlementButtons(task, record) {
  if (task.type === "study") {
    return `
      <button class="ghost-button" data-task="${task.id}" data-settle-status="completed" type="button">${record.status === "completed" ? "取消完成" : "改为完成"}</button>
      <button class="ghost-button" data-task="${task.id}" data-settle-status="excellent" type="button">${record.status === "excellent" ? "取消优秀" : "改为优秀"}</button>
    `;
  }
  if (task.type === "class") {
    return `
      <button class="ghost-button" data-task="${task.id}" data-settle-status="completed" type="button">${record.status === "completed" ? "取消参加" : "改为参加"}</button>
      <button class="ghost-button" data-task="${task.id}" data-settle-status="excellent" type="button">${record.status === "excellent" ? "取消表扬" : "改为表扬"}</button>
    `;
  }
  return `<button class="ghost-button" data-task="${task.id}" data-settle-status="completed" type="button">${record.status === "completed" ? "取消完成" : "改为完成"}</button>`;
}

function settleToday() {
  settleDate(todayKey);
}

function undoTodaySettlement() {
  undoSettlementForDate(todayKey);
}

function settleDate(dateKey) {
  if (state.settlements[dateKey]) return;
  ensureTreasureMonth(dateKey.slice(0, 7));
  const calc = calculateForDate(dateKey);
  state.settlements[dateKey] = {
    date: dateKey,
    points: calc.total,
    qualified: calc.qualified,
    leave: Boolean(state.records[dateKey]?.leave),
    box: calc.boxResult,
    settledAt: new Date().toISOString(),
    pointsBefore: state.points,
    streakBefore: state.streak,
    missStreakBefore: state.missStreak,
  };
  recalculateSettledProgress();
  updateBadges();
  toast(`${dateKey === todayKey ? "今日" : dateKey} 结算完成，${calc.total >= 0 ? "+" : ""}${calc.total} 分`);
  render();
}

function undoSettlementForDate(dateKey) {
  const settlement = state.settlements[dateKey];
  if (!settlement) return;
  delete state.settlements[dateKey];
  recalculateSettledProgress();
  updateBadges();
  toast(`${dateKey === todayKey ? "今日" : dateKey} 结算已撤销，可以修改后重新结算。`);
  render();
}

function recalculateSettledProgress() {
  let points = 0;
  let streak = 0;
  let missStreak = 0;
  let hadMissStreak = false;
  let comeback = false;
  Object.keys(state.settlements).sort().forEach((dateKey) => {
    const settlement = state.settlements[dateKey];
    const calc = calculateForDate(dateKey);
    settlement.points = calc.total;
    settlement.qualified = calc.qualified;
    settlement.leave = Boolean(state.records[dateKey]?.leave);
    settlement.box = calc.boxResult;
    settlement.pointsBefore = points;
    settlement.streakBefore = streak;
    settlement.missStreakBefore = missStreak;
    points = Math.max(0, points + Number(settlement.points || 0));
    if (!settlement.leave) {
      if (settlement.qualified) {
        if (hadMissStreak && streak + 1 >= 3) comeback = true;
        streak += 1;
        missStreak = 0;
      } else {
        streak = 0;
        missStreak += 1;
        if (missStreak >= 2) hadMissStreak = true;
      }
    }
    settlement.streakAfter = streak;
    settlement.missStreakAfter = missStreak;
  });
  const approvedRedemptionCost = state.redemptions
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + Number(item.cost || 0), 0);
  state.points = Math.max(0, points - approvedRedemptionCost);
  state.streak = streak;
  state.missStreak = missStreak;
  state.flags.hadMissStreak = hadMissStreak;
  state.flags.comeback = comeback;
}

function calculateToday() {
  return calculateForDate(todayKey);
}

function calculateForDate(dateKey) {
  const record = state.records[dateKey] || { tasks: {}, leave: false };
  const tasks = tasksForDate(dateKey);
  const studyTasks = tasks.filter((task) => task.type === "study");
  const habitTasks = tasks.filter((task) => task.type === "habit");
  const studyDone = studyTasks.filter((task) => isDone(record.tasks?.[task.id] || initialTaskRecord(task))).length;
  const habitDone = habitTasks.filter((task) => isDone(record.tasks?.[task.id] || initialTaskRecord(task))).length;
  const habitPercent = habitTasks.length ? Math.round((habitDone / habitTasks.length) * 100) : 100;
  const qualified = studyDone === studyTasks.length && habitPercent >= 80;
  const previous = previousProgressBefore(dateKey);
  const multiplier = getMultiplier(previous.streak);

  let coreBase = 0;
  let classPoints = 0;
  let bonusPoints = 0;
  let qualityBonus = 0;
  tasks.forEach((task) => {
    const taskRecord = record.tasks?.[task.id] || initialTaskRecord(task);
    if (!isDone(taskRecord)) return;
    if (task.type === "study" || task.type === "habit") coreBase += Number(task.points);
    if (task.type === "class") classPoints += Number(task.points);
    if (task.type === "bonus") bonusPoints += displayTaskPoints(task, taskRecord);
    if ((task.type === "study" || task.type === "class") && taskRecord.status === "excellent") qualityBonus += 1;
  });

  const coreWithMultiplier = Math.round(coreBase * multiplier);
  const projectedMissStreak = record.leave || qualified ? 0 : previous.missStreak + 1;
  const missPenalty = record.leave ? 0 : missPenaltyFor(projectedMissStreak);
  const box = getTreasureBox(dateKey);
  let boxPoints = 0;
  let boxLabel = box ? "有宝箱，结算后揭晓" : "无";
  let boxResult = null;
  if (box && !record.leave) {
    if (box.type === "reward" && qualified) {
      boxPoints = 5;
      boxLabel = "奖励宝箱 +5";
      boxResult = "reward-opened";
    } else if (box.type === "penalty" && !qualified) {
      boxPoints = -5;
      boxLabel = "惩罚宝箱 -5";
      boxResult = "penalty-opened";
    } else {
      boxLabel = "宝箱未触发";
      boxResult = "not-opened";
    }
  }
  const total = coreWithMultiplier + classPoints + bonusPoints + qualityBonus + boxPoints - missPenalty;
  return {
    studyDone,
    studyTotal: studyTasks.length,
    habitDone,
    habitTotal: habitTasks.length,
    habitPercent,
    qualified,
    multiplier,
    coreBase,
    coreWithMultiplier,
    classPoints,
    bonusPoints,
    qualityBonus,
    boxPoints,
    boxLabel,
    boxResult,
    missPenalty,
    total,
  };
}

function previousProgressBefore(dateKey) {
  const previousKey = Object.keys(state.settlements).filter((key) => key < dateKey).sort().pop();
  const previous = previousKey ? state.settlements[previousKey] : null;
  return {
    streak: Number.isFinite(previous?.streakAfter) ? previous.streakAfter : 0,
    missStreak: Number.isFinite(previous?.missStreakAfter) ? previous.missStreakAfter : 0,
  };
}

function renderHistory() {
  if (!elements.historyPanel) return;
  const monthDate = parseDateKey(selectedHistoryDate);
  const selectedRecord = state.records[selectedHistoryDate];
  const selectedSettlement = state.settlements[selectedHistoryDate];
  const canOperateSelectedDate = selectedHistoryDate <= todayKey;
  elements.historyPanel.innerHTML = `
    <div class="calendar-panel">
      <div class="calendar-header">
        <button class="ghost-button" data-history-month="-1" type="button">上个月</button>
        <strong>${monthDate.getFullYear()} 年 ${monthDate.getMonth() + 1} 月</strong>
        <button class="ghost-button" data-history-month="1" type="button">下个月</button>
      </div>
      <div class="calendar-grid">
        ${WEEKDAYS.map((day) => `<span class="calendar-weekday">${day}</span>`).join("")}
        ${renderCalendarDays(monthDate)}
      </div>
    </div>
    <div class="history-detail">
      <div class="calc-panel">
        <div class="calc-line"><span>日期</span><strong>${selectedHistoryDate} ${WEEKDAYS[parseDateKey(selectedHistoryDate).getDay()]}</strong></div>
        <div class="calc-line"><span>结算</span><strong>${selectedSettlement ? `${selectedSettlement.points >= 0 ? "+" : ""}${selectedSettlement.points} 分` : "未结算"}</strong></div>
        <div class="calc-line"><span>达标</span><strong>${selectedRecord?.leave ? "请假/特殊日" : selectedSettlement ? selectedSettlement.qualified ? "达标" : "未达标" : "未结算"}</strong></div>
        ${canOperateSelectedDate ? `
          <label style="margin:14px 0 0">
            <span><input id="historyLeaveToggle" type="checkbox" ${selectedRecord?.leave ? "checked" : ""} ${selectedSettlement ? "disabled" : ""} /> 标记为请假/特殊日</span>
          </label>
          <div class="history-actions" style="margin-top:14px">
            ${selectedSettlement
              ? `<button id="undoHistorySettleButton" class="ghost-button danger full-width" type="button">撤销这一天结算</button>`
              : `<button id="settleHistoryButton" class="primary-button" type="button">补结算这一天</button>`}
          </div>
        ` : `<p class="muted" style="margin:14px 0 0">未来日期暂不能结算。</p>`}
      </div>
      <div class="list-panel history-list">
        ${tasksForDate(selectedHistoryDate).length ? tasksForDate(selectedHistoryDate).map((task) => renderHistoryTask(selectedHistoryDate, task, Boolean(selectedSettlement))).join("") : `<p class="muted">这一天没有安排任务。</p>`}
      </div>
    </div>
  `;
  elements.historyPanel.querySelectorAll("[data-history-date]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedHistoryDate = button.dataset.historyDate;
      renderHistory();
    });
  });
  elements.historyPanel.querySelectorAll("[data-history-month]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = parseDateKey(selectedHistoryDate);
      next.setMonth(next.getMonth() + Number(button.dataset.historyMonth));
      selectedHistoryDate = toDateKey(next);
      renderHistory();
    });
  });
  elements.historyPanel.querySelector("#historyLeaveToggle")?.addEventListener("change", (event) => {
    if (!state.records[selectedHistoryDate]) state.records[selectedHistoryDate] = { tasks: {}, leave: false };
    state.records[selectedHistoryDate].leave = event.target.checked;
    render();
  });
  elements.historyPanel.querySelector("#settleHistoryButton")?.addEventListener("click", () => settleDate(selectedHistoryDate));
  elements.historyPanel.querySelector("#undoHistorySettleButton")?.addEventListener("click", () => undoSettlementForDate(selectedHistoryDate));
  elements.historyPanel.querySelectorAll("[data-history-status]").forEach((button) => {
    button.addEventListener("click", () => {
      setTaskStatusForDate(selectedHistoryDate, button.dataset.task, button.dataset.historyStatus);
      toast("状态已保存，可以补结算这一天。");
    });
  });
}

function renderCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array.from({ length: first.getDay() }, () => `<span></span>`).join("");
  const days = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const dateKey = toDateKey(new Date(year, month, day));
    const settlement = state.settlements[dateKey];
    const record = state.records[dateKey];
    const className = [
      "calendar-day",
      dateKey === selectedHistoryDate ? "selected" : "",
      dateKey === todayKey ? "today" : "",
      settlement?.qualified ? "qualified" : "",
      settlement && !settlement.qualified ? "missed" : "",
      record?.leave ? "leave" : "",
    ].filter(Boolean).join(" ");
    return `<button class="${className}" data-history-date="${dateKey}" type="button"><strong>${day}</strong><span>${calendarDayMark(dateKey)}</span></button>`;
  }).join("");
  return blanks + days;
}

function calendarDayMark(dateKey) {
  const settlement = state.settlements[dateKey];
  if (state.records[dateKey]?.leave) return "假";
  if (!settlement) return "";
  if (settlement.qualified) return "达";
  return "缺";
}

function renderHistoryTask(dateKey, task, locked = false) {
  const record = state.records[dateKey]?.tasks?.[task.id] || initialTaskRecord(task);
  const detail = taskDetailText(task, record);
  const makeupText = record.makeup ? " · 已补做" : "";
  return `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(displayTaskName(task, record))}</strong>
        <p class="muted" style="margin:6px 0 0">${statusText(record.status, task.type)}${makeupText}${detail ? ` · ${detail}` : ""}</p>
        ${locked ? "" : `
          <div class="weekday-row">
            ${historyStatusButtons(task, record)}
          </div>
        `}
      </div>
      <span class="point-pill">${taskTypeText(task.type)}</span>
    </div>
  `;
}

function historyStatusButtons(task, record) {
  if (task.type === "study") {
    return `
      <button class="ghost-button" data-task="${task.id}" data-history-status="completed" type="button">${record.status === "completed" ? "取消完成" : "完成"}</button>
      <button class="ghost-button" data-task="${task.id}" data-history-status="excellent" type="button">${record.status === "excellent" ? "取消优秀" : "优秀"}</button>
    `;
  }
  if (task.type === "class") {
    return `
      <button class="ghost-button" data-task="${task.id}" data-history-status="completed" type="button">${record.status === "completed" ? "取消参加" : "参加"}</button>
      <button class="ghost-button" data-task="${task.id}" data-history-status="excellent" type="button">${record.status === "excellent" ? "取消表扬" : "表扬"}</button>
    `;
  }
  return `<button class="ghost-button" data-task="${task.id}" data-history-status="completed" type="button">${record.status === "completed" ? "取消完成" : "完成"}</button>`;
}

function renderClimbingPanel() {
  if (!elements.climbingPanel) return;
  const dates = currentWeekDates();
  const climbing = calculateClimbingStatus();
  elements.climbingPanel.innerHTML = `
    <div class="calc-panel">
      <div class="calc-line"><span>本周学习任务</span><strong>${climbing.done} / ${climbing.total}</strong></div>
      <div class="calc-line"><span>攀岩课资格</span><strong>${climbing.qualified ? "已获得" : `还差 ${climbing.remaining} 项`}</strong></div>
    </div>
    <div class="climbing-week">
      ${dates.map(renderClimbingDay).join("")}
    </div>
  `;
  elements.climbingPanel.querySelectorAll("[data-climb-status]").forEach((button) => {
    button.addEventListener("click", () => {
      setTaskStatusForDate(button.dataset.date, button.dataset.task, button.dataset.climbStatus);
      toast("状态已保存。已结算日期的修改不会重算积分。");
    });
  });
  elements.climbingPanel.querySelectorAll("[data-makeup]").forEach((button) => {
    button.addEventListener("click", () => toggleMakeup(button.dataset.date, button.dataset.task));
  });
}

function renderClimbingDay(dateKey) {
  const date = parseDateKey(dateKey);
  const studyTasks = TASKS.filter((task) => task.type === "study" && isScheduled(task, date.getDay()));
  if (!studyTasks.length) return "";
  return `
    <section class="climbing-day">
      <h3>${date.getMonth() + 1} 月 ${date.getDate()} 日 ${WEEKDAYS[date.getDay()]}</h3>
      ${studyTasks.map((task) => renderClimbingTask(dateKey, task)).join("")}
    </section>
  `;
}

function renderClimbingTask(dateKey, task) {
  const record = state.records[dateKey]?.tasks?.[task.id] || initialTaskRecord(task);
  const done = isDone(record);
  const label = done ? statusText(record.status, task.type) : record.makeup ? "已补做" : "未完成";
  return `
    <div class="list-item compact-item ${done || record.makeup ? "is-ok" : "is-missing"}">
      <div>
        <strong>${escapeHtml(task.name)}</strong>
        <p class="muted" style="margin:6px 0 0">${label}${taskDetailText(task, record) ? ` · ${taskDetailText(task, record)}` : ""}</p>
        <div class="weekday-row">
          <button class="ghost-button" data-date="${dateKey}" data-task="${task.id}" data-climb-status="completed" type="button">${record.status === "completed" ? "取消完成" : "完成"}</button>
          <button class="ghost-button" data-date="${dateKey}" data-task="${task.id}" data-climb-status="excellent" type="button">${record.status === "excellent" ? "取消优秀" : "优秀"}</button>
          <button class="ghost-button" data-date="${dateKey}" data-task="${task.id}" data-makeup="true" type="button">${record.makeup ? "取消补做" : "标记补做"}</button>
        </div>
      </div>
      <span class="point-pill">${done || record.makeup ? "达成" : "缺"}</span>
    </div>
  `;
}

function taskDetailText(task, record) {
  const pianoPieces = task.id === "piano-practice"
    ? normalizedPianoPieces(record).filter((piece) => piece.name || piece.progress).map((piece) => `${piece.name || "未命名曲目"} ${piece.progress || 0}%`).join("；")
    : "";
  return [
    record.duration ? `${record.duration} 分钟` : "",
    pianoPieces,
    task.id !== "piano-practice" && record.title ? `《${escapeHtml(record.title)}》` : "",
    task.id !== "piano-practice" && record.progress ? `${record.progress}%` : "",
    task.id === "go-game" && record.selfLevel ? `George ${escapeHtml(record.selfLevel)}` : "",
    record.level ? `对手 ${escapeHtml(record.level)}` : "",
    task.id === "go-game" ? (record.won ? "获胜" : "未获胜") : "",
    record.note ? `备注：${escapeHtml(record.note)}` : "",
  ].filter(Boolean).join(" · ");
}

function renderStats() {
  if (!elements.statsPanel) return;
  const stats = calculateStats(statsRange);
  elements.statsPanel.innerHTML = `
    <section class="stats-grid">
      ${statCard("总得分", `${stats.totalPoints} 分`, "已结算积分")}
      ${statCard("学习完成率", `${stats.studyRate}%`, `${stats.studyDone} / ${stats.studyTotal}`)}
      ${statCard("习惯完成率", `${stats.habitRate}%`, `${stats.habitDone} / ${stats.habitTotal}`)}
      ${statCard("学习用时", formatHours(stats.studyMinutes), `${stats.studyMinutes} 分钟`)}
      ${statCard("优秀完成", `${stats.excellentCount} 次`, "学习任务")}
      ${statCard("达标天数", `${stats.qualifiedDays} 天`, `${stats.settledDays} 天已结算`)}
    </section>

    <section class="stats-section">
      <h2>需要关注的任务</h2>
      <div class="stats-table">
        ${stats.lowCompletion.length ? stats.lowCompletion.map((item, index) => `
          <div class="stats-row">
            <span>${index + 1}</span>
            <strong>${item.name}</strong>
            <span>${item.rate}%</span>
            <span>${item.done} / ${item.total}</span>
            <span>优秀 ${item.excellent}</span>
            <span>${item.minutes} 分钟</span>
          </div>
        `).join("") : `<p class="muted">这个范围内没有需要特别关注的任务。</p>`}
      </div>
    </section>

    <section class="achievement-grid">
      <article class="achievement-card">
        <h2>钢琴成果</h2>
        <p>${stats.piano.summary}</p>
        ${renderNameProgressTable(stats.piano.items, "曲目")}
      </article>
      <article class="achievement-card">
        <h2>围棋成果</h2>
        <p>${stats.go.summary}</p>
      </article>
      <article class="achievement-card">
        <h2>阅读成果</h2>
        <p>${stats.reading.summary}</p>
        ${renderNameProgressTable(stats.reading.items, "书名")}
      </article>
    </section>
  `;
}

function statCard(label, value, note) {
  return `
    <article class="stat-card">
      <span>${label}</span>
      <strong>${value}</strong>
      <p>${note}</p>
    </article>
  `;
}

function renderNameProgressTable(items, nameLabel) {
  if (!items.length) return `<p class="muted">暂无记录。</p>`;
  return `
    <div class="mini-table">
      <div class="mini-row header"><span>${nameLabel}</span><span>最新进度</span><span>次数</span><span>用时</span></div>
      ${items.slice(0, 8).map((item) => `
        <div class="mini-row">
          <span>${escapeHtml(item.name)}</span>
          <span>${item.progress}%</span>
          <span>${item.count}</span>
          <span>${item.minutes} 分钟</span>
        </div>
      `).join("")}
    </div>
  `;
}

function calculateStats(range) {
  const dateKeys = statDateKeys(range);
  const taskStats = new Map();
  let totalPoints = 0;
  let settledDays = 0;
  let qualifiedDays = 0;
  let studyTotal = 0;
  let studyDone = 0;
  let habitTotal = 0;
  let habitDone = 0;
  let studyMinutes = 0;
  let excellentCount = 0;
  const piano = new Map();
  const reading = new Map();
  let goGames = 0;
  let goWins = 0;
  let firstGoLevel = "";
  let lastGoLevel = "";

  dateKeys.forEach((dateKey) => {
    const date = parseDateKey(dateKey);
    const day = state.records[dateKey];
    const settlement = state.settlements[dateKey];
    if (settlement) {
      settledDays += 1;
      totalPoints += Number(settlement.points || 0);
      if (settlement.qualified) qualifiedDays += 1;
    }
    tasksForDate(dateKey).forEach((task) => {
      if (day?.leave) return;
      const record = day?.tasks?.[task.id] || initialTaskRecord(task);
      const done = isDone(record);
      const minutes = Number(record.duration || 0);
      if (task.type === "study") {
        studyTotal += 1;
        if (done) studyDone += 1;
        if (done) studyMinutes += minutes;
        if (record.status === "excellent") excellentCount += 1;
      }
      if (task.type === "habit") {
        habitTotal += 1;
        if (done) habitDone += 1;
      }
      if (task.type === "study" || task.type === "habit") {
        const item = taskStats.get(task.id) || { name: task.name, type: task.type, total: 0, done: 0, excellent: 0, minutes: 0 };
        item.total += 1;
        if (done) item.done += 1;
        if (record.status === "excellent") item.excellent += 1;
        if (done) item.minutes += minutes;
        taskStats.set(task.id, item);
      }
      if (done && task.id === "piano-practice") {
        normalizedPianoPieces(record).forEach((piece) => {
          if (!piece.name) return;
          const item = piano.get(piece.name) || { name: piece.name, progress: 0, count: 0, minutes: 0, lastDate: "" };
          item.progress = Number(piece.progress || item.progress || 0);
          item.count += 1;
          item.minutes += minutes;
          item.lastDate = dateKey;
          piano.set(piece.name, item);
        });
      }
      if (done && (task.id === "chinese-reading" || task.id === "english-reading") && record.title) {
        const item = reading.get(record.title) || { name: record.title, progress: 0, count: 0, minutes: 0, lastDate: "", type: task.name };
        item.progress = Number(record.progress || item.progress || 0);
        item.count += 1;
        item.minutes += minutes;
        item.lastDate = dateKey;
        reading.set(record.title, item);
      }
      if (done && task.id === "go-game") {
        goGames += 1;
        if (record.won) goWins += 1;
        if (record.selfLevel && !firstGoLevel) firstGoLevel = record.selfLevel;
        if (record.selfLevel) lastGoLevel = record.selfLevel;
      }
    });
  });

  const lowCompletion = [...taskStats.values()]
    .filter((item) => item.total >= 2)
    .map((item) => ({ ...item, rate: item.total ? Math.round((item.done / item.total) * 100) : 0 }))
    .sort((a, b) => a.rate - b.rate || b.total - a.total)
    .slice(0, 8);
  const pianoItems = [...piano.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  const readingItems = [...reading.values()].sort((a, b) => b.lastDate.localeCompare(a.lastDate));

  return {
    totalPoints,
    settledDays,
    qualifiedDays,
    studyTotal,
    studyDone,
    habitTotal,
    habitDone,
    studyRate: studyTotal ? Math.round((studyDone / studyTotal) * 100) : 0,
    habitRate: habitTotal ? Math.round((habitDone / habitTotal) * 100) : 0,
    studyMinutes,
    excellentCount,
    lowCompletion,
    piano: {
      items: pianoItems,
      summary: `George 通过 ${formatHours(sumBy(pianoItems, "minutes"))} 钢琴练习，练习了 ${pianoItems.length} 首曲子，其中 ${pianoItems.filter((item) => item.progress >= 100).length} 首达到 100%。`,
    },
    reading: {
      items: readingItems,
      summary: `George 用 ${formatHours(sumBy(readingItems, "minutes"))} 阅读了 ${readingItems.length} 本书，其中 ${readingItems.filter((item) => item.progress >= 100).length} 本已读完。`,
    },
    go: {
      summary: goGames
        ? `George 下了 ${goGames} 盘围棋，赢了 ${goWins} 盘，胜率 ${Math.round((goWins / goGames) * 100)}%。${firstGoLevel || lastGoLevel ? `围棋级别从 ${firstGoLevel || "未记录"} 到 ${lastGoLevel || "未记录"}。` : "级别变化暂无记录。"}`
        : "暂无围棋对局记录。",
    },
  };
}

function statDateKeys(range) {
  if (range === "week") return currentWeekDates();
  const keys = new Set([...Object.keys(state.records), ...Object.keys(state.settlements), todayKey]);
  if (range === "month") {
    const currentMonth = todayKey.slice(0, 7);
    return [...keys].filter((dateKey) => dateKey.startsWith(currentMonth)).sort();
  }
  return [...keys].sort();
}

function formatHours(minutes) {
  if (!minutes) return "0 小时";
  const hours = minutes / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} 小时`;
}

function sumBy(items, field) {
  return items.reduce((sum, item) => sum + Number(item[field] || 0), 0);
}

function renderRewards() {
  elements.rewardGrid.innerHTML = REWARDS.map((reward) => {
    const canRedeem = reward.flexible || state.points >= reward.cost;
    return `
      <article class="reward-card">
        <h3>${reward.name}</h3>
        <p class="reward-note">${reward.detail}</p>
        <p class="reward-note">${reward.flexible ? "按实际价值 × 10" : `需要 ${reward.cost} 分`}</p>
        ${reward.flexible ? `
          <label>预计价值（元）<input id="flexValue" type="number" min="1" value="5" /></label>
        ` : ""}
        <button class="redeem-button" data-reward="${reward.id}" ${canRedeem ? "" : "disabled"} type="button">${canRedeem ? "申请兑换" : "积分不足"}</button>
      </article>
    `;
  }).join("");
  elements.rewardGrid.querySelectorAll("[data-reward]").forEach((button) => {
    button.addEventListener("click", () => requestRedemption(button.dataset.reward));
  });
  elements.redemptionList.innerHTML = state.redemptions.length
    ? state.redemptions.slice().reverse().map(renderRedemption).join("")
    : `<p class="muted">暂无兑换申请。</p>`;
  elements.redemptionList.querySelectorAll("[data-approve]").forEach((button) => {
    button.addEventListener("click", () => approveRedemption(button.dataset.approve));
  });
  elements.redemptionList.querySelectorAll("[data-cancel]").forEach((button) => {
    button.addEventListener("click", () => cancelRedemption(button.dataset.cancel));
  });
}

function requestRedemption(rewardId) {
  const reward = REWARDS.find((item) => item.id === rewardId);
  if (!reward) return;
  const flexValue = Number(document.querySelector("#flexValue")?.value || 0);
  const cost = reward.flexible ? Math.max(10, Math.round(flexValue * 10)) : reward.cost;
  if (state.points < cost) {
    toast("积分不足，暂时不能申请。");
    return;
  }
  state.redemptions.push({
    id: `redeem-${Date.now()}`,
    rewardId,
    name: reward.flexible ? `灵活兑换（约 ${flexValue} 元）` : reward.name,
    cost,
    status: "pending",
    date: todayKey,
  });
  toast("已提交兑换申请，等待家长确认。");
  render();
}

function renderRedemption(item) {
  return `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <p class="muted" style="margin:6px 0 0">${item.cost} 分 · ${redemptionStatusText(item.status)} · ${item.date}</p>
      </div>
      <div class="action-row">
        <button class="ghost-button" data-approve="${item.id}" ${item.status !== "pending" ? "disabled" : ""} type="button">确认</button>
        <button class="ghost-button danger" data-cancel="${item.id}" ${item.status !== "pending" ? "disabled" : ""} type="button">取消</button>
      </div>
    </div>
  `;
}

function approveRedemption(id) {
  const item = state.redemptions.find((redemption) => redemption.id === id);
  if (!item || item.status !== "pending") return;
  if (state.points < item.cost) {
    toast("当前积分不足，无法确认兑换。");
    return;
  }
  state.points -= item.cost;
  item.status = "approved";
  toast("兑换已确认并扣分。");
  render();
}

function cancelRedemption(id) {
  const item = state.redemptions.find((redemption) => redemption.id === id);
  if (!item || item.status !== "pending") return;
  item.status = "cancelled";
  toast("兑换申请已取消。");
  render();
}

function renderBadges() {
  elements.badgeGrid.innerHTML = BADGES.map((badge) => {
    const unlocked = state.unlockedBadges.includes(badge.id);
    const title = badge.hidden && !unlocked ? "隐藏勋章" : badge.name;
    const condition = badge.hidden && !unlocked ? "达成后自动解锁" : badge.condition;
    const current = state.currentTitle === badge.title;
    return `
      <article class="badge-card ${unlocked ? "" : "locked"}">
        <div class="badge-mark">${unlocked ? "已" : "?"}</div>
        <h3>${title}</h3>
        <p class="badge-condition">${condition}</p>
        <button class="select-title-button" data-title="${badge.title}" ${unlocked ? "" : "disabled"} type="button">${current ? "正在展示" : `设为${badge.title}`}</button>
      </article>
    `;
  }).join("");
  elements.badgeGrid.querySelectorAll("[data-title]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentTitle = button.dataset.title;
      toast(`当前称号：${state.currentTitle}`);
      render();
    });
  });
}

function updateBadges() {
  const newlyUnlocked = BADGES.filter((badge) => !state.unlockedBadges.includes(badge.id) && badge.test(state));
  newlyUnlocked.forEach((badge) => state.unlockedBadges.push(badge.id));
  if (!state.currentTitle && newlyUnlocked[0]) state.currentTitle = newlyUnlocked[0].title;
}

function renderScheduleEditor() {
  const groups = [
    { type: "study", title: "学习任务" },
    { type: "class", title: "课外班" },
    { type: "habit", title: "生活习惯" },
    { type: "bonus", title: "加分任务" },
  ];
  elements.scheduleEditor.innerHTML = groups.map((group) => `
    <section>
      <h3>${group.title}</h3>
      ${TASKS.filter((task) => task.type === group.type).map(renderScheduleItem).join("")}
    </section>
  `).join("");
  elements.scheduleEditor.querySelectorAll("[data-schedule]").forEach((input) => {
    input.addEventListener("change", () => {
      const days = [...document.querySelectorAll(`[data-schedule="${input.dataset.schedule}"]:checked`)].map((item) => Number(item.value));
      state.schedules[input.dataset.schedule] = days;
      render();
    });
  });
}

function renderScheduleItem(task) {
  const selected = state.schedules[task.id] || [];
  return `
    <div class="schedule-item">
      <div>
        <strong>${task.name}</strong>
        <div class="weekday-row">
          ${WEEKDAYS.map((day, index) => `
            <label><input data-schedule="${task.id}" type="checkbox" value="${index}" ${selected.includes(index) ? "checked" : ""} />${day}</label>
          `).join("")}
        </div>
      </div>
      <span class="point-pill">+${task.points}</span>
    </div>
  `;
}

function calculateClimbingStatus() {
  const dates = currentWeekDates();
  let total = 0;
  let done = 0;
  dates.forEach((dateKey) => {
    const date = parseDateKey(dateKey);
    TASKS.filter((task) => task.type === "study" && isScheduled(task, date.getDay())).forEach((task) => {
      total += 1;
      const record = state.records[dateKey]?.tasks?.[task.id];
      if (record && (isDone(record) || record.makeup)) done += 1;
    });
  });
  return { total, done, remaining: Math.max(0, total - done), qualified: total > 0 && done === total };
}

function todaysTasks() {
  const day = today.getDay();
  return TASKS.filter((task) => isScheduled(task, day));
}

function tasksForDate(dateKey) {
  const day = parseDateKey(dateKey).getDay();
  return TASKS.filter((task) => isScheduled(task, day));
}

function isScheduled(task, day) {
  return (state.schedules[task.id] || []).includes(day);
}

function recordFor(dateKey, taskId) {
  if (!state.records[dateKey]) state.records[dateKey] = { tasks: {}, leave: false };
  if (!state.records[dateKey].tasks[taskId]) state.records[dateKey].tasks[taskId] = initialTaskRecord(taskById(taskId));
  return state.records[dateKey].tasks[taskId];
}

function taskById(taskId) {
  return TASKS.find((task) => task.id === taskId);
}

function isDone(record) {
  return record.status === "completed" || record.status === "excellent";
}

function earnedRawPoints(task, record) {
  if (!isDone(record)) return 0;
  return displayTaskPoints(task, record) + ((task.type === "study" || task.type === "class") && record.status === "excellent" ? 1 : 0);
}

function displayTaskPoints(task, record) {
  if (task.customPoints) return Number(record.customPoints || task.points || 1);
  return Number(task.points);
}

function displayTaskName(task, record) {
  if (task.customPoints && record.customName) return record.customName;
  return task.name;
}

function taskTypeText(type) {
  return { study: "学习任务", habit: "生活习惯", class: "课外班", bonus: "加分任务" }[type] || "";
}

function statusText(status, type) {
  if (status === "excellent") return type === "class" ? "老师表扬" : "优秀完成";
  if (status === "completed") return type === "class" ? "已参加" : "已完成";
  return "未完成";
}

function getMultiplier(streak) {
  if (streak >= 21) return 1.5;
  if (streak >= 14) return 1.4;
  if (streak >= 7) return 1.3;
  if (streak >= 5) return 1.2;
  if (streak >= 3) return 1.1;
  return 1;
}

function missPenaltyFor(missStreak) {
  if (missStreak === 3) return 3;
  if (missStreak === 5) return 5;
  if (missStreak === 7) return 8;
  return 0;
}

function ensureTreasureMonth(key) {
  if (state.treasureBoxes[key]) return;
  const [year, month] = key.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [];
  while (days.length < 5) {
    const day = Math.floor(Math.random() * daysInMonth) + 1;
    if (!days.includes(day)) days.push(day);
  }
  state.treasureBoxes[key] = days.map((day, index) => ({
    date: `${key}-${String(day).padStart(2, "0")}`,
    type: index < 3 ? "reward" : "penalty",
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function getTreasureBox(dateKey) {
  return state.treasureBoxes[dateKey.slice(0, 7)]?.find((box) => box.date === dateKey) || null;
}

function currentWeekDates() {
  const start = new Date(today);
  const day = today.getDay() || 7;
  start.setDate(today.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return toDateKey(date);
  });
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isTodaySettled() {
  return Boolean(state.settlements[todayKey]);
}

function setView(view) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}View`);
  });
}

function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  ensureToday();
  toast("体验数据已重置");
  render();
}

function countTaskStatus(s, taskId, status) {
  return Object.values(s.records).filter((day) => day.tasks?.[taskId]?.status === status).length;
}

function countTaskDone(s, taskId) {
  return Object.values(s.records).filter((day) => isDone(day.tasks?.[taskId] || {})).length;
}

function countExcellent(s) {
  return Object.values(s.records).reduce((sum, day) => {
    return sum + TASKS.filter((task) => task.type === "study" && day.tasks?.[task.id]?.status === "excellent").length;
  }, 0);
}

function countReadingDone(s) {
  return countTaskDone(s, "chinese-reading") + countTaskDone(s, "english-reading");
}

function countGoWins(s) {
  return Object.values(s.records).filter((day) => day.tasks?.["go-game"]?.won).length;
}

function countHabitQualifiedDays(s) {
  return Object.entries(s.records).filter(([dateKey, day]) => {
    const date = parseDateKey(dateKey);
    const habitTasks = TASKS.filter((task) => task.type === "habit" && isScheduled(task, date.getDay()));
    if (!habitTasks.length) return false;
    const done = habitTasks.filter((task) => isDone(day.tasks?.[task.id] || {})).length;
    return done / habitTasks.length >= 0.8;
  }).length;
}

function countRewardBoxes(s) {
  return Object.values(s.settlements).filter((settlement) => settlement.box === "reward-opened").length;
}

function hasPerfectEnergyDay(s) {
  return Object.entries(s.records).some(([dateKey, day]) => {
    const date = parseDateKey(dateKey);
    const core = TASKS.filter((task) => (task.type === "study" || task.type === "habit") && isScheduled(task, date.getDay()));
    const allDone = core.length > 0 && core.every((task) => isDone(day.tasks?.[task.id] || {}));
    const excellent = TASKS.some((task) => task.type === "study" && day.tasks?.[task.id]?.status === "excellent");
    return allDone && excellent;
  });
}

function hasAllRounderWeek(s) {
  const dates = currentWeekDates();
  const doneTypes = new Set();
  dates.forEach((dateKey) => {
    const tasks = s.records[dateKey]?.tasks || {};
    if (Object.entries(tasks).some(([id, record]) => taskById(id)?.type === "study" && isDone(record))) doneTypes.add("study");
    if (Object.entries(tasks).some(([id, record]) => taskById(id)?.type === "habit" && isDone(record))) doneTypes.add("habit");
    if (isDone(tasks["chinese-reading"] || {}) || isDone(tasks["english-reading"] || {})) doneTypes.add("reading");
    if (isDone(tasks["piano-practice"] || {})) doneTypes.add("piano");
    if (isDone(tasks["go-game"] || {})) doneTypes.add("go");
  });
  return ["study", "habit", "reading", "piano", "go"].every((item) => doneTypes.has(item));
}

function redemptionStatusText(status) {
  return { pending: "待确认", approved: "已兑换", cancelled: "已取消" }[status] || status;
}

function toast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}
