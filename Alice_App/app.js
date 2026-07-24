// State
let isMoving = false;
let currentScreen = 'welcome-screen';

// Net Position State (cm)
let netPos = {
    FL: 0,
    FR: 0,
    BL: 0,
    BR: 0
};

// Control State
let activeDevice = 'net'; // 'net' or 'light'
let manualMode = 'sync'; // 'sync' or 'indiv'
let selectedPoint = 'ALL'; // 'ALL', 'FL', 'FR', 'BL', 'BR'
let selectedDistance = 1; // cm
let waveDistance = 1; // cm

// Light State (simple 1-axis synchronized height)
let lightPos = 0; // cm

document.addEventListener('DOMContentLoaded', () => {
    updatePositionUI();
    setAppBackground('welcome-screen'); // Initialize first background
});

// Dropdown Logic
function toggleDropdown() {
    const dropdown = document.getElementById('main-dropdown');
    dropdown.classList.toggle('hidden');
}

function handleNavClick() {
    if (currentScreen === 'welcome-screen') {
        toggleDropdown();
    } else {
        goHome();
    }
}

function hideAllWelcomePanels() {
    ['connected-devices-info', 'help-instructions-panel', 'connect-device-panel'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const toggleBtn = document.getElementById('toggle-devices-btn');
    if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-info-circle" style="width: 20px; color: var(--text-muted);"></i> Connected Devices';
}

function goHome() {
    document.getElementById('main-dropdown').classList.add('hidden');
    hideAllWelcomePanels();
    navigateTo('welcome-screen');
}

function toggleConnectedDevices() {
    document.getElementById('main-dropdown').classList.add('hidden');

    const infoBlock = document.getElementById('connected-devices-info');
    const isHidden = infoBlock.classList.contains('hidden');

    hideAllWelcomePanels();

    if (isHidden) {
        infoBlock.classList.remove('hidden');
        const toggleBtn = document.getElementById('toggle-devices-btn');
        if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-info-circle" style="width: 20px; color: var(--text-muted);"></i> Hide connected devices';
    }

    if (document.getElementById('welcome-screen').style.display === 'none' && !document.getElementById('welcome-screen').classList.contains('active')) {
        navigateTo('welcome-screen');
    }
}

function showHelp() {
    document.getElementById('main-dropdown').classList.add('hidden');
    hideAllWelcomePanels();

    const helpPanel = document.getElementById('help-instructions-panel');
    if (helpPanel) {
        helpPanel.classList.remove('hidden');
    }

    if (document.getElementById('welcome-screen').style.display === 'none' && !document.getElementById('welcome-screen').classList.contains('active')) {
        navigateTo('welcome-screen');
    }
}

function closeHelp() {
    const helpPanel = document.getElementById('help-instructions-panel');
    if (helpPanel) {
        helpPanel.classList.add('hidden');
    }
}

function showConnectDevice() {
    document.getElementById('main-dropdown').classList.add('hidden');
    hideAllWelcomePanels();

    const connectPanel = document.getElementById('connect-device-panel');
    if (connectPanel) {
        connectPanel.classList.remove('hidden');
    }

    if (document.getElementById('welcome-screen').style.display === 'none' && !document.getElementById('welcome-screen').classList.contains('active')) {
        navigateTo('welcome-screen');
    }
}

function closeConnectDevice() {
    const connectPanel = document.getElementById('connect-device-panel');
    if (connectPanel) {
        connectPanel.classList.add('hidden');
    }
}

window.onclick = function (event) {
    if (!event.target.matches('.nav-btn') && !event.target.matches('.fa-bars')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (!openDropdown.classList.contains('hidden')) {
                openDropdown.classList.add('hidden');
            }
        }
    }
}

// Background logic
const allBackgrounds = [
    'bg_products.jpg',
    'bg_movement_1.jpg',
    'bg_movement_2.jpg'
];

function setAppBackground(screenId) {
    const container = document.getElementById('app-container');
    const randomBg = allBackgrounds[Math.floor(Math.random() * allBackgrounds.length)];
    container.style.backgroundImage = `url('${randomBg}')`;
}

