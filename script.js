const LOCAL_STORAGE_KEY = 'studyTrackerProData';
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 30;

// NEW: Timer Presets Configuration
const PRESETS = {
    'free': { focus: Infinity, break: 0, name: 'Free Mode', icon: 'sun', color: 'indigo' },
    '25/5': { focus: 25 * 60, break: 5 * 60, name: '25/5 Pomodoro', icon: 'timer', color: 'emerald' },
    '50/10': { focus: 50 * 60, break: 10 * 60, name: '50/10 Focus', icon: 'clock', color: 'yellow' }
};

const SUBJECT_COLORS = ['indigo', 'emerald', 'sky', 'yellow', 'red', 'purple', 'teal', 'pink'];
const DEFAULT_SUBJECTS = [
    { id: 'physics', name: 'Physics', color: 'indigo' },
    { id: 'chemistry', name: 'Chemistry', color: 'emerald' },
    { id: 'math', name: 'Math', color: 'sky' },
    { id: 'other', name: 'Other', color: 'yellow' },
    { id: 'lang', name: 'Language', color: 'red' },
];

const ACHIEVEMENTS_CONFIG = [
    { id: 'focused_hour_easy', icon: 'hourglass', name: 'First Step (1h)', unit: 'minutes', description: 'Log one hour of focused time.', goal: 60, color: 'text-amber-300' },
    { id: 'focused_hour_medium', icon: 'hourglass', name: 'Time Manager (5h)', unit: 'minutes', description: 'Log five hours of focused time.', goal: 300, color: 'text-gray-300' },
    { id: 'focused_hour_hard', icon: 'hourglass', name: 'Flow State Master (20h)', unit: 'minutes', description: 'Log twenty hours of focused time.', goal: 1200, color: 'text-indigo-400' },
    { id: 'tasks_done_easy', icon: 'check-circle', name: 'Getting Things Done (5)', unit: 'tasks', description: 'Complete 5 tasks.', goal: 5, color: 'text-amber-300' },
    { id: 'tasks_done_medium', icon: 'check-circle', name: 'Productivity Pro (20)', unit: 'tasks', description: 'Complete 20 tasks.', goal: 20, color: 'text-gray-300' },
    { id: 'tasks_done_hard', icon: 'check-circle', name: 'Executioner (50)', unit: 'tasks', description: 'Complete 50 tasks.', goal: 50, color: 'text-indigo-400' }
];

const DEFAULT_STATE = {
    isRunning: false,
    timeElapsed: 0,
    startTime: null,
    lastTickTime: null,
    subjects: DEFAULT_SUBJECTS,
    currentSubject: DEFAULT_SUBJECTS[0].id,
    sessionGoal: '',
    sessions: [],
    tasks: [],
    currentPage: 'timer',
    totalFocusTime: 0,
    isPomodoroActive: false,
    pomodoroMode: 'focus',
    pomodoroTimeRemaining: 0,
    currentDailyStreak: 0,
    lastActiveDate: null,
    dailyFocusGoalMinutes: 30,
    dailyTimeLogged: 0,
    unlockedAchievements: [],
    longestDailyStreak: 0,
    timerMode: 'free',
};

let state = { ...DEFAULT_STATE };
let intervalId = null;
let currentSongIndex = 0;
let currentSessionId = null;
let weeklyChart = null;
let subjectChart = null;

const PLAYLIST = [
    'assets/song1.mp3',
    'assets/song2.mp3',
    'assets/song3.mp3',
    'assets/song4.mp3',
    'assets/song5.mp3',
];

let stats = {
    overallTime: 0,
    monthlyTime: 0,
    weeklyTime: 0,
    prevMonthlyTime: 0,
    prevWeeklyTime: 0,
    dailyTimeInWeek: Array(7).fill(0),
    tasksCompleted: 0,
    totalTasks: 0,
    efficiency: 0,
    avgDailyHours: 0,
    avgSessionLengthSeconds: 0,
    achievements: {},
    subjectBreakdown: {},
    mostFocusedSubject: 'N/A',
    mostFocusedSubjectRatio: 0,
};

