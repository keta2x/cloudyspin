// D:/python projects/seobot_renewed_9_11/seobot/bot\web_app\js\script.js

// <<< НОВОЕ: ID администраторов, которые увидят дебаг-меню >>>
const ADMIN_TELEGRAM_IDS = [329421959, 5259652179, 6835772441];

const tg = window.Telegram.WebApp;
const BACKEND_URL = 'https://cloudyspin.ddns.net';

// DOM-элементы
const spinButton = document.getElementById('spin-button');
const spinButtonText = document.querySelector('#spin-button .button-text');
const spinsCountEl = document.getElementById('spins-count');
const pointsCountEl = document.getElementById('points-count');
const textCanvas = document.getElementById('text-canvas');
const happyHourBanner = document.getElementById('happy-hour-banner');
const happyHourText = document.getElementById('happy-hour-text');
const spinsLabelEl = document.getElementById('spins-label');
const pointsLabelEl = document.getElementById('points-label');
const mainContent = document.querySelector('.main-content');
let preRenderedWheelCanvas = null;
const ANIMATION_DURATION_S = 6;
const PIXEL_RATIO = 4;

// <<< ИСПРАВЛЕНО: Конфиг колеса, который ты предоставил >>>

const WHEEL_LAYOUT = [
    'mythic', 'common', 'rare', 'epic', 'rare', 'common', 
    'legendary', 'common', 'rare', 'common'
];

/*
const WHEEL_LAYOUT = [
    'mythic', 'common', 'rare', 'common','legendary', 'rare', 'common', 
    'rare', 'epic', 'common', 'rare','common'
];
*/

const ICON_CONFIG = {
    mythic: {
        size: 62, // Уменьшили с 70
        radiusOffset: 0.28,
        zOffset: 10,
        rotationOffset: 0,
    },
    legendary: {
        size: 32, // Уменьшили с 40
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
        size: 20, // Уменьшили с 25
        radiusOffset: 0.4,
        zOffset: 10,
        rotationOffset: 0,
    },
    common: {
        size: 16, // Уменьшили с 20
        radiusOffset: 0.4,
        zOffset: 10,
        rotationOffset: 0,
    }
};

const TEXT_BACKGROUND_CONFIG = {
    enabled: true,
    paddingX: 5,        // Минимальный горизонтальный отступ
    paddingY: 5,        // Минимальный вертикальный отступ
    depth: 1.5,         // Толщина плашки
    zOffset: 3,         // Z-смещение от поверхности сектора
    color: '#000000',   
    opacity: 0.2     // Полупрозрачность для лучшей читаемости
};

const WHEEL_OUTER_RADIUS = 192 * PIXEL_RATIO * 0.85;
const WHEEL_INNER_RADIUS = 60 * PIXEL_RATIO * 0.85;
const textBackgroundRingConfig = {
    enabled: true,          // Включить/выключить кольцо
    radiusOffset: -6,        // Смещение радиуса (положительное - наружу, отрицательное - внутрь)
    lineWidth: 70,          // Толщина кольца в пикселях
    color: 'rgba(0, 0, 0, 0.5)', // Основной цвет кольца
    shadow: {
        enabled: true,      // Включить/выключить тень
        color: 'rgba(0, 0, 0, 0.5)', // Цвет тени
        blur: 10,            // Размытие тени
        offsetY: 4          // Вертикальное смещение тени
    }
};

let textCtx; 
let theWheel;
let wheelSpinning = false;
let currentUserInfo = { available_spins: 0, loyalty_points: 0 };
let wheelConfig = {};
let i18n = {};
let spinResultData = null;
let sectorIcons = {}; // Объект для хранения загруженных текстур иконок
let spinButton3D; // Наша 3D-кнопка (THREE.Group)
let spinButtonTopMaterial; // <<< НОВОЕ: Материал для анимации свечения
let spinButtonIdleAnimation; // Анимация пульсации (GSAP)
let spinButtonSpinningAnimation; // Анимация вращения (GSAP)
let loadedRarityTextures = {}; // Глобальное хранилище для текстур
let wheelSpinSound; // <<< НОВОЕ: Переменная для звука вращения колеса
let backgroundMusic;
let winSound;
let spinClickSound;
// <<< НОВОЕ: Константа для начального масштаба кнопки >>>
const INITIAL_BUTTON_SCALE = 0.8;
// В script.js
const rarityStyles = {
    legendary: {
        // ... (все старые свойства остаются)
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
        // <<< НОВОЕ >>>
        textureUrl: '/static/textures/texture_legendary.png'
    },
    epic: {
        // ...
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
        // <<< НОВОЕ >>>
        textureUrl: '/static/textures/texture_epic.png'
    },
    rare: {
        // ...
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
        // <<< НОВОЕ >>>
        textureUrl: '/static/textures/texture_rare.png'
    },
    common: {
        // ...
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
        // <<< НОВОЕ >>>
        textureUrl: '/static/textures/texture_common.png'
    },
    mythic: {
        // ...
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
        // <<< НОВОЕ >>>
        textureUrl: '/static/textures/texture_mythic.png'
    }
};

// <<< ИЗМЕНЕНИЕ: Дефолтные настройки сцены. Они будут перезаписаны настройками с сервера, если те существуют. >>>
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
    // <<< НОВОЕ: Секция для настроек звука >>>
    sound: {
        volume: 0.5 // Громкость по умолчанию (от 0.0 до 1.0)
    }
};