// Navigation
function navigateTo(screenId) {
    if (isMoving) return; // Locked during movement

    // Set dynamic background
    setAppBackground(screenId);

    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Show target
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));
    const navMap = {
        'manual-control': 'nav-manual',
        'wave-control': 'nav-wave',
        'give-love': 'nav-love',
        'products': 'nav-products'
    };
    if (navMap[screenId]) {
        document.getElementById(navMap[screenId]).classList.add('active');
    }

    // Update Top Header
    const titleEl = document.getElementById('screen-title');
    const mainNavBtn = document.getElementById('main-nav-btn');
    const homeNavBtn = document.getElementById('home-nav-btn');

    if (screenId === 'welcome-screen') {
        if (titleEl) titleEl.textContent = 'Alice Is';
        if (mainNavBtn) mainNavBtn.classList.remove('hidden');
        if (homeNavBtn) homeNavBtn.classList.add('hidden');
    } else if (screenId === 'products' || screenId === 'menu') {
        if (titleEl) titleEl.textContent = screenId === 'products' ? 'Products' : 'Settings';
        if (mainNavBtn) mainNavBtn.classList.add('hidden');
        if (homeNavBtn) homeNavBtn.classList.remove('hidden');
    } else {
        // Motion screens
        if (titleEl) titleEl.textContent = screenId.replace('-control', '').replace('-', ' ').toUpperCase();
        if (mainNavBtn) mainNavBtn.classList.add('hidden');
        if (homeNavBtn) homeNavBtn.classList.remove('hidden');
    }
}

// === Manual Control Logic ===
function setDevice(device) {
    activeDevice = device;
    document.getElementById('device-net').classList.toggle('active', device === 'net');
    document.getElementById('device-light').classList.toggle('active', device === 'light');

    // Show/Hide net specific controls
    const netModeContainer = document.getElementById('net-mode-container');
    const netPointSelector = document.getElementById('net-point-selector');

    if (device === 'light') {
        netModeContainer.style.display = 'none';
        netPointSelector.style.display = 'none';

        // Hide calibration blocks 1-3 for Light
        document.getElementById('calib-block-1').style.display = 'none';
        document.getElementById('calib-block-2').style.display = 'none';
        document.getElementById('calib-block-3').style.display = 'none';
        document.getElementById('calib-hr-1').style.display = 'none';
        document.getElementById('calib-hr-2').style.display = 'none';
        document.getElementById('calib-hr-3').style.display = 'none';
        document.getElementById('level-net-title').innerText = 'Level Light';
        document.getElementById('level-net-desc').innerText = 'Cut power to manually level the top light physically.';
        document.getElementById('level-net-btn').innerText = 'Level the light';
        document.getElementById('level-net-confirm-desc').innerText = 'Are you sure you want to cut the power and level the top light?';
    } else {
        netModeContainer.style.display = 'block';
        netPointSelector.style.display = 'block';

        // Show calibration blocks 1-3 for Net
        document.getElementById('calib-block-1').style.display = 'block';
        document.getElementById('calib-block-2').style.display = 'block';
        document.getElementById('calib-block-3').style.display = 'block';
        document.getElementById('calib-hr-1').style.display = 'block';
        document.getElementById('calib-hr-2').style.display = 'block';
        document.getElementById('calib-hr-3').style.display = 'block';
        document.getElementById('level-net-title').innerText = 'Level Net';
        document.getElementById('level-net-desc').innerText = 'Cut power to manually level the net physically.';
        document.getElementById('level-net-btn').innerText = 'Level Net';
        document.getElementById('level-net-confirm-desc').innerText = 'Are you sure you want to cut the power and level the net?';
    }
}

function setManualMode(mode) {
    manualMode = mode;
    document.getElementById('mode-sync').classList.toggle('active', mode === 'sync');
    document.getElementById('mode-indiv').classList.toggle('active', mode === 'indiv');

    if (mode === 'sync') {
        selectPoint('ALL');
    } else {
        if (selectedPoint === 'ALL') selectPoint('FL'); // default to FL if switching to indiv
    }
}

function selectPoint(point) {
    if (manualMode === 'sync' && point !== 'ALL') {
        setManualMode('indiv'); // Switch to indiv automatically if a corner is tapped
    } else if (manualMode === 'indiv' && point === 'ALL') {
        setManualMode('sync');
    }

    selectedPoint = point;
    ['ALL', 'FL', 'FR', 'BL', 'BR'].forEach(p => {
        document.getElementById(`btn-${p}`).classList.toggle('active', p === point);
    });
}

function setDistance(dist) {
    selectedDistance = dist;
    const btns = document.querySelectorAll('.dist-btn');
    btns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === dist - 1);
    });
}