const D = {
    timerTitle: document.getElementById('timer-title'),
    timeDisplay: document.getElementById('time-display'),
    taskInput: document.getElementById('task-input'),
    startPauseBtn: document.getElementById('start-pause-btn'),
    stopBtn: document.getElementById('stop-btn'),
    discardBtn: document.getElementById('discard-btn'),
    musicBtn: document.getElementById('music-btn'),
    musicPlayer: document.getElementById('music-player'),
    presetFreeBtn: document.getElementById('preset-free-btn'),
    preset255Btn: document.getElementById('preset-25-5-btn'),
    preset5010Btn: document.getElementById('preset-50-10-btn'),
    historyList: document.getElementById('history-list'),
    noHistory: document.getElementById('no-history'),
    subjectSelector: document.getElementById('subject-selector'),
    detailsModal: document.getElementById('details-modal'),
    modalContent: document.getElementById('modal-content'),
    streakProgressBar: document.getElementById('streak-progress-bar'),
    streakProgressPercent: document.getElementById('streak-progress-percent'),
    streakCount: document.getElementById('streak-count'),
    nextStreakInfo: document.getElementById('next-streak-info'),
    timerView: document.getElementById('timer-view'),
    tasksView: document.getElementById('tasks-view'),
    historyView: document.getElementById('history-view'),
    achievementsView: document.getElementById('achievements-view'),
    progressView: document.getElementById('progress-view'),
    settingsView: document.getElementById('settings-view'),
    navTimerBtn: document.getElementById('nav-timer-btn'),
    navTasksBtn: document.getElementById('nav-tasks-btn'),
    navHistoryBtn: document.getElementById('nav-history-btn'),
    navAchievementsBtn: document.getElementById('nav-achievements-btn'),
    navProgressBtn: document.getElementById('nav-progress-btn'),
    navSettingsBtn: document.getElementById('nav-settings-btn'),
    taskInputNew: document.getElementById('new-task-input'),
    taskPriority: document.getElementById('task-priority'),
    taskDueDate: document.getElementById('task-due-date'),
    tasksListContainer: document.getElementById('tasks-list'),
    noTasks: document.getElementById('no-tasks'),
    dateSelector: document.getElementById('date-selector'),
    historySearch: document.getElementById('history-search'),
    dailySummaryContainer: document.getElementById('daily-summary-container'),
    trophiesContainer: document.getElementById('trophies-container'),
    metricsContainer: document.getElementById('metrics-container'),
    weeklyChart: document.getElementById('weeklyChart'),
    subjectChart: document.getElementById('subjectChart'),
    fullscreenClockModal: document.getElementById('fullscreen-clock-modal'),
    fullscreenTimeDisplay: document.getElementById('fullscreen-time-display'),
    fullscreenSubjectGoal: document.getElementById('fullscreen-subject-goal'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    newSubjectInput: document.getElementById('new-subject-input'),
    subjectsListManager: document.getElementById('subjects-list-manager'),
    dailyGoalInput: document.getElementById('daily-goal-input'),
    roomView: document.getElementById('room-view'),
    navRoomBtn: document.getElementById('nav-room-btn'),
    toastContainer: document.getElementById('toast-container'),
};

// UTILITIES
function formatTime(totalSeconds, includeHours) {
    const totalSec = Math.max(0, Math.floor(totalSeconds));
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = Math.floor(totalSec % 60);
    const minutesStr = minutes.toString().padStart(2, '0');
    const secondsStr = seconds.toString().padStart(2, '0');
    if (includeHours || hours > 0) {
        const hoursStr = hours.toString().padStart(2, '0');
        return `${hoursStr}:${minutesStr}:${secondsStr}`;
    }
    return `${minutesStr}:${secondsStr}`;
}

const formatMinutes = (seconds) => {
    const totalMinutes = Math.floor(seconds / 60);
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

function formatComparison(current, previous, unit) {
    if (previous === 0) return `<span class="text-gray-400">No previous ${unit} data</span>`;
    const change = current - previous;
    const percentChange = (change / previous) * 100;
    const formattedPercent = Math.abs(percentChange).toFixed(0);
    if (Math.abs(percentChange) < 1) return `<span class="text-gray-400">Same as last ${unit}</span>`;
    let icon = 'minus', color = 'text-gray-400', direction = 'No change';
    if (percentChange > 0) {
        icon = 'arrow-up-right';
        color = 'text-emerald-400';
        direction = 'Up';
    } else if (percentChange < 0) {
        icon = 'arrow-down-right';
        color = 'text-red-400';
        direction = 'Down';
    }
    return `<span class="${color} flex items-center"><i data-lucide="${icon}" class="w-4 h-4 mr-1"></i>${direction} ${formattedPercent}%</span>`;
}

function getFormattedDate(isoString) {
    if (!isoString) return null;
    return isoString.split('T')[0];
}

function formatDateForDisplay(dateKey) {
    const date = new Date(dateKey + 'T00:00:00');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function getPeriodStart(period, referenceDate = new Date()) {
    const date = new Date(referenceDate.getTime());
    date.setHours(0, 0, 0, 0);
    if (period === 'week') {
        const day = date.getDay() || 7;
        date.setDate(date.getDate() - day + 1);
        return date;
    } else if (period === 'prevWeek') {
        const startOfWeek = getPeriodStart('week', referenceDate);
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        return startOfWeek;
    } else if (period === 'month') {
        date.setDate(1);
        return date;
    } else if (period === 'prevMonth') {
        date.setDate(1);
        date.setMonth(date.getMonth() - 1);
        return date;
    }
    return new Date(0);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (type === 'info') toast.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    toast.innerHTML = `<div class="flex items-center"><i data-lucide="${type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-triangle' : 'info')}" class="w-5 h-5 mr-2"></i>${message}</div>`;
    D.toastContainer.appendChild(toast);
    window.createLucideIcons();
    setTimeout(() => toast.remove(), 3000);
}

// STORAGE
function loadState() {
    try {
        const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedState) {
            const loadedState = JSON.parse(storedState);
            state = { ...DEFAULT_STATE, ...loadedState };

            if (state.isRunning && state.startTime) {
                const now = Date.now();
                const timeAway = Math.floor((now - state.startTime) / 1000);
                if (state.isPomodoroActive) {
                    state.pomodoroTimeRemaining = Math.max(0, state.pomodoroTimeRemaining - timeAway);
                    if (state.pomodoroTimeRemaining <= 0) {
                        state.isRunning = false;
                        if (state.pomodoroMode === 'focus') {
                            const maxDuration = PRESETS[state.timerMode].focus;
                            logSession(maxDuration);
                            nextPomodoroPhase(true);
                        } else if (state.pomodoroMode === 'break') {
                            state.isPomodoroActive = false;
                            setTimerMode('free');
                        }
                        showToast('Session corrected: Pomodoro finished while you were away.', 'info');
                    }
                } else {
                    state.timeElapsed += timeAway;
                }
            }
            checkStreakOnLoad();
        } else {
            setTimerMode(state.timerMode);
        }
        calculateStats();
    } catch (e) {
        console.error("Could not load state:", e);
        state = DEFAULT_STATE;
        setTimerMode(state.timerMode);
    }
}

function checkStreakOnLoad() {
    const now = new Date();
    const todayKey = getFormattedDate(now.toISOString());
    const yesterday = new Date(now.getTime());
    yesterday.setDate(now.getDate() - 1);
    const yesterdayKey = getFormattedDate(yesterday.toISOString());
    const lastActiveKey = state.lastActiveDate ? getFormattedDate(state.lastActiveDate) : null;
    const goalMetYesterday = state.sessions.filter(s => getFormattedDate(s.timestamp) === yesterdayKey)
        .reduce((total, s) => total + s.duration, 0) >= (state.dailyFocusGoalMinutes * 60);

    if (lastActiveKey && lastActiveKey !== todayKey) {
        if (lastActiveKey !== yesterdayKey || !goalMetYesterday) {
            const goalMetToday = state.sessions.filter(s => getFormattedDate(s.timestamp) === todayKey)
                .reduce((total, s) => total + s.duration, 0) >= (state.dailyFocusGoalMinutes * 60);
            if (!goalMetToday) {
                state.currentDailyStreak = 0;
                state.dailyTimeLogged = 0;
            } else {
                state.dailyTimeLogged = state.sessions.filter(s => getFormattedDate(s.timestamp) === todayKey)
                    .reduce((total, s) => total + s.duration, 0);
            }
        } else if (lastActiveKey === yesterdayKey && goalMetYesterday) {
            state.dailyTimeLogged = state.sessions.filter(s => getFormattedDate(s.timestamp) === todayKey)
                .reduce((total, s) => total + s.duration, 0);
        }
    } else if (lastActiveKey === todayKey) {
        state.dailyTimeLogged = state.sessions.filter(s => getFormattedDate(s.timestamp) === todayKey)
            .reduce((total, s) => total + s.duration, 0);
    }
    state.lastActiveDate = now.toISOString();
    saveState();
    calculateStats();
}

function saveState() {
    try {
        if (state.timerMode !== 'free' && state.isPomodoroActive && state.pomodoroTimeRemaining <= 0) {
            state.isRunning = false;
        }
        const stateToSave = { ...state };
        delete stateToSave.lastTickTime;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        console.error("Could not save state:", e);
    }
}

// TIMER LOGIC
function updateTimer() {
    if (!state.isRunning) {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        return;
    }

    const now = Date.now();
    if (!state.lastTickTime) {
        state.lastTickTime = now;
        return;
    }

    const timePassedMs = now - state.lastTickTime;
    let timePassedSeconds = Math.floor(timePassedMs / 1000);

    if (timePassedSeconds <= 0) {
        state.lastTickTime = now;
        updateUI();
        return;
    }

    state.lastTickTime = now;
    let phaseChanged = false;

    if (state.isPomodoroActive) {
        state.pomodoroTimeRemaining = Math.max(0, state.pomodoroTimeRemaining - timePassedSeconds);
        if (state.pomodoroTimeRemaining <= 0) {
            nextPomodoroPhase();
            phaseChanged = true;
        }
    } else {
        state.timeElapsed += timePassedSeconds;
    }

    if (!phaseChanged) {
        updateUI();
        saveState();
        checkAchievements();
        if (typeof broadcastStatus === 'function') {
            broadcastStatus();
        }
    }
}

function getRemainingTime() {
    return state.isPomodoroActive ? state.pomodoroTimeRemaining : state.timeElapsed;
}

function setTimerMode(mode) {
    if (state.isRunning) {
        showToast('Cannot change mode while timer is running. Please stop first.', 'error');
        return;
    }
    const preset = PRESETS[mode];
    state.timerMode = mode;
    state.isPomodoroActive = (mode !== 'free');
    state.pomodoroMode = 'focus';
    state.timeElapsed = 0;
    state.pomodoroTimeRemaining = preset.focus;
    state.startTime = null;
    updateUI();

    const btns = [D.presetFreeBtn, D.preset255Btn, D.preset5010Btn];
    btns.forEach(btn => {
        let btnMode = btn.id.replace('preset-', '').replace('-btn', '').replace(/-/g, '/');
        if (btnMode === mode) {
            btn.classList.add('bg-indigo-600/70', 'hover:bg-indigo-600', 'text-white');
            btn.classList.remove('bg-gray-700/50', 'hover:bg-gray-600/70');
        } else {
            btn.classList.remove('bg-indigo-600/70', 'hover:bg-indigo-600', 'text-white');
            btn.classList.add('bg-gray-700/50', 'hover:bg-gray-600/70');
        }
    });
    saveState();
}

function startPauseHandler() {
    if (state.isPomodoroActive && state.pomodoroTimeRemaining <= 0) return;
    if (state.isRunning) {
        state.isRunning = false;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
        state.lastTickTime = null;
        D.startPauseBtn.querySelector('i').setAttribute('data-lucide', 'play');
        document.body.classList.remove('session-active');
        if (typeof broadcastStatus === 'function') broadcastStatus();
    } else {
        if (!state.currentSubject) {
            showToast('Please select a subject before starting the timer.', 'error');
            return;
        }
        state.isRunning = true;
        state.startTime = Date.now();
        state.lastTickTime = Date.now();
        if (state.pomodoroTimeRemaining > 0 || !state.isPomodoroActive) {
            intervalId = setInterval(updateTimer, 1000);
        }
        D.startPauseBtn.querySelector('i').setAttribute('data-lucide', 'pause');
        document.body.classList.add('session-active');
        if (typeof broadcastStatus === 'function') broadcastStatus();
    }
    updateUI();
    saveState();
}

function stopSession() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    state.isRunning = false;
    state.lastTickTime = null;

    const focusTime = state.isPomodoroActive
        ? (PRESETS[state.timerMode].focus - state.pomodoroTimeRemaining)
        : state.timeElapsed;

    if (focusTime > 5 || (state.isPomodoroActive && state.pomodoroMode === 'focus')) {
        logSession(focusTime);
        state.dailyTimeLogged += focusTime;
        checkDailyStreak();
    } else if (focusTime > 0) {
        showToast(`Session too short (${formatMinutes(focusTime)}) to log.`, 'error');
    }

    if (state.isPomodoroActive && state.pomodoroTimeRemaining <= 0) {
    } else {
        setTimerMode(state.timerMode);
    }

    state.timeElapsed = 0;
    state.startTime = null;
    state.lastTickTime = null;
    document.body.classList.remove('session-active');
    if (typeof broadcastStatus === 'function') broadcastStatus();
    calculateStats();
    updateUI();
    saveState();
}

function discardSession() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    state.isRunning = false;
    state.lastTickTime = null;
    setTimerMode(state.timerMode);
    D.startPauseBtn.querySelector('i').setAttribute('data-lucide', 'play');
    document.body.classList.remove('session-active');
    if (typeof broadcastStatus === 'function') broadcastStatus();
    showToast('Session discarded. Time not logged.', 'info');
    updateUI();
    saveState();
}