function get3DSectorMaterialConfig(rarity) {
    // <<< НОВЫЙ ВАРИАНТ: Эффект "Космический Опал" для мифического сектора >>>
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

        // <<< УЛЬТРА-ЯРКИЙ ФРАГМЕНТНЫЙ ШЕЙДЕР >>>
        const fragmentShader = `
            uniform float time;
            uniform sampler2D baseTexture;
            varying vec2 vUv;

            // --- Вспомогательные функции ---

            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            // 2D Шум для создания органических узоров
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

            // Fractal Brownian Motion (fbm) - несколько слоев шума для создания "облаков"
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
                // --- Создание яркого, переливающегося эффекта ---

                // 1. Создаем две системы координат для шума, которые движутся в разных направлениях.
                // Это создает сложную, нелинейную анимацию.
                vec2 uv1 = vUv * 2.0; // Масштаб для основного узора
                uv1.x += time * 0.1;

                vec2 uv2 = vUv * 1.5; // Масштаб для искажения
                uv2.y -= time * 0.15;

                // 2. Генерируем основной узор "облаков" с помощью fbm.
                // Мы используем один слой шума, чтобы исказить координаты для другого.
                // Это создает очень красивый эффект завихрения.
                float noise_pattern = fbm(uv1 + fbm(uv2));

                // 3. Превращаем узор в постоянно меняющийся радужный градиент.
                // Hue (оттенок) теперь зависит и от узора, и от времени.
                float hue = fract(noise_pattern + time * 0.2);

                // 4. Устанавливаем МАКСИМАЛЬНУЮ насыщенность (0.95) и яркость (1.0)
                vec3 vibrantColor = hsv2rgb(vec3(hue, 0.95, 1.0));

                // 5. Добавляем "эмиссионное свечение".
                // Участки с высоким значением шума будут светиться еще ярче.
                // pow(noise_pattern, 2.0) делает свечение более контрастным.
                vec3 emissiveGlow = vibrantColor * pow(noise_pattern, 2.0) * 1.2;

                // 6. Смешиваем основной цвет и свечение.
                vec3 finalColor = vibrantColor + emissiveGlow;

                // 7. Загружаем базовую текстуру (если она есть) и умножаем на нее.
                vec4 texColor = texture2D(baseTexture, vUv);
                
                // Это позволяет сохранить детали текстуры, полностью перекрасив их
                // в наш анимированный цвет.
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

    // Старая логика для всех остальных секторов остается без изменений
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
        color: style.gradient[0], // основной цвет сектора (можно попробовать [1] для эксперимента)
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

// Removed drawStyledSectors as it's replaced by 3D rendering.

// Removed drawRarityHighlights as it's replaced by 3D rendering.

// ИСПРАВЛЕННАЯ функция синхронизации 3D и 2D вращения
// Убедитесь, что эта функция только синхронизирует вращение, не меняя масштабы
function winwheelAnimationLoop() {
    if (!theWheel || !wheelContainer) return;
    
    // Очищаем 2D-холст
    const ctx = theWheel.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(theWheel.centerX, theWheel.centerY);
    ctx.rotate(theWheel.degToRad(theWheel.rotationAngle));
    ctx.drawImage(preRenderedWheelCanvas, -theWheel.centerX, -theWheel.centerY);
    ctx.restore();

    // Синхронизация 3D вращения - только rotation, не scale!
    const rotationRad = THREE.MathUtils.degToRad(theWheel.rotationAngle);
    wheelContainer.rotation.z = -rotationRad;
}



// <<< ПОЛНОСТЬЮ ЗАМЕНЯЕМ ОРКЕСТРАТОР >>>
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
        'outerRadius': WHEEL_OUTER_RADIUS, // Kept for internal Winwheel calculations (e.g., text positioning)
        'innerRadius': WHEEL_INNER_RADIUS, // Kept for internal Winwheel calculations (e.g., text positioning)
        'segments': segmentsData, // Kept for Winwheel's internal segment tracking (e.g., getRandomForSegment)
        'drawText': false, // Text will be drawn separately on preRenderedWheelCanvas
        'fillStyle': 'transparent', // No fill needed as 3D handles segments
        'strokeStyle': 'transparent', // No stroke needed as 3D handles segments
        'pointerAngle': -90,
        'rotationAngle': -108,
        'animation': {
            'type': 'spinToStop', 'duration': ANIMATION_DURATION_S, 'spins': 8,
            'easing': 'Power4.easeOut', 'callbackFinished': 'winwheelStopAnimation',
            'callbackAfter': 'winwheelAnimationLoop'
        }
    });

    // Создаем 3D-сектора на основе реальных данных
    create3DSectors(prizes, font); 
    // Настраиваем пустой pre-render холст
    preRenderedWheelCanvas = document.createElement('canvas');
    preRenderedWheelCanvas.width = theWheel.canvas.width;
    preRenderedWheelCanvas.height = theWheel.canvas.height;
    const preRenderCtx = preRenderedWheelCanvas.getContext('2d');
    
    // 3. Рисуем кольцо для текста и сам текст поверх всего
    //drawTextBackgroundRing(theWheel, preRenderCtx);
    //drawWheelText(theWheel, preRenderCtx);
    // --- КОНЕЦ БЛОКА ОПТИМИЗАЦИИ ---

    window.winwheelToDrawDuringAnimation = theWheel;
    window.winwheelStopAnimation = winwheelStopAnimation;
    window.winwheelAnimationLoop = winwheelAnimationLoop;

    winwheelAnimationLoop(); // Вызываем первый раз для отрисовки начального состояния
    setTimeout(() => verifySectorAlignment(), 1000);
    enableBloomEffect();
}

function drawTextBackgroundRing(wheel, ctx) { // <<< ИЗМЕНЕНО
    if (!ctx || !wheel || !textBackgroundRingConfig.enabled) return;

    const baseTextRadius = WHEEL_INNER_RADIUS + (WHEEL_OUTER_RADIUS - WHEEL_INNER_RADIUS) * 0.7; // <<< a. theWheel -> wheel
    const ringRadius = baseTextRadius + (textBackgroundRingConfig.radiusOffset * PIXEL_RATIO);

    ctx.save(); // <<< b. textCtx -> ctx

    // <<< ИЗМЕНЕНО: Умножаем значения из конфига на PIXEL_RATIO >>>
    if (textBackgroundRingConfig.shadow.enabled) {
        ctx.shadowColor = textBackgroundRingConfig.shadow.color;
        ctx.shadowBlur = textBackgroundRingConfig.shadow.blur * PIXEL_RATIO;
        ctx.shadowOffsetY = textBackgroundRingConfig.shadow.offsetY * PIXEL_RATIO;
    }
    ctx.lineWidth = textBackgroundRingConfig.lineWidth * PIXEL_RATIO * 0.85;
    ctx.strokeStyle = textBackgroundRingConfig.color; // Прозрачность кольца регулируется альфа-каналом (последнее значение от 0 до 1) в строке RGBA цвета, определенного в переменной textBackgroundRingConfig.
    ctx.beginPath();
    ctx.arc(wheel.centerX, wheel.centerY, ringRadius, 0, Math.PI * 2, false); // <<< c. theWheel -> wheel
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

        // <<< ИЗМЕНЕНО: Увеличиваем размер и задаем новый шрифт >>>
        const lineHeight = 14 * PIXEL_RATIO; 
        const textRadius = WHEEL_INNER_RADIUS + (WHEEL_OUTER_RADIUS - WHEEL_INNER_RADIUS) * 0.66;

        ctx.save();
        
        // <<< ИЗМЕНЕНО: Применяем шрифт Manrope >>>
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

    // --- НАЧАЛО ИСПРАВЛЕНИЯ: Индивидуальный расчет ширины ---

    // 1. Рассчитываем общий угол, который займет все слово на дуге
    const totalAngle = ctx.measureText(text).width / radius;

    // 2. Поворачиваем холст назад на половину этого угла, чтобы начать рисовать из центра.
    ctx.rotate(-totalAngle / 2);

    for (let i = 0; i < text.length; i++) {
        // 3. В цикле для КАЖДОЙ буквы измеряем ее ИНДИВИДУАЛЬНУЮ ширину
        const char = text[i];
        const charWidth = ctx.measureText(char).width;

        // 4. Рассчитываем ИНДИВИДУАЛЬНЫЙ угол для этой буквы
        const charAngle = charWidth / radius;

        // 5. Поворачиваем холст на половину угла буквы, чтобы ее центр встал на нужную позицию
        ctx.rotate(charAngle / 2);

        // --- Отрисовка свечения и текста (код остается прежним) ---
        ctx.save();
        ctx.translate(0, -radius);

        // Рисуем ауру
        ctx.shadowColor = style.glow;
        ctx.shadowBlur = 15 * PIXEL_RATIO;
        ctx.fillStyle = style.glow;
        ctx.fillText(char, 0, 0);

        // Рисуем четкий текст
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = style.coreColor;
        ctx.fillText(char, 0, 0);

        ctx.restore();
        // --- Конец блока отрисовки ---

        // 6. Поворачиваем холст еще на половину угла текущей буквы, чтобы подготовиться к следующей
        ctx.rotate(charAngle / 2);
    }

    // --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    ctx.restore();
}

spinButton.addEventListener('click', async () => {
    if (wheelSpinning || !theWheel || currentUserInfo.available_spins <= 0) return;

    // Воспроизводим звук нажатия на кнопку
    if (spinClickSound) {
        spinClickSound.currentTime = 0;
        spinClickSound.play();
    }

    // <<< НОВОЕ: Останавливаем анимацию переворотов перед стартом вращения >>>
    stopAllSectorFlips();

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
        // <<< НОВОЕ: Возобновляем анимацию даже в случае ошибки >>>
        resumeAllSectorFlips(); 
        await loadUserInfo();
    }
});

function applyLocalization() {
    document.title = i18n.title || 'CloudySpin';
    spinsLabelEl.textContent = i18n.spins_label || 'spins';
    pointsLabelEl.textContent = i18n.points_label || 'points';
    happyHourText.textContent = i18n.happy_hour_active || 'Happy Hour is active!';
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
    // <<< НОВОЕ: Останавливаем и перематываем звук >>>
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
    const statsPanel = document.querySelector('.stats-panel-wrapper'); // Используем новую обертку

    const animationClass = 'winner-celebration';
    const glowClass = 'winner-glow';
    const animationDuration = 3000; // 3 секунды, как в CSS

    // Добавляем классы для запуска анимаций
    wheelWrapper.classList.add(glowClass);
    spinButton.classList.add(animationClass);
    statsPanel.classList.add(animationClass);
    //mainContent.classList.add(animationClass);

    // Убираем классы после завершения анимации, чтобы она могла сработать снова
    setTimeout(() => {
        wheelWrapper.classList.remove(glowClass);
        spinButton.classList.remove(animationClass);
        statsPanel.classList.remove(animationClass);
        //mainContent.classList.remove(animationClass);
    }, animationDuration);
}


async function handleAnimationFinished() {
    if (!spinResultData) {
        console.error("Spin result data is missing when animation finished.");
        wheelSpinning = false;
        await loadUserInfo();
        return;
    }

    // <<< НОВОЕ: Воспроизводим звук выигрыша >>>
    if (winSound) {
        winSound.currentTime = 0; // Перематываем на начало на случай повторных выигрышей
        winSound.play();
    }

    triggerWinAnimation(); // Запускаем фоновую анимацию празднования
    
    // Находим и приз, и его редкость
    const prize = wheelConfig.prizes.find(p => p.id === spinResultData.prize.id);
    const rarity = prize ? prize.rarity.toLowerCase() : 'common';
    
    if (prize) {
        setTimeout(() => {
            // <<< ИЗМЕНЕНО: Передаем и приз, и его редкость >>>
            showPrizeNotification(prize, rarity);
        }, 500);
    } else {
        console.error("Could not find prize details in wheelConfig for ID:", spinResultData.prize.id);
        // Фоллбэк на случай, если что-то пошло не так
        const winMessage = i18n.alert_win_message 
            ? i18n.alert_win_message.replace('{prize_name}', spinResultData.prize.name) 
            : `Congratulations! You won: ${spinResultData.prize.name}`;
        await tg.showAlert(winMessage);
        await finalizeWin(); // Все равно пытаемся завершить выигрыш
    }
}

function updateUI() {
    // Анимация для спинов
    animateValue(spinsCountEl, parseInt(spinsCountEl.textContent) || 0, currentUserInfo.available_spins, 500);
    
    // <<< ВОССТАНОВЛЕННАЯ СТРОКА: Анимация для очков лояльности >>>
    animateValue(pointsCountEl, parseInt(pointsCountEl.textContent) || 0, currentUserInfo.loyalty_points, 500);
    
    // Логика доступности кнопки
    const canSpin = !wheelSpinning && currentUserInfo.available_spins > 0;
    spinButton.disabled = !canSpin;
    updateSpinButtonText();
    
    // Управление анимацией пульсации кнопки
    if (canSpin) {
        pulseButtonAnimation();
    } else {
        if (spinButtonIdleAnimation) spinButtonIdleAnimation.pause();
        if (!wheelSpinning && spinButton3D) {
            // Устанавливаем базовый масштаб, если спинов нет
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
            
            // Используем встроенный метод Telegram для открытия ссылки
            if (tg && tg.openTelegramLink) {
                tg.openTelegramLink(botUrl);
            } else {
                // Фоллбэк для случаев, когда Web App работает вне Telegram
                window.open(botUrl, '_blank');
            }
        });
    }
});

// Исправленная версия 3D модуля

let threeScene, threeCamera, threeRenderer, effectComposer;
let wheelContainer;
// Добавьте глобальную переменную для хранения текущего компенсированного масштаба
let currentButtonScale = INITIAL_BUTTON_SCALE;
// Добавьте флаг для отслеживания состояния анимации кнопки
let isButtonAnimating = false;
const clock = new THREE.Clock();
// <<< ОБНОВЛЕНО: Конфигурация для плашки с уведомлением о призе >>>
// <<< ОБНОВЛЕНО: Добавляем X-смещение и двигаем кнопку >>>
const PRIZE_NOTIFICATION_CONFIG = {
    assetUrl: 'img/prize_plank.png', 
    aspectRatio: '512 / 288', 
    fontFamily: "'Manrope', sans-serif",

    // --- ПУЛЬТ УПРАВЛЕНИЯ ПОЛОЖЕНИЕМ ---
    titleTop: '28%',
    prizeNameTop: '46%',
    prizeNameOffsetX: '14%', // <<< НОВОЕ: Смещение по горизонтали. '2%' сдвинет вправо.
    buttonBottom: '-15%'      // <<< ИЗМЕНЕНО: Уменьшаем значение, чтобы сдвинуть кнопку ниже.
};

// <<< НОВОЕ: DOM-элементы для уведомления (если удалили, добавьте снова) >>>
let prizeNotificationOverlay = null;
let prizeNotificationContainer = null;
let prizeNotificationTitle = null;
let prizeNotificationPrizeName = null;
let prizeNotificationButton = null;
// <<< ОБНОВЛЕНО: Добавляем отдельные смещения для рамки >>>
const WHEEL_GEOMETRY_CONFIG = {
    // --- Глобальные настройки ---
    // Смещение всего компонента (колесо + рамка)
    offsetX: 0,
    offsetY: 0,

    // --- Настройки 3D-колеса ---
    // Размер секторов, текста и иконок
    innerWheelRadius: 170,
    holeRatio: 0.31, // Соотношение внутреннего отверстия

    // --- Настройки Внешней Рамки ---
    // Масштаб рамки относительно колеса (1.0 = тот же размер)
    outerRingScale: 1.5,
    // Локальное смещение ТОЛЬКО рамки для тонкой подстройки
    ringOffsetX: -14,
    ringOffsetY: -32
};
// --- Конец пульта управления ---

// <<< НОВОЕ: Эталонная ширина, для которой наши 3D размеры идеальны >>>
const DESIGN_REFERENCE_WIDTH = 360; // (в px)
// <<< СТАЛО: Радиусы теперь вычисляются автоматически из пульта управления >>>
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

class Sector {
    constructor(config, font) {
        this.config = config;
        this.font = font;
        this.group = new THREE.Group();
        this.isAnimating = false;
        
        this.textGroup = null;
        this.currentFlipAngle = 0;

        // <<< НОВОЕ: Вектор для определения "мирового" направления сектора >>>
        // Мы создаем его один раз здесь для лучшей производительности.
        this.worldDirectionVector = new THREE.Vector2();

        this.style = rarityStyles[this.config.rarity] || rarityStyles.common;
        this.baseTextColor = new THREE.Color(this.style.textColor);
        this.targetTextColor = new THREE.Color(this.style.glow);
        
        this._createMesh();
        this._createText();
        this._createIcon();
        this._scheduleNextFlip();
    }

    // Обновляем метод _createMesh в классе Sector
    _createMesh() {
        const { startAngle, angleLength, rarity } = this.config;
        const geoConfig = WHEEL_3D_CONFIG.geometry;
        
        const SECTOR_GAP = 0.055; // в радианах
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

        // <<< НАЧАЛО ИСПРАВЛЕНИЯ >>>
        const materialOrConfig = get3DSectorMaterialConfig(rarity);

        if (materialOrConfig instanceof THREE.Material) {
            // Если мы получили готовый материал (например, наш ShaderMaterial для 'mythic'),
            // используем его напрямую.
            this.material = materialOrConfig;
        } else {
            // В противном случае, мы получили объект с настройками.
            // Создаем стандартный MeshPhysicalMaterial, как и раньше.
            const rarityTexture = loadedRarityTextures[rarity];
            const materialProperties = {
                ...materialOrConfig, // Используем полученный конфиг
                map: rarityTexture,  // Добавляем текстуру
            };
            this.material = new THREE.MeshPhysicalMaterial(materialProperties);
        }
        // <<< КОНЕЦ ИСПРАВЛЕНИЯ >>>
        
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

    // Новый метод для создания кастомного UV генератора
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
                
                // Вычисляем UV координаты для каждой вершины
                const uvA = calculatePolarUV(ax, ay, startAngle, angleLength);
                const uvB = calculatePolarUV(bx, by, startAngle, angleLength);
                const uvC = calculatePolarUV(cx, cy, startAngle, angleLength);
                
                return [uvA, uvB, uvC];
            },
            
            generateSideWallUV: function(geometry, vertices, indexA, indexB, indexC, indexD) {
                // Для боковых граней используем простое растягивание текстуры
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
                
                // Определяем, какая это грань
                const isRadialFace = Math.abs(az - bz) < 0.01 && Math.abs(cz - dz) < 0.01;
                
                if (isRadialFace) {
                    // Для радиальных граней (боковые стороны сектора)
                    const u1 = az / WHEEL_3D_CONFIG.geometry.depth;
                    const u2 = cz / WHEEL_3D_CONFIG.geometry.depth;
                    
                    return [
                        new THREE.Vector2(u1, 0),
                        new THREE.Vector2(u1, 1),
                        new THREE.Vector2(u2, 1),
                        new THREE.Vector2(u2, 0)
                    ];
                } else {
                    // Для дуговых граней (внутренняя и внешняя дуги)
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
        
        // Вспомогательная функция для расчета полярных UV координат
        function calculatePolarUV(x, y, startAngle, angleLength) {
            const angle = Math.atan2(y, x);
            const radius = Math.sqrt(x * x + y * y);
            
            // Нормализуем угол относительно сектора
            let normalizedAngle = (angle - startAngle) / angleLength;
            // Убеждаемся, что значение в диапазоне [0, 1]
            normalizedAngle = Math.max(0, Math.min(1, normalizedAngle));
            
            // Нормализуем радиус
            let normalizedRadius = (radius - LOGICAL_INNER_RADIUS) / (LOGICAL_OUTER_RADIUS - LOGICAL_INNER_RADIUS);
            normalizedRadius = Math.max(0, Math.min(1, normalizedRadius));
            
            return new THREE.Vector2(normalizedAngle, normalizedRadius);
        }
    }

    
    update(deltaTime) {
        // Проверяем, является ли материал нашим шейдером, и обновляем время
        if (this.material && this.material.isShaderMaterial) {
            this.material.uniforms.time.value += deltaTime;
        }

        // <<< НАЧАЛО ФИНАЛЬНОГО БЛОКА: Динамический переворот текста с учетом всех поворотов >>>
        if (this.textGroup && wheelContainer) {
            // 1. Устанавливаем вектор в локальное направление сектора (его фиксированное положение внутри колеса).
            this.worldDirectionVector.set(
                Math.cos(this.centerAngle),
                Math.sin(this.centerAngle)
            );

            // 2. Поворачиваем этот вектор на текущий угол вращения всего колеса,
            // чтобы получить его реальное направление на экране.
            this.worldDirectionVector.rotateAround({ x: 0, y: 0 }, wheelContainer.rotation.z);

            // 3. Определяем целевой угол переворота.
            // Если Y-компонента итогового вектора отрицательна, сектор находится в нижней половине экрана.
            // Это самый надежный способ проверки.
            const targetFlipAngle = this.worldDirectionVector.y < 0 ? Math.PI : 0;

            // 4. Плавно интерполируем текущий угол к целевому для гладкой анимации.
            const LERP_SPEED = 15; 
            this.currentFlipAngle = THREE.MathUtils.lerp(this.currentFlipAngle, targetFlipAngle, LERP_SPEED * deltaTime);

            // 5. Применяем итоговый поворот к группе с текстом:
            // базовый поворот (чтобы текст "смотрел" наружу) + плавный переворот.
            this.textGroup.rotation.z = (this.centerAngle - Math.PI / 2) + this.currentFlipAngle;
        }
        // <<< КОНЕЦ ФИНАЛЬНОГО БЛОКА >>>

        // Анимация для текста и иконок (старая логика остается без изменений)
        const time = (this.time || 0) + deltaTime;
        this.time = time; 
        const pulse = (Math.sin(time * 2) + 1) / 2;

        if (this.textMaterial) {
            const currentTextColor = this.baseTextColor.clone().lerp(this.targetTextColor, pulse);
            this.textMaterial.color.copy(currentTextColor);
            
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
    
        const fontSize = 11;
        const lineHeight = 19;
        const textRadius = LOGICAL_INNER_RADIUS + (LOGICAL_OUTER_RADIUS - LOGICAL_INNER_RADIUS) * 0.67;
    
        // <<< ИЗМЕНЕНИЕ: Сохраняем группу в свойство класса >>>
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
    
            // <<< ИЗМЕНЕНИЕ: Добавляем в this.textGroup >>>
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
    
        // <<< ИЗМЕНЕНИЕ: Убрана логика переворота. Устанавливаем только базовый поворот. >>>
        this.textGroup.rotation.z = this.centerAngle - Math.PI / 2;
    
        // Создаем плашки и добавляем их в ту же группу
        this._createTextBackgrounds(lineData, this.textGroup);
    
        // Добавляем готовую группу в основную группу сектора
        this.group.add(this.textGroup);
    }
    
    /**
     * Создает индивидуальные плашки для каждой строки, используя те же координаты что и текст
     */
    _createTextBackgrounds(lineData, textGroup) {
        if (!TEXT_BACKGROUND_CONFIG.enabled) return;
        const config = TEXT_BACKGROUND_CONFIG;
    
        lineData.forEach(({ yOffset, width, height }) => {
            const plateWidth = width + config.paddingX;
            const plateHeight = height + config.paddingY;
            const radius = Math.min(plateHeight, plateWidth) * 0.25; // 25% радиус, можно менять
        
            // Новый способ:
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
        // <<< ИЗМЕНЕНИЕ: Увеличиваем задержку для наглядности и снижения нагрузки >>>
        const randomDelay = 3000 + Math.random() * 2000; // от 3 до 5 секунд
        this.flipTimeout = setTimeout(() => this.triggerFlip(), randomDelay);
    }

    // <<< НОВЫЙ МЕТОД: Останавливает запланированный переворот >>>
    stopFlip() {
        if (this.flipTimeout) {
            clearTimeout(this.flipTimeout);
            this.flipTimeout = null;
        }
    }

    // <<< НОВЫЙ МЕТОД: Возобновляет цикл анимации переворота >>>
    resumeFlip() {
        // Не запускаем новый, если таймер уже есть или сектор сейчас анимируется
        if (!this.flipTimeout && !this.isAnimating) {
            this._scheduleNextFlip();
        }
    }

}



// <<< ИЗМЕНЕНИЕ: Глобальные переменные для доступа к источникам света >>>
let ambientLight, directionalLight;

// ИСПРАВЛЕННАЯ ФУНКЦИЯ ИНИЦИАЛИЗАЦИИ
function initThreeScene() {
    const canvas = document.querySelector('#three-canvas');
    if (!canvas) { 
        console.error("Three.js canvas not found!"); 
        return; 
    }
    
    console.log("Initializing Three.js scene...");

    threeScene = new THREE.Scene();
    wheelContainer = new THREE.Group();

    // <<< НОВОЕ: Применяем ГЛОБАЛЬНОЕ смещение ко всему контейнеру >>>
    wheelContainer.position.set(
        WHEEL_GEOMETRY_CONFIG.offsetX,
        WHEEL_GEOMETRY_CONFIG.offsetY,
        0 // Смещение по Z для всей группы не нужно
    );

    threeScene.add(wheelContainer);

    // Камеру создаем здесь, но настраиваем в updateCanvasSize
    // Начальные значения frustum не важны, они сразу же обновятся
    threeCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
    threeCamera.position.z = 200;
    
    threeRenderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    
    // Настройка теней и освещения (можно будет оптимизировать позже)
    threeRenderer.shadowMap.enabled = true;
    threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // <<< ИЗМЕНЕНИЕ: Используем глобальные переменные и настройки из sceneSettings >>>
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

    // Добавляем слушатель на изменение размера окна
    window.addEventListener('resize', updateCanvasSize);
    // Вызываем функцию один раз при инициализации, чтобы задать начальные размеры
    updateCanvasSize();

    animateThreeScene();
}

// Исправленная функция для добавления фильтров
function addSubtleSceneFilter() {
    // Конфигурация эффектов
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

    // Сначала отключаем старый bloom эффект, если он есть
    if (effectComposer) {
        // Сохраняем ссылку на старый composer
        const oldComposer = effectComposer;
        effectComposer = null;
        
        // Очищаем старые пассы
        if (oldComposer.passes) {
            oldComposer.passes.forEach(pass => {
                if (pass.dispose) pass.dispose();
            });
        }
    }

    // Создаем новый composer
    effectComposer = new THREE.EffectComposer(threeRenderer);
    
    // Всегда добавляем базовый render pass
    const renderPass = new THREE.RenderPass(threeScene, threeCamera);
    effectComposer.addPass(renderPass);

    // Переменная для хранения ссылки на filter pass
    let filterPass = null;
    let bloomPass = null;

    // Шейдер для затемнения и виньетки
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
                
                // Применяем затемнение только если включено
                if (darknessEnabled > 0.5) {
                    color = mix(color, color * darknessColor, darknessIntensity);
                }
                
                // Применяем виньетку только если включена
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

    // Добавляем фильтр только если хотя бы один эффект включен
    if (FILTER_CONFIG.darkness.enabled || FILTER_CONFIG.vignette.enabled) {
        filterPass = new THREE.ShaderPass(subtleFilterShader);
        effectComposer.addPass(filterPass);
    }

    // Добавляем bloom только если включен
    if (FILTER_CONFIG.glow.enabled && FILTER_CONFIG.glow.strength > 0) {
        bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            FILTER_CONFIG.glow.strength,
            FILTER_CONFIG.glow.radius,
            FILTER_CONFIG.glow.threshold
        );
        effectComposer.addPass(bloomPass);
    }

    // Функция для обновления параметров
    window.updateSceneFilter = function(params) {
        let needsRecreate = false;

        // Проверяем, нужно ли пересоздать composer
        if (params.darkness && params.darkness.enabled !== undefined) {
            needsRecreate = needsRecreate || (params.darkness.enabled !== FILTER_CONFIG.darkness.enabled);
        }
        if (params.vignette && params.vignette.enabled !== undefined) {
            needsRecreate = needsRecreate || (params.vignette.enabled !== FILTER_CONFIG.vignette.enabled);
        }
        if (params.glow && params.glow.enabled !== undefined) {
            needsRecreate = needsRecreate || (params.glow.enabled !== FILTER_CONFIG.glow.enabled);
        }

        // Обновляем конфигурацию
        if (params.darkness) Object.assign(FILTER_CONFIG.darkness, params.darkness);
        if (params.vignette) Object.assign(FILTER_CONFIG.vignette, params.vignette);
        if (params.glow) Object.assign(FILTER_CONFIG.glow, params.glow);

        if (needsRecreate) {
            // Пересоздаем composer с новыми настройками
            addSubtleSceneFilter();
        } else {
            // Обновляем существующие параметры
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

// Обновляем функцию анимации для использования EffectComposer
function updateRenderFunction() {
    // Заменяем прямой рендеринг на композитор в animateThreeScene
    const originalAnimate = animateThreeScene;
    window.animateThreeScene = function() {
        requestAnimationFrame(animateThreeScene);
        const deltaTime = clock.getDelta();

        if (wheelContainer) {
            wheelContainer.children.forEach(sectorGroup => {
                if (sectorGroup.userData.sectorInstance) {
                    sectorGroup.userData.sectorInstance.update(deltaTime);
                }
            });
        }

        // Используем EffectComposer вместо прямого рендеринга
        if (effectComposer) {
            effectComposer.render();
        } else if (threeRenderer && threeScene && threeCamera) {
            threeRenderer.render(threeScene, threeCamera);
        }
    };
}

/**
 * <<< ПОЛНОСТЬЮ ПЕРЕРАБОТАНА ДЛЯ АДАПТИВНОГО МАСШТАБА >>>
 * Обновляет размер рендерера и МАСШТАБ камеры для идеального вписывания.
 */
// Обновляем функцию updateCanvasSize для увеличения области рендеринга
function updateCanvasSize() {
    const wheelWrapper = document.querySelector('.wheel-wrapper');
    if (!wheelWrapper || !threeRenderer || !threeCamera) return;

    const actualWidth = wheelWrapper.clientWidth;
    const actualHeight = wheelWrapper.clientHeight;

    // Увеличиваем размер canvas для предотвращения обрезки
    const CANVAS_SCALE_FACTOR = 2; // Увеличиваем canvas в 1.5 раза
    const canvasWidth = actualWidth * CANVAS_SCALE_FACTOR;
    const canvasHeight = actualHeight * CANVAS_SCALE_FACTOR;

    threeRenderer.setSize(canvasWidth, canvasHeight);
    threeRenderer.setPixelRatio(window.devicePixelRatio);

    // Настраиваем камеру с учетом увеличенной области
    const viewWidth = DESIGN_REFERENCE_WIDTH * CANVAS_SCALE_FACTOR;
    const aspectRatio = canvasWidth / canvasHeight;
    
    threeCamera.left = -viewWidth / 2;
    threeCamera.right = viewWidth / 2;
    threeCamera.top = (viewWidth / aspectRatio) / 2;
    threeCamera.bottom = -(viewWidth / aspectRatio) / 2;

    threeCamera.zoom = actualWidth / DESIGN_REFERENCE_WIDTH;
    threeCamera.updateProjectionMatrix();

    // Обновляем стили canvas для центрирования
    const canvas = threeRenderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.left = '50%';
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // ОБНОВЛЕНО: Не меняем масштаб кнопки во время её анимации
    if (spinButton3D && !isButtonAnimating) {
        currentButtonScale = INITIAL_BUTTON_SCALE / threeCamera.zoom;
        spinButton3D.scale.set(currentButtonScale, currentButtonScale, currentButtonScale);
    }

    console.log(`Canvas resized: ${canvasWidth}x${canvasHeight}, Zoom: ${threeCamera.zoom.toFixed(2)}`);
}

// Также добавьте CSS для wheel-wrapper, чтобы разрешить overflow



function animateThreeScene() {
    requestAnimationFrame(animateThreeScene);
    const deltaTime = clock.getDelta();

    if (wheelContainer) {
        wheelContainer.children.forEach(sectorGroup => {
            if (sectorGroup.userData.sectorInstance) {
                sectorGroup.userData.sectorInstance.update(deltaTime);
            }
        });
    }

    // Рендерим сцену без изменения параметров камеры или объектов
    if (threeRenderer && threeScene && threeCamera) {
        threeRenderer.render(threeScene, threeCamera);
    }
}

function create3DSectors(prizes, font) {
    // Очищаем предыдущие сектора
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

    // Создаем сектора в том же порядке, что и в 2D
    prizes.forEach((prize, index) => {
        const rarity = prize.rarity.toLowerCase();
        const text = prize.localized_name;

        // Добавляем смещение на один сегмент (36°) по часовой стрелке
        const startAngleDeg = index * segmentDegrees + segmentDegrees; // Вычитаем один сегмент
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

/**
 * Создает и добавляет в сцену 3D модель кнопки SPIN.
 * @param {THREE.Texture} faceTexture - Текстура для лицевой стороны.
 * @param {THREE.Texture} sideTexture - Текстура для боковых и задней сторон.
 */
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

    // <<< ИЗМЕНЕНИЕ: Сохраняем материал в нашу новую переменную >>>
    const topGeometry = new THREE.CircleGeometry(buttonRadius, 64);
    spinButtonTopMaterial = new THREE.MeshStandardMaterial({ 
        map: faceTexture,
        roughness: 0.4,
        metalness: 0.2,
        emissive: '#ffc400',
        emissiveIntensity: 0.1, // Начальная интенсивность
        emissiveMap: faceTexture,
        transparent: true
    });
    const topMesh = new THREE.Mesh(topGeometry, spinButtonTopMaterial);
    // <<< КОНЕЦ ИЗМЕНЕНИЯ >>>

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

/**
 * <<< НОВАЯ ФУНКЦИЯ >>>
 * Останавливает анимацию переворота для всех секторов на колесе.
 */
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

/**
 * <<< НОВАЯ ФУНКЦИЯ >>>
 * Возобновляет анимацию переворота для всех секторов на колесе.
 */
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

/**
 * Запускает плавную анимацию пульсации для 3D-кнопки (состояние ожидания).
 * ИСПОЛЬЗУЕТ СИНТАКСИС GSAP v2 (TweenMax).
 */
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

/**
 * <<< ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ >>>
 * Гарантирует отсутствие конфликтов анимаций во время вращения.
 */
/**
 * <<< ПОЛНОСТЬЮ ПЕРЕРАБОТАНА >>>
 * Запускает сложную анимацию нажатия и накопления энергии.
 */
function startSpinButtonAnimation() {
    // 1. Убиваем все предыдущие анимации кнопки, чтобы избежать конфликтов
    if (spinButtonIdleAnimation) spinButtonIdleAnimation.kill(); 
    if (spinButtonSpinningAnimation) spinButtonSpinningAnimation.kill();

    isButtonAnimating = true;

    if (spinButton3D && spinButtonTopMaterial) {
        const fixedScale = currentButtonScale; // Фиксируем масштаб на момент начала анимации
        
        // 2. Создаем новую временную шкалу для управления всей анимацией
        const tl = new TimelineMax({
            // Сохраняем эту шкалу в глобальную переменную, чтобы ее можно было остановить
            onStart: function() {
                spinButtonSpinningAnimation = this;
            }
        });

        // --- ФАЗА 1: Эффект "Вдавливания" ---
        // Кнопка быстро вдавливается...
        tl.to(spinButton3D.scale, 0.15, {
            x: fixedScale * 0.85,
            y: fixedScale * 0.85,
            z: fixedScale * 0.85,
            ease: Power2.easeOut
        })
        // ...и тут же "отпружинивает" обратно к своему нормальному размеру
        .to(spinButton3D.scale, 0.4, {
            x: fixedScale,
            y: fixedScale,
            z: fixedScale,
            ease: Elastic.easeOut.config(1, 0.75)
        });

        // --- ФАЗА 2: Накопление энергии (запускается ПАРАЛЛЕЛЬНО с фазой 1) ---
        
        // а) Нарастающее свечение: плавно увеличиваем emissiveIntensity за все время вращения колеса.
        // Используем ease: Power1.easeIn, чтобы энергия нарастала медленно вначале и быстрее к концу.
        tl.to(spinButtonTopMaterial, ANIMATION_DURATION_S, {
            emissiveIntensity: 2.0, // Финальная, очень яркая интенсивность
            ease: Power1.easeIn
        }, 0); // "0" означает, что эта анимация начнется в самом начале шкалы (в 0 секунд)

        // б) Мощная пульсация: кнопка медленно "дышит" энергией.
        // Эта анимация повторяется на протяжении всего вращения колеса.
        tl.to(spinButton3D.scale, 1.0, { // Длительность одного цикла пульсации - 1 секунда
            x: fixedScale * 1.08, // Немного увеличивается
            y: fixedScale * 1.08,
            z: fixedScale * 1.08,
            repeat: Math.floor(ANIMATION_DURATION_S), // Повторяем почти до конца
            yoyo: true, // Возвращаемся к исходному масштабу
            ease: Power1.easeInOut // Плавный вдох-выдох
        }, 0.15); // Начинаем пульсацию сразу после вдавливания
    }
}

/**
 * <<< ОБНОВЛЕНО >>>
 * Корректно останавливает новую сложную анимацию и плавно возвращает кнопку в состояние покоя.
 */
function stopButtonAnimations() {
    // 1. Убиваем основную временную шкалу анимации вращения. Это остановит и свечение, и пульсацию.
    if (spinButtonSpinningAnimation) spinButtonSpinningAnimation.kill();
    // Также на всякий случай убиваем анимацию покоя.
    if (spinButtonIdleAnimation) spinButtonIdleAnimation.kill();
    
    isButtonAnimating = false;

    if (spinButton3D && spinButtonTopMaterial) {
        // 2. Плавно возвращаем все анимированные параметры в их состояние по умолчанию.
        
        // Возвращаем масштаб к нормальному с приятным эластичным эффектом.
        currentButtonScale = INITIAL_BUTTON_SCALE / threeCamera.zoom;
        TweenMax.to(spinButton3D.scale, 0.8, { 
            x: currentButtonScale, 
            y: currentButtonScale, 
            z: currentButtonScale, 
            ease: Elastic.easeOut.config(1, 0.5) 
        });

        // Возвращаем интенсивность свечения к значению по умолчанию.
        TweenMax.to(spinButtonTopMaterial, 0.5, { 
            emissiveIntensity: 0.1,
            ease: Power2.easeOut 
        });
        
        // Сбрасываем поворот, если он был (на всякий случай, если старая логика где-то осталась).
        TweenMax.to(spinButton3D.rotation, 0.5, { 
            z: 0,
            ease: Power2.easeOut 
        });

        // 3. Перезапускаем стандартную анимацию пульсации в состоянии покоя.
        pulseButtonAnimation();
    }
}

/**
 * <<< ФИНАЛЬНАЯ ВЕРСИЯ >>>
 * Создает 3D-плоскость для внешней рамки и добавляет ее в сцену.
 * @param {THREE.Texture} texture - Загруженная текстура для outer-ring.png
 */
function createOuterRing(texture) {
    // 1. Определяем размер плоскости (без изменений)
    const ringDiameter = LOGICAL_OUTER_RADIUS * 2 * WHEEL_GEOMETRY_CONFIG.outerRingScale;

    // 2. Создаем геометрию (без изменений)
    const geometry = new THREE.PlaneGeometry(ringDiameter, ringDiameter);

    // 3. Создаем материал (без изменений)
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
    });

    // 4. Создаем сам 3D-объект (Mesh) (без изменений)
    const ringMesh = new THREE.Mesh(geometry, material);

    // 5. <<< ИЗМЕНЕНИЕ 1: Позиционируем рамку с учетом ВСЕХ смещений >>>
    // Так как рамка теперь будет в главной сцене, ее позиция должна учитывать
    // и глобальное смещение всего компонента, и ее собственное локальное смещение.
    ringMesh.position.set(
        WHEEL_GEOMETRY_CONFIG.offsetX + WHEEL_GEOMETRY_CONFIG.ringOffsetX,
        WHEEL_GEOMETRY_CONFIG.offsetY + WHEEL_GEOMETRY_CONFIG.ringOffsetY,
        30 // z-index: 30 единиц, чтобы быть поверх всего
    );

    // 6. <<< ИЗМЕНЕНИЕ 2: Добавляем рамку в ГЛАВНУЮ СЦЕНУ, а не во вращающийся контейнер >>>
    threeScene.add(ringMesh);

    console.log("3D Outer Ring created and added to the scene.");
}

// ФУНКЦИЯ ДЛЯ ВКЛЮЧЕНИЯ BLOOM ПОСЛЕ ПРОВЕРКИ БАЗОВОГО РЕНДЕРИНГА
function enableBloomEffect() {
    if (!threeRenderer || !threeScene || !threeCamera) return;
    
    console.log("Enabling bloom effect...");
    
    // Проверяем доступность классов post-processing
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

    // Проверяем, какой сектор сейчас под указателем
    const currentWinningSeg = theWheel.getIndicatedSegment();
    console.log(`\nCurrent winning segment (2D):`, currentWinningSeg ? 
        `${currentWinningSeg.text} (segment ${theWheel.getIndicatedSegmentNumber()})` : 'none');
    
    console.log("==========================================");
}

// ВЫЗОВИТЕ ЭТУ ФУНКЦИЮ В КОНСОЛИ ДЛЯ ВКЛЮЧЕНИЯ BLOOM ПОСЛЕ ПРОВЕРКИ:
// enableBloomEffect();

// Добавим вспомогательные функции для настройки иконок
window.updateIconConfig = function(rarity, config) {
    if (!ICON_CONFIG[rarity]) {
        console.error(`Unknown rarity: ${rarity}`);
        return;
    }
    
    // Обновляем конфигурацию
    Object.assign(ICON_CONFIG[rarity], config);
    
    // Применяем изменения к существующим иконкам
    if (wheelContainer) {
        wheelContainer.children.forEach(sectorGroup => {
            const sector = sectorGroup.userData.sectorInstance;
            if (sector && sector.config.rarity === rarity && sector.iconMesh) {
                const iconConfig = ICON_CONFIG[rarity];
                
                // Обновляем размер
                if (config.size !== undefined) {
                    sector.iconMesh.geometry.dispose();
                    sector.iconMesh.geometry = new THREE.PlaneGeometry(iconConfig.size, iconConfig.size);
                }
                
                // Обновляем позицию
                if (config.radiusOffset !== undefined) {
                    const iconRadius = LOGICAL_INNER_RADIUS + (LOGICAL_OUTER_RADIUS - LOGICAL_INNER_RADIUS) * iconConfig.radiusOffset;
                    sector.iconMesh.position.x = iconRadius * Math.cos(sector.centerAngle);
                    sector.iconMesh.position.y = iconRadius * Math.sin(sector.centerAngle);
                }
                
                // Обновляем высоту
                if (config.zOffset !== undefined) {
                    sector.iconMesh.position.z = WHEEL_3D_CONFIG.geometry.depth + iconConfig.zOffset;
                }
                
                // Обновляем поворот
                if (config.rotationOffset !== undefined) {
                    sector.iconMesh.rotation.z = sector.centerAngle - Math.PI / 2 + iconConfig.rotationOffset;
                }
            }
        });
    }
    
    console.log(`Icon config for ${rarity} updated:`, ICON_CONFIG[rarity]);
};

// Функция для получения текущей конфигурации
window.getIconConfig = function(rarity) {
    if (rarity) {
        return ICON_CONFIG[rarity];
    }
    return ICON_CONFIG;
};

// Функция для сброса конфигурации к значениям по умолчанию
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

/**
 * <<< ИСПРАВЛЕННАЯ ВЕРСИЯ >>>
 * Использует display: none для надежного скрытия оверлея.
 */
function setupPrizeNotification() {
    // 1. Создаем CSS стили
    const styles = `
        #prize-notification-overlay {
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(8px);
            display: none; /* Изначально полностью скрыт */
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
            /* <<< УДАЛЕНО: Соотношение сторон теперь определяется самим изображением, чтобы избежать обрезки. */
            /* aspect-ratio: ${PRIZE_NOTIFICATION_CONFIG.aspectRatio}; */
            transform: scale(0.7) translateY(20px);
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        #prize-notification-overlay.visible #prize-notification-container {
            transform: scale(1) translateY(0);
        }
        .plank-bg {
            /* <<< ИЗМЕНЕНО: Изображение теперь в потоке документа и задает высоту контейнеру, сохраняя свои пропорции. */
            display: block;
            width: 100%;
            height: auto;
            user-select: none;
            pointer-events: none;
        }
        .plank-content {
            /* <<< ИЗМЕНЕНО: Контент абсолютно позиционируется поверх изображения. */
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
            font-size: clamp(1.1rem, 4vw, 1.6rem);
            font-weight: 800;
            color: rgb(252,174,5);
            text-transform: uppercase;
            text-shadow: 0 0 8px rgb(255, 183, 0), 0 0 16px rgb(255, 183, 0);
        }
        #prize-notification-prize-name {
            font-size: clamp(1.4rem, 5vw, 2rem);
            font-weight: 900;
            line-height: 1.2;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            transition: text-shadow 0.3s ease;
            word-break: break-word;
        }
        #prize-notification-button {
            font-family: ${PRIZE_NOTIFICATION_CONFIG.fontFamily};
            font-size: clamp(1rem, 3.8vw, 1.4rem);
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

    // 2. Создаем HTML-элементы (без изменений)
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

    // 3. Собираем структуру и добавляем на страницу (без изменений)
    contentContainer.append(prizeNotificationTitle, prizeNotificationPrizeName, prizeNotificationButton);
    prizeNotificationContainer.append(bgImage, contentContainer);
    prizeNotificationOverlay.appendChild(prizeNotificationContainer);
    document.body.appendChild(prizeNotificationOverlay);

    // 4. Назначаем обработчик на кнопку (без изменений)
    prizeNotificationButton.addEventListener('click', async () => {
        hidePrizeNotification();
        await finalizeWin();
    });
}