// === Wave Control Logic ===
function setWaveDistance(dist) {
    waveDistance = dist;
    const btns = document.querySelectorAll('.dist-btn-wave');
    btns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === dist - 1);
    });
}
function setWaveDirection(dir) {
    document.getElementById('wave-dir-raise').classList.toggle('active', dir === 'raise');
    document.getElementById('wave-dir-lower').classList.toggle('active', dir === 'lower');
}

// === Give Love Logic ===
let loveDuration = 5;
let loveIntensity = 'soft';

function setLoveDuration(sec) {
    loveDuration = sec;
    document.getElementById('love-dur-5').classList.toggle('active', sec === 5);
    document.getElementById('love-dur-10').classList.toggle('active', sec === 10);
    updateGiveLoveUI();
}

function setLoveIntensity(intensity) {
    loveIntensity = intensity;
    document.getElementById('love-int-soft').classList.toggle('active', intensity === 'soft');
    document.getElementById('love-int-normal').classList.toggle('active', intensity === 'normal');
    updateGiveLoveUI();
}

function updateGiveLoveUI() {
    const container = document.getElementById('give-love-function-card');
    if (!container) return;

    const G = loveIntensity === 'soft' ? '0.5 mm' : '1.0 mm';

    let cycles1 = 2;
    let cycles2 = 1;
    if (loveDuration === 10) {
        cycles1 = 3;
        cycles2 = 2;
    }

    container.innerHTML = `
        <h3 style="margin-bottom: 5px; color: var(--primary-green-dark);">Give Love Function</h3>
        <p class="description black-text text-center" style="font-size: 12px; margin-bottom: 5px;">Smooth cyclic micro-movement. Returns to original base position.</p>
        
        <div style="background: rgba(0,0,0,0.03); padding: 5px 8px; border-radius: 6px; width: 100%; text-align: left; margin-bottom: 5px;">
            <b style="font-size:12px; color:#333;">Sequence (${loveDuration} sec):</b><br>
            <span style="font-size:11px;">1. Gentle Breath — ${cycles1} cycles</span><br>
            <span style="font-size:11px;">2. Soft Leaf Release — ${cycles2} cycles</span><br>
            <span style="font-size:11px;">3. Smooth return to base</span>
        </div>

        <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 5px; width: 100%; text-align: left; line-height: 1.2;">
            <b>Variables:</b> H = Base Height | G = Amplitude (${G}) | E = Smooth Envelope<br>
            <i>Safety Rule: No movement above 5cm max difference.</i>
        </div>
    `;
}

// === UI Helpers ===
function toggleCollapse(id) {
    document.getElementById(id).classList.toggle('show');
}
function actionLog(action) {
    showNotification(`Action: ${action}`, false);
}
function showNotification(msg, isError) {
    const notif = document.getElementById('notification-area');
    notif.textContent = msg;
    notif.className = isError ? 'error' : '';
    notif.classList.remove('hidden');
    setTimeout(() => { notif.classList.add('hidden'); }, 3000);
}

// === Safety & Movement Simulation ===

function simulateMovement(pointsToMove, distanceChange) {
    // Clone current state
    let nextState = { ...netPos };

    // Apply changes
    pointsToMove.forEach(p => {
        nextState[p] += distanceChange;
    });

    // Check bounds (0 to 35cm)
    for (const val of Object.values(nextState)) {
        if (val < 0 || val > 35) {
            return { safe: false, reason: "You reached the limit (0-35cm)." };
        }
    }

    // Check maximum point difference (5cm rule)
    const heights = Object.values(nextState);
    const maxH = Math.max(...heights);
    const minH = Math.min(...heights);
    if (maxH - minH > 5) {
        return { safe: false, reason: `Blocked: Maximum point difference would be ${maxH - minH} cm (Limit is 5 cm).` };
    }

    return { safe: true, nextState };
}

function lockInterface(moving) {
    isMoving = moving;
    const overlay = document.getElementById('movement-overlay');
    overlay.style.display = moving ? 'block' : 'none';

    // Disable bottom nav buttons
    document.querySelectorAll('.bottom-nav-item').forEach(btn => {
        btn.disabled = moving;
    });
}

function updatePositionUI() {
    // Calculate level base (minimum height among the 4 points)
    const base = Math.min(netPos.FL, netPos.FR, netPos.BL, netPos.BR);

    ['FL', 'FR', 'BL', 'BR'].forEach(p => {
        const offset = netPos[p] - base;
        const text = `${netPos[p]} cm<br>(+${offset})`;
        document.getElementById(`status-${p}`).innerHTML = text;
    });

    // Refresh calibration panel if it's open or state changed
    refreshCalibrationUI();
}