function nextPomodoroPhase(isCorrection = false) {
    if (state.pomodoroMode === 'focus' && !isCorrection) {
        const focusDuration = PRESETS[state.timerMode].focus;
        logSession(focusDuration);
        state.dailyTimeLogged += focusDuration;
        checkDailyStreak();
        calculateStats();
    }

    if (state.pomodoroMode === 'focus') {
        if (PRESETS[state.timerMode].break > 0) {
            state.pomodoroMode = 'break';
            state.pomodoroTimeRemaining = PRESETS[state.timerMode].break;
            showToast(`Focus complete! Time for a ${formatMinutes(state.pomodoroTimeRemaining)} break.`, 'success');
        } else {
            state.isPomodoroActive = false;
            setTimerMode('free');
            showToast(`Focus complete! Session logged.`, 'success');
        }
    } else if (state.pomodoroMode === 'break') {
        state.pomodoroMode = 'focus';
        state.pomodoroTimeRemaining = PRESETS[state.timerMode].focus;
        showToast(`Break over! Time to focus again.`, 'success');
    }

    if (!isCorrection && state.isRunning) {
        state.lastTickTime = Date.now();
    } else if (isCorrection) {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(updateTimer, 1000);
    }
    updateUI();
    saveState();
}

function logSession(durationOverride = state.timeElapsed) {
    const now = new Date();
    const session = {
        id: Date.now().toString(),
        timestamp: now.toISOString(),
        duration: durationOverride,
        subjectId: state.currentSubject,
        goal: D.taskInput.value.trim() || 'No goal set',
        mode: state.isPomodoroActive ? `${state.timerMode} (${state.pomodoroMode})` : 'Free Mode',
    };

    if (session.duration > 5) {
        state.sessions.unshift(session);
        showToast(`Session logged: ${formatMinutes(session.duration)} of focused time!`, 'success');
        if (D.taskInput.value.trim()) {
            const task = {
                id: 's' + session.id,
                text: `[Focus Session] ${D.taskInput.value.trim()} (${formatMinutes(session.duration)})`,
                completed: true,
                priority: 'low',
                timestamp: session.timestamp,
                dueDate: null,
            };
            state.tasks.unshift(task);
        }
    }
}

function checkDailyStreak() {
    const goalSeconds = state.dailyFocusGoalMinutes * 60;
    const now = new Date();
    const todayKey = getFormattedDate(now.toISOString());
    const yesterday = new Date(now.getTime());
    yesterday.setDate(now.getDate() - 1);
    const yesterdayKey = getFormattedDate(yesterday.toISOString());
    const lastActiveKey = state.lastActiveDate ? getFormattedDate(state.lastActiveDate) : null;
    const goalMetToday = state.dailyTimeLogged >= goalSeconds;

    if (goalMetToday && lastActiveKey !== todayKey) {
        if (state.currentDailyStreak > 0) {
            const goalMetYesterday = state.sessions.filter(s => getFormattedDate(s.timestamp) === yesterdayKey)
                .reduce((total, s) => total + s.duration, 0) >= goalSeconds;
            if (goalMetYesterday) {
                state.currentDailyStreak += 1;
                showToast(`🔥 Streak continued! Now ${state.currentDailyStreak} days!`, 'success');
            } else {
                state.currentDailyStreak = 1;
                showToast(`Streak reset, but a new streak has begun!`, 'info');
            }
        } else {
            state.currentDailyStreak = 1;
            showToast(`🔥 First day of your focus streak!`, 'success');
        }
    } else if (lastActiveKey !== todayKey) {
        const goalMetYesterday = state.sessions.filter(s => getFormattedDate(s.timestamp) === yesterdayKey)
            .reduce((total, s) => total + s.duration, 0) >= goalSeconds;
        if (!goalMetYesterday) {
            state.currentDailyStreak = 0;
        }
    }
    state.longestDailyStreak = Math.max(state.longestDailyStreak, state.currentDailyStreak);
    state.lastActiveDate = now.toISOString();
    saveState();
}

function filterExpiredTasks() {
    const today = getFormattedDate(new Date().toISOString());
    let tasksChanged = false;
    const activeTasks = state.tasks.filter(task => {
        if (task.completed) return true;
        if (!task.dueDate) return true;
        if (task.dueDate >= today) return true;
        tasksChanged = true;
        return false;
    });
    if (tasksChanged) {
        state.tasks = activeTasks;
        saveState();
        showToast('Expired tasks have been automatically cleared from the list. ✅', 'info');
    }
}

// UI UPDATES
function updateUI() {
    const timeToDisplay = state.isPomodoroActive ? state.pomodoroTimeRemaining : state.timeElapsed;
    D.timeDisplay.textContent = formatTime(timeToDisplay, true);
    D.fullscreenTimeDisplay.textContent = formatTime(timeToDisplay, true);

    if (state.isPomodoroActive) {
        const currentMode = PRESETS[state.timerMode];
        const modeText = state.pomodoroMode === 'focus' ? 'Focus Time' : 'Break Time';
        D.timerTitle.innerHTML = `<i data-lucide="${currentMode.icon}" class="w-6 h-6 inline mr-2 text-${currentMode.color}-400"></i> ${currentMode.name}: ${modeText}`;
    } else {
        D.timerTitle.textContent = 'Focused Subject Tracker';
    }
    window.createLucideIcons();

    if (state.isPomodoroActive) {
        D.stopBtn.disabled = !state.isRunning || state.pomodoroMode === 'break';
        D.discardBtn.disabled = !state.isRunning || state.pomodoroMode === 'break';
        D.startPauseBtn.innerHTML = `<i data-lucide="${state.isRunning ? 'pause' : 'play'}" class="w-6 h-6"></i>`;
        if (state.pomodoroMode === 'break') {
            D.startPauseBtn.innerHTML = `<i data-lucide="${state.isRunning ? 'pause' : 'play'}" class="w-6 h-6 text-yellow-400"></i>`;
            D.stopBtn.disabled = true;
            D.discardBtn.disabled = true;
        }
    } else {
        const hasTimeElapsed = state.timeElapsed > 0;
        D.stopBtn.disabled = !state.isRunning && !hasTimeElapsed;
        D.discardBtn.disabled = !state.isRunning && !hasTimeElapsed;
        D.startPauseBtn.innerHTML = `<i data-lucide="${state.isRunning ? 'pause' : 'play'}" class="w-6 h-6"></i>`;
    }

    const musicIcon = D.musicPlayer.paused ? 'music' : 'volume-2';
    const musicIconElement = D.musicBtn.querySelector('i');
    if (musicIconElement) {
        musicIconElement.setAttribute('data-lucide', musicIcon);
    }
    window.createLucideIcons();
    D.taskInput.disabled = state.isRunning;

    let currentSessionTime = 0;
    if (state.isRunning) {
        if (state.isPomodoroActive && state.pomodoroMode === 'focus') {
            currentSessionTime = PRESETS[state.timerMode].focus - state.pomodoroTimeRemaining;
        } else if (!state.isPomodoroActive) {
            currentSessionTime = state.timeElapsed;
        }
    }

    const totalFocusTimeToday = state.dailyTimeLogged + currentSessionTime;
    const goalSeconds = state.dailyFocusGoalMinutes * 60;
    const progress = Math.min(1, totalFocusTimeToday / goalSeconds);
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    D.streakProgressBar.style.strokeDashoffset = offset;
    D.streakProgressPercent.textContent = `${Math.floor(progress * 100)}%`;
    D.streakCount.textContent = state.currentDailyStreak;

    const timerProgressBar = document.getElementById('timer-progress-bar');
    if (timerProgressBar) {
        let sessionProgress = 0;
        const TOTAL_LENGTH = 1880;
        if (state.isPomodoroActive) {
            const totalTime = PRESETS[state.timerMode][state.pomodoroMode];
            if (totalTime > 0) {
                sessionProgress = 1 - (state.pomodoroTimeRemaining / totalTime);
            }
        } else {
            const ONE_HOUR = 3600;
            sessionProgress = (state.timeElapsed % ONE_HOUR) / ONE_HOUR;
        }
        const offset = TOTAL_LENGTH * (1 - sessionProgress);
        timerProgressBar.style.strokeDashoffset = offset;
        if (state.isPomodoroActive) {
            if (state.pomodoroMode === 'break') {
                timerProgressBar.classList.remove('text-indigo-500', 'text-emerald-500');
                timerProgressBar.classList.add('text-yellow-400');
            } else {
                timerProgressBar.classList.remove('text-yellow-400', 'text-emerald-500');
                timerProgressBar.classList.add('text-indigo-500');
            }
        } else {
            timerProgressBar.classList.remove('text-yellow-400', 'text-indigo-500');
            timerProgressBar.classList.add('text-emerald-500');
        }
    }

    const remainingMinutes = Math.max(0, state.dailyFocusGoalMinutes - Math.floor(totalFocusTimeToday / 60));
    if (remainingMinutes > 0) {
        D.nextStreakInfo.textContent = `Log ${remainingMinutes} more minutes to secure your streak!`;
        D.nextStreakInfo.classList.remove('text-emerald-400');
        D.nextStreakInfo.classList.add('text-gray-500');
    } else {
        D.nextStreakInfo.textContent = `Daily goal complete! Keep the streak alive!`;
        D.nextStreakInfo.classList.add('text-emerald-400');
        D.nextStreakInfo.classList.remove('text-gray-500');
    }

    const currentSubject = state.subjects.find(s => s.id === state.currentSubject);
    D.fullscreenSubjectGoal.textContent = `${currentSubject ? currentSubject.name : 'Subject'} | ${D.taskInput.value.trim() || 'No Goal'}`;

    renderHistory('', '', 5);
    window.createLucideIcons();
}

