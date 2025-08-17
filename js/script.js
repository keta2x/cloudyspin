// D:/python projects/seobot_renewed_9_11/seobot/bot\web_app\js\script.js

const tg = window.Telegram.WebApp;
const BACKEND_URL = 'https://cloudyspin.ddns.net';

// DOM-элементы
const spinButton = document.getElementById('spin-button');
const spinButtonText = document.querySelector('#spin-button .button-text');
const spinsCountEl = document.getElementById('spins-count');
const pointsCountEl = document.getElementById('points-count');
const textCanvas = document.getElementById('text-canvas');
const happyHourIndicator = document.getElementById('happy-hour-indicator');
const spinsLabelEl = document.getElementById('spins-label');
const pointsLabelEl = document.getElementById('points-label');
const mainContent = document.querySelector('.main-content');
const pointsRateInfoEl = document.getElementById('points-rate-info');
const prizeInfoButton = document.getElementById('prize-info-button');
const prizeOverlay = document.getElementById('prize-info-overlay');
const prizeModal = document.getElementById('prize-info-modal');
const prizeCloseButton = document.getElementById('prize-info-close-button');
const prizeInfoTitle = document.getElementById('prize-info-title');
const prizeContentContainer = document.getElementById('prize-info-content');

// <<< Элементы для таблицы лидеров >>>
const leaderboardButton = document.getElementById('leaderboard-button');
const leaderboardOverlay = document.getElementById('leaderboard-overlay');
const leaderboardModal = document.getElementById('leaderboard-modal');
const leaderboardCloseButton = document.getElementById('leaderboard-close-button');
const leaderboardTitle = document.getElementById('leaderboard-title');
const leaderboardContent = document.getElementById('leaderboard-content');

let isPrizeInfoPopulated = false; // Флаг, чтобы не создавать меню дважды
let preRenderedWheelCanvas = null;
const ANIMATION_DURATION_S = 6;
let smoothRotationZ = THREE.MathUtils.degToRad(-108); // Инициализируем с начальным углом колеса

// <<<< ОПТИМИЗАЦИЯ: Уменьшаем разрешение >>>>
const PIXEL_RATIO = Math.min(window.devicePixelRatio, 2); // Максимум 2x

// <<< ИСПРАВЛЕНО: Конфиг колеса, который ты предоставил >>>

const WHEEL_LAYOUT = [
    'mythic', 'common', 'rare', 'epic', 'rare', 'common', 
    'legendary', 'common', 'rare', 'common'
];

const ICON_CONFIG = {
    mythic: {
        size: 62,
        radiusOffset: 0.28,
        zOffset: 10,
        rotationOffset: 0,
    },
    legendary: {
        size: 32,
        radiusOffset: 0.28,
        zOffset: 10,
        rotationOffset: 0,
    },
    epic: {
        size: 54,
        radiusOffset: 0.3,
        zOffset: 10,
        rotationOffset: 0,
    },
    rare: {
        size: 20,
        radiusOffset: 0.4,
        zOffset: 10,
        rotationOffset: 0,
    },
    common: {
        size: 16,
        radiusOffset: 0.4,
        zOffset: 10,
        rotationOffset: 0,
    }
};

const TEXT_BACKGROUND_CONFIG = {
    enabled: true,
    paddingX: 5,
    paddingY: 5,
    depth: 1.5,
    zOffset: 3,
    color: '#000000',   
    opacity: 0.2
};

const WHEEL_OUTER_RADIUS = 192 * PIXEL_RATIO * 0.85;
const WHEEL_INNER_RADIUS = 60 * PIXEL_RATIO * 0.85;
const textBackgroundRingConfig = {
    enabled: true,
    radiusOffset: -6,
    lineWidth: 70,
    color: 'rgba(0, 0, 0, 0.5)',
    shadow: {
        enabled: true,
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 10,
        offsetY: 4
    }
};

let textCtx; 
let theWheel;
let wheelSpinning = false;
let currentUserInfo = { available_spins: 0, loyalty_points: 0 };
let wheelConfig = {};
let i18n = {};
let spinResultData = null;
let sectorIcons = {};
let spinButton3D;
let spinButtonTopMaterial;
let spinButtonIdleAnimation;
let spinButtonSpinningAnimation;
let loadedRarityTextures = {};
let wheelSpinSound;
let backgroundMusic;
let winSound;
let spinClickSound;

// <<< НОВОЕ: Константа для начального масштаба кнопки >>>
const INITIAL_BUTTON_SCALE = 0.8;

// <<<< ОПТИМИЗАЦИЯ: Флаг для управления производительностью >>>>
let performanceMode = 'normal'; // 'normal' или 'low'
let bloomEnabled = true;

// В script.js
const rarityStyles = {
    legendary: {
        gradient: ['rgb(255,184,0)', 'rgb(255,215,0)'],
        bevelLight: 'rgb(255,248,220)',
        bevelDark: 'rgb(48,25,0)',
        specularColor: 'rgb(255,240,190)',
        glow: 'rgb(255, 81, 0)',
        textColor: 'rgb(255, 255, 255)',
        textHighlightColor: 'rgb(255,255,200)',
        coreColor: 'rgb(252,174,5)',
        sectorColor: 'rgb(5, 4, 0)',
        sectorEmissive: 'rgb(255, 136, 0)',
        sectorEmissiveIntensity: 0,
        sectorRoughness: 0,
        sectorMetalness: 0,
        sectorClearcoat: 0,
        sectorClearcoatRoughness: 0,
        textureUrl: '/static/textures/texture_legendary.png'
    },
    epic: {
        gradient: ['rgb(255,78,219)', 'rgb(255,122,245)'],
        bevelLight: 'rgb(255,200,255)',
        bevelDark: 'rgb(120,0,80)',
        specularColor: 'rgb(255,180,255)',
        glow: 'rgb(146, 73, 95)',
        textColor: 'rgb(224, 224, 224)',
        textHighlightColor: 'rgb(255, 124, 2)',
        coreColor: 'rgb(255, 0, 204)',
        sectorColor: 'rgb(0, 0, 0)',
        sectorEmissiveIntensity: 0,
        sectorEmissive: 'rgb(155, 17, 30)',
        sectorRoughness: 0,
        sectorMetalness: 0,
        sectorClearcoat: 0,
        sectorClearcoatRoughness: 0,
        textureUrl: '/static/textures/texture_epic.png'
    },
    rare: {
        gradient: ['rgb(0,51,102)', 'rgb(0,80,200)'],
        bevelLight: 'rgb(120,180,255)',
        bevelDark: 'rgb(0,20,60)',
        specularColor: 'rgb(120,180,255)',
        glow: 'rgb(0,80,255)',
        textColor: 'rgb(0,80,255)',
        textHighlightColor: 'rgb(120,180,255)',
        coreColor: 'rgb(122,209,255)',
        sectorColor: 'rgb(35,54,110)',
        sectorEmissive: 'rgb(0,80,255)',
        sectorEmissiveIntensity: 0,
        sectorRoughness: 0,
        metalness: 0,
        clearcoat: 0,
        clearcoatRoughness: 0,
        textureUrl: '/static/textures/texture_rare.png'
    },
    common: {
        gradient: ['rgb(16,19,26)', 'rgb(35,35,35)'],
        bevelLight: 'rgb(40,43,44)',
        bevelDark: 'rgb(0,0,0)',
        specularColor: 'rgb(50,51,53)',
        glow: 'rgb(60,60,60)',
        textColor: 'rgb(224,224,224)',
        textHighlightColor: 'rgb(12,12,12)',
        coreColor: 'rgb(224,224,224)',
        sectorColor: 'rgb(19,26,70)',
        sectorEmissive: 'rgb(0, 0, 0)',
        sectorEmissiveIntensity: 0,
        sectorRoughness: 0,
        metalness: 0,
        clearcoat: 0,
        clearcoatRoughness: 0,
        textureUrl: '/static/textures/texture_common.png'
    },
    mythic: {
        gradient: ['rgb(64,220,255)', 'rgb(0,250,255)'],
        bevelLight: 'rgb(200,255,255)',
        bevelDark: 'rgb(0,80,120)',
        specularColor: 'rgb(200,255,255)',
        glow: 'rgb(34, 54, 170)',
        textColor: 'rgb(255, 255, 255)',
        textHighlightColor: 'rgb(252, 134, 0)',
        coreColor: 'rgb(64,220,255)',
        sectorColor: 'rgb(0, 0, 0)',
        sectorEmissive: 'rgb(0, 204, 255)',
        sectorEmissiveIntensity: 0,
        sectorRoughness: 0,
        metalness: 0,
        clearcoat: 0,
        clearcoatRoughness: 0,
        textureUrl: '/static/textures/texture_mythic.png'
    }
};

// Дефолтные настройки сцены
let sceneSettings = {
    lights: {
        ambient: { intensity: 0.2 },
        directional: { intensity: 2, position: { x: -100, y: 200, z: 200 } }
    },
    materials: {
        legendary: { color: '#ffa50a', emissive: '#ffd900', emissiveIntensity: 0.7, metalness: 0.2, roughness: 0.35 },
        epic: { color: '#2e0029', emissive: '#d900ff', emissiveIntensity: 0.5, metalness: 0.2, roughness: 0.35 },
        rare: { color: '#00183d', emissive: '#008eff', emissiveIntensity: 0.4, metalness: 0.2, roughness: 0.35 },
        common: { color: '#151821', emissive: '#4a5568', emissiveIntensity: 0.1, metalness: 0.5, roughness: 0.3 },
        mythic: { color: '#00183d', emissive: '#008eff', emissiveIntensity: 0.4, metalness: 0.2, roughness: 0.35 }
    },
    sound: {
        volume: 0.5
    }
};

function get3DSectorMaterialConfig(rarity) {
    if (rarity === 'mythic') {
        const mythicUniforms = {
            time: { value: 0.0 },
            baseTexture: { value: loadedRarityTextures[rarity] || null }
        };

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        // Восстановленный оригинальный шейдер
        const fragmentShader = `
            uniform float time;
            uniform sampler2D baseTexture;
            varying vec2 vUv;

            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            float noise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                float a = random(i);
                float b = random(i + vec2(1.0, 0.0));
                float c = random(i + vec2(0.0, 1.0));
                float d = random(i + vec2(1.0, 1.0));
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
            }

            float fbm(vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 0.0;
                for (int i = 0; i < 6; i++) {
                    value += amplitude * noise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 uv1 = vUv * 2.0;
                uv1.x += time * 0.1;

                vec2 uv2 = vUv * 1.5;
                uv2.y -= time * 0.15;

                float noise_pattern = fbm(uv1 + fbm(uv2));
                float hue = fract(noise_pattern + time * 0.2);

                vec3 vibrantColor = hsv2rgb(vec3(hue, 0.95, 1.0));
                vec3 emissiveGlow = vibrantColor * pow(noise_pattern, 2.0) * 1.2;
                vec3 finalColor = vibrantColor + emissiveGlow;

                vec4 texColor = texture2D(baseTexture, vUv);
                gl_FragColor = vec4(finalColor * texColor.rgb, 1.0);
            }
        `;
        
        return new THREE.ShaderMaterial({
            uniforms: mythicUniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.DoubleSide 
        });
    }

    const settings = sceneSettings.materials[rarity] || sceneSettings.materials.common;

    return {
        color: new THREE.Color(settings.color),
        roughness: settings.roughness,
        metalness: settings.metalness,
        emissive: new THREE.Color(settings.emissive),
        emissiveIntensity: settings.emissiveIntensity,
        clearcoat: 0.5,
        clearcoatRoughness: 0.1
    };
}

function getMaterialConfigFromRarity(rarity) {
    const style = rarityStyles[rarity] || rarityStyles.common;
    return {
        color: style.gradient[0],
        emissive: style.glow,
        emissiveIntensity: 0.5,
        roughness: 0.25,
        metalness: 0.7,
        clearcoat: 0.7,
        clearcoatRoughness: 0.1
    };
}

// --- ИНИЦИАЛИЗАЦИЯ ---
tg.ready();