/**
 * <<< ОБНОВЛЕНО: Показывает уведомление и стилизует его под редкость приза >>>
 * @param {object} prize - Объект приза из конфига (содержит localized_name).
 * @param {string} rarity - Строка с редкостью ('legendary', 'epic', и т.д.).
 */
function showPrizeNotification(prize, rarity) {
    if (!prizeNotificationOverlay || !prize) return;

    // <<< ФИКС: Временно разрешаем контенту выходить за горизонтальные границы >>>
    // Это предотвратит обрезку во время анимации масштабирования.
    document.body.style.overflowX = 'visible';
    document.documentElement.style.overflowX = 'visible';

    const style = rarityStyles[rarity] || rarityStyles.common;
    
    // Заполнение контента
    prizeNotificationTitle.textContent = i18n.prize_notification_title || 'ПОЗДРАВЛЯЕМ!';
    prizeNotificationPrizeName.textContent = prize.localized_name || prize.name;
    prizeNotificationButton.textContent = i18n.prize_notification_button || 'ЗАБРАТЬ';
    
    // Позиционирование элементов (без изменений)
    prizeNotificationTitle.style.top = PRIZE_NOTIFICATION_CONFIG.titleTop;
    prizeNotificationTitle.style.transform = 'translateX(-50%)';
    prizeNotificationPrizeName.style.top = PRIZE_NOTIFICATION_CONFIG.prizeNameTop;
    prizeNotificationPrizeName.style.transform = `translateX(calc(-50% + ${PRIZE_NOTIFICATION_CONFIG.prizeNameOffsetX}))`;
    prizeNotificationButton.style.bottom = PRIZE_NOTIFICATION_CONFIG.buttonBottom;
    prizeNotificationButton.style.transform = 'translateX(-50%)';

    // --- РЕШЕНИЕ: Разделяем стилизацию для common и остальных редкостей ---
    if (rarity === 'common') {
        // Для 'common' используем простой, сплошной цвет текста без градиента
        prizeNotificationPrizeName.style.background = 'none';
        prizeNotificationPrizeName.style.webkitBackgroundClip = 'initial';
        prizeNotificationPrizeName.style.webkitTextFillColor = 'initial';
        prizeNotificationPrizeName.style.color = style.textColor; // Используем основной цвет текста из конфига
        prizeNotificationPrizeName.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)'; // Простое теневое выделение
    } else {
        // Для всех остальных редкостей оставляем градиент и яркое свечение
        prizeNotificationPrizeName.style.background = `linear-gradient(180deg, ${style.textHighlightColor} 40%, ${style.textColor} 100%)`;
        prizeNotificationPrizeName.style.webkitBackgroundClip = 'text';
        prizeNotificationPrizeName.style.webkitTextFillColor = 'transparent';
        prizeNotificationPrizeName.style.textShadow = `0 3px 15px ${style.glow}`;
    }
    // --- КОНЕЦ РЕШЕНИЯ ---

    // Стилизация кнопки (остается общей для всех)
    prizeNotificationButton.style.background = `linear-gradient(180deg, ${style.gradient[0]} 0%, ${style.gradient[1]} 100%)`;
    prizeNotificationButton.style.borderColor = style.textHighlightColor;
    prizeNotificationButton.style.color = isColorDark(style.gradient[1]) ? '#FFFFFF' : '#000000';
    prizeNotificationButton.style.textShadow = `0 1px 2px rgba(0, 0, 0, 0.4)`;

    // Показываем уведомление
    prizeNotificationOverlay.style.display = 'flex';
    setTimeout(() => {
        prizeNotificationOverlay.classList.add('visible');
    }, 10); 
}