// SUBJECTS
function renderSubjectSelector() {
    D.subjectSelector.innerHTML = state.subjects.map(subject => {
        const isChecked = subject.id === state.currentSubject;
        const activeClasses = isChecked ? `bg-${subject.color}-600 border-${subject.color}-400 text-white shadow-lg shadow-${subject.color}-600/50` : `bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/70`;
        return `
                    <input type="radio" id="subject-${subject.id}" name="subject-select" value="${subject.id}" class="hidden subject-radio" ${isChecked ? 'checked' : ''} onclick="selectSubject('${subject.id}')">
                    <label for="subject-${subject.id}" class="p-3 rounded-lg font-semibold transition-all cursor:pointer border ${activeClasses}">
                        ${subject.name}
                    </label>
                `;
    }).join('');
}

function selectSubject(subjectId) {
    state.currentSubject = subjectId;
    saveState();
    renderSubjectSelector();
    updateUI();
}

function addSubjectHandler() {
    const name = D.newSubjectInput.value.trim();
    if (!name) {
        showToast('Subject name cannot be empty.', 'error');
        return;
    }
    if (state.subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        showToast('Subject already exists.', 'error');
        return;
    }
    const newSubject = {
        id: name.toLowerCase().replace(/\s/g, '_'),
        name: name,
        color: SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length]
    };
    state.subjects.push(newSubject);
    D.newSubjectInput.value = '';
    showToast('Subject added successfully!', 'success');
    saveState();
    renderSubjectSelector();
    renderSubjectManager();
    calculateStats();
}

function renderSubjectManager() {
    D.subjectsListManager.innerHTML = state.subjects.map(subject => {
        return `
                    <div class="flex items-center p-3 bg-gray-700/50 rounded-lg justify-between">
                        <span class="text-gray-300 border-l-4 border-${subject.color}-500 pl-3">${subject.name}</span>
                        <button onclick="removeSubject('${subject.id}')" class="p-1 rounded-full text-red-400 hover:bg-white/10 transition-colors">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </div>
                `;
    }).join('');
    window.createLucideIcons();
}

function removeSubject(subjectId) {
    if (state.subjects.length <= 1) {
        showToast('Cannot remove the last subject.', 'error');
        return;
    }
    if (state.currentSubject === subjectId) {
        state.currentSubject = state.subjects.find(s => s.id !== subjectId).id;
    }
    state.subjects = state.subjects.filter(s => s.id !== subjectId);
    showToast('Subject removed.', 'success');
    saveState();
    renderSubjectSelector();
    renderSubjectManager();
}

// TASKS
function renderTasks() {
    D.tasksListContainer.innerHTML = '';
    if (state.tasks.length === 0) {
        D.noTasks.classList.remove('hidden');
    } else {
        D.noTasks.classList.add('hidden');
        state.tasks.forEach((task, index) => {
            const div = document.createElement('div');
            div.className = `flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all group fade-in-up`;
            div.style.animationDelay = `${index * 0.05}s`;
            const priorityClass = `priority-${task.priority}`;
            const completedClass = task.completed ? 'opacity-50 line-through' : '';
            const dueDateDisplay = task.dueDate ? `<span class="text-xs text-gray-500 ml-2 flex items-center"><i data-lucide="calendar" class="w-3 h-3 mr-1"></i>${formatDateForDisplay(task.dueDate)}</span>` : '';
            div.innerHTML = `
                        <div class="flex items-center flex-grow ${priorityClass} pl-3">
                            <input type="checkbox" id="${task.id}" ${task.completed ? 'checked' : ''} onchange="toggleTaskCompletion('${task.id}')" class="mr-3">
                            <label for="${task.id}" class="text-gray-200 font-medium cursor:pointer select-none ${completedClass} flex-grow">
                                ${task.text}
                                ${dueDateDisplay}
                            </label>
                        </div>
                        <button onclick="deleteTask('${task.id}')" class="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    `;
            D.tasksListContainer.appendChild(div);
        });
    }
    window.createLucideIcons();
}

function addTask() {
    const text = D.taskInputNew.value.trim();
    const priority = D.taskPriority.value;
    const dueDate = D.taskDueDate.value;
    if (text === '') {
        showToast('Task description cannot be empty.', 'error');
        return;
    }
    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false,
        priority: priority,
        dueDate: dueDate || null,
        timestamp: new Date().toISOString(),
    };
    state.tasks.unshift(newTask);
    D.taskInputNew.value = '';
    D.taskDueDate.value = '';
    D.taskPriority.value = 'medium';
    showToast('Task added!', 'success');
    saveState();
    renderTasks();
    calculateStats();
}

function toggleTaskCompletion(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            showToast('Task completed! 🎉', 'success');
        } else {
            showToast('Task marked incomplete.', 'info');
        }
        saveState();
        renderTasks();
        calculateStats();
        checkAchievements();
    }
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(t => t.id !== taskId);
    showToast('Task deleted.', 'success');
    saveState();
    renderTasks();
    calculateStats();
}

