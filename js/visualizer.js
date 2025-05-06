/**
 * Gestiona las visualizaciones de audio en canvas
 */

// Variables globales
let canvas;
let ctx;
let animationId;
let isVisualizationActive = false;

// Configuración de visualización
let visualizerType;
let visualizerColors;

/**
 * Inicializa el canvas para visualizaciones
 */
function initializeCanvas() {
    canvas = document.getElementById('visualization-canvas');
    ctx = canvas.getContext('2d');
    
    // Ajustar tamaño del canvas al contenedor
    resizeCanvas();
    
    // Ajustar canvas cuando cambia el tamaño de la ventana
    window.addEventListener('resize', resizeCanvas);
    
    // Obtener configuración del visualizador
    visualizerType = CONFIG.visualizer.type;
    visualizerColors = CONFIG.visualizer.colors;
}

/**
 * Ajusta el tamaño del canvas al contenedor
 */
function resizeCanvas() {
    const container = document.querySelector('.visualization-container');
    if (canvas && container) {
        canvas.width = container.offsetWidth;
        // Reducir la altura del canvas para que ocupe menos espacio vertical
        // Mantenemos un tamaño adecuado para las visualizaciones pero más compacto
        canvas.height = Math.min(container.offsetWidth * 0.6, container.offsetHeight);
        
        // Asegurar que el canvas tenga suficiente altura para mostrar las visualizaciones
        // pero sin desplazar demasiado los elementos inferiores
        if (canvas.height > 300) {
            canvas.height = 300; // Limitar altura máxima
        }
    }
}

/**
 * Inicia la visualización de audio
 */
function startVisualization() {
    if (!canvas) {
        initializeCanvas();
    }
    
    isVisualizationActive = true;
    cancelAnimationFrame(animationId); // Evitar múltiples loops
    animateVisualization();
}

/**
 * Detiene la visualización de audio
 */
function stopVisualization() {
    isVisualizationActive = false;
    cancelAnimationFrame(animationId);
    
    // Limpiar canvas
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * Pausa la visualización sin limpiar el canvas
 */
function pauseVisualization() {
    isVisualizationActive = false;
    cancelAnimationFrame(animationId);
}

/**
 * Reanuda la visualización
 */
function resumeVisualization() {
    if (!isVisualizationActive) {
        isVisualizationActive = true;
        animateVisualization();
    }
}

/**
 * Loop principal de animación para visualizaciones
 */
function animateVisualization() {
    if (!isVisualizationActive) return;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Obtener datos de audio
    const frequencyData = getFrequencyData();
    const volumeLevel = getVolumeLevel();
    
    // Seleccionar tipo de visualización
    switch (visualizerType) {
        case 'circles':
            drawCircles(frequencyData, volumeLevel);
            break;
        case 'bars':
            drawBars(frequencyData, volumeLevel);
            break;
        case 'waves':
            drawWaves(frequencyData, volumeLevel);
            break;
        case 'particles':
            drawParticles(frequencyData, volumeLevel);
            break;
        default:
            drawCircles(frequencyData, volumeLevel);
    }
    
    // Continuar loop de animación
    animationId = requestAnimationFrame(animateVisualization);
}

/**
 * Dibuja visualización de círculos concéntricos
 */
function drawCircles(frequencyData, volumeLevel) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    
    // Dibujar círculos concéntricos
    const numCircles = 5;
    const radiusStep = maxRadius / numCircles;
    
    // Agrupar frecuencias para cada círculo
    const frequencyGroups = groupFrequencies(frequencyData, numCircles);
    
    // Dibujar desde el círculo más grande al más pequeño
    for (let i = 0; i < numCircles; i++) {
        const freqValue = frequencyGroups[i] / 255; // Normalizar a 0-1
        const radius = radiusStep * (numCircles - i) * (0.7 + freqValue * 0.3);
        
        // Calcular color con interpolación
        const hue = (i * 30 + Date.now() * 0.05) % 360;
        const color = `hsl(${hue}, 80%, 60%)`;
        
        // Dibujar círculo
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2 + freqValue * 4;
        ctx.stroke();
    }
    
    // Círculo central pulsante con el volumen
    const innerRadius = maxRadius * 0.2 * (0.8 + volumeLevel * 0.4);
    const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, innerRadius
    );
    gradient.addColorStop(0, visualizerColors.secondary);
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

/**
 * Dibuja visualización de barras de frecuencia
 */