function winwheelAnimationLoop() {
    if (!theWheel || !wheelContainer) return;
    
    // Целевой угол поворота от Winwheel
    const targetRotationRad = THREE.MathUtils.degToRad(theWheel.rotationAngle);
    
    // Если колесо не вращается, применяем точное значение
    if (!wheelSpinning) {
        smoothRotationZ = -targetRotationRad;
        wheelContainer.rotation.z = smoothRotationZ;
    } else {
        // Во время вращения используем плавную интерполяцию
        const lerpFactor = 0.15;
        smoothRotationZ = THREE.MathUtils.lerp(smoothRotationZ, -targetRotationRad, lerpFactor);
        wheelContainer.rotation.z = smoothRotationZ;
    }
}

function createWheel(prizes, font) {
    if (theWheel) {
        theWheel.stopAnimation(false);
        theWheel = null;
    }
    
    const segmentsData = prizes.map((prize) => {
        const rarity = prize.rarity.toLowerCase();
        const style = rarityStyles[rarity] || rarityStyles.common;
        return {
            'text': prize.localized_name, 'id': prize.id, 'rarity': rarity,
            'style': style,
            'textFontWeight': '900',
        };
    });

    theWheel = new Winwheel({
        'canvasId': 'canvas',
        'numSegments': prizes.length,
        'outerRadius': WHEEL_OUTER_RADIUS,
        'innerRadius': WHEEL_INNER_RADIUS,
        'segments': segmentsData,
        'drawText': false,
        'fillStyle': 'transparent',
        'strokeStyle': 'transparent',
        'pointerAngle': -90,
        'rotationAngle': -108,
        'animation': {
            'type': 'spinToStop', 'duration': ANIMATION_DURATION_S, 'spins': 8,
            'easing': 'Power4.easeOut', 'callbackFinished': 'winwheelStopAnimation',
            'callbackAfter': 'winwheelAnimationLoop'
        }
    });

    // Скрываем 2D canvas
    const canvas2D = theWheel.canvas;
    canvas2D.style.display = 'none';

    create3DSectors(prizes, font);

    // ВАЖНО: Устанавливаем начальные значения поворота
    const initialRotationRad = THREE.MathUtils.degToRad(theWheel.rotationAngle);
    smoothRotationZ = -initialRotationRad;
    
    // Применяем начальный поворот к 3D колесу
    if (wheelContainer) {
        wheelContainer.rotation.z = smoothRotationZ;
    }

    window.winwheelToDrawDuringAnimation = theWheel;
    window.winwheelStopAnimation = winwheelStopAnimation;
    window.winwheelAnimationLoop = winwheelAnimationLoop;

    // Вызываем один раз для синхронизации
    winwheelAnimationLoop();
    
    setTimeout(() => verifySectorAlignment(), 1000);
    
    if (performanceMode === 'normal') {
        enableBloomEffect();
    }
}

function drawTextBackgroundRing(wheel, ctx) {
    if (!ctx || !wheel || !textBackgroundRingConfig.enabled) return;

    const baseTextRadius = WHEEL_INNER_RADIUS + (WHEEL_OUTER_RADIUS - WHEEL_INNER_RADIUS) * 0.7;
    const ringRadius = baseTextRadius + (textBackgroundRingConfig.radiusOffset * PIXEL_RATIO);

    ctx.save();

    if (textBackgroundRingConfig.shadow.enabled) {
        ctx.shadowColor = textBackgroundRingConfig.shadow.color;
        ctx.shadowBlur = textBackgroundRingConfig.shadow.blur * PIXEL_RATIO;
        ctx.shadowOffsetY = textBackgroundRingConfig.shadow.offsetY * PIXEL_RATIO;
    }
    ctx.lineWidth = textBackgroundRingConfig.lineWidth * PIXEL_RATIO * 0.85;
    ctx.strokeStyle = textBackgroundRingConfig.color;
    ctx.beginPath();
    ctx.arc(wheel.centerX, wheel.centerY, ringRadius, 0, Math.PI * 2, false);
    ctx.stroke();

    ctx.restore();
}