function executeMove(direction) {
    const change = direction === 'UP' ? selectedDistance : -selectedDistance;

    if (activeDevice === 'light') {
        // Light is synchronized only, no 5cm rule between corners needed
        let nextLightPos = lightPos + change;
        if (nextLightPos < 0 || nextLightPos > 100) { // arbitrary light bounds
            showNotification("Light movement exceeds absolute limits.", true);
            return;
        }

        lockInterface(true);
        showNotification(`Moving Top Light: ${direction} ${selectedDistance}cm...`, false);
        setTimeout(() => {
            if (!isMoving) return;
            lightPos = nextLightPos;
            lockInterface(false);
            showNotification("Light movement complete.", false);
        }, 2000);
        return;
    }

    // Net logic
    let points = [];
    if (selectedPoint === 'ALL') {
        points = ['FL', 'FR', 'BL', 'BR'];
    } else {
        points = [selectedPoint];
    }

    const check = simulateMovement(points, change);
    if (!check.safe) {
        showNotification(check.reason, true);
        return;
    }

    // Safe to move
    startMotorSimulation(check.nextState, `${direction} ${selectedDistance}cm`);
}

// === Wave Logic & Functions ===

const waveFormulas = {
    'gentle': {
        name: 'Gentle Wave',
        description: 'The entire net breathes up/down. All points move together without tilt.',
        formula: `FL = H + E * (A/2) * sin(θ)<br>FR = H + E * (A/2) * sin(θ)<br>BL = H + E * (A/2) * sin(θ)<br>BR = H + E * (A/2) * sin(θ)`,
        maxDiff: '0 cm'
    },
    'frontback': {
        name: 'Front-Back Wave',
        description: 'Front and back sides alternate. Wave from front to back.',
        formula: `FL = H + E * (A/2) * sin(θ)<br>FR = H + E * (A/2) * sin(θ)<br>BL = H - E * (A/2) * sin(θ)<br>BR = H - E * (A/2) * sin(θ)`,
        maxDiff: 'A cm'
    },
    'leftright': {
        name: 'Left-Right Wave',
        description: 'Left and right sides alternate. Wave from left to right.',
        formula: `FL = H + E * (A/2) * sin(θ)<br>BL = H + E * (A/2) * sin(θ)<br>FR = H - E * (A/2) * sin(θ)<br>BR = H - E * (A/2) * sin(θ)`,
        maxDiff: 'A cm'
    },
    'diagonal': {
        name: 'Diagonal Wave',
        description: 'The two diagonals alternate. Diagonal twisting of the net.',
        formula: `FL = H + E * (A/2) * sin(θ)<br>BR = H + E * (A/2) * sin(θ)<br>FR = H - E * (A/2) * sin(θ)<br>BL = H - E * (A/2) * sin(θ)`,
        maxDiff: 'A cm'
    },
    'circular': {
        name: 'Circular Wave',
        description: 'The wave circles the four points with a phase shift. Soft circular movement.',
        formula: `FL = H + E * (A/2) * sin(θ)<br>FR = H + E * (A/2) * sin(θ + π/2)<br>BR = H + E * (A/2) * sin(θ + π)<br>BL = H + E * (A/2) * sin(θ + 3π/2)`,
        maxDiff: 'A cm'
    }
};

function updateWaveFunctionUI() {
    const presetEl = document.getElementById('wave-preset');
    if (!presetEl) return;
    const wave = waveFormulas[presetEl.value];
    if (!wave) return;

    const container = document.getElementById('wave-function-card');
    if (container) {
        container.innerHTML = `
            <h3 style="margin-bottom: 5px; color: var(--primary-green-dark);">${wave.name}</h3>
            <p class="description black-text text-center" style="font-size: 12px; margin-bottom: 5px;">${wave.description}</p>
            <div style="background: rgba(0,0,0,0.03); padding: 5px 8px; border-radius: 6px; width: 100%; font-family: monospace; font-size: 12px; line-height: 1.4; text-align: left; margin-bottom: 5px;">
                ${wave.formula}
            </div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 2px; border-top: 1px solid rgba(0,0,0,0.1); padding-top: 5px; width: 100%; text-align: left; line-height: 1.2;">
                <b>Variables:</b> H = Base Height | A = Amplitude (1-5cm) | E = Smooth Envelope<br>
                <i>Safety Rule: max(FL,FR,BL,BR) - min(FL,FR,BL,BR) <= 5 cm</i>
            </div>
        `;
    }
}

