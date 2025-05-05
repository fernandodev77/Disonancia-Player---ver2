/**
 * Archivo principal que inicializa la aplicación
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la interfaz con los datos de configuración
    initializeUI();
    
    // Inicializar el temporizador de cuenta regresiva
    initCountdown();
    
    // Configurar eventos de botones
    setupEventListeners();
    
    // Inicializar el reproductor de audio (pero no reproducir automáticamente)
    initializePlayer();
});

/**
 * Inicializa la interfaz de usuario con los datos de configuración
 */
function initializeUI() {
    // Establecer información de la canción
    document.getElementById('song-title').textContent = CONFIG.songInfo.title;
    document.getElementById('artist-name').textContent = CONFIG.songInfo.artist;
    
    // Establecer imágenes de portada
    const albumCovers = document.querySelectorAll('#album-cover-img, #player-album-img');
    albumCovers.forEach(cover => {
        cover.src = CONFIG.songInfo.coverImage;
        cover.alt = `${CONFIG.songInfo.artist} - ${CONFIG.songInfo.title}`;
    });
    
    // Comprobar preferencia de tema guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.getElementById('theme-switch').checked = true;
    }
}

/**
 * Inicializa el temporizador de cuenta regresiva
 */
function initCountdown() {
    const countdownElement = document.getElementById('countdown');
    const releaseDate = CONFIG.releaseDate;
    
    // Asegurarse de que el contador sea visible inicialmente
    countdownElement.style.display = 'block';
    
    // Si la fecha de lanzamiento ya pasó, ocultar el contador
    if (new Date() >= releaseDate) {
        countdownElement.style.display = 'none';
        return;
    }
    
    // Actualizar el contador cada segundo
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Actualiza el contador de tiempo restante
 */
function updateCountdown() {
    const now = new Date();
    const releaseDate = CONFIG.releaseDate;
    const difference = releaseDate - now;
    
    // Si la fecha ya pasó, ocultar el contador
    if (difference <= 0) {
        document.getElementById('countdown').style.display = 'none';
        return;
    }
    
    // Calcular días, horas, minutos y segundos restantes
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // Actualizar elementos del DOM
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

/**
 * Configura los event listeners para los botones y controles
 */
function setupEventListeners() {
    // Botón de reproducción en la pantalla de introducción
    document.getElementById('play-btn').addEventListener('click', () => {
        // Ocultar pantalla de intro y mostrar reproductor
        document.getElementById('intro-screen').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('intro-screen').classList.add('hidden');
            document.getElementById('player-view').classList.remove('hidden');
            document.getElementById('player-view').classList.add('fade-in');
            
            // Iniciar reproducción y visualización
            wavesurfer.play();
            startVisualization();
        }, 500);
    });
    
    // Botón de volver a la pantalla de introducción
    document.getElementById('back-btn').addEventListener('click', () => {
        // Pausar reproducción
        wavesurfer.pause();
        stopVisualization();
        
        // Ocultar reproductor y mostrar pantalla de intro
        document.getElementById('player-view').classList.add('fade-out');
        setTimeout(() => {
            document.getElementById('player-view').classList.add('hidden');
            document.getElementById('intro-screen').classList.remove('hidden');
            document.getElementById('intro-screen').classList.add('fade-in');
        }, 500);
    });
    
    // Botón de play/pause en el reproductor
    document.getElementById('player-play-btn').addEventListener('click', togglePlayPause);
    
    // Control de volumen
    document.getElementById('volume-slider').addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        wavesurfer.setVolume(volume);
        updateVolumeIcon(volume);
    });
    
    // Botón de pre-save
    document.getElementById('presave-btn').addEventListener('click', () => {
        window.open(CONFIG.songInfo.presaveLink, '_blank');
    });
    
    // Botón de compartir
    document.getElementById('share-btn').addEventListener('click', () => {
        generateShareImage();
    });
    
    // Cambio de tema
    document.getElementById('theme-switch').addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        }
    });
}

/**
 * Alterna entre reproducir y pausar
 */
function togglePlayPause() {
    if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
        document.getElementById('play-icon').classList.remove('fa-pause');
        document.getElementById('play-icon').classList.add('fa-play');
        pauseVisualization();
    } else {
        wavesurfer.play();
        document.getElementById('play-icon').classList.remove('fa-play');
        document.getElementById('play-icon').classList.add('fa-pause');
        resumeVisualization();
    }
}

/**
 * Actualiza el icono de volumen según el nivel
 */
function updateVolumeIcon(volume) {
    const volumeIcon = document.getElementById('volume-icon');
    volumeIcon.className = ''; // Eliminar clases existentes
    
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
}

/**
 * Formatea el tiempo en segundos a formato mm:ss
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}