function drawWheelText(wheel, ctx) {
    if (!ctx || !wheel) return;

    for (let i = 1; i <= wheel.numSegments; i++) {
        const seg = wheel.segments[i];
        if (!seg || !seg.text) continue;

        const centerAngle = wheel.degToRad(seg.startAngle + (seg.endAngle - seg.startAngle) / 2);
        const angleCorrection = wheel.degToRad(-90);
        const correctedAngle = centerAngle - angleCorrection;

        const style = seg.style;
        const lines = seg.text.split('\n');
        
        lines.reverse();

        const lineHeight = 14 * PIXEL_RATIO; 
        const textRadius = WHEEL_INNER_RADIUS + (WHEEL_OUTER_RADIUS - WHEEL_INNER_RADIUS) * 0.66;

        ctx.save();
        
        ctx.font = `${seg.textFontWeight || '800'} ${lineHeight}px Manrope, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let j = 0; j < lines.length; j++) {
            const line = lines[j];
            const lineOffset = (j - (lines.length - 1) / 2) * (lineHeight + 5 * PIXEL_RATIO);
            const radius = textRadius + lineOffset;
            
            drawCurvedText(line, radius, correctedAngle, style, wheel, ctx);
        }
        
        ctx.restore();
    }
}

function drawCurvedText(text, radius, angle, style, wheel, ctx) {
    ctx.save();
    ctx.translate(wheel.centerX, wheel.centerY);
    ctx.rotate(angle);

    const totalAngle = ctx.measureText(text).width / radius;
    ctx.rotate(-totalAngle / 2);

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charAngle = charWidth / radius;
        ctx.rotate(charAngle / 2);

        ctx.save();
        ctx.translate(0, -radius);

        ctx.shadowColor = style.glow;
        ctx.shadowBlur = 15 * PIXEL_RATIO;
        ctx.fillStyle = style.glow;
        ctx.fillText(char, 0, 0);

        ctx.shadowBlur = 5;
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = style.coreColor;
        ctx.fillText(char, 0, 0);

        ctx.restore();
        ctx.rotate(charAngle / 2);
    }

    ctx.restore();
}

spinButton.addEventListener('click', async () => {
    if (wheelSpinning || !theWheel || currentUserInfo.available_spins <= 0) return;

    if (spinClickSound) {
        spinClickSound.currentTime = 0;
        spinClickSound.play();
    }

    stopAllSectorFlips();

    // <<<< ОПТИМИЗАЦИЯ: Отключаем bloom во время вращения >>>>
    bloomEnabled = false;

    spinButton.disabled = true;
    wheelSpinning = true;
    updateSpinButtonText();
    startSpinButtonAnimation();

    try {
        const result = await apiFetch('/api/v1/spin', { 
            method: 'POST',
            body: JSON.stringify({ prizes: wheelConfig.prizes })
        });
        
        if (!result.success || !result.prize) {
            throw new Error(result.error || i18n.alert_sync_error || 'Invalid server response.');
        }
        
        spinResultData = result;
        currentUserInfo.available_spins -= 1;
        updateUI();

        const prizeIndex = wheelConfig.prizes.findIndex(p => p.id === result.prize.id);
        const winningSegmentNumber = prizeIndex !== -1 ? prizeIndex + 1 : 0;

        if (winningSegmentNumber > 0) {
            if (theWheel.anim) {
                theWheel.stopAnimation(false);
            }
            theWheel.rotationAngle = theWheel.rotationAngle % 360;
            theWheel.animation.spins = 12;
            
            theWheel.animation.stopAngle = theWheel.getRandomForSegment(winningSegmentNumber);
            
            if (wheelSpinSound) {
                wheelSpinSound.currentTime = 0;
                wheelSpinSound.play();
            }
            theWheel.startAnimation();
        } else {
            throw new Error(i18n.alert_sync_error || 'Sync error.');
        }

    } catch (error) {
        console.error("Spin Error:", error);
        tg.showAlert(error.message);
        wheelSpinning = false;
        spinButton.classList.remove('spinning');
        spinResultData = null;
        if (wheelSpinSound) {
            wheelSpinSound.pause();
        }
        bloomEnabled = true; // Восстанавливаем bloom
        resumeAllSectorFlips(); 
        await loadUserInfo();
    }
});

function applyLocalization() {
    document.title = i18n.title || 'CloudySpin';
    spinsLabelEl.textContent = i18n.spins_label || 'spins';
    pointsLabelEl.textContent = i18n.points_label || 'points';
    
    if (pointsRateInfoEl) {
        pointsRateInfoEl.textContent = i18n.points_rate_info || '5 points = 1$';
    }

    if (prizeInfoButton) {
        prizeInfoButton.title = i18n.prize_info_button_title || 'Prize List';
    }
    // <<< Локализация для таблицы лидеров >>>
    if (leaderboardButton) {
        leaderboardButton.title = i18n.leaderboard_button_title || 'Leaderboard';
    }
    if (leaderboardTitle) {
        leaderboardTitle.textContent = i18n.leaderboard_title || 'Leaderboard';
    }

    if (prizeInfoTitle) {
        prizeInfoTitle.textContent = i18n.prize_info_title || 'Prizes';
    }

    updateSpinButtonText();
}

function updateSpinButtonText() {
    if (wheelSpinning) {
        spinButtonText.textContent = i18n.spin_button_spinning || "SPIN";
    } else {
        spinButtonText.textContent = currentUserInfo.available_spins > 0 
            ? (i18n.spin_button_ready || "SPIN") 
            : (i18n.spin_button_no_spins || "0");
    }
}

function winwheelStopAnimation() {
    // <<<< ОПТИМИЗАЦИЯ: Восстанавливаем bloom после остановки >>>>
    bloomEnabled = true;
    
    if (wheelSpinSound) {
        wheelSpinSound.pause();
        wheelSpinSound.currentTime = 0;
    }

    if (handleAnimationFinished) {
        handleAnimationFinished();
    }
}

function triggerWinAnimation() {
    const wheelWrapper = document.querySelector('.wheel-wrapper');
    const spinButton = document.getElementById('spin-button');
    const statsPanel = document.querySelector('.stats-panel-wrapper');

    const animationClass = 'winner-celebration';
    const glowClass = 'winner-glow';
    const animationDuration = 3000;

    wheelWrapper.classList.add(glowClass);
    spinButton.classList.add(animationClass);
    statsPanel.classList.add(animationClass);

    setTimeout(() => {
        wheelWrapper.classList.remove(glowClass);
        spinButton.classList.remove(animationClass);
        statsPanel.classList.remove(animationClass);
    }, animationDuration);
}

async function handleAnimationFinished() {
    if (!spinResultData) {
        console.error("Spin result data is missing when animation finished.");
        wheelSpinning = false;
        await loadUserInfo();
        return;
    }

    if (winSound) {
        winSound.currentTime = 0;
        winSound.play();
    }

    triggerWinAnimation();
    
    const prize = wheelConfig.prizes.find(p => p.id === spinResultData.prize.id);
    const rarity = prize ? prize.rarity.toLowerCase() : 'common';
    
    if (prize) {
        setTimeout(() => {
            showPrizeNotification(prize, rarity);
        }, 500);
    } else {
        console.error("Could not find prize details in wheelConfig for ID:", spinResultData.prize.id);
        const winMessage = i18n.alert_win_message 
            ? i18n.alert_win_message.replace('{prize_name}', spinResultData.prize.name) 
            : `Congratulations! You won: ${spinResultData.prize.name}`;
        await tg.showAlert(winMessage);
        await finalizeWin();
    }
}

function updateUI() {
    animateValue(spinsCountEl, parseInt(spinsCountEl.textContent) || 0, currentUserInfo.available_spins, 500);
    animateValue(pointsCountEl, parseInt(pointsCountEl.textContent) || 0, currentUserInfo.loyalty_points, 500);
    
    const canSpin = !wheelSpinning && currentUserInfo.available_spins > 0;
    spinButton.disabled = !canSpin;
    updateSpinButtonText();
    
    if (canSpin) {
        pulseButtonAnimation();
    } else {
        if (spinButtonIdleAnimation) spinButtonIdleAnimation.pause();
        if (!wheelSpinning && spinButton3D) {
            spinButton3D.scale.set(currentButtonScale, currentButtonScale, currentButtonScale);
        }
    }
}

async function loadUserInfo() {
    try {
        const userInfo = await apiFetch('/api/v1/user-info');
        currentUserInfo.available_spins = userInfo.available_spins;
        currentUserInfo.loyalty_points = userInfo.loyalty_points;
        updateUI();
    } catch (error) {
        console.error("Failed to load user info:", error);
        spinButton.disabled = true;
        spinButtonText.textContent = i18n.spin_button_error || "Error";
    }
}

async function apiFetch(endpoint, options = {}) {
    if (!tg.initData) throw new Error('Telegram initData is not available.');

    const defaultHeaders = { 'Authorization': `tma ${tg.initData}` };
    if (options.method === 'POST') {
        defaultHeaders['Content-Type'] = 'application/json';
        options.body = options.body || JSON.stringify({});
    }
    options.headers = { ...defaultHeaders, ...options.headers };

    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
        const responseText = await response.text();
        if (!response.ok) {
            let errorMsg = `Server Error: ${response.status}`;
            try { errorMsg = JSON.parse(responseText).error || errorMsg; } catch (e) {}
            throw new Error(errorMsg);
        }
        return responseText ? JSON.parse(responseText) : {};
    } catch (error) {
        console.error(`API Fetch Error for ${endpoint}:`, error);
        throw error;
    }
}

function animateValue(element, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

document.addEventListener('DOMContentLoaded', () => {
    const spendInBotButton = document.getElementById('spend-in-bot-btn');
    
    if (spendInBotButton) {
        spendInBotButton.addEventListener('click', () => {
            const botUrl = 'https://t.me/CloudySeo_Bot'; 
            
            if (tg && tg.openTelegramLink) {
                tg.openTelegramLink(botUrl);
            } else {
                window.open(botUrl, '_blank');
            }
        });
    }
});

// Исправленная версия 3D модуля

let threeScene, threeCamera, threeRenderer, effectComposer;
let wheelContainer;
let currentButtonScale = INITIAL_BUTTON_SCALE;
let isButtonAnimating = false;
const clock = new THREE.Clock();
const DEBUG_BOUNDARIES = false;
const PRIZE_NOTIFICATION_CONFIG = {
    assetUrl: 'img/prize_plank.png', 
    aspectRatio: '512 / 288', 
    fontFamily: "'Manrope', sans-serif",
    
    // <<< ИЗМЕНЕНИЯ: Новая система позиционирования >>>
    // Настройки для заголовка и кнопки (центр всей плашки + легкое смещение)
    titleTop: '28%',
    titleOffsetX: '12%', // Небольшое смещение вправо для оптического центра
    buttonBottom: '-15%',
    
    // Настройки для области текста приза
    prizeTextTopBoundary: '40%',   // Верхняя граница зоны
    prizeTextBottomBoundary: '25%', // Нижняя граница зоны
    prizeTextLeftBoundary: '32%',   // Отступ слева, чтобы не заезжать на сундук
    prizeTextRightBoundary: '8%'     // Отступ справа для симметрии
    // <<< КОНЕЦ ИЗМЕНЕНИЙ >>>
};

let prizeNotificationOverlay = null;
let prizeNotificationContainer = null;
let prizeNotificationTitle = null;
let prizeNotificationPrizeName = null;
let prizeNotificationButton = null;

const WHEEL_GEOMETRY_CONFIG = {
    offsetX: 0,
    offsetY: 0,
    innerWheelRadius: 170,
    holeRatio: 0.31,
    outerRingScale: 1.5,
    ringOffsetX: -14,
    ringOffsetY: -32
};

const DESIGN_REFERENCE_WIDTH = 360;
const LOGICAL_OUTER_RADIUS = WHEEL_GEOMETRY_CONFIG.innerWheelRadius;
const LOGICAL_INNER_RADIUS = WHEEL_GEOMETRY_CONFIG.innerWheelRadius * WHEEL_GEOMETRY_CONFIG.holeRatio;

const WHEEL_3D_CONFIG = {
    geometry: {
        depth: 12,
        bevelThickness: 3,
        bevelSize: 4,
        bevelSegments: 16
    },
    bloom: {
        threshold: 0.1,
        strength: 1.5,
        radius: 0.6
    }
};

function createRoundedRectShape(width, height, radius) {
    const x = -width / 2;
    const y = -height / 2;
    const shape = new THREE.Shape();

    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);

    return shape;
}

// <<<< ОПТИМИЗИРОВАННЫЙ КЛАСС SECTOR >>>>
class Sector {
    constructor(config, font) {
        this.config = config;
        this.font = font;
        this.group = new THREE.Group();
        this.isAnimating = false;
        
        this.textGroup = null;
        this.currentFlipAngle = 0;

        // <<<< ОПТИМИЗАЦИЯ: Кешируем вычисления >>>>
        this.worldDirectionVector = new THREE.Vector2();
        this._tempTextColor = new THREE.Color();
        
        this.style = rarityStyles[this.config.rarity] || rarityStyles.common;
        this.baseTextColor = new THREE.Color(this.style.textColor);
        this.targetTextColor = new THREE.Color(this.style.glow);
        
        this._createMesh();
        this._createText();
        this._createIcon();
        
        // <<<< ОПТИМИЗАЦИЯ: Кешируем тригонометрические значения >>>>
        this._cosAngle = Math.cos(this.centerAngle);
        this._sinAngle = Math.sin(this.centerAngle);
        
        this._scheduleNextFlip();
    }

    _createMesh() {
        const { startAngle, angleLength, rarity } = this.config;
        const geoConfig = WHEEL_3D_CONFIG.geometry;
        
        const SECTOR_GAP = 0.055;
        const gapOffset = SECTOR_GAP / 2;
        const adjustedStartAngle = startAngle + gapOffset;
        const adjustedAngleLength = angleLength - SECTOR_GAP;
        
        const shape = new THREE.Shape();
        shape.moveTo(LOGICAL_INNER_RADIUS * Math.cos(adjustedStartAngle), LOGICAL_INNER_RADIUS * Math.sin(adjustedStartAngle));
        shape.lineTo(LOGICAL_OUTER_RADIUS * Math.cos(adjustedStartAngle), LOGICAL_OUTER_RADIUS * Math.sin(adjustedStartAngle));
        shape.absarc(0, 0, LOGICAL_OUTER_RADIUS, adjustedStartAngle, adjustedStartAngle + adjustedAngleLength, false);
        shape.lineTo(LOGICAL_INNER_RADIUS * Math.cos(adjustedStartAngle + adjustedAngleLength), LOGICAL_INNER_RADIUS * Math.sin(adjustedStartAngle + adjustedAngleLength));
        shape.absarc(0, 0, LOGICAL_INNER_RADIUS, adjustedStartAngle + adjustedAngleLength, adjustedStartAngle, true);

        const extrudeSettings = {
            steps: 2,
            depth: geoConfig.depth,
            bevelEnabled: true,
            bevelThickness: geoConfig.bevelThickness,
            bevelSize: geoConfig.bevelSize,
            bevelOffset: 0,
            bevelSegments: geoConfig.bevelSegments,
            UVGenerator: this._createCustomUVGenerator(adjustedStartAngle, adjustedAngleLength)
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

        const materialOrConfig = get3DSectorMaterialConfig(rarity);

        if (materialOrConfig instanceof THREE.Material) {
            this.material = materialOrConfig;
        } else {
            const rarityTexture = loadedRarityTextures[rarity];
            const materialProperties = {
                ...materialOrConfig,
                map: rarityTexture,
            };
            this.material = new THREE.MeshPhysicalMaterial(materialProperties);
        }
        
        const mesh = new THREE.Mesh(geometry, this.material);
        mesh.receiveShadow = true;
        this.group.add(mesh);

        this.centerAngle = startAngle + angleLength / 2;
        this.sectorCenter = new THREE.Vector3(
            (LOGICAL_INNER_RADIUS + LOGICAL_OUTER_RADIUS) / 2 * Math.cos(this.centerAngle),
            (LOGICAL_INNER_RADIUS + LOGICAL_OUTER_RADIUS) / 2 * Math.sin(this.centerAngle),
            0
        );
    }

    _createCustomUVGenerator(startAngle, angleLength) {
        const centerAngle = startAngle + angleLength / 2;
        
        return {
            generateTopUV: function(geometry, vertices, indexA, indexB, indexC) {
                const ax = vertices[indexA * 3];
                const ay = vertices[indexA * 3 + 1];
                const bx = vertices[indexB * 3];
                const by = vertices[indexB * 3 + 1];
                const cx = vertices[indexC * 3];
                const cy = vertices[indexC * 3 + 1];
                
                const uvA = calculatePolarUV(ax, ay, startAngle, angleLength);
                const uvB = calculatePolarUV(bx, by, startAngle, angleLength);
                const uvC = calculatePolarUV(cx, cy, startAngle, angleLength);
                
                return [uvA, uvB, uvC];
            },
            
            generateSideWallUV: function(geometry, vertices, indexA, indexB, indexC, indexD) {
                const ax = vertices[indexA * 3];
                const ay = vertices[indexA * 3 + 1];
                const az = vertices[indexA * 3 + 2];
                const bx = vertices[indexB * 3];
                const by = vertices[indexB * 3 + 1];
                const bz = vertices[indexB * 3 + 2];
                const cx = vertices[indexC * 3];
                const cy = vertices[indexC * 3 + 1];
                const cz = vertices[indexC * 3 + 2];
                const dx = vertices[indexD * 3];
                const dy = vertices[indexD * 3 + 1];
                const dz = vertices[indexD * 3 + 2];
                
                const isRadialFace = Math.abs(az - bz) < 0.01 && Math.abs(cz - dz) < 0.01;
                
                if (isRadialFace) {
                    const u1 = az / WHEEL_3D_CONFIG.geometry.depth;
                    const u2 = cz / WHEEL_3D_CONFIG.geometry.depth;
                    
                    return [
                        new THREE.Vector2(u1, 0),
                        new THREE.Vector2(u1, 1),
                        new THREE.Vector2(u2, 1),
                        new THREE.Vector2(u2, 0)
                    ];
                } else {
                    const angle1 = Math.atan2(ay, ax);
                    const angle2 = Math.atan2(by, bx);
                    const u1 = (angle1 - startAngle) / angleLength;
                    const u2 = (angle2 - startAngle) / angleLength;
                    const v1 = az / WHEEL_3D_CONFIG.geometry.depth;
                    const v2 = cz / WHEEL_3D_CONFIG.geometry.depth;
                    
                    return [
                        new THREE.Vector2(u1, v1),
                        new THREE.Vector2(u2, v1),
                        new THREE.Vector2(u2, v2),
                        new THREE.Vector2(u1, v2)
                    ];
                }
            }
        };
        
        function calculatePolarUV(x, y, startAngle, angleLength) {
            const angle = Math.atan2(y, x);
            const radius = Math.sqrt(x * x + y * y);
            
            let normalizedAngle = (angle - startAngle) / angleLength;
            normalizedAngle = Math.max(0, Math.min(1, normalizedAngle));
            
            let normalizedRadius = (radius - LOGICAL_INNER_RADIUS) / (LOGICAL_OUTER_RADIUS - LOGICAL_INNER_RADIUS);
            normalizedRadius = Math.max(0, Math.min(1, normalizedRadius));
            
            return new THREE.Vector2(normalizedAngle, normalizedRadius);
        }
    }

    // <<<< ОПТИМИЗИРОВАННЫЙ UPDATE >>>>
    update(deltaTime) {
        if (this.material && this.material.isShaderMaterial) {
            this.material.uniforms.time.value += deltaTime;
        }

        if (this.textGroup && wheelContainer) {
            // <<<< ОПТИМИЗАЦИЯ: Используем кешированные значения >>>>
            this.worldDirectionVector.set(this._cosAngle, this._sinAngle);
            this.worldDirectionVector.rotateAround({ x: 0, y: 0 }, wheelContainer.rotation.z);

            const targetFlipAngle = this.worldDirectionVector.y < 0 ? Math.PI : 0;

            const LERP_SPEED = 15; 
            this.currentFlipAngle = THREE.MathUtils.lerp(this.currentFlipAngle, targetFlipAngle, LERP_SPEED * deltaTime);

            this.textGroup.rotation.z = (this.centerAngle - Math.PI / 2) + this.currentFlipAngle;
        }

        const time = (this.time || 0) + deltaTime;
        this.time = time; 
        const pulse = (Math.sin(time * 2) + 1) / 2;

        if (this.textMaterial) {
            // <<<< ОПТИМИЗАЦИЯ: Переиспользуем объект цвета >>>>
            this._tempTextColor.copy(this.baseTextColor);
            this._tempTextColor.lerp(this.targetTextColor, pulse);
            this.textMaterial.color.copy(this._tempTextColor);
            
            const textEmissiveIntensity = pulse * 0.4;
            this.textMaterial.emissive.copy(this.targetTextColor);
            this.textMaterial.emissiveIntensity = textEmissiveIntensity;
        }
        
        if (this.iconMaterial) {
            this.iconMaterial.opacity = 1 - pulse;
            this.iconMaterial.emissiveIntensity = (1 - pulse) * 0.2;
        }
    }

    _createText() {
        if (!this.font || !this.config.text) return;
    
        const textLines = this.config.text.split('\n');
    
        this.textMaterial = new THREE.MeshStandardMaterial({
            color: this.baseTextColor,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0
        });
    
        const fontSize = 10;
        const lineHeight = 19;
        const textRadius = LOGICAL_INNER_RADIUS + (LOGICAL_OUTER_RADIUS - LOGICAL_INNER_RADIUS) * 0.67;
    
        this.textGroup = new THREE.Group();
    
        const lineData = [];
        
        textLines.forEach((line, index) => {
            const textGeo = new THREE.TextGeometry(line, {
                font: this.font,
                size: fontSize,
                height: 3,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.05,
                bevelOffset: 0.35,
                bevelSegments: 5
            });
            textGeo.center();
    
            const textMesh = new THREE.Mesh(textGeo, this.textMaterial);
            textMesh.castShadow = false;
    
            const yOffset = (index - (textLines.length - 1) / 2) * -lineHeight;
            textMesh.position.y = yOffset;
            textMesh.position.z = 8;
    
            const lineBox = new THREE.Box3().setFromObject(textMesh);
            const lineSize = new THREE.Vector3();
            lineBox.getSize(lineSize);
    
            lineData.push({
                mesh: textMesh,
                yOffset: yOffset,
                width: lineSize.x,
                height: lineSize.y
            });
    
            this.textGroup.add(textMesh);
        });
    
        const box = new THREE.Box3().setFromObject(this.textGroup);
        const center = new THREE.Vector3();
        box.getCenter(center);
    
        this.textGroup.position.x = -center.x;
        this.textGroup.position.y = -center.y;
    
        this.textGroup.position.x += textRadius * Math.cos(this.centerAngle);
        this.textGroup.position.y += textRadius * Math.sin(this.centerAngle);
        this.textGroup.position.z = WHEEL_3D_CONFIG.geometry.depth + 8;
    
        this.textGroup.rotation.z = this.centerAngle - Math.PI / 2;
    
        this._createTextBackgrounds(lineData, this.textGroup);
    
        this.group.add(this.textGroup);
    }
    
    _createTextBackgrounds(lineData, textGroup) {
        if (!TEXT_BACKGROUND_CONFIG.enabled) return;
        const config = TEXT_BACKGROUND_CONFIG;
    
        lineData.forEach(({ yOffset, width, height }) => {
            const plateWidth = width + config.paddingX;
            const plateHeight = height + config.paddingY;
            const radius = Math.min(plateHeight, plateWidth) * 0.25;
        
            const shape = createRoundedRectShape(plateWidth, plateHeight, radius);
            const extrudeSettings = {
                depth: config.depth,
                bevelEnabled: false
            };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
            const material = new THREE.MeshStandardMaterial({
                color: config.color,
                opacity: config.opacity,
                transparent: true,
                depthWrite: false,
                depthTest: true
            });
        
            const backgroundMesh = new THREE.Mesh(geometry, material);
            backgroundMesh.position.y = yOffset;
            backgroundMesh.position.z = config.zOffset || 7.5;
        
            textGroup.add(backgroundMesh);
        });
    }
    
    _createIcon() {
        const rarity = this.config.rarity;
        const iconTexture = sectorIcons[rarity];
        
        if (!iconTexture) {
            console.warn(`Icon texture not found for rarity: ${rarity}`);
            return;
        }

        const iconConfig = ICON_CONFIG[rarity] || ICON_CONFIG.common;
        const iconGeometry = new THREE.PlaneGeometry(iconConfig.size, iconConfig.size);
        
        const iconMaterial = new THREE.MeshStandardMaterial({
            map: iconTexture,
            transparent: true,
            opacity: 0,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0,
            emissiveMap: iconTexture,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
        
        const iconRadius = LOGICAL_INNER_RADIUS + (LOGICAL_OUTER_RADIUS - LOGICAL_INNER_RADIUS) * iconConfig.radiusOffset;
        iconMesh.position.x = iconRadius * Math.cos(this.centerAngle);
        iconMesh.position.y = iconRadius * Math.sin(this.centerAngle);
        iconMesh.position.z = WHEEL_3D_CONFIG.geometry.depth + iconConfig.zOffset;
        
        iconMesh.rotation.z = this.centerAngle - Math.PI / 2 + iconConfig.rotationOffset;
        
        this.iconMaterial = iconMaterial;
        this.iconMesh = iconMesh;
        
        this.group.add(iconMesh);
    }

    triggerFlip() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const duration = 800;
        const startTime = Date.now();
        
        const rotationAxis = new THREE.Vector3(
            Math.cos(this.centerAngle),
            Math.sin(this.centerAngle),
            0
        ).normalize();
        
        const flipAnimation = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            const easeProgress = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const rotationAngle = easeProgress * Math.PI * 2;
            
            this.group.rotation.set(0, 0, 0);
            this.group.rotateOnAxis(rotationAxis, rotationAngle);

            if (progress < 1) {
                requestAnimationFrame(flipAnimation);
            } else {
                this.group.rotation.set(0, 0, 0);
                this.isAnimating = false;
                this._scheduleNextFlip();
            }
        };
        requestAnimationFrame(flipAnimation);
    }

    _scheduleNextFlip() {
        if (this.flipTimeout) clearTimeout(this.flipTimeout);
        // <<<< ОПТИМИЗАЦИЯ: Увеличиваем интервал переворотов >>>>
        const randomDelay = 5000 + Math.random() * 5000; // от 5 до 10 секунд
        this.flipTimeout = setTimeout(() => this.triggerFlip(), randomDelay);
    }

    stopFlip() {
        if (this.flipTimeout) {
            clearTimeout(this.flipTimeout);
            this.flipTimeout = null;
        }
    }

    resumeFlip() {
        if (!this.flipTimeout && !this.isAnimating) {
            this._scheduleNextFlip();
        }
    }
}

let ambientLight, directionalLight;

// <<<< ОПТИМИЗИРОВАННАЯ ИНИЦИАЛИЗАЦИЯ >>>>
function initThreeScene() {
    const canvas = document.querySelector('#three-canvas');
    if (!canvas) { 
        console.error("Three.js canvas not found!"); 
        return; 
    }
    
    console.log("Initializing Three.js scene...");

    threeScene = new THREE.Scene();
    wheelContainer = new THREE.Group();

    wheelContainer.position.set(
        WHEEL_GEOMETRY_CONFIG.offsetX,
        WHEEL_GEOMETRY_CONFIG.offsetY,
        0
    );

    threeScene.add(wheelContainer);

    threeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    threeCamera.position.z = 200;
    
    threeRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true,
        // <<<< ОПТИМИЗАЦИЯ: Добавляем powerPreference >>>>
        powerPreference: "high-performance"
    });
    
    // Настройка теней
    threeRenderer.shadowMap.enabled = true;
    threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const lightSettings = sceneSettings.lights;
    ambientLight = new THREE.AmbientLight(0xffffff, lightSettings.ambient.intensity);
    threeScene.add(ambientLight);
    
    directionalLight = new THREE.DirectionalLight(0xffffff, lightSettings.directional.intensity);
    directionalLight.position.set(
        lightSettings.directional.position.x,
        lightSettings.directional.position.y,
        lightSettings.directional.position.z
    );
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 50;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -300;
    directionalLight.shadow.camera.right = 300;
    directionalLight.shadow.camera.top = 300;
    directionalLight.shadow.camera.bottom = -300;
    threeScene.add(directionalLight);

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    animateThreeScene();
}

// <<<< ОПТИМИЗИРОВАННАЯ ФУНКЦИЯ >>>>
function addSubtleSceneFilter() {
    const FILTER_CONFIG = {
        darkness: {
            enabled: false,
            intensity: 0.85,
            color: '#000000'
        },
        vignette: {
            enabled: false,
            intensity: 0.2,
            softness: 0.5,
            radius: 0.7
        },
        glow: {
            enabled: false,
            strength: 0.1,
            radius: 0.4,
            threshold: 0.8
        }
    };

    if (effectComposer) {
        const oldComposer = effectComposer;
        effectComposer = null;
        
        if (oldComposer.passes) {
            oldComposer.passes.forEach(pass => {
                if (pass.dispose) pass.dispose();
            });
        }
    }

    effectComposer = new THREE.EffectComposer(threeRenderer);
    
    const renderPass = new THREE.RenderPass(threeScene, threeCamera);
    effectComposer.addPass(renderPass);

    let filterPass = null;
    let bloomPass = null;

    const subtleFilterShader = {
        uniforms: {
            tDiffuse: { value: null },
            darknessEnabled: { value: FILTER_CONFIG.darkness.enabled ? 1.0 : 0.0 },
            darknessIntensity: { value: FILTER_CONFIG.darkness.intensity },
            darknessColor: { value: new THREE.Color(FILTER_CONFIG.darkness.color) },
            vignetteEnabled: { value: FILTER_CONFIG.vignette.enabled ? 1.0 : 0.0 },
            vignetteIntensity: { value: FILTER_CONFIG.vignette.intensity },
            vignetteSoftness: { value: FILTER_CONFIG.vignette.softness },
            vignetteRadius: { value: FILTER_CONFIG.vignette.radius }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float darknessEnabled;
            uniform float darknessIntensity;
            uniform vec3 darknessColor;
            uniform float vignetteEnabled;
            uniform float vignetteIntensity;
            uniform float vignetteSoftness;
            uniform float vignetteRadius;
            varying vec2 vUv;
            
            void main() {
                vec4 texel = texture2D(tDiffuse, vUv);
                vec3 color = texel.rgb;
                
                if (darknessEnabled > 0.5) {
                    color = mix(color, color * darknessColor, darknessIntensity);
                }
                
                if (vignetteEnabled > 0.5) {
                    vec2 center = vec2(0.5, 0.5);
                    float dist = distance(vUv, center);
                    float vignette = smoothstep(vignetteRadius - vignetteSoftness, vignetteRadius + vignetteSoftness, dist);
                    vignette = 1.0 - (vignette * vignetteIntensity);
                    color *= vignette;
                }
                
                gl_FragColor = vec4(color, texel.a);
            }
        `
    };

    if (FILTER_CONFIG.darkness.enabled || FILTER_CONFIG.vignette.enabled) {
        filterPass = new THREE.ShaderPass(subtleFilterShader);
        effectComposer.addPass(filterPass);
    }

    if (FILTER_CONFIG.glow.enabled && FILTER_CONFIG.glow.strength > 0) {
        bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            FILTER_CONFIG.glow.strength,
            FILTER_CONFIG.glow.radius,
            FILTER_CONFIG.glow.threshold
        );
        effectComposer.addPass(bloomPass);
    }

    window.updateSceneFilter = function(params) {
        let needsRecreate = false;

        if (params.darkness && params.darkness.enabled !== undefined) {
            needsRecreate = needsRecreate || (params.darkness.enabled !== FILTER_CONFIG.darkness.enabled);
        }
        if (params.vignette && params.vignette.enabled !== undefined) {
            needsRecreate = needsRecreate || (params.vignette.enabled !== FILTER_CONFIG.vignette.enabled);
        }
        if (params.glow && params.glow.enabled !== undefined) {
            needsRecreate = needsRecreate || (params.glow.enabled !== FILTER_CONFIG.glow.enabled);
        }

        if (params.darkness) Object.assign(FILTER_CONFIG.darkness, params.darkness);
        if (params.vignette) Object.assign(FILTER_CONFIG.vignette, params.vignette);
        if (params.glow) Object.assign(FILTER_CONFIG.glow, params.glow);

        if (needsRecreate) {
            addSubtleSceneFilter();
        } else {
            if (filterPass) {
                filterPass.uniforms.darknessEnabled.value = FILTER_CONFIG.darkness.enabled ? 1.0 : 0.0;
                filterPass.uniforms.darknessIntensity.value = FILTER_CONFIG.darkness.intensity;
                filterPass.uniforms.darknessColor.value = new THREE.Color(FILTER_CONFIG.darkness.color);
                filterPass.uniforms.vignetteEnabled.value = FILTER_CONFIG.vignette.enabled ? 1.0 : 0.0;
                filterPass.uniforms.vignetteIntensity.value = FILTER_CONFIG.vignette.intensity;
                filterPass.uniforms.vignetteSoftness.value = FILTER_CONFIG.vignette.softness;
                filterPass.uniforms.vignetteRadius.value = FILTER_CONFIG.vignette.radius;
            }
            if (bloomPass) {
                bloomPass.strength = FILTER_CONFIG.glow.strength;
                bloomPass.radius = FILTER_CONFIG.glow.radius;
                bloomPass.threshold = FILTER_CONFIG.glow.threshold;
            }
        }
    };

    console.log('Scene filter applied. Current settings:', FILTER_CONFIG);
}