// HISTORY/DETAILS MODAL
function renderHistory(searchQuery = '', dateKey = '', limit = Infinity) {
    D.historyList.innerHTML = '';
    D.dailySummaryContainer.innerHTML = '';

    const recentSessions = state.sessions.slice(0, 5);
    if (recentSessions.length === 0) {
        D.noHistory.classList.remove('hidden');
    } else {
        D.noHistory.classList.add('hidden');
        recentSessions.forEach((session, index) => {
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors cursor:pointer fade-in-up';
            div.style.animationDelay = `${index * 0.05}s`;
            div.onclick = () => openSessionDetails(session.id);
            const subject = state.subjects.find(s => s.id === session.subjectId) || { name: 'Unknown', color: 'gray' };
            const date = new Date(session.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            div.innerHTML = `
                        <div class="flex items-center">
                            <div class="w-2 h-2 rounded-full bg-${subject.color}-500 mr-3 shadow-[0_0_8px_rgba(var(--color-${subject.color}-500),0.5)]"></div>
                            <div>
                                <div class="font-medium text-gray-200 text-sm">${subject.name}</div>
                                <div class="text-xs text-gray-500">${timeStr} • ${formatMinutes(session.duration)}</div>
                            </div>
                        </div>
                        <div class="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                            ${session.mode === 'Free Mode' ? 'Free' : 'Focus'}
                        </div>
                    `;
            D.historyList.appendChild(div);
        });
    }

    const sessionsByDate = {};
    state.sessions.forEach(session => {
        const dateKey = getFormattedDate(session.timestamp);
        if (!sessionsByDate[dateKey]) sessionsByDate[dateKey] = [];
        sessionsByDate[dateKey].push(session);
    });

    const sortedDates = Object.keys(sessionsByDate).sort((a, b) => new Date(b) - new Date(a));
    const currentSelection = D.dateSelector.value;
    D.dateSelector.innerHTML = '<option value="">All Dates</option>';
    sortedDates.forEach(date => {
        const option = document.createElement('option');
        option.value = date;
        option.textContent = formatDateForDisplay(date);
        D.dateSelector.appendChild(option);
    });
    if (currentSelection && sortedDates.includes(currentSelection)) {
        D.dateSelector.value = currentSelection;
    }

    const datesToDisplay = dateKey ? [dateKey] : sortedDates;
    if (datesToDisplay.length === 0 || (dateKey && !sessionsByDate[dateKey])) {
        D.dailySummaryContainer.innerHTML = `
                    <div class="empty-state fade-in-up">
                        <div class="empty-state-icon">📅</div>
                        <p class="text-gray-400 font-medium">No history found for this selection.</p>
                    </div>`;
    } else {
        datesToDisplay.forEach((dateKey, dateIndex) => {
            const sessions = sessionsByDate[dateKey];
            if (!sessions) return;
            const dayTotal = sessions.reduce((acc, s) => acc + s.duration, 0);
            const dateContainer = document.createElement('div');
            dateContainer.className = 'bg-black/20 rounded-2xl p-6 border border-white/5 fade-in-up';
            dateContainer.style.animationDelay = `${dateIndex * 0.1}s`;
            let sessionsHTML = '';
            sessions.forEach(session => {
                const subject = state.subjects.find(s => s.id === session.subjectId) || { name: 'Unknown', color: 'gray' };
                const time = new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                sessionsHTML += `
                            <div class="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors cursor:pointer border-b border-white/5 last:border-0" onclick="openSessionDetails('${session.id}')">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 rounded-lg bg-${subject.color}-500/10 text-${subject.color}-400">
                                        <i data-lucide="clock" class="w-4 h-4"></i>
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-200 text-sm">${subject.name}</div>
                                        <div class="text-xs text-gray-500">${session.goal}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-gray-200">${formatMinutes(session.duration)}</div>
                                    <div class="text-xs text-gray-500">${time}</div>
                                </div>
                            </div>
                        `;
            });
            dateContainer.innerHTML = `
                        <div class="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                            <h3 class="text-lg font-bold text-indigo-200 flex items-center">
                                <i data-lucide="calendar" class="w-5 h-5 mr-2"></i>
                                ${formatDateForDisplay(dateKey)}
                            </h3>
                            <span class="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-sm font-bold border border-indigo-500/30">
                                Total: ${formatMinutes(dayTotal)}
                            </span>
                        </div>
                        <div class="space-y-1">
                            ${sessionsHTML}
                        </div>
                    `;
            D.dailySummaryContainer.appendChild(dateContainer);
        });
    }
    window.createLucideIcons();
}

function updateDateSelector() {
    const uniqueDates = [...new Set(state.sessions.map(s => getFormattedDate(s.timestamp)))].sort().reverse();
    D.dateSelector.innerHTML = '<option value="">All Dates</option>';
    D.dateSelector.innerHTML += uniqueDates.map(date =>
        `<option value="${date}">${formatDateForDisplay(date)}</option>`
    ).join('');
    D.historySearch.oninput = () => handleDateChange(D.dateSelector.value || '');
}

function handleDateChange(dateKey) {
    const dailySessions = state.sessions.filter(s => {
        const isDateMatch = !dateKey || getFormattedDate(s.timestamp) === dateKey;
        const isSearchMatch = D.historySearch.value === '' ||
            s.goal.toLowerCase().includes(D.historySearch.value.toLowerCase()) ||
            s.mode.toLowerCase().includes(D.historySearch.value.toLowerCase()) ||
            state.subjects.find(sub => sub.id === s.subjectId)?.name.toLowerCase().includes(D.historySearch.value.toLowerCase());
        return isDateMatch && isSearchMatch;
    });
    const totalDuration = dailySessions.reduce((sum, s) => sum + s.duration, 0);
    const tasksCompletedToday = state.tasks.filter(t => t.completed && getFormattedDate(t.timestamp) === dateKey);
    const totalTasksCompletedToday = tasksCompletedToday.length;

    if (!dateKey) {
        D.dailySummaryContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📅</div>
                        <p class="text-gray-400 font-medium">Select a date to view your timeline</p>
                    </div>
                `;
    } else {
        const completedTasksList = tasksCompletedToday.length > 0 ? tasksCompletedToday.map(t => `
                    <li class="text-sm text-gray-300 truncate">${t.text.replace(/\[Focus Session\]\s*/, '⏱️ ')}</li>
                `).join('') : '<li class="text-sm text-gray-400">No tasks completed on this day.</li>';

        const subjectData = dailySessions.reduce((acc, s) => {
            const subject = state.subjects.find(sub => sub.id === s.subjectId);
            const subjectName = subject ? subject.name : 'Unknown';
            if (!acc[subjectName]) {
                acc[subjectName] = 0;
            }
            acc[subjectName] += s.duration;
            return acc;
        }, {});

        const subjectBreakdownList = Object.entries(subjectData).sort(([, a], [, b]) => b - a).map(([name, duration]) => {
            const subject = state.subjects.find(s => s.name === name);
            const colorClass = subject ? `text-${subject.color}-400` : 'text-gray-400';
            return `<li class="flex justify-between text-sm text-gray-300"><span class="${colorClass}">${name}</span><span>${formatMinutes(duration)}</span></li>`;
        }).join('');

        const dailySummaryHTML = `
                    <div class="glass-base p-4 rounded-xl bg-gray-700/50 border-gray-600/50 mb-6">
                        <h3 class="text-xl font-bold text-gray-100 mb-2">Summary for ${formatDateForDisplay(dateKey)}</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="p-3 bg-gray-800 rounded-lg">
                                <p class="text-sm text-gray-400">Total Focus Time</p>
                                <p class="text-2xl font-extrabold text-indigo-400">${formatMinutes(totalDuration)}</p>
                            </div>
                            <div class="p-3 bg-gray-800 rounded-lg">
                                <p class="text-sm text-gray-400">Tasks Completed</p>
                                <p class="text-2xl font-extrabold text-emerald-400">${totalTasksCompletedToday}</p>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div class="glass-base p-4 rounded-xl bg-gray-800/50 border-gray-700/50">
                            <h3 class="text-lg font-semibold text-emerald-300 mb-3 flex items-center">
                                <i data-lucide="clipboard-check" class="w-5 h-5 mr-2"></i> Tasks Completed Today (${tasksCompletedToday.length})
                            </h3>
                            <ul class="space-y-2 max-h-48 overflow-y-auto pr-2">
                                ${completedTasksList}
                            </ul>
                        </div>
                        <div class="glass-base p-4 rounded-xl bg-gray-800/50 border-gray-700/50">
                            <h3 class="text-lg font-semibold text-indigo-300 mb-3 flex items-center">
                                <i data-lucide="book" class="w-5 h-5 mr-2"></i> Time by Subject
                            </h3>
                            <ul class="space-y-2 max-h-48 overflow-y-auto pr-2">
                                ${subjectBreakdownList}
                            </ul>
                        </div>
                    </div>
                `;
        D.dailySummaryContainer.innerHTML = dailySummaryHTML;
        window.createLucideIcons();
    }
    renderHistory(D.historySearch.value, dateKey, Infinity);
}

function openSessionDetails(sessionId) {
    const session = state.sessions.find(s => s.id === sessionId);
    if (!session) return;
    const subject = state.subjects.find(s => s.id === session.subjectId) || { name: 'Unknown', color: 'gray' };
    const date = new Date(session.timestamp);
    currentSessionId = sessionId;

    D.modalContent.innerHTML = `
                <div class="flex items-center mb-6">
                    <div class="w-4 h-4 rounded-full bg-${subject.color}-500 mr-3 shadow-[0_0_10px_rgba(var(--color-${subject.color}-500),0.5)]"></div>
                    <span class="text-lg font-bold text-gray-200">${subject.name}</span>
                </div>
                <div class="space-y-4">
                    <div class="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Goal</div>
                        <div class="text-gray-200 font-medium">${session.goal}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Duration</div>
                            <div class="text-xl font-bold text-indigo-300">${formatMinutes(session.duration)}</div>
                        </div>
                        <div class="bg-black/30 p-4 rounded-xl border border-white/5">
                            <div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Mode</div>
                            <div class="text-gray-300">${session.mode || 'Free Mode'}</div>
                        </div>
                    </div>
                    <div class="bg-black/30 p-4 rounded-xl border border-white/5">
                        <div class="text-xs text-gray-500 uppercase tracking-wider mb-1">Date & Time</div>
                        <div class="text-gray-300">${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</div>
                    </div>
                </div>
            `;
    D.detailsModal.classList.remove('hidden');
    D.detailsModal.firstElementChild.classList.add('scale-in');
    document.body.classList.add('modal-open');
    window.createLucideIcons();
}

function closeModal() {
    D.detailsModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    currentSessionId = null;
}

function deleteSession(sessionId) {
    if (confirm("Are you sure you want to permanently delete this session?")) {
        state.sessions = state.sessions.filter(s => s.id !== sessionId);
        state.tasks = state.tasks.filter(t => t.id !== ('s' + sessionId));
        showToast('Session and associated task deleted.', 'success');
        calculateStats();
        checkStreakOnLoad();
        updateUI();
        closeModal();
        if (state.currentPage === 'history') {
            updateDateSelector();
            handleDateChange(D.dateSelector.value || '');
        }
    }
}

// STATS & PROGRESS
function calculateStats() {
    const now = new Date();
    const startOfWeek = getPeriodStart('week', now);
    const startOfPrevWeek = getPeriodStart('prevWeek', now);
    const startOfMonth = getPeriodStart('month', now);
    const startOfPrevMonth = getPeriodStart('prevMonth', now);

    const allTime = state.sessions.filter(s => s.mode.includes('Focus') || s.mode.includes('Free Mode'));
    const sessionsCount = allTime.length;

    const weeklyTimeSessions = allTime.filter(s => new Date(s.timestamp) >= startOfWeek);
    const monthlyTimeSessions = allTime.filter(s => new Date(s.timestamp) >= startOfMonth);
    const prevWeeklyTimeSessions = allTime.filter(s => new Date(s.timestamp) >= startOfPrevWeek && new Date(s.timestamp) < startOfWeek);
    const prevMonthlyTimeSessions = allTime.filter(s => new Date(s.timestamp) >= startOfPrevMonth && new Date(s.timestamp) < startOfMonth);

    const overallTime = allTime.reduce((sum, s) => sum + s.duration, 0);
    const weeklyTime = weeklyTimeSessions.reduce((sum, s) => sum + s.duration, 0);
    const monthlyTime = monthlyTimeSessions.reduce((sum, s) => sum + s.duration, 0);
    const prevWeeklyTime = prevWeeklyTimeSessions.reduce((sum, s) => sum + s.duration, 0);
    const prevMonthlyTime = prevMonthlyTimeSessions.reduce((sum, s) => sum + s.duration, 0);

    const dailyTimeInWeek = Array(7).fill(0);
    weeklyTimeSessions.forEach(s => {
        const dayIndex = (new Date(s.timestamp).getDay() || 7) - 1;
        dailyTimeInWeek[dayIndex] += s.duration;
    });

    const subjectBreakdown = {};
    allTime.forEach(session => {
        const duration = session.duration;
        const subjectName = state.subjects.find(s => s.id === session.subjectId)?.name || 'Unknown';
        subjectBreakdown[subjectName] = (subjectBreakdown[subjectName] || 0) + duration;
    });

    const tasksCompleted = state.tasks.filter(t => t.completed).length;
    const totalTasks = state.tasks.length;
    const efficiency = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0;

    const firstSessionTimestamp = state.sessions.length > 0
        ? state.sessions[state.sessions.length - 1].timestamp
        : new Date().toISOString();
    const totalDays = Math.ceil((Date.now() - new Date(firstSessionTimestamp).getTime()) / (1000 * 3600 * 24)) || 1;
    const avgDailyHours = (overallTime / totalDays) / 3600;
    const avgSessionLengthSeconds = sessionsCount > 0 ? overallTime / sessionsCount : 0;

    const mostFocused = Object.entries(subjectBreakdown).sort(([, a], [, b]) => b - a)[0];
    const mostFocusedSubject = mostFocused ? mostFocused[0] : 'N/A';
    const mostFocusedSubjectRatio = overallTime > 0 && mostFocused ? mostFocused[1] / overallTime : 0;

    stats = {
        overallTime,
        monthlyTime,
        weeklyTime,
        prevMonthlyTime,
        prevWeeklyTime,
        dailyTimeInWeek,
        tasksCompleted,
        totalTasks,
        efficiency,
        avgDailyHours,
        avgSessionLengthSeconds,
        subjectBreakdown,
        mostFocusedSubject,
        mostFocusedSubjectRatio
    };
}

function renderProgress() {
    calculateStats();
    D.metricsContainer.innerHTML = `
                <div class="glass-base p-4 rounded-xl bg-gray-700/50 border-gray-600/50">
                    <p class="text-sm text-gray-400">Total Focus</p>
                    <p class="text-2xl font-extrabold text-indigo-400">${formatMinutes(stats.overallTime)}</p>
                    <p class="text-xs text-gray-500">${state.sessions.length} sessions</p>
                </div>
                <div class="glass-base p-4 rounded-xl bg-gray-700/50 border-gray-600/50">
                    <p class="text-sm text-gray-400">Weekly Focus</p>
                    <p class="text-2xl font-extrabold text-indigo-400">${formatMinutes(stats.weeklyTime)}</p>
                    <p class="text-xs text-gray-500">${formatComparison(stats.weeklyTime, stats.prevWeeklyTime, 'week')}</p>
                </div>
                <div class="glass-base p-4 rounded-xl bg-gray-700/50 border-gray-600/50">
                    <p class="text-sm text-gray-400">Monthly Focus</p>
                    <p class="text-2xl font-extrabold text-indigo-400">${formatMinutes(stats.monthlyTime)}</p>
                    <p class="text-xs text-gray-500">${formatComparison(stats.monthlyTime, stats.prevMonthlyTime, 'month')}</p>
                </div>
                <div class="glass-base p-4 rounded-xl bg-gray-700/50 border-gray-600/50">
                    <p class="text-sm text-gray-400">Task Completion</p>
                    <p class="text-2xl font-extrabold text-emerald-400">${stats.efficiency}%</p>
                    <p class="text-xs text-gray-500">${stats.tasksCompleted} / ${stats.totalTasks} completed</p>
                </div>
                <div class="glass-base p-4 rounded-xl bg-gray-700/50 border-gray-600/50">
                    <p class="text-sm text-gray-400">Longest Streak</p>
                    <p class="text-2xl font-extrabold text-red-400">${stats.longestDailyStreak || state.longestDailyStreak} days</p>
                    <p class="text-xs text-gray-500">Current: ${state.currentDailyStreak} days</p>
                </div>
                <div class="glass-base p-4 rounded-xl bg-gray-700/50 border-gray-600/50">
                    <p class="text-sm text-gray-400">Avg. Session Length</p>
                    <p class="text-2xl font-extrabold text-yellow-400">${formatMinutes(stats.avgSessionLengthSeconds)}</p>
                    <p class="text-xs text-gray-500">Avg. Daily: ${stats.avgDailyHours.toFixed(1)} hrs</p>
                </div>
            `;
    window.createLucideIcons();
    renderCharts();
}

function renderCharts() {
    const ctxWeekly = D.weeklyChart.getContext('2d');
    if (weeklyChart) weeklyChart.destroy();

    const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekData = stats.dailyTimeInWeek.map(seconds => seconds / 3600);

    weeklyChart = new Chart(ctxWeekly, {
        type: 'bar',
        data: {
            labels: weekLabels,
            datasets: [{
                label: 'Hours Focused',
                data: weekData,
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: '#6366f1',
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: '#818cf8',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                }
            }
        }
    });

    const ctxSubject = D.subjectChart.getContext('2d');
    if (subjectChart) subjectChart.destroy();

    const subjectLabels = Object.keys(stats.subjectBreakdown).map(id => {
        const sub = state.subjects.find(s => s.id === id);
        return sub ? sub.name : id;
    });
    const subjectData = Object.values(stats.subjectBreakdown).map(seconds => seconds / 3600);
    const subjectColors = Object.keys(stats.subjectBreakdown).map(id => {
        const sub = state.subjects.find(s => s.id === id);
        const colorMap = {
            'indigo': '#6366f1', 'emerald': '#10b981', 'sky': '#0ea5e9',
            'yellow': '#eab308', 'red': '#ef4444', 'purple': '#a855f7',
            'teal': '#14b8a6', 'pink': '#ec4899', 'gray': '#6b7280'
        };
        return colorMap[sub?.color] || '#6366f1';
    });

    subjectChart = new Chart(ctxSubject, {
        type: 'doughnut',
        data: {
            labels: subjectLabels,
            datasets: [{
                data: subjectData,
                backgroundColor: subjectColors,
                borderColor: 'rgba(17, 25, 40, 0.8)',
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#e2e8f0', usePointStyle: true, padding: 20 }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value.toFixed(1)}h (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '70%',
        }
    });
}

// ACHIEVEMENTS
function checkAchievements() {
    ACHIEVEMENTS_CONFIG.forEach(ach => {
        let currentProgress = 0;
        if (ach.unit === 'minutes') {
            currentProgress = Math.floor(stats.overallTime / 60);
        } else if (ach.unit === 'tasks') {
            currentProgress = stats.tasksCompleted;
        }

        if (currentProgress >= ach.goal && !state.unlockedAchievements.includes(ach.id)) {
            state.unlockedAchievements.push(ach.id);
            showToast(`🏆 Achievement Unlocked: ${ach.name}!`, 'success');
            saveState();
        }
    });
}

function renderAchievements() {
    D.trophiesContainer.innerHTML = '';
    ACHIEVEMENTS_CONFIG.forEach((achievement, index) => {
        const isUnlocked = state.unlockedAchievements.includes(achievement.id);
        const div = document.createElement('div');
        div.className = `p-6 rounded-2xl border transition-all duration-300 fade-in-up ${isUnlocked
            ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
            : 'bg-white/5 border-white/5 opacity-60 grayscale'}`;
        div.style.animationDelay = `${index * 0.05}s`;

        div.innerHTML = `
                    <div class="flex items-start space-x-4">
                        <div class="p-3 rounded-xl ${isUnlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-500'}">
                            <i data-lucide="${achievement.icon}" class="w-8 h-8 ${isUnlocked ? 'achievement-pulse' : ''}"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg ${isUnlocked ? 'text-yellow-200' : 'text-gray-400'}">${achievement.name}</h3>
                            <p class="text-sm text-gray-400 mt-1">${achievement.description}</p>
                            ${isUnlocked
                ? '<div class="mt-2 inline-flex items-center text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">UNLOCKED</div>'
                : '<div class="mt-2 inline-flex items-center text-xs font-bold text-gray-500 bg-gray-700/50 px-2 py-1 rounded border border-gray-600">LOCKED</div>'}
                        </div>
                    </div>
                `;
        D.trophiesContainer.appendChild(div);
    });
    window.createLucideIcons();
}

// SETTINGS
function updateDailyGoal(newGoal) {
    const goal = parseInt(newGoal);
    if (goal < 5) {
        showToast('Goal must be at least 5 minutes.', 'error');
        D.dailyGoalInput.value = state.dailyFocusGoalMinutes;
        return;
    }
    state.dailyFocusGoalMinutes = goal;
    showToast(`Daily focus goal set to ${goal} minutes.`, 'success');
    saveState();
    updateUI();
}

// DATA MANAGEMENT
function exportData() {
    const data = {
        state: state,
        stats: stats,
        timestamp: new Date().toISOString()
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_tracker_data_${getFormattedDate(data.timestamp)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data export initiated.', 'success');
}

function exportCsvData() {
    const sessions = state.sessions;
    if (sessions.length === 0) {
        showToast('No sessions to export.', 'error');
        return;
    }
    const headers = ["ID", "Date", "Time (seconds)", "Time (minutes)", "Subject", "Goal", "Mode"];
    const rows = sessions.map(session => {
        const subjectName = state.subjects.find(s => s.id === session.subjectId)?.name || 'Unknown';
        return [
            session.id,
            formatDateForDisplay(getFormattedDate(session.timestamp)),
            session.duration,
            (session.duration / 60).toFixed(2),
            subjectName,
            `"${session.goal.replace(/"/g, '""')}"`,
            session.mode
        ];
    });
    let csvContent = headers.join(",") + "\n";
    rows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study_tracker_sessions_${getFormattedDate(new Date().toISOString())}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV export initiated.', 'success');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData.state) {
                state = { ...state, ...importedData.state };
                if (!Array.isArray(state.subjects)) state.subjects = DEFAULT_SUBJECTS;
                if (!Array.isArray(state.sessions)) state.sessions = [];
                if (!Array.isArray(state.tasks)) state.tasks = [];
                if (!Array.isArray(state.unlockedAchievements)) state.unlockedAchievements = [];
                loadState();
                showToast('Data imported successfully! Please check your history and settings.', 'success');
                switchPage(state.currentPage || 'timer');
            } else {
                showToast('Invalid file format. Please import a valid Study Tracker JSON file.', 'error');
            }
        } catch (error) {
            showToast('Error reading file: Invalid JSON format.', 'error');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm("WARNING: This will permanently delete ALL your sessions, tasks, and settings. Are you absolutely sure you want to continue?")) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        state = { ...DEFAULT_STATE };
        loadState();
        switchPage('timer');
        showToast('All application data cleared successfully.', 'success');
    }
}

