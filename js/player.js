/**
 * Gestiona la reproducción de audio usando WaveSurfer.js
 */

// Variables globales
let wavesurfer;
let audioContext;
let analyser;
let audioSource;

/**
 * Inicializa el reproductor de audio con WaveSurfer
 */
function initializePlayer() {
    // Crear instancia de WaveSurfer
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'rgba(187, 134, 252, 0.4)',
        progressColor: '#bb86fc',
        cursorColor: '#6200ea',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 2,
        responsive: true,
        hideScrollbar: true,
        backend: 'WebAudio'
    });

    // Cargar archivo de audio
    wavesurfer.load(CONFIG.songInfo.audioFile);

    // Configurar eventos de WaveSurfer
    setupWaveSurferEvents();

    // Configurar Web Audio API para análisis
    setupAudioAnalyser();
}

/**
 * Configura los eventos para WaveSurfer
 */
function setupWaveSurferEvents() {
    // Cuando el audio está listo
    wavesurfer.on('ready', function() {
        // Actualizar duración total
        const duration = wavesurfer.getDuration();
        document.getElementById('total-time').textContent = formatTime(duration);
        
        // Habilitar botones
        document.getElementById('player-play-btn').disabled = false;
    });

    

    // Cuando se reproduce
    wavesurfer.on('play', function() {
        document.getElementById('play-icon').classList.remove('fa-play');
        document.getElementById('play-icon').classList.add('fa-pause');
    });

    // Cuando se pausa
    wavesurfer.on('pause', function() {
        document.getElementById('play-icon').classList.remove('fa-pause');
        document.getElementById('play-icon').classList.add('fa-play');
    });

    // Actualizar tiempo actual durante la reproducción
    wavesurfer.on('audioprocess', function() {
        const currentTime = wavesurfer.getCurrentTime();
        document.getElementById('current-time').textContent = formatTime(currentTime);
    });

    // Cuando termina la reproducción
    wavesurfer.on('finish', function() {
        document.getElementById('play-icon').classList.remove('fa-pause');
        document.getElementById('play-icon').classList.add('fa-play');
        pauseVisualization();
    });

    // Manejo de errores
    wavesurfer.on('error', function(err) {
        console.error('Error en WaveSurfer:', err);
        alert('Error al cargar el audio. Por favor, intenta de nuevo.');
    });
}

/**
 * Configura el analizador de audio para las visualizaciones
 */
function setupAudioAnalyser() {
    // Esperar a que WaveSurfer esté listo
    wavesurfer.on('ready', function() {
        try {
            // Obtener el contexto de audio de WaveSurfer
            audioContext = wavesurfer.backend.ac;
            
            // Crear nodo analizador
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048; // Tamaño de FFT (potencia de 2)
            analyser.smoothingTimeConstant = 0.8; // Suavizado (0-1)
            
            // Conectar la fuente de audio al analizador
            audioSource = wavesurfer.backend.source;
            audioSource.connect(analyser);
            
            // Asegurarse de que el analizador siga conectado al destino
            analyser.connect(audioContext.destination);
            
            console.log('Analizador de audio configurado correctamente');
        } catch (error) {
            console.error('Error al configurar el analizador de audio:', error);
        }
    });
}

/**
 * Obtiene los datos de frecuencia del analizador
 * @returns {Uint8Array} Array con datos de frecuencia (0-255)
 */
function getFrequencyData() {
    if (!analyser) return new Uint8Array(0);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    return dataArray;
}

/**
 * Obtiene los datos de forma de onda del analizador
 * @returns {Uint8Array} Array con datos de forma de onda (0-255)
 */
function getWaveformData() {
    if (!analyser) return new Uint8Array(0);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(dataArray);
    return dataArray;
}

/**
 * Obtiene el nivel de volumen actual (RMS)
 * @returns {number} Nivel de volumen (0-1)
 */
function getVolumeLevel() {
    const waveform = getWaveformData();
    if (waveform.length === 0) return 0;
    
    // Calcular RMS (Root Mean Square)
    let sum = 0;
    for (let i = 0; i < waveform.length; i++) {
        // Convertir de 0-255 a -1 a 1
        const amplitude = (waveform[i] - 128) / 128;
        sum += amplitude * amplitude;
    }
    const rms = Math.sqrt(sum / waveform.length);
    
    // Aplicar sensibilidad
    const sensitivity = CONFIG.visualizer.sensitivity / 5;
    return Math.min(1, rms * sensitivity * 5);
}