// <<<< ОПТИМИЗИРОВАННАЯ ФУНКЦИЯ >>>>
function updateCanvasSize() {
    const wheelWrapper = document.querySelector('.wheel-wrapper');
    if (!wheelWrapper || !threeRenderer || !threeCamera) return;

    const actualWidth = wheelWrapper.clientWidth;
    const actualHeight = wheelWrapper.clientHeight;

    // <<<< ОПТИМИЗАЦИЯ: Уменьшаем масштаб canvas >>>>
    const CANVAS_SCALE_FACTOR = 1.5; // Было 2
    const canvasWidth = actualWidth * CANVAS_SCALE_FACTOR;
    const canvasHeight = actualHeight * CANVAS_SCALE_FACTOR;

    threeRenderer.setSize(canvasWidth, canvasHeight);
    // <<<< ОПТИМИЗАЦИЯ: Ограничиваем pixel ratio >>>>
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const viewWidth = DESIGN_REFERENCE_WIDTH * CANVAS_SCALE_FACTOR;
    const aspectRatio = canvasWidth / canvasHeight;
    
    threeCamera.left = -viewWidth / 2;
    threeCamera.right = viewWidth / 2;
    threeCamera.top = (viewWidth / aspectRatio) / 2;
    threeCamera.bottom = -(viewWidth / aspectRatio) / 2;

    threeCamera.zoom = actualWidth / DESIGN_REFERENCE_WIDTH;
    threeCamera.updateProjectionMatrix();

    const canvas = threeRenderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    if (spinButton3D && !isButtonAnimating) {
        currentButtonScale = INITIAL_BUTTON_SCALE / threeCamera.zoom;
        spinButton3D.scale.set(currentButtonScale, currentButtonScale, currentButtonScale);
    }

    console.log(`Canvas resized: ${canvasWidth}x${canvasHeight}, Zoom: ${threeCamera.zoom.toFixed(2)}`);
}