// MUSIC PLAYER
function initMusicPlayer() {
    D.musicPlayer.src = PLAYLIST[currentSongIndex];
    D.musicPlayer.loop = false;
    D.musicPlayer.volume = 0.5;
    D.musicPlayer.onended = () => {
        currentSongIndex = (currentSongIndex + 1) % PLAYLIST.length;
        D.musicPlayer.src = PLAYLIST[currentSongIndex];
        D.musicPlayer.play().catch(e => console.log('Autoplay failed:', e));
        updateUI();
    };
}

function toggleSongPlayback() {
    if (D.musicPlayer.paused) {
        D.musicPlayer.play().catch(e => {
            showToast('Autoplay blocked. Please try clicking the button again after interacting with the page.', 'error');
            console.error('Audio playback failed:', e);
        });
    } else {
        D.musicPlayer.pause();
    }
    updateUI();
}

// PAGE NAVIGATION
function switchPage(page) {
    const views = {
        'timer': D.timerView,
        'tasks': D.tasksView,
        'history': D.historyView,
        'achievements': D.achievementsView,
        'progress': D.progressView,
        'settings': D.settingsView,
        'room': D.roomView
    };
    const navButtons = {
        'timer': D.navTimerBtn,
        'tasks': D.navTasksBtn,
        'history': D.navHistoryBtn,
        'achievements': D.navAchievementsBtn,
        'progress': D.navProgressBtn,
        'settings': D.navSettingsBtn,
        'room': D.navRoomBtn
    };

    Object.values(views).forEach(view => view.classList.add('hidden'));
    const selectedView = views[page];
    if (selectedView) {
        selectedView.classList.remove('hidden');
        state.currentPage = page;
    }

    Object.values(navButtons).forEach(btn => {
        btn.classList.remove('bg-indigo-600');
        btn.classList.add('bg-gray-700/50', 'hover:bg-gray-700');
    });
    const selectedBtn = navButtons[page];
    if (selectedBtn) {
        selectedBtn.classList.remove('bg-gray-700/50', 'hover:bg-gray-700');
        selectedBtn.classList.add('bg-indigo-600');
    }

    if (page === 'tasks') renderTasks();
    if (page === 'history') {
        updateDateSelector();
        handleDateChange(D.dateSelector.value || '');
    }
    if (page === 'achievements') renderAchievements();
    if (page === 'progress') renderProgress();
    if (page === 'settings') renderSubjectManager();
    window.createLucideIcons();
    saveState();
}

