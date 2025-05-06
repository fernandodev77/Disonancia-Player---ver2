/**
 * Configuración del reproductor Disonancia
 */

const CONFIG = {
    // Información de la canción
    songInfo: {
        title: "Magia de Curación",
        artist: "Sonido Galaxy",
        audioFile: "./Audio/song.mp3",
        coverImage: "./albumcover/cover.jpg",
        presaveLink: "https://open.spotify.com", // Enlace de pre-save (cambiar por el real)
    },
    
    // Fecha de lanzamiento (formato: año, mes-1, día, hora, minuto)
    // Nota: en JavaScript los meses van de 0 a 11, por eso se resta 1 al mes
    releaseDate: new Date(2025, 11, 31, 0, 0), // 31 de Diciembre de 2023
    
    // Configuración del visualizador
    visualizer: {
        // Tipo de visualización: 'circles', 'bars', 'waves', 'particles'
        type: 'circles',
        // Colores para la visualización
        colors: {
            primary: '#6200ea',
            secondary: '#bb86fc',
            background: '#121212'
        },
        // Sensibilidad de la visualización (1-10)
        sensitivity: 5,
        // Modo de rendimiento para dispositivos de baja potencia
        lowPerformanceMode: false
    },
    
    // Configuración para compartir
    sharing: {
        // Texto para la imagen compartida
        text: "¡Escucha mi nuevo lanzamiento!",
        // Hashtags para redes sociales
        hashtags: ["#NuevoLanzamiento", "#Música"],
        // URL para incluir en la imagen compartida (opcional)
        url: "@sonidogxlaxy"
    }
};