function executeWave() {
    const heights = [netPos.FL, netPos.FR, netPos.BL, netPos.BR];
    const maxH = Math.max(...heights);
    const minH = Math.min(...heights);
    const currentDifference = maxH - minH;

    const availableWaveRoom = 5 - currentDifference;

    if (availableWaveRoom <= 0) {
        showNotification("Wave blocked: point difference limit reached. Please level the net first.", true);
        return;
    }

    let effectiveWaveHeight = waveDistance;
    let message = "";

    if (effectiveWaveHeight > availableWaveRoom) {
        effectiveWaveHeight = availableWaveRoom;
        message = `Wave height reduced for safety. ${effectiveWaveHeight} cm applied.`;
    }

    const preset = document.getElementById('wave-preset').value;
    let cycles = 3;
    if (preset === 'diagonal' || preset === 'circular') {
        cycles = 2;
    }

    lockInterface(true);
    if (message) {
        showNotification(message + ` Running ${preset} (${cycles} cycles)...`, false);
    } else {
        showNotification(`Running ${preset} (${cycles} cycles) at ${effectiveWaveHeight}cm...`, false);
    }

    // Simulate wave duration (e.g. 2 seconds per cycle)
    const waveDuration = cycles * 2000;

    setTimeout(() => {
        if (!isMoving) return; // E-Stop was pressed

        lockInterface(false);
        showNotification("Wave completed. Net returned to base position.", false);
        // The net position returns to its original state, so no permanent change
        updatePositionUI();
    }, waveDuration);
}

function executeGiveLove() {
    lockInterface(true);

    const G = loveIntensity === 'soft' ? '0.5 mm' : '1.0 mm';
    showNotification(`Give Love (${loveIntensity}, ${loveDuration}s) starting. Max diff: ${G}...`, false);

    setTimeout(() => {
        if (!isMoving) return; // E-Stop pressed

        lockInterface(false);
        showNotification(`Give Love completed. Net softly returned to base.`, false);
        // Position doesn't change permanently
        updatePositionUI();
    }, loveDuration * 1000);
}

function startMotorSimulation(newState, actionName) {
    lockInterface(true);
    showNotification(`Moving: ${actionName}...`, false);

    // Simulate motor movement taking 2 seconds
    setTimeout(() => {
        if (!isMoving) return; // E-Stop was pressed

        netPos = newState; // Apply new state
        updatePositionUI();
        lockInterface(false);
        showNotification("Movement complete.", false);
    }, 2000);
}

function emergencyStop() {
    if (!isMoving) {
        showNotification("System is already stopped.", false);
        return;
    }
    isMoving = false;
    lockInterface(false);

    // In real life, this halts motors immediately and probably leaves netPos at an intermediate state.
    // For this prototype, we just cancel the timeout completion.
    showNotification("EMERGENCY STOP ACTIVATED. All movement halted.", true);
}

// === Calibration & Leveling ===
let savedProfiles = [];

function refreshCalibrationUI() {
    // 1. Set Zero Level Info
    const heights = [netPos.FL, netPos.FR, netPos.BL, netPos.BR].sort((a, b) => a - b);
    const min = heights[0];
    const max = heights[3];
    const mid = (min + max) / 2;

    const diffMid = mid - min;
    const diffMax = max - min;

    document.getElementById('zero-level-info').innerHTML =
        `Differences: <br> Lowest: +0 cm | Middle: +${diffMid} cm | Highest: +${diffMax} cm`;

    // 2. Save Offsets Info
    const base = min; // The lowest point is the base (0 offset)
    const formatOffset = (val) => {
        const diff = val - base;
        return diff > 0 ? `+${diff}` : `${diff}`;
    };

    document.getElementById('save-offsets-info').innerHTML =
        `FL: ${formatOffset(netPos.FL)} | FR: ${formatOffset(netPos.FR)} | BL: ${formatOffset(netPos.BL)} | BR: ${formatOffset(netPos.BR)}`;

    // Reset Level Net flows
    document.getElementById('level-net-error').classList.add('hidden');
    document.getElementById('level-net-flow-1').classList.remove('hidden');
    document.getElementById('level-net-flow-2').classList.add('hidden');
    document.getElementById('level-net-flow-3').classList.add('hidden');
}