/**
 * <<< НОВАЯ ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ >>>
 * Определяет, является ли цвет темным или светлым.
 * @param {string} color - Цвет в формате 'rgb(r, g, b)'.
 * @returns {boolean} - true, если цвет темный, false - если светлый.
 */
function isColorDark(color) {
    // Извлекаем значения R, G, B из строки
    const [r, g, b] = color.match(/\d+/g).map(Number);
    // Формула для расчета воспринимаемой яркости (Luma)
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    // Порог яркости. Если меньше 128, считаем цвет темным.
    return luma < 128;
}

function hidePrizeNotification() {
    if (!prizeNotificationOverlay) return;
    
    prizeNotificationOverlay.classList.remove('visible');
    // Прячем элемент ПОСЛЕ того, как анимация прозрачности завершится
    setTimeout(() => {
        prizeNotificationOverlay.style.display = 'none';
        // <<< ФИКС: Возвращаем overflow в исходное состояние (убираем инлайновый стиль) >>>
        // Это позволит таблице стилей снова управлять этим свойством.
        document.body.style.overflowX = '';
        document.documentElement.style.overflowX = '';
    }, 400); // 400ms - это длительность transition в CSS
}

// <<< НОВОЕ: Функция для завершения выигрыша (отправка на сервер, обновление UI) >>>
async function finalizeWin() {
    if (!spinResultData) return;

    try {
        await apiFetch('/api/v1/notify-win', {
            method: 'POST',
            body: JSON.stringify({ prize_data: spinResultData })
        });
    } catch (error) {
        console.error("Failed to notify server of win:", error);
        tg.showAlert(i18n.alert_sync_error || "Could not save your prize. Please contact support.");
    } finally {
        wheelSpinning = false;
        spinResultData = null;
        stopButtonAnimations();
        
        // <<< НОВОЕ: Возобновляем анимацию переворотов после завершения выигрыша >>>
        resumeAllSectorFlips();
        
        await loadUserInfo();
    }
}