function drawBars(frequencyData, volumeLevel) {
    if (frequencyData.length === 0) return;
    
    const barWidth = canvas.width / Math.min(64, frequencyData.length);
    const heightMultiplier = canvas.height / 256 * 0.8;
    
    // Usar solo las primeras 64 frecuencias (más relevantes para música)
    const usableFrequencies = Math.min(64, frequencyData.length);
    
    for (let i = 0; i < usableFrequencies; i++) {
        const x = i * barWidth;
        const barHeight = frequencyData[i] * heightMultiplier;
        
        // Calcular color basado en la frecuencia
        const hue = (i / usableFrequencies * 180 + Date.now() * 0.02) % 360;
        const saturation = 80 + volumeLevel * 20;
        const lightness = 40 + volumeLevel * 20;
        
        // Dibujar barra
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        
        // Dibujar reflejo (efecto espejo)
        const gradientHeight = barHeight * 0.6;
        const gradient = ctx.createLinearGradient(
            0, canvas.height - barHeight - gradientHeight,
            0, canvas.height - barHeight
        );
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.3)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight - gradientHeight, barWidth - 1, gradientHeight);
    }
}

/**
 * Dibuja visualización de ondas
 */
function drawWaves(frequencyData, volumeLevel) {
    if (frequencyData.length === 0) return;
    
    const centerY = canvas.height / 2;
    const waveHeight = canvas.height * 0.4 * volumeLevel;
    
    // Dibujar múltiples ondas
    const numWaves = 3;
    
    for (let wave = 0; wave < numWaves; wave++) {
        const waveOpacity = 1 - wave * 0.2;
        const waveOffset = wave * 10;
        
        // Comenzar el path
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        
        // Dibujar la onda usando curvas
        for (let i = 0; i < canvas.width; i += 20) {
            // Usar diferentes frecuencias para cada punto
            const freqIndex = Math.floor(i / canvas.width * frequencyData.length / 4);
            const freqValue = frequencyData[freqIndex] / 255; // Normalizar a 0-1
            
            // Calcular altura de la onda
            const waveY = centerY + Math.sin(i * 0.03 + Date.now() * 0.002 + wave) * waveHeight * freqValue;
            
            // Dibujar punto de la curva
            if (i === 0) {
                ctx.lineTo(i, waveY);
            } else {
                ctx.quadraticCurveTo(i - 10, waveY - waveOffset, i, waveY);
            }
        }
        
        // Completar el path hasta el borde inferior
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();
        
        // Aplicar gradiente
        const gradient = ctx.createLinearGradient(0, centerY - waveHeight, 0, centerY + waveHeight);
        gradient.addColorStop(0, `rgba(98, 0, 234, ${waveOpacity})`);
        gradient.addColorStop(1, `rgba(187, 134, 252, ${waveOpacity * 0.5})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

/**
 * Dibuja visualización de partículas
 */
function drawParticles(frequencyData, volumeLevel) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.8;
    
    // Número de partículas basado en el volumen
    const numParticles = Math.floor(30 + volumeLevel * 50);
    
    // Agrupar frecuencias para usar en las partículas
    const frequencyGroups = groupFrequencies(frequencyData, 8);
    
    // Dibujar cada partícula
    for (let i = 0; i < numParticles; i++) {
        // Usar un índice de frecuencia para esta partícula
        const freqIndex = i % frequencyGroups.length;
        const freqValue = frequencyGroups[freqIndex] / 255; // Normalizar a 0-1
        
        // Calcular posición en un patrón circular
        const angle = (i / numParticles) * Math.PI * 2 + Date.now() * 0.001;
        const radiusOffset = Math.sin(Date.now() * 0.002 + i * 0.2) * 20;
        const particleRadius = maxRadius * (0.2 + freqValue * 0.8) + radiusOffset;
        
        const x = centerX + Math.cos(angle) * particleRadius;
        const y = centerY + Math.sin(angle) * particleRadius;
        
        // Tamaño basado en la frecuencia y volumen
        const size = 2 + freqValue * 8 * volumeLevel;
        
        // Color basado en la posición
        const hue = (angle / (Math.PI * 2) * 360 + Date.now() * 0.05) % 360;
        const saturation = 80 + volumeLevel * 20;
        const lightness = 50 + freqValue * 30;
        
        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fill();
        
        // Añadir brillo
        ctx.beginPath();
        ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, ${0.3 * freqValue})`;
        ctx.fill();
    }
}

/**
 * Agrupa datos de frecuencia en grupos más pequeños
 */
function groupFrequencies(frequencyData, numGroups) {
    if (frequencyData.length === 0) return new Array(numGroups).fill(0);
    
    const result = new Array(numGroups).fill(0);
    const groupSize = Math.floor(frequencyData.length / numGroups);
    
    for (let i = 0; i < numGroups; i++) {
        let sum = 0;
        const startIndex = i * groupSize;
        const endIndex = startIndex + groupSize;
        
        for (let j = startIndex; j < endIndex && j < frequencyData.length; j++) {
            sum += frequencyData[j];
        }
        
        result[i] = sum / groupSize;
    }
    
    return result;
}