function toggleFullscreenClock() {
    const isHidden = D.fullscreenClockModal.classList.contains('hidden');
    if (isHidden) {
        D.fullscreenClockModal.classList.remove('hidden');
        document.body.classList.add('modal-open');
        D.fullscreenBtn.querySelector('i').setAttribute('data-lucide', 'minimize');
    } else {
        D.fullscreenClockModal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        D.fullscreenBtn.querySelector('i').setAttribute('data-lucide', 'maximize');
    }
    window.createLucideIcons();
}

document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    if (state.currentPage === 'timer') {
        if (e.key === ' ' || e.key.toLowerCase() === 'p') {
            e.preventDefault();
            startPauseHandler();
        }
        const getRemaining = getRemainingTime();
        if (e.key.toLowerCase() === 's' && (state.isRunning || getRemaining > 0)) {
            e.preventDefault();
            stopSession();
        }
        if (e.key.toLowerCase() === 'd' && !state.isRunning && getRemaining > 0) {
            e.preventDefault();
            discardSession();
        }
        if (e.key.toLowerCase() === 'f') {
            e.preventDefault();
            toggleFullscreenClock();
        }
    }
    if (e.key === 'Escape') {
        if (!D.fullscreenClockModal.classList.contains('hidden')) {
            toggleFullscreenClock();
        } else if (!D.detailsModal.classList.contains('hidden')) {
            closeModal();
        }
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.isRunning) {
        updateTimer();
    }
});

// --- PEERJS MULTIPLAYER LOGIC ---
const ROOM_PREFIX = "studytracker-pro-v1-";
let peer = null;
let conn = null;
let roomPeers = {};
let myPeerId = null;
let myRoomCode = null;
let isHost = false;
let hostConn = null;
let clientConns = {};
let soundsEnabled = true;
let roomStartTime = null;
let peerFocusTime = {};
let customStatus = 'Available';
let peerCardsMinimized = false;
let roomPassword = null;

function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
}

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function toggleSoundNotifications() {
    soundsEnabled = !soundsEnabled;
    showToast(soundsEnabled ? 'Sounds enabled' : 'Sounds muted', 'success');
}

function playSound(type) {
    if (!soundsEnabled) return;
}

function initializePeer(name, mode, targetCode = null) {
    if (!name) {
        showToast('Please enter your name.', 'error');
        return;
    }

    if (mode === 'create') {
        if (!myRoomCode) {
            myRoomCode = generateRoomCode();
        }
        peer = new Peer(ROOM_PREFIX + myRoomCode);
    } else {
        peer = new Peer();
    }

    peer.on('open', (id) => {
        myPeerId = id;
        if (mode === 'create') {
            isHost = true;
            setupActiveRoomUI(myRoomCode);
            roomStartTime = Date.now();
            peerFocusTime[id] = 0;
            updatePeerData(id, {
                name: name,
                status: 'Idle',
                mode: state.timerMode,
                timeRemaining: getRemainingTime(),
                isRunning: state.isRunning,
                sessionGoal: document.getElementById('task-input')?.value || '',
                focusTime: 0,
                isSelf: true
            });
            saveSessionData(name);
            showToast(`Room created! Code: ${myRoomCode}`, 'success');
        } else if (mode === 'join' && targetCode) {
            isHost = false;
            connectToHost(ROOM_PREFIX + targetCode, name);
        }
    });

    peer.on('connection', (c) => {
        handleConnection(c);
    });

    peer.on('error', (err) => {
        console.error("Peer Error:", err);
        if (err.type === 'peer-unavailable') {
            showToast('Room not found. Check the code and try again.', 'error');
            sessionStorage.removeItem('studyRoomSession');
            leaveRoom();
        } else if (err.type === 'unavailable-id') {
            if (mode === 'create') {
                myRoomCode = null;
                initializePeer(name, 'create');
            }
        } else {
            showToast('Connection error: ' + err.type, 'error');
        }
    });
}