function alignTo(target) {
    const heights = [netPos.FL, netPos.FR, netPos.BL, netPos.BR].sort((a, b) => a - b);
    const min = heights[0];
    const max = heights[3];
    const mid = (min + max) / 2;

    let targetVal = 0;
    if (target === 'lowest') targetVal = min;
    else if (target === 'highest') targetVal = max;
    else targetVal = mid;

    // Check bounds
    if (targetVal < 0 || targetVal > 35) {
        showNotification("Target exceeds physical limits.", true);
        return;
    }

    const newState = { FL: targetVal, FR: targetVal, BL: targetVal, BR: targetVal };
    startMotorSimulation(newState, `Aligning to ${target} (${targetVal}cm)`);

    setTimeout(refreshCalibrationUI, 2100);
}

function saveOffsets() {
    if (savedProfiles.length >= 5) {
        showNotification("Max 5 profiles allowed. Restart app to clear.", true);
        return;
    }
    const input = document.getElementById('save-profile-name');
    let name = input.value.trim();
    if (!name) name = "Profile " + (savedProfiles.length + 1);

    const profile = {
        name: name,
        state: { ...netPos }
    };
    savedProfiles.push(profile);

    // Update select
    const select = document.getElementById('load-profile-select');
    const opt = document.createElement('option');
    opt.value = savedProfiles.length - 1;
    opt.text = name;
    select.add(opt);

    input.value = '';
    showNotification(`Saved: ${name}`, false);
}

function loadOffsets() {
    const select = document.getElementById('load-profile-select');
    const idx = select.value;
    if (idx === "") {
        showNotification("Please select a profile to load.", true);
        return;
    }

    const profile = savedProfiles[idx];

    // Validate physical limits
    let valid = true;
    for (const val of Object.values(profile.state)) {
        if (val < 0 || val > 35) valid = false;
    }
    if (!valid) {
        showNotification("Loaded state exceeds limits.", true);
        return;
    }

    startMotorSimulation({ ...profile.state }, `Loading ${profile.name}`);
    setTimeout(refreshCalibrationUI, 2100);
}

function startLevelNet() {
    if (activeDevice === 'light') {
        // Skip Set Zero Level check for Light
        document.getElementById('level-net-error').classList.add('hidden');
        document.getElementById('level-net-flow-1').classList.add('hidden');
        document.getElementById('level-net-flow-2').classList.remove('hidden');
        return;
    }

    // Check if level for Net
    const heights = [netPos.FL, netPos.FR, netPos.BL, netPos.BR];
    const isLevel = heights.every(h => h === heights[0]);

    if (!isLevel) {
        document.getElementById('level-net-error').classList.remove('hidden');
    } else {
        document.getElementById('level-net-error').classList.add('hidden');
        document.getElementById('level-net-flow-1').classList.add('hidden');
        document.getElementById('level-net-flow-2').classList.remove('hidden');
    }
}

function confirmCutPower(isYes) {
    if (!isYes) {
        document.getElementById('level-net-flow-2').classList.add('hidden');
        document.getElementById('level-net-flow-1').classList.remove('hidden');
        return;
    }
    document.getElementById('level-net-flow-2').classList.add('hidden');
    document.getElementById('level-net-flow-3').classList.remove('hidden');
    showNotification("POWER CUT. Motors are free. Adjust manually.", false);
}

function restorePower() {
    document.getElementById('level-net-flow-3').classList.add('hidden');
    document.getElementById('level-net-flow-1').classList.remove('hidden');
    showNotification("Power Restored. Motors engaged.", false);
}

// === Quotes Logic ===
function loadRandomQuote() {
    const quotes = [
        `"Intelligence with good intentions can enjoy the creation"`,
        `"Under self observation the one will understand and accept the suroundings"`,
        `"The happines to see the progress and imagination of AI"`,
        `"Working with my Ai colleagues allowed me to turn my vision in reality"`
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const quoteEl = document.getElementById('daily-quote');
    if (quoteEl) quoteEl.innerText = randomQuote;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadRandomQuote();

    const wavePresetEl = document.getElementById('wave-preset');
    if (wavePresetEl) {
        wavePresetEl.addEventListener('change', updateWaveFunctionUI);
        updateWaveFunctionUI(); // Initial load
    }

    updateGiveLoveUI(); // Initial load for Give Love
});