/**
 * Асинхронно загружает все текстуры для секторов на основе конфига rarityStyles.
 * @param {THREE.TextureLoader} loader - Экземпляр THREE.TextureLoader.
 * @returns {Promise<void>}
 */
async function loadRarityTextures(loader) {
    console.log("Loading rarity textures...");
    const texturePromises = [];
    const rarities = Object.keys(rarityStyles);

    for (const rarity of rarities) {
        const style = rarityStyles[rarity];
        if (style.textureUrl) {
            const promise = loader.loadAsync(style.textureUrl).then(texture => {
                // Настраиваем текстуру для правильного отображения
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.repeat.set(1, 1);
                texture.offset.set(0, 0);
                texture.rotation = 0;
                
                // Включаем анизотропную фильтрацию для лучшего качества
                const maxAnisotropy = threeRenderer.capabilities.getMaxAnisotropy();
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


// =================================================================================
// <<< НАЧАЛО: ОБНОВЛЕННЫЙ БЛОК ДЛЯ ДЕБАГ-МЕНЮ (С ПЕРЕТАСКИВАНИЕМ) >>>
// =================================================================================

function setupDebugMenu() {
    // 1. Создаем и внедряем CSS для меню
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
        /* <<< НОВОЕ: Стили для заголовка, за который можно тащить >>> */
        #debug-panel-header {
            padding: 8px 15px;
            background-color: #4a5568;
            cursor: move; /* Указывает, что элемент можно двигать */
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            user-select: none; /* Запрещает выделение текста в заголовке */
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

    // 2. Создаем HTML для меню
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    
    const rarities = Object.keys(sceneSettings.materials);
    
    // <<< ИЗМЕНЕНИЕ: Добавлена обертка .debug-panel-content и заголовок #debug-panel-header >>>
    panel.innerHTML = `
        <div id="debug-panel-header">
            <h4>⚙️ Настройки Сцены</h4>
        </div>
        <div class="debug-panel-content">
            <!-- Секция управления светом -->
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

            <!-- Секция управления материалами -->
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
            
            <!-- <<< НОВОЕ: Секция управления звуком >>> -->
            <fieldset class="debug-fieldset">
                <legend class="debug-legend">Звук</legend>
                <div class="debug-control">
                    <label for="sound-volume">Громкость вращения</label>
                    <input type="range" id="sound-volume" min="0" max="1" step="0.05" value="${sceneSettings.sound.volume}">
                </div>
            </fieldset>

            <!-- Кнопки действий -->
            <div class="debug-actions">
                <button id="save-settings-btn" class="debug-button debug-button-save">Сохранить на сервере</button>
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    // 3. Создаем кнопку для открытия/закрытия меню
    const toggleButton = document.createElement('button');
    toggleButton.id = 'debug-menu-toggle';
    toggleButton.innerHTML = '⚙️';
    toggleButton.addEventListener('click', () => {
        panel.classList.toggle('visible');
    });
    document.body.appendChild(toggleButton);

    // 4. Логика для вкладок (без изменений)
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

    // 5. Назначаем обработчики событий на все контролы (без изменений)
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

    // <<< НОВОЕ: Назначаем обработчик для ползунка громкости >>>
    document.getElementById('sound-volume').addEventListener('input', e => {
        const newVolume = parseFloat(e.target.value);
        sceneSettings.sound.volume = newVolume;
        if (wheelSpinSound) {
            wheelSpinSound.volume = newVolume;
        }
    });

    // 6. Обработчик кнопки сохранения (без изменений)
    document.getElementById('save-settings-btn').addEventListener('click', async () => {
        // <<< ИЗМЕНЕНИЕ: Добавляем настройки звука в сохраняемый объект >>>
        const currentSettings = { 
            lights: { directional: {}, ambient: {} }, 
            materials: {},
            sound: {} // <<< НОВОЕ
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
        
        // <<< НОВОЕ: Собираем настройки звука >>>
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

    // <<< НОВОЕ: Логика для перетаскивания панели >>>
    const header = document.getElementById('debug-panel-header');
    let isDragging = false;
    let offsetX, offsetY;

    const onMouseDown = (e) => {
        isDragging = true;
        // Предотвращаем стандартное поведение, например, выделение текста
        e.preventDefault();
        
        // Рассчитываем смещение курсора относительно левого верхнего угла панели
        offsetX = e.clientX - panel.offsetLeft;
        offsetY = e.clientY - panel.offsetTop;

        // Добавляем глобальные слушатели для движения и отпускания мыши
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        
        // Устанавливаем новые координаты панели
        panel.style.left = `${e.clientX - offsetX}px`;
        panel.style.top = `${e.clientY - offsetY}px`;
    };

    const onMouseUp = () => {
        isDragging = false;
        // Удаляем глобальные слушатели, чтобы остановить перетаскивание
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    // Назначаем слушателя на заголовок панели
    header.addEventListener('mousedown', onMouseDown);
}

// =================================================================================
// <<< КОНЕЦ: ОБНОВЛЕННЫЙ БЛОК ДЛЯ ДЕБАГ-МЕНЮ >>>
// =================================================================================


async function main() {
    // <<< НОВОЕ: Получаем доступ к оверлею загрузки в самом начале >>>
    const loaderOverlay = document.getElementById('loader-overlay');

    // <<< ИЗМЕНЕНИЕ: Оборачиваем всю логику загрузки в try...finally >>>
    try {
        tg.expand();
        // <<< УДАЛЕНО: Строка mainContent.style.opacity = 1; отсюда убрана >>>
        textCtx = textCanvas.getContext('2d');
        
        setupPrizeNotification();
        
        const fontLoader = new THREE.FontLoader();
        const textureLoader = new THREE.TextureLoader();

        // Загружаем конфиг и применяем настройки
        const config = await apiFetch('/api/v1/wheel-config');
        if (config.scene_settings) {
            console.log("Загружены настройки сцены с сервера.");
            // ... (логика применения настроек остается без изменений) ...
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

        // Инициализация всех звуков
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

        // Инициализация дебаг-меню для админов
        if (tg.initDataUnsafe && tg.initDataUnsafe.user && ADMIN_TELEGRAM_IDS.includes(tg.initDataUnsafe.user.id)) {
            console.log("Пользователь - администратор. Инициализация дебаг-меню.");
            setupDebugMenu();
        }

        // <<< КЛЮЧЕВОЙ МОМЕНТ: Ждем загрузки ВСЕХ ассетов >>>
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
        
        // Настройка загруженных ресурсов
        buttonSideTex.repeat.set(1, 1);
        sectorIcons = { mythic: mythicIcon, legendary: legendaryIcon, epic: epicIcon };
        buttonFaceTex.center.set(0.5, 0.5);
        buttonFaceTex.rotation = Math.PI / 2;

        // Создание 3D-объектов после загрузки ресурсов
        create3DSpinButton(buttonFaceTex, buttonSideTex);
        createOuterRing(outerRingTex);

        // Финальная настройка UI
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

        // Запуск фоновой музыки
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
        // <<< ИЗМЕНЕНИЕ: Этот блок выполнится ПОСЛЕ try (или catch) >>>
        // Прячем загрузчик и показываем контент в любом случае
        if (loaderOverlay) {
            loaderOverlay.classList.add('hidden');
            // Для чистоты можно удалить элемент из DOM после завершения анимации
            setTimeout(() => {
                if (loaderOverlay.parentNode) {
                    loaderOverlay.parentNode.removeChild(loaderOverlay);
                }
            }, 600); // Чуть больше, чем длительность transition
        }
        // <<< ВОТ ПРАВИЛЬНОЕ МЕСТО для этой строки >>>
        mainContent.style.opacity = 1;
    }
}

// <<< ОБНОВЛЕНО: Передаем все геометрические параметры в CSS >>>
document.documentElement.style.setProperty('--ring-scale', WHEEL_GEOMETRY_CONFIG.outerRingScale);


main(); // Запускаем все