function animateThreeScene() {
    requestAnimationFrame(animateThreeScene);
    
    // Используем фиксированный deltaTime для стабильности
    const deltaTime = Math.min(clock.getDelta(), 0.1); // Ограничиваем максимальный deltaTime
    
    // Вызываем winwheelAnimationLoop каждый кадр для плавной интерполяции
    if (wheelSpinning && theWheel) {
        winwheelAnimationLoop();
    }

    if (wheelContainer) {
        wheelContainer.children.forEach(sectorGroup => {
            if (sectorGroup.userData.sectorInstance) {
                sectorGroup.userData.sectorInstance.update(deltaTime);
            }
        });
    }

    // Рендеринг
    if (effectComposer && bloomEnabled) {
        effectComposer.render();
    } else if (threeRenderer && threeScene && threeCamera) {
        threeRenderer.render(threeScene, threeCamera);
    }
}

function create3DSectors(prizes, font) {
    while(wheelContainer.children.length > 0){ 
        wheelContainer.remove(wheelContainer.children[0]); 
    }

    const numSegments = prizes.length;
    if (numSegments === 0) {
        console.error("Cannot create 3D sectors: prizes array is empty.");
        return;
    }

    const segmentDegrees = 360 / numSegments;
    
    console.log(`3D Sectors Debug:
    - Number of segments: ${numSegments}
    - Segment degrees: ${segmentDegrees}`);

    prizes.forEach((prize, index) => {
        const rarity = prize.rarity.toLowerCase();
        const text = prize.localized_name;

        const startAngleDeg = index * segmentDegrees + segmentDegrees;
        const startAngle = THREE.MathUtils.degToRad(-startAngleDeg);
        const angleLength = THREE.MathUtils.degToRad(segmentDegrees);

        console.log(`Sector ${index} (${rarity}): ${text}
        startAngleDeg=${startAngleDeg}, centerAngleDeg=${startAngleDeg + segmentDegrees/2}`);

        const sector = new Sector({
            rarity: rarity,
            text: text,
            startAngle,
            angleLength,
            index: index
        }, font);

        sector.group.userData.sectorInstance = sector;
        sector.group.userData.prizeId = prize.id;
        wheelContainer.add(sector.group);
    });

    console.log("3D sectors created successfully");
}

function create3DSpinButton(faceTexture, sideTexture) {
    const buttonRadius = 74;
    const buttonHeight = 10;

    faceTexture.center.set(0.5, 0.5);
    faceTexture.rotation = 0;
    faceTexture.needsUpdate = true;

    spinButton3D = new THREE.Group();

    const sideGeometry = new THREE.CylinderGeometry(
        buttonRadius, buttonRadius, buttonHeight, 64, 1, true
    );
    const sideMaterial = new THREE.MeshStandardMaterial({ 
        map: sideTexture,
        roughness: 0.6,
        metalness: 0.3
    });
    const sideMesh = new THREE.Mesh(sideGeometry, sideMaterial);
    spinButton3D.add(sideMesh);

    const topGeometry = new THREE.CircleGeometry(buttonRadius, 64);
    spinButtonTopMaterial = new THREE.MeshStandardMaterial({ 
        map: faceTexture,
        roughness: 0.4,
        metalness: 0.2,
        emissive: '#ffc400',
        emissiveIntensity: 0.1,
        emissiveMap: faceTexture,
        transparent: true
    });
    const topMesh = new THREE.Mesh(topGeometry, spinButtonTopMaterial);

    topMesh.position.y = buttonHeight / 2 + 0.1;
    topMesh.rotation.x = -Math.PI / 2;
    spinButton3D.add(topMesh);

    const bottomGeometry = new THREE.CircleGeometry(buttonRadius, 64);
    const bottomMaterial = new THREE.MeshStandardMaterial({ 
        map: sideTexture,
        roughness: 0.6,
        metalness: 0.3
    });
    const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomMesh.position.y = -buttonHeight / 2 - 0.1;
    bottomMesh.rotation.x = Math.PI / 2;
    spinButton3D.add(bottomMesh);

    spinButton3D.position.set(0, 0, 150);
    spinButton3D.rotation.x = Math.PI / 2;
    spinButton3D.scale.set(INITIAL_BUTTON_SCALE, INITIAL_BUTTON_SCALE, INITIAL_BUTTON_SCALE);

    threeScene.add(spinButton3D);
}

function stopAllSectorFlips() {
    if (!wheelContainer) return;
    console.log("Stopping all sector flip animations.");
    wheelContainer.children.forEach(sectorGroup => {
        const sectorInstance = sectorGroup.userData.sectorInstance;
        if (sectorInstance && typeof sectorInstance.stopFlip === 'function') {
            sectorInstance.stopFlip();
        }
    });
}

function resumeAllSectorFlips() {
    if (!wheelContainer) return;
    console.log("Resuming all sector flip animations.");
    wheelContainer.children.forEach(sectorGroup => {
        const sectorInstance = sectorGroup.userData.sectorInstance;
        if (sectorInstance && typeof sectorInstance.resumeFlip === 'function') {
            sectorInstance.resumeFlip();
        }
    });
}

function pulseButtonAnimation() {
    if (spinButtonIdleAnimation) spinButtonIdleAnimation.kill(); 

    if (spinButton3D) {
        spinButton3D.scale.set(currentButtonScale, currentButtonScale, currentButtonScale);

        spinButtonIdleAnimation = TweenMax.to(spinButton3D.scale, 1.5, {
            x: currentButtonScale * 1.05,
            y: currentButtonScale * 1.05,
            z: currentButtonScale * 1.05,
            ease: Power1.easeInOut,
            yoyo: true,
            repeat: -1
        });
    }
}

function startSpinButtonAnimation() {
    if (spinButtonIdleAnimation) spinButtonIdleAnimation.kill(); 
    if (spinButtonSpinningAnimation) spinButtonSpinningAnimation.kill();

    isButtonAnimating = true;

    if (spinButton3D && spinButtonTopMaterial) {
        const fixedScale = currentButtonScale;
        
        const tl = new TimelineMax({
            onStart: function() {
                spinButtonSpinningAnimation = this;
            }
        });

        tl.to(spinButton3D.scale, 0.15, {
            x: fixedScale * 0.85,
            y: fixedScale * 0.85,
            z: fixedScale * 0.85,
            ease: Power2.easeOut
        })
        .to(spinButton3D.scale, 0.4, {
            x: fixedScale,
            y: fixedScale,
            z: fixedScale,
            ease: Elastic.easeOut.config(1, 0.75)
        });

        tl.to(spinButtonTopMaterial, ANIMATION_DURATION_S, {
            emissiveIntensity: 2.0,
            ease: Power1.easeIn
        }, 0);

        tl.to(spinButton3D.scale, 1.0, {
            x: fixedScale * 1.08,
            y: fixedScale * 1.08,
            z: fixedScale * 1.08,
            repeat: Math.floor(ANIMATION_DURATION_S),
            yoyo: true,
            ease: Power1.easeInOut
        }, 0.15);
    }
}

function stopButtonAnimations() {
    if (spinButtonSpinningAnimation) spinButtonSpinningAnimation.kill();
    if (spinButtonIdleAnimation) spinButtonIdleAnimation.kill();
    
    isButtonAnimating = false;

    if (spinButton3D && spinButtonTopMaterial) {
        currentButtonScale = INITIAL_BUTTON_SCALE / threeCamera.zoom;
        TweenMax.to(spinButton3D.scale, 0.8, { 
            x: currentButtonScale, 
            y: currentButtonScale, 
            z: currentButtonScale, 
            ease: Elastic.easeOut.config(1, 0.5) 
        });

        TweenMax.to(spinButtonTopMaterial, 0.5, { 
            emissiveIntensity: 0.1,
            ease: Power2.easeOut 
        });
        
        TweenMax.to(spinButton3D.rotation, 0.5, { 
            z: 0,
            ease: Power2.easeOut 
        });

        pulseButtonAnimation();
    }
}

function createOuterRing(texture) {
    const ringDiameter = LOGICAL_OUTER_RADIUS * 2 * WHEEL_GEOMETRY_CONFIG.outerRingScale;
    const geometry = new THREE.PlaneGeometry(ringDiameter, ringDiameter);
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
    });
    const ringMesh = new THREE.Mesh(geometry, material);
    ringMesh.position.set(
        WHEEL_GEOMETRY_CONFIG.offsetX + WHEEL_GEOMETRY_CONFIG.ringOffsetX,
        WHEEL_GEOMETRY_CONFIG.offsetY + WHEEL_GEOMETRY_CONFIG.ringOffsetY,
        30
    );
    threeScene.add(ringMesh);
    console.log("3D Outer Ring created and added to the scene.");
}

function enableBloomEffect() {
    if (!threeRenderer || !threeScene || !threeCamera) return;
    
    console.log("Enabling bloom effect...");
    
    if (typeof THREE.EffectComposer === 'undefined' || 
        typeof THREE.RenderPass === 'undefined' || 
        typeof THREE.UnrealBloomPass === 'undefined') {
        console.warn("Post-processing classes not available. Bloom disabled.");
        return;
    }
    
    effectComposer = new THREE.EffectComposer(threeRenderer);
    effectComposer.setSize(1680, 1680);

    const renderPass = new THREE.RenderPass(threeScene, threeCamera);
    effectComposer.addPass(renderPass);

    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(1680, 1680), 
        WHEEL_3D_CONFIG.bloom.strength,
        WHEEL_3D_CONFIG.bloom.radius,
        WHEEL_3D_CONFIG.bloom.threshold
    );
    effectComposer.addPass(bloomPass);
    
    console.log("Bloom effect enabled");
}