function createRoom() {
    const name = document.getElementById('peer-name-input').value;
    if (!name) {
        showToast('Please enter your name first.', 'error');
        return;
    }
    const password = document.getElementById('room-password-input').value;
    roomPassword = password || null;
    myRoomCode = null;
    initializePeer(name, 'create');
}

function joinRoom() {
    const name = document.getElementById('peer-name-input').value;
    const roomCode = document.getElementById('room-id-input').value.toUpperCase().trim();
    if (!name) {
        showToast('Please enter your name first.', 'error');
        return;
    }
    if (!roomCode || roomCode.length !== 6) {
        showToast('Please enter a valid 6-character room code.', 'error');
        return;
    }
    initializePeer(name, 'join', roomCode);
}

function connectToHost(fullHostId, name) {
    hostConn = peer.connect(fullHostId, {
        metadata: { name: name }
    });

    hostConn.on('open', () => {
        const shortCode = fullHostId.replace(ROOM_PREFIX, '');
        setupActiveRoomUI(shortCode);
        saveSessionData(name, shortCode);
        broadcastStatus();
        showToast('Joined room successfully!', 'success');
    });

    hostConn.on('data', (data) => {
        handleData(fullHostId, data);
    });

    hostConn.on('close', () => {
        showToast('Disconnected from host.', 'error');
        leaveRoom();
    });

    hostConn.on('error', (err) => {
        showToast("Could not connect to host.", "error");
    });
}

function setupActiveRoomUI(displayCode) {
    document.getElementById('room-setup').classList.add('hidden');
    document.getElementById('active-room').classList.remove('hidden');
    const codeDisplay = document.getElementById('display-room-code');
    if (codeDisplay) codeDisplay.innerText = displayCode;
}

function saveSessionData(name, code = myRoomCode) {
    sessionStorage.setItem('studyRoomSession', JSON.stringify({
        roomCode: code,
        isHost: isHost,
        name: name,
        password: roomPassword
    }));
}

function handleConnection(c) {
    if (isHost) {
        clientConns[c.peer] = c;
        c.on('open', () => {
            c.send({ type: 'FULL_STATE', peers: roomPeers });
        });
        c.on('data', (data) => {
            handleData(c.peer, data);
        });
        c.on('close', () => {
            delete clientConns[c.peer];
            delete roomPeers[c.peer];
            renderPeers();
            broadcastToClients({ type: 'PEER_LEFT', peerId: c.peer });
        });
    }
}

function handleData(senderId, data) {
    if (data.type === 'STATUS') {
        updatePeerData(senderId, data.payload);
        if (isHost) {
            broadcastToClients({ type: 'STATUS', payload: data.payload }, senderId);
        }
    } else if (data.type === 'FULL_STATE') {
        roomPeers = data.peers;
        const myName = document.getElementById('peer-name-input').value;
        roomPeers[myPeerId] = {
            name: myName,
            status: 'Idle',
            mode: state.timerMode,
            timeRemaining: getRemainingTime(),
            isRunning: state.isRunning,
            sessionGoal: document.getElementById('task-input')?.value || '',
            focusTime: 0,
            isSelf: true
        };
        renderPeers();
    } else if (data.type === 'PEER_LEFT') {
        delete roomPeers[data.peerId];
        renderPeers();
        if (isHost) broadcastToClients(data, senderId);
    } else if (data.type === 'CHAT') {
        renderChatMessage(data.sender, data.message, data.isSelf, data.isEmoji);
        if (isHost) {
            broadcastToClients({ type: 'CHAT', sender: data.sender, message: data.message, isSelf: false, isEmoji: data.isEmoji }, senderId);
        }
    }
}

function broadcastToClients(data, excludeId = null) {
    Object.values(clientConns).forEach(conn => {
        if (conn.peer !== excludeId && conn.open) {
            conn.send(data);
        }
    });
}

function broadcastStatus() {
    if (!peer || (!isHost && !hostConn)) return;
    if (state.isRunning && myPeerId) {
        if (!peerFocusTime[myPeerId]) peerFocusTime[myPeerId] = 0;
        peerFocusTime[myPeerId] += 1;
    }
    const currentGoal = document.getElementById('task-input')?.value || '';
    const statusPayload = {
        peerId: myPeerId,
        name: document.getElementById('peer-name-input').value || 'Anonymous',
        status: state.isRunning ? (state.isPomodoroActive && state.pomodoroMode === 'break' ? 'On Break' : 'Focusing') : 'Idle',
        mode: state.timerMode,
        timeRemaining: getRemainingTime(),
        isRunning: state.isRunning,
        sessionGoal: currentGoal,
        focusTime: peerFocusTime[myPeerId] || 0,
        customStatus: customStatus
    };
    updatePeerData(myPeerId, { ...statusPayload, isSelf: true });
    if (isHost) {
        broadcastToClients({ type: 'STATUS', payload: statusPayload });
    } else {
        hostConn.send({ type: 'STATUS', payload: statusPayload });
    }
}

function updatePeerData(id, data) {
    roomPeers[id] = data;
    renderPeers();
}

function renderPeers() {
    const grid = document.getElementById('peers-list');
    if (!grid) return;
    grid.innerHTML = '';
    Object.values(roomPeers).forEach(peer => {
        const isSelf = peer.isSelf;
        const card = document.createElement('div');
        const timeString = formatTime(peer.timeRemaining);
        const statusColor = peer.status === 'Focusing' ? 'text-emerald-400' : (peer.status === 'On Break' ? 'text-yellow-400' : 'text-gray-400');
        const avatarColor = getAvatarColor(peer.name);
        card.className = `p-4 rounded-xl bg-white/5 border ${isSelf ? 'border-indigo-500/50' : 'border-white/10'} relative`;
        card.innerHTML = `
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style="background: ${avatarColor}">
                    ${peer.name.substring(0, 2).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-bold text-white truncate">${peer.name} ${isSelf ? '(You)' : ''}</div>
                    <div class="text-xs text-gray-400 truncate">${peer.sessionGoal || 'No goal set'}</div>
                </div>
            </div>
            <div class="flex justify-between items-end">
                <div class="text-xl font-mono font-bold text-white">${timeString}</div>
                <div class="${statusColor} text-xs font-bold px-2 py-1 rounded-full bg-black/20">
                    ${peer.status}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function leaveRoom() {
    if (peer) peer.destroy();
    peer = null;
    conn = null;
    hostConn = null;
    clientConns = {};
    roomPeers = {};
    isHost = false;
    myRoomCode = null;
    sessionStorage.removeItem('studyRoomSession');
    document.getElementById('active-room').classList.add('hidden');
    document.getElementById('room-setup').classList.remove('hidden');
    showToast('Left the room.', 'success');
}

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    const myName = document.getElementById('peer-name-input').value || 'Me';
    renderChatMessage(myName, message, true);
    if (isHost) {
        broadcastToClients({ type: 'CHAT', sender: myName, message: message, isSelf: false });
    } else if (hostConn) {
        hostConn.send({ type: 'CHAT', sender: myName, message: message });
    }
    input.value = '';
}

function renderChatMessage(sender, message, isSelf, isEmoji = false) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `mb-2 flex ${isSelf ? 'justify-end' : 'justify-start'}`;
    const bubbleClass = isSelf ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-200';
    div.innerHTML = `
        <div class="max-w-[85%] rounded-xl px-3 py-2 ${bubbleClass}">
            <div class="text-[10px] opacity-75 mb-1">${sender}</div>
            <div class="text-sm">${message}</div>
        </div>
    `;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function copyRoomCode() {
    const code = document.getElementById('display-room-code').innerText;
    navigator.clipboard.writeText(code).then(() => showToast('Room code copied!', 'success'));
}

function checkSavedSession() {
    const savedSession = sessionStorage.getItem('studyRoomSession');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            if (session.roomCode && session.name) {
                document.getElementById('peer-name-input').value = session.name;
                switchPage('room');
                if (session.isHost) {
                    roomPassword = session.password || null;
                    myRoomCode = session.roomCode;
                    initializePeer(session.name, 'create');
                } else {
                    initializePeer(session.name, 'join', session.roomCode);
                }
            }
        } catch (e) {
            console.error("Error restoring session:", e);
            sessionStorage.removeItem('studyRoomSession');
        }
    }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    filterExpiredTasks();
    initMusicPlayer();
    setTimerMode(state.timerMode);
    renderSubjectSelector();
    D.dailyGoalInput.value = state.dailyFocusGoalMinutes;
    renderTasks();
    renderHistory();
    renderAchievements();
    updateUI();
    checkSavedSession();
    window.createLucideIcons();
    switchPage(state.currentPage || 'timer');
});