function verifySectorAlignment() {
    if (!theWheel || !wheelContainer) {
        console.error("Cannot verify: theWheel or wheelContainer not initialized");
        return;
    }

    console.log("=== SECTOR ALIGNMENT VERIFICATION ===");
    console.log(`2D Wheel config:
    - rotationAngle: ${theWheel.rotationAngle}°
    - pointerAngle: ${theWheel.pointerAngle}°
    - numSegments: ${theWheel.numSegments}`);

    console.log("\n2D Sectors (Winwheel):");
    for (let i = 1; i <= theWheel.numSegments; i++) {
        const seg = theWheel.segments[i];
        if (seg) {
            console.log(`  Segment ${i}: ${seg.text} (${seg.rarity})
      startAngle: ${seg.startAngle}°, endAngle: ${seg.endAngle}°
      centerAngle: ${seg.startAngle + (seg.endAngle - seg.startAngle) / 2}°`);
        }
    }

    console.log("\n3D Sectors:");
    wheelContainer.children.forEach((sectorGroup, index) => {
        const sectorInstance = sectorGroup.userData.sectorInstance;
        if (sectorInstance) {
            const centerAngleDeg = THREE.MathUtils.radToDeg(sectorInstance.centerAngle);
            console.log(`  3D Sector ${index}: ${sectorInstance.config.text} (${sectorInstance.config.rarity})
      centerAngle: ${centerAngleDeg}° (${sectorInstance.centerAngle} rad)
      prizeId: ${sectorGroup.userData.prizeId}`);
        }
    });

    console.log("\n3D Container rotation:", {
        x: THREE.MathUtils.radToDeg(wheelContainer.rotation.x),
        y: THREE.MathUtils.radToDeg(wheelContainer.rotation.y), 
        z: THREE.MathUtils.radToDeg(wheelContainer.rotation.z)
    });

    const currentWinningSeg = theWheel.getIndicatedSegment();
    console.log(`\nCurrent winning segment (2D):`, currentWinningSeg ? 
        `${currentWinningSeg.text} (segment ${theWheel.getIndicatedSegmentNumber()})` : 'none');
    
    console.log("==========================================");
}

window.updateIconConfig = function(rarity, config) {
    if (!ICON_CONFIG[rarity]) {
        console.error(`Unknown rarity: ${rarity}`);
        return;
    }
    
    Object.assign(ICON_CONFIG[rarity], config);
    
    if (wheelContainer) {
        wheelContainer.children.forEach(sectorGroup => {
            const sector = sectorGroup.userData.sectorInstance;
            if (sector && sector.config.rarity === rarity && sector.iconMesh) {
                const iconConfig = ICON_CONFIG[rarity];
                
                if (config.size !== undefined) {
                    sector.iconMesh.geometry.dispose();
                    sector.iconMesh.geometry = new THREE.PlaneGeometry(iconConfig.size, iconConfig.size);
                }
                
                if (config.radiusOffset !== undefined) {
                    const iconRadius = LOGICAL_INNER_RADIUS + (LOGICAL_OUTER_RADIUS - LOGICAL_INNER_RADIUS) * iconConfig.radiusOffset;
                    sector.iconMesh.position.x = iconRadius * Math.cos(sector.centerAngle);
                    sector.iconMesh.position.y = iconRadius * Math.sin(sector.centerAngle);
                }
                
                if (config.zOffset !== undefined) {
                    sector.iconMesh.position.z = WHEEL_3D_CONFIG.geometry.depth + iconConfig.zOffset;
                }
                
                if (config.rotationOffset !== undefined) {
                    sector.iconMesh.rotation.z = sector.centerAngle - Math.PI / 2 + iconConfig.rotationOffset;
                }
            }
        });
    }
    
    console.log(`Icon config for ${rarity} updated:`, ICON_CONFIG[rarity]);
};

window.getIconConfig = function(rarity) {
    if (rarity) {
        return ICON_CONFIG[rarity];
    }
    return ICON_CONFIG;
};

window.resetIconConfig = function(rarity) {
    const defaults = {
        mythic: { size: 40, radiusOffset: 0.4, zOffset: 10, rotationOffset: 0 },
        legendary: { size: 35, radiusOffset: 0.4, zOffset: 10, rotationOffset: 0 },
        epic: { size: 30, radiusOffset: 0.4, zOffset: 10, rotationOffset: 0 },
        rare: { size: 25, radiusOffset: 0.4, zOffset: 10, rotationOffset: 0 },
        common: { size: 20, radiusOffset: 0.4, zOffset: 10, rotationOffset: 0 }
    };
    
    if (rarity && defaults[rarity]) {
        ICON_CONFIG[rarity] = { ...defaults[rarity] };
        window.updateIconConfig(rarity, {});
        console.log(`Icon config for ${rarity} reset to defaults`);
    }
};

function setupPrizeNotification() {
    const styles = `
        #prize-notification-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.4s ease-out;
        }
        #prize-notification-overlay.visible {
            display: flex;
            opacity: 1;
        }
        #prize-notification-container {
            position: relative;
            width: 90vw;
            max-width: 450px;
            transform: scale(0.7) translateY(20px);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #prize-notification-overlay.visible #prize-notification-container {
            transform: scale(1) translateY(0);
        }
        .plank-bg {
            display: block;
            width: 100%;
            height: auto;
            user-select: none;
            pointer-events: none;
        }
        .plank-content {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            width: 100%; height: 100%;
        }
        #prize-notification-title,
        #prize-notification-prize-name,
        #prize-notification-button {
            position: absolute;
            left: 50%;
            width: 90%;
            text-align: center;
        }
        #prize-notification-title {
            /* Позиционирование теперь полностью в JS, оставляем только стили текста */
            font-size: clamp(1.2rem, 4.2vw, 1.7rem); /* <<< УВЕЛИЧЕН РАЗМЕР >>> */
            font-weight: 800;
            color: rgb(252,174,5);
            text-transform: uppercase;
            text-shadow: 0 0 8px rgb(255, 183, 0), 0 0 16px rgb(255, 183, 0);
        }
        #prize-notification-prize-name {
            display: flex;
            flex-direction: column; 
            align-items: center;
            justify-content: center;
            margin: auto 0;
            overflow-wrap: break-word;
            font-size: clamp(1.125rem, 4.125vw, 1.65rem);
            font-weight: 900;
            transition: text-shadow 0.3s ease;
        }

        #prize-notification-prize-name span {
            display: block; 
            line-height: 1.2; 
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        #prize-notification-button {
            font-family: ${PRIZE_NOTIFICATION_CONFIG.fontFamily};
            font-size: clamp(1.206rem, 3.6vw, 1.674rem);
            font-weight: 800;
            text-transform: uppercase;
            padding: 3% 10%;
            min-width: 50%;
            max-width: 80%;
            border-radius: 14px;
            border-width: 2px;
            border-style: solid;
            cursor: pointer;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3);
            transition: all 0.2s ease;
        }
        #prize-notification-button:hover {
            transform: translateY(-2px) translateX(-50%);
        }
        #prize-notification-button:active {
            transform: translateY(1px) scale(0.98) translateX(-50%);
        }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    prizeNotificationOverlay = document.createElement('div');
    prizeNotificationOverlay.id = 'prize-notification-overlay';

    prizeNotificationContainer = document.createElement('div');
    prizeNotificationContainer.id = 'prize-notification-container';

    const bgImage = document.createElement('img');
    bgImage.src = PRIZE_NOTIFICATION_CONFIG.assetUrl;
    bgImage.className = 'plank-bg';
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'plank-content';

    prizeNotificationTitle = document.createElement('h2');
    prizeNotificationTitle.id = 'prize-notification-title';

    prizeNotificationPrizeName = document.createElement('p');
    prizeNotificationPrizeName.id = 'prize-notification-prize-name';

    prizeNotificationButton = document.createElement('button');
    prizeNotificationButton.id = 'prize-notification-button';

    contentContainer.append(prizeNotificationTitle, prizeNotificationPrizeName, prizeNotificationButton);
    prizeNotificationContainer.append(bgImage, contentContainer);
    prizeNotificationOverlay.appendChild(prizeNotificationContainer);
    document.body.appendChild(prizeNotificationOverlay);

    prizeNotificationButton.addEventListener('click', async () => {
        hidePrizeNotification();
        await finalizeWin();
    });
}

function showPrizeNotification(prize, rarity) {
    if (!prizeNotificationOverlay || !prize) return;

    if (DEBUG_BOUNDARIES) {
        prizeNotificationPrizeName.style.border = '1px dashed red';
    } else {
        prizeNotificationPrizeName.style.border = 'none';
    }

    document.body.style.overflowX = 'visible';
    document.documentElement.style.overflowX = 'visible';

    const style = rarityStyles[rarity] || rarityStyles.common;
    
    prizeNotificationTitle.textContent = i18n.prize_notification_title || 'ПОЗДРАВЛЯЕМ!';

    // --- НАЧАЛО КЛЮЧЕВОГО ИЗМЕНЕНИЯ ---
    // Используем новое поле 'notification_name' для плашки.
    // Если его нет, для обратной совместимости используем 'localized_name'.
    let prizeText = prize.notification_name || prize.localized_name || prize.name;
    
    // Теперь мы можем просто разделить по '\n', так как автоперенос больше не нужен.
    // Если '\n' нет, то split вернет массив из одного элемента, что тоже правильно.
    let lines = prizeText.split('\n');
    // --- КОНЕЦ КЛЮЧЕВОГО ИЗМЕНЕНИЯ ---
    
    prizeNotificationPrizeName.innerHTML = ''; 
    lines.forEach(line => {
        const span = document.createElement('span');
        span.textContent = line;
        prizeNotificationPrizeName.appendChild(span);
    });

    prizeNotificationButton.textContent = i18n.prize_notification_button || 'ЗАБРАТЬ';
    
    prizeNotificationTitle.style.top = PRIZE_NOTIFICATION_CONFIG.titleTop;
    prizeNotificationTitle.style.transform = `translateX(calc(-50% + ${PRIZE_NOTIFICATION_CONFIG.titleOffsetX}))`;
    prizeNotificationButton.style.bottom = PRIZE_NOTIFICATION_CONFIG.buttonBottom;
    prizeNotificationButton.style.transform = 'translateX(-50%)';

    prizeNotificationPrizeName.style.top = PRIZE_NOTIFICATION_CONFIG.prizeTextTopBoundary;
    prizeNotificationPrizeName.style.bottom = PRIZE_NOTIFICATION_CONFIG.prizeTextBottomBoundary;
    prizeNotificationPrizeName.style.left = PRIZE_NOTIFICATION_CONFIG.prizeTextLeftBoundary;
    prizeNotificationPrizeName.style.width = `calc(100% - ${PRIZE_NOTIFICATION_CONFIG.prizeTextLeftBoundary} - ${PRIZE_NOTIFICATION_CONFIG.prizeTextRightBoundary})`;
    prizeNotificationPrizeName.style.transform = 'none';
    
    prizeNotificationPrizeName.style.background = 'none';
    
    prizeNotificationPrizeName.querySelectorAll('span').forEach(span => {
        if (rarity === 'common') {
            span.style.background = 'none';
            span.style.webkitBackgroundClip = 'initial';
            span.style.webkitTextFillColor = 'initial';
            span.style.color = style.textColor;
            span.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
        } else {
            span.style.background = `linear-gradient(180deg, ${style.textHighlightColor} 40%, ${style.textColor} 100%)`;
            span.style.webkitBackgroundClip = 'text';
            span.style.webkitTextFillColor = 'transparent';
            span.style.textShadow = `0 3px 15px ${style.glow}`;
        }
    });

    prizeNotificationButton.style.background = `linear-gradient(180deg, ${style.gradient[0]} 0%, ${style.gradient[1]} 100%)`;
    prizeNotificationButton.style.borderColor = style.textHighlightColor;
    prizeNotificationButton.style.color = isColorDark(style.gradient[1]) ? '#FFFFFF' : '#000000';
    prizeNotificationButton.style.textShadow = `0 1px 2px rgba(0, 0, 0, 0.4)`;

    prizeNotificationOverlay.style.display = 'flex';
    setTimeout(() => {
        prizeNotificationOverlay.classList.add('visible');
    }, 10); 
}

function isColorDark(color) {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    return luma < 128;
}

function hidePrizeNotification() {
    if (!prizeNotificationOverlay) return;
    
    prizeNotificationOverlay.classList.remove('visible');
    setTimeout(() => {
        prizeNotificationOverlay.style.display = 'none';
        document.body.style.overflowX = '';
        document.documentElement.style.overflowX = '';
    }, 400);
}

async function finalizeWin() {
    if (!spinResultData) return;

    try {
        // Вызов apiFetch('/api/v1/notify-win', ...) был удален.
        // Бэкенд теперь отправляет уведомление автоматически сразу после выигрыша,
        // что предотвращает возможность отправки поддельных уведомлений клиентом.
    } catch (error) {
        // Блок catch оставлен на случай, если в будущем здесь появится другая логика,
        // которая может вызвать ошибку.
        console.error("Error during win finalization:", error);
        tg.showAlert(i18n.alert_sync_error || "Could not save your prize. Please contact support.");
    } finally {
        wheelSpinning = false;
        spinResultData = null;
        stopButtonAnimations();
        resumeAllSectorFlips();
        await loadUserInfo();
    }
}

// <<<< ОПТИМИЗИРОВАННАЯ ФУНКЦИЯ ЗАГРУЗКИ ТЕКСТУР >>>>
async function loadRarityTextures(loader) {
    console.log("Loading rarity textures...");
    const texturePromises = [];
    const rarities = Object.keys(rarityStyles);

    for (const rarity of rarities) {
        const style = rarityStyles[rarity];
        if (style.textureUrl) {
            const promise = loader.loadAsync(style.textureUrl).then(texture => {
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.repeat.set(1, 1);
                texture.offset.set(0, 0);
                texture.rotation = 0;
                
                // <<<< ОПТИМИЗАЦИЯ: Ограничиваем анизотропию >>>>
                const maxAnisotropy = Math.min(threeRenderer.capabilities.getMaxAnisotropy(), 4);
                texture.anisotropy = maxAnisotropy;
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                
                loadedRarityTextures[rarity] = texture;
                console.log(`Texture for ${rarity} loaded with anisotropy: ${maxAnisotropy}`);
            }).catch(err => {
                console.error(`Failed to load texture for ${rarity}:`, err);
            });
            texturePromises.push(promise);
        }
    }

    await Promise.all(texturePromises);
    console.log("All rarity textures loaded successfully.");
}

function setupDebugMenu() {
    const debugStyles = `
        #debug-menu-toggle {
            position: fixed; top: 10px; left: 10px; z-index: 9999;
            background-color: rgba(0,0,0,0.5); color: white; border: 1px solid white;
            border-radius: 50%; width: 40px; height: 40px; font-size: 24px;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        #debug-panel {
            position: fixed; top: 60px; left: 10px; z-index: 9998;
            background-color: #2d3748; color: white; border-radius: 8px;
            width: 320px; max-height: calc(100vh - 80px);
            display: none; flex-direction: column;
            border: 1px solid #4a5568;
            box-shadow: 0 10px 25px rgba(0,0,0,0.4);
        }
        #debug-panel-header {
            padding: 8px 15px;
            background-color: #4a5568;
            cursor: move;
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            user-select: none;
        }
        #debug-panel-header h4 {
            margin: 0;
            font-weight: bold;
            color: white;
        }
        .debug-panel-content {
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        #debug-panel.visible { display: flex; }
        .debug-fieldset { border: 1px solid #4a5568; border-radius: 5px; padding: 10px; }
        .debug-legend { font-weight: bold; color: #a0aec0; }
        .debug-control { display: grid; grid-template-columns: 1fr 2fr; align-items: center; gap: 10px; margin-bottom: 8px; }
        .debug-control label { font-size: 14px; color: #e2e8f0; }
        .debug-control input[type="range"] { width: 100%; }
        .debug-control input[type="color"] { border: none; background: transparent; width: 40px; height: 25px; padding: 0; }
        .debug-tabs { display: flex; border-bottom: 1px solid #4a5568; margin-bottom: 10px; }
        .debug-tab { padding: 8px 12px; cursor: pointer; color: #a0aec0; }
        .debug-tab.active { color: white; border-bottom: 2px solid #3182ce; }
        .debug-tab-content { display: none; }
        .debug-tab-content.active { display: block; }
        .debug-actions { display: flex; gap: 10px; margin-top: 10px; }
        .debug-button {
            flex-grow: 1; padding: 10px; border: none; border-radius: 5px;
            font-weight: bold; cursor: pointer; transition: background-color 0.2s;
        }
        .debug-button-save { background-color: #3182ce; color: white; }
        .debug-button-save:hover { background-color: #2b6cb0; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = debugStyles;
    document.head.appendChild(styleSheet);

    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    
    const rarities = Object.keys(sceneSettings.materials);
    
    panel.innerHTML = `
        <div id="debug-panel-header">
            <h4>⚙️ Настройки Сцены</h4>
        </div>
        <div class="debug-panel-content">
            <fieldset class="debug-fieldset">
                <legend class="debug-legend">Освещение</legend>
                <div class="debug-control">
                    <label for="dir-intensity">Directional Intensity</label>
                    <input type="range" id="dir-intensity" min="0" max="5" step="0.1" value="${sceneSettings.lights.directional.intensity}">
                </div>
                <div class="debug-control">
                    <label for="amb-intensity">Ambient Intensity</label>
                    <input type="range" id="amb-intensity" min="0" max="2" step="0.05" value="${sceneSettings.lights.ambient.intensity}">
                </div>
                <p style="margin: 10px 0 5px; color: #a0aec0;">Directional Position</p>
                <div class="debug-control">
                    <label for="dir-pos-x">X</label>
                    <input type="range" id="dir-pos-x" min="-300" max="300" step="10" value="${sceneSettings.lights.directional.position.x}">
                </div>
                <div class="debug-control">
                    <label for="dir-pos-y">Y</label>
                    <input type="range" id="dir-pos-y" min="-300" max="300" step="10" value="${sceneSettings.lights.directional.position.y}">
                </div>
                <div class="debug-control">
                    <label for="dir-pos-z">Z</label>
                    <input type="range" id="dir-pos-z" min="-300" max="300" step="10" value="${sceneSettings.lights.directional.position.z}">
                </div>
            </fieldset>

            <fieldset class="debug-fieldset">
                <legend class="debug-legend">Материалы Секторов</legend>
                <div class="debug-tabs">
                    ${rarities.map((r, i) => `<div class="debug-tab ${i === 0 ? 'active' : ''}" data-tab="${r}">${r}</div>`).join('')}
                </div>
                <div class="debug-tabs-content">
                    ${rarities.map((r, i) => `
                        <div class="debug-tab-content ${i === 0 ? 'active' : ''}" id="tab-${r}">
                            <div class="debug-control">
                                <label for="mat-${r}-emissive">Emissive Color</label>
                                <input type="color" id="mat-${r}-emissive" value="${sceneSettings.materials[r].emissive}">
                            </div>
                            <div class="debug-control">
                                <label for="mat-${r}-emissiveIntensity">Emissive Intensity</label>
                                <input type="range" id="mat-${r}-emissiveIntensity" min="0" max="2" step="0.05" value="${sceneSettings.materials[r].emissiveIntensity}">
                            </div>
                            <div class="debug-control">
                                <label for="mat-${r}-roughness">Roughness</label>
                                <input type="range" id="mat-${r}-roughness" min="0" max="1" step="0.01" value="${sceneSettings.materials[r].roughness}">
                            </div>
                            <div class="debug-control">
                                <label for="mat-${r}-metalness">Metalness</label>
                                <input type="range" id="mat-${r}-metalness" min="0" max="1" step="0.01" value="${sceneSettings.materials[r].metalness}">
                            </div>
                             <div class="debug-control">
                                <label for="mat-${r}-color">Base Color</label>
                                <input type="color" id="mat-${r}-color" value="${sceneSettings.materials[r].color}">
                            </div>
                        </div>
                    `).join('')}
                </div>
            </fieldset>
            
            <fieldset class="debug-fieldset">
                <legend class="debug-legend">Звук</legend>
                <div class="debug-control">
                    <label for="sound-volume">Громкость вращения</label>
                    <input type="range" id="sound-volume" min="0" max="1" step="0.05" value="${sceneSettings.sound.volume}">
                </div>
            </fieldset>

            <div class="debug-actions">
                <button id="save-settings-btn" class="debug-button debug-button-save">Сохранить на сервере</button>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    const toggleButton = document.createElement('button');
    toggleButton.id = 'debug-menu-toggle';
    toggleButton.innerHTML = '⚙️';
    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('visible');
    });
    document.body.appendChild(toggleButton);

    const tabs = panel.querySelectorAll('.debug-tab');
    const tabContents = panel.querySelectorAll('.debug-tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            panel.querySelector(`#tab-${tab.dataset.tab}`).classList.add('active');
        });
    });

    document.getElementById('dir-intensity').addEventListener('input', e => directionalLight.intensity = parseFloat(e.target.value));
    document.getElementById('amb-intensity').addEventListener('input', e => ambientLight.intensity = parseFloat(e.target.value));
    document.getElementById('dir-pos-x').addEventListener('input', e => directionalLight.position.x = parseFloat(e.target.value));
    document.getElementById('dir-pos-y').addEventListener('input', e => directionalLight.position.y = parseFloat(e.target.value));
    document.getElementById('dir-pos-z').addEventListener('input', e => directionalLight.position.z = parseFloat(e.target.value));
    rarities.forEach(r => {
        const updateMaterial = (prop, value, isColor = false) => {
            wheelContainer.children.forEach(sectorGroup => {
                const sector = sectorGroup.userData.sectorInstance;
                if (sector && sector.config.rarity === r) {
                    if (isColor) {
                        sector.material[prop].set(value);
                    } else {
                        sector.material[prop] = parseFloat(value);
                    }
                }
            });
        };
        document.getElementById(`mat-${r}-emissive`).addEventListener('input', e => updateMaterial('emissive', e.target.value, true));
        document.getElementById(`mat-${r}-emissiveIntensity`).addEventListener('input', e => updateMaterial('emissiveIntensity', e.target.value));
        document.getElementById(`mat-${r}-roughness`).addEventListener('input', e => updateMaterial('roughness', e.target.value));
        document.getElementById(`mat-${r}-metalness`).addEventListener('input', e => updateMaterial('metalness', e.target.value));
        document.getElementById(`mat-${r}-color`).addEventListener('input', e => updateMaterial('color', e.target.value, true));
    });

    document.getElementById('sound-volume').addEventListener('input', e => {
        const newVolume = parseFloat(e.target.value);
        sceneSettings.sound.volume = newVolume;
        if (wheelSpinSound) {
            wheelSpinSound.volume = newVolume;
        }
    });

    document.getElementById('save-settings-btn').addEventListener('click', async () => {
        const currentSettings = { 
            lights: { directional: {}, ambient: {} }, 
            materials: {},
            sound: {}
        };
        currentSettings.lights.directional.intensity = parseFloat(document.getElementById('dir-intensity').value);
        currentSettings.lights.ambient.intensity = parseFloat(document.getElementById('amb-intensity').value);
        currentSettings.lights.directional.position = {
            x: parseFloat(document.getElementById('dir-pos-x').value),
            y: parseFloat(document.getElementById('dir-pos-y').value),
            z: parseFloat(document.getElementById('dir-pos-z').value),
        };
        rarities.forEach(r => {
            currentSettings.materials[r] = {
                emissive: document.getElementById(`mat-${r}-emissive`).value,
                emissiveIntensity: parseFloat(document.getElementById(`mat-${r}-emissiveIntensity`).value),
                roughness: parseFloat(document.getElementById(`mat-${r}-roughness`).value),
                metalness: parseFloat(document.getElementById(`mat-${r}-metalness`).value),
                color: document.getElementById(`mat-${r}-color`).value,
            };
        });
        
        currentSettings.sound.volume = parseFloat(document.getElementById('sound-volume').value);

        console.log("Сохранение настроек:", JSON.stringify(currentSettings, null, 2));
        try {
            await apiFetch('/api/v1/save-scene-settings', {
                method: 'POST',
                body: JSON.stringify(currentSettings)
            });
            alert('Настройки успешно сохранены для всех пользователей!');
        } catch (error) {
            console.error("Ошибка сохранения настроек:", error);
            alert(`Не удалось сохранить настройки: ${error.message}`);
        }
    });

    const header = document.getElementById('debug-panel-header');
    let isDragging = false;
    let offsetX, offsetY;

    const onMouseDown = (e) => {
        isDragging = true;
        e.preventDefault();
        
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        
        panel.style.left = `${e.clientX - offsetX}px`;
        panel.style.top = `${e.clientY - offsetY}px`;
    };

    const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    header.addEventListener('mousedown', onMouseDown);
}

// <<<< НОВАЯ ФУНКЦИЯ: Управление режимом производительности >>>>
window.setPerformanceMode = function(mode) {
    performanceMode = mode;
    
    if (mode === 'low') {
        // Отключаем bloom
        bloomEnabled = false;
        if (effectComposer) effectComposer = null;
        
        // Снижаем качество рендеринга
        threeRenderer.setPixelRatio(1);
        
        // Отключаем тени
        threeRenderer.shadowMap.enabled = false;
        
        // Останавливаем анимацию переворотов секторов
        stopAllSectorFlips();
        
        console.log("Performance mode: LOW - effects disabled");
    } else {
        // Восстанавливаем качество
        bloomEnabled = true;
        enableBloomEffect();
        
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        threeRenderer.shadowMap.enabled = true;
        
        // Возобновляем анимации
        resumeAllSectorFlips();
        
        console.log("Performance mode: NORMAL - all effects enabled");
    }
};

/**
 * Логика для модального окна с информацией о призах в виде аккордеона
 */
function populatePrizeInfo() {
    if (!i18n.prizes || !i18n.rarities) return;

    prizeContentContainer.innerHTML = ''; // Очищаем контейнер

    const rarities = Object.keys(i18n.prizes);

    rarities.forEach((rarity) => {
        // 1. Создаем главный контейнер для элемента аккордеона
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        // 2. Создаем кликабельный заголовок
        const accordionHeader = document.createElement('div');
        accordionHeader.className = 'accordion-header';
        accordionHeader.dataset.rarity = rarity; // Для стилизации цвета и свечения
        accordionHeader.innerHTML = `
            <span>${i18n.rarities[rarity] || rarity}</span>
            <span class="accordion-indicator">▼</span>
        `;
        
        // 3. Создаем контейнер для контента (списка призов)
        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content';

        // 4. Наполняем контент призами
        i18n.prizes[rarity].forEach(prize => {
            const prizeItem = document.createElement('div');
            prizeItem.className = 'prize-item';
            prizeItem.innerHTML = `
                <h4 class="prize-item-name" data-rarity="${rarity}">${prize.name}</h4>
                <p class="prize-item-description">${prize.description}</p>
            `;
            accordionContent.appendChild(prizeItem);
        });

        // 5. Собираем все вместе
        accordionItem.appendChild(accordionHeader);
        accordionItem.appendChild(accordionContent);
        prizeContentContainer.appendChild(accordionItem);
    });

    isPrizeInfoPopulated = true;
}

// Открытие меню
prizeInfoButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (!isPrizeInfoPopulated) {
        populatePrizeInfo();
    }
    prizeOverlay.classList.add('visible');
});

// Закрытие меню
prizeCloseButton.addEventListener('click', () => {
    prizeOverlay.classList.remove('visible');
});

prizeOverlay.addEventListener('click', (e) => {
    if (e.target === prizeOverlay) {
        prizeOverlay.classList.remove('visible');
    }
});

// <<< НОВАЯ ЛОГИКА: Управление аккордеоном через делегирование событий >>>
prizeContentContainer.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (!header) return; // Клик был не по заголовку

    const currentItem = header.parentElement;
    const isAlreadyActive = currentItem.classList.contains('active');

    // Сначала закрываем все открытые элементы
    prizeContentContainer.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
    });

    // Если кликнутый элемент не был активен, открываем его
    if (!isAlreadyActive) {
        currentItem.classList.add('active');
    }
    // Если он был активен, то он уже закрылся на предыдущем шаге, и ничего больше делать не надо
});

/**
 * ===================================================================
 *                 ЛОГИКА ТАБЛИЦЫ ЛИДЕРОВ
 * ===================================================================
 */

// Функция для форматирования времени (как давно был выигрыш)
function formatTimeAgo(dateString) {
    // Проверяем, что i18n и вложенный объект существуют
    if (!i18n || !i18n.time_ago) {
        return dateString;
    }
    try {
        const date = new Date(dateString);
        // Проверка на валидность даты
        if (isNaN(date.getTime())) {
            return dateString;
        }
        const now = new Date();
        const seconds = Math.round((now - date) / 1000);
        const minutes = Math.round(seconds / 60);
        const hours = Math.round(minutes / 60);
        const days = Math.round(hours / 24);

        if (seconds < 60) return i18n.time_ago.now;
        if (minutes < 60) return i18n.time_ago.minutes.replace('{n}', minutes);
        if (hours < 24) return i18n.time_ago.hours.replace('{n}', hours);
        if (days <= 1) return i18n.time_ago.day;
        return i18n.time_ago.days.replace('{n}', days);
    } catch (e) {
        console.error("Error formatting time ago:", e);
        return dateString; // В случае ошибки возвращаем исходную строку
    }
}

// Асинхронная функция для запроса данных и заполнения модального окна
async function populateLeaderboard() {
    if (!leaderboardContent) return;
    
    leaderboardContent.innerHTML = '<div class="loader-spinner" style="margin: 40px auto;"></div>';
    
    try {
        // <<< ИЗМЕНЕНИЕ ЗДЕСЬ: Добавляем уникальный параметр к URL >>>
        // `?_=${Date.now()}` делает URL уникальным при каждом вызове, обходя кеш браузера.
        const leaderboardData = await apiFetch(`/api/v1/leaderboard?_=${Date.now()}`);
        
        leaderboardContent.innerHTML = ''; // Очищаем спиннер

        if (!leaderboardData || leaderboardData.length === 0) {
            leaderboardContent.innerHTML = `<p style="text-align: center; color: #aaa; padding: 20px 0;">${i18n.leaderboard_empty || 'Leaderboard is empty.'}</p>`;
            return;
        }

        leaderboardData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'leaderboard-item';
            const cleanedPrizeName = item.prize_name.replace(/\\/g, ''); 

            div.innerHTML = `
                <span class="leaderboard-prize-name" data-rarity="${item.rarity}">${cleanedPrizeName}</span>
                <span class="leaderboard-timestamp">${formatTimeAgo(item.timestamp)}</span>
            `;
            leaderboardContent.appendChild(div);
        });

    } catch (error) {
        console.error("Failed to load leaderboard:", error);
        leaderboardContent.innerHTML = `<p style="text-align: center; color: #ff6b6b;">Failed to load data.</p>`;
    }
}


// Функция для установки всех обработчиков событий для таблицы лидеров
function setupLeaderboard() {
    if (leaderboardButton) {
        leaderboardButton.addEventListener('click', (e) => {
            e.preventDefault();
            leaderboardOverlay.classList.add('visible');
            populateLeaderboard(); // Загружаем данные при каждом открытии
        });
    }

    if (leaderboardCloseButton) {
        leaderboardCloseButton.addEventListener('click', () => {
            leaderboardOverlay.classList.remove('visible');
        });
    }

    if (leaderboardOverlay) {
        leaderboardOverlay.addEventListener('click', (e) => {
            if (e.target === leaderboardOverlay) {
                leaderboardOverlay.classList.remove('visible');
            }
        });
    }
}

async function main() {
    const loaderOverlay = document.getElementById('loader-overlay');

    try {
        tg.expand();
        textCtx = textCanvas.getContext('2d');
        
        setupPrizeNotification();
        
        const fontLoader = new THREE.FontLoader();
        const textureLoader = new THREE.TextureLoader();

        const config = await apiFetch('/api/v1/wheel-config');
        if (config.scene_settings) {
            console.log("Загружены настройки сцены с сервера.");
            sceneSettings.lights.ambient = {...sceneSettings.lights.ambient, ...config.scene_settings.lights?.ambient};
            sceneSettings.lights.directional = {...sceneSettings.lights.directional, ...config.scene_settings.lights?.directional};
            Object.keys(sceneSettings.materials).forEach(rarity => {
                if(config.scene_settings.materials?.[rarity]) {
                    sceneSettings.materials[rarity] = {...sceneSettings.materials[rarity], ...config.scene_settings.materials[rarity]};
                }
            });
            if (config.scene_settings.sound) {
                sceneSettings.sound = {...sceneSettings.sound, ...config.scene_settings.sound};
            }
        }
        
        initThreeScene();

        wheelSpinSound = new Audio('/sfx/wheel_spinning.mp3');
        wheelSpinSound.loop = true;
        wheelSpinSound.volume = sceneSettings.sound.volume;
        backgroundMusic = new Audio('/sfx/bg_music.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.20;
        winSound = new Audio('/sfx/win.mp3');
        winSound.volume = sceneSettings.sound.volume;
        spinClickSound = new Audio('/sfx/spin_click.mp3');
        spinClickSound.volume = sceneSettings.sound.volume * 0.64;

        // Проверяем флаг is_admin, полученный с бэкенда.
        // Это безопаснее, чем хранить ID на клиенте.
        if (config.is_admin) {
            console.log("Пользователь - администратор. Инициализация дебаг-меню.");
            setupDebugMenu();
        }

        if (config.is_happy_hour) {
            console.log("Happy Hour is active, showing indicator.");
            if (happyHourIndicator) {
                happyHourIndicator.style.display = 'block'; // Показываем индикатор
            }
        } else {
            console.log("Happy Hour is not active.");
            if (happyHourIndicator) {
                happyHourIndicator.style.display = 'none'; // Скрываем индикатор
            }
        }

        await loadRarityTextures(textureLoader);

        const [font, buttonFaceTex, buttonSideTex, mythicIcon, legendaryIcon, epicIcon, outerRingTex] = await Promise.all([
            fontLoader.loadAsync('San_Francisco_Pro.json'),
            textureLoader.loadAsync('img/spin_button.png'),
            textureLoader.loadAsync('img/spin_button_texture.png'),
            textureLoader.loadAsync('/static/textures/mythic_prize.png'),
            textureLoader.loadAsync('/static/textures/legendary_prize.png'),
            textureLoader.loadAsync('/static/textures/epic_prize.png'),
            textureLoader.loadAsync('../static/outer-ring.png')
        ]);
        
        buttonSideTex.repeat.set(1, 1);
        sectorIcons = { mythic: mythicIcon, legendary: legendaryIcon, epic: epicIcon };
        buttonFaceTex.center.set(0.5, 0.5);
        buttonFaceTex.rotation = Math.PI / 2;

        create3DSpinButton(buttonFaceTex, buttonSideTex);
        createOuterRing(outerRingTex);

        wheelConfig = config;
        i18n = wheelConfig.ui_localization || {};
        applyLocalization();
        if (wheelConfig && wheelConfig.prizes) {
            createWheel(wheelConfig.prizes, font);
        } else {
            tg.showAlert(i18n.alert_config_error || 'Could not load wheel configuration.');
        }
        await loadUserInfo();

        pulseButtonAnimation();
        addSubtleSceneFilter();
        setupLeaderboard();
        try {
            await backgroundMusic.play();
        } catch (error) {
            console.warn("Автовоспроизведение фоновой музыки заблокировано браузером. Музыка начнется после первого клика.");
            document.body.addEventListener('click', () => {
                if (backgroundMusic.paused) {
                    backgroundMusic.play();
                }
            }, { once: true });
        }

    } catch (error) {
        console.error("Initialization failed:", error);
        tg.showAlert(`Failed to load data: ${error.message}`);
    } finally {
        if (loaderOverlay) {
            loaderOverlay.classList.add('hidden');
            setTimeout(() => {
                if (loaderOverlay.parentNode) {
                    loaderOverlay.parentNode.removeChild(loaderOverlay);
                }
            }, 600);
        }
        mainContent.style.opacity = 1;
    }
}

document.documentElement.style.setProperty('--ring-scale', WHEEL_GEOMETRY_CONFIG.outerRingScale);

main();