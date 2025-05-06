/**
 * Gestiona la funcionalidad de compartir en redes sociales
 */

/**
 * Genera una imagen para compartir en redes sociales
 */
function generateShareImage() {
    // Obtener el canvas para compartir
    const shareCanvas = document.getElementById('share-canvas');
    const shareCtx = shareCanvas.getContext('2d');
    
    // Configurar tamaño para Instagram Stories (9:16)
    const width = 1080;
    const height = 1920;
    shareCanvas.width = width;
    shareCanvas.height = height;
    
    // Dibujar fondo
    shareCtx.fillStyle = CONFIG.visualizer.colors.background;
    shareCtx.fillRect(0, 0, width, height);
    
    // Cargar imagen de portada
    const coverImage = new Image();
    coverImage.crossOrigin = 'anonymous';
    coverImage.src = CONFIG.songInfo.coverImage;
    
    coverImage.onload = function() {
        // Dibujar portada del álbum (centrada y grande)
        const coverSize = width * 0.8;
        const coverX = (width - coverSize) / 2;
        const coverY = height * 0.25 - coverSize / 2;
        
        // Dibujar sombra
        shareCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        shareCtx.shadowBlur = 30;
        shareCtx.shadowOffsetX = 0;
        shareCtx.shadowOffsetY = 10;
        
        // Dibujar portada con bordes redondeados
        roundedImage(shareCtx, coverX, coverY, coverSize, coverSize, 20);
        shareCtx.clip();
        shareCtx.drawImage(coverImage, coverX, coverY, coverSize, coverSize);
        shareCtx.restore();
        
        // Resetear sombra
        shareCtx.shadowColor = 'transparent';
        shareCtx.shadowBlur = 0;
        shareCtx.shadowOffsetX = 0;
        shareCtx.shadowOffsetY = 0;
        
        // Dibujar información de la canción
        shareCtx.textAlign = 'center';
        
        // Título de la canción
        shareCtx.font = 'bold 70px Arial';
        shareCtx.fillStyle = '#ffffff';
        shareCtx.fillText(CONFIG.songInfo.title, width / 2, height * 0.55);
        
        // Nombre del artista
        shareCtx.font = '50px Arial';
        shareCtx.fillStyle = CONFIG.visualizer.colors.secondary;
        shareCtx.fillText(CONFIG.songInfo.artist, width / 2, height * 0.55 + 80);
        
        // Dibujar waveform si está disponible
        if (wavesurfer) {
            try {
                // Obtener imagen del waveform
                const waveformImage = wavesurfer.exportImage();
                const waveImg = new Image();
                waveImg.src = waveformImage;
                
                waveImg.onload = function() {
                    const waveHeight = height * 0.1;
                    const waveY = height * 0.65;
                    
                    shareCtx.drawImage(waveImg, 0, waveY, width, waveHeight);
                    finishShareImage();
                };
                
                waveImg.onerror = function() {
                    console.error('Error al cargar la imagen del waveform');
                    finishShareImage();
                };
            } catch (error) {
                console.error('Error al exportar waveform:', error);
                finishShareImage();
            }
        } else {
            finishShareImage();
        }
    };
    
    coverImage.onerror = function() {
        console.error('Error al cargar la imagen de portada');
        // Continuar sin la imagen de portada
        finishShareImage();
    };
}

/**
 * Finaliza la generación de la imagen para compartir
 */
function finishShareImage() {
    const shareCanvas = document.getElementById('share-canvas');
    const shareCtx = shareCanvas.getContext('2d');
    const width = shareCanvas.width;
    const height = shareCanvas.height;
    
    // Añadir texto promocional
    shareCtx.font = 'bold 40px Arial';
    shareCtx.fillStyle = '#ffffff';
    shareCtx.textAlign = 'center';
    shareCtx.fillText(CONFIG.sharing.text, width / 2, height * 0.75);
    
    // Añadir hashtags
    if (CONFIG.sharing.hashtags && CONFIG.sharing.hashtags.length > 0) {
        shareCtx.font = '30px Arial';
        shareCtx.fillStyle = CONFIG.visualizer.colors.secondary;
        shareCtx.fillText(CONFIG.sharing.hashtags.join(' '), width / 2, height * 0.75 + 50);
    }
    
    // Añadir URL
    if (CONFIG.sharing.url) {
        shareCtx.font = '35px Arial';
        shareCtx.fillStyle = '#ffffff';
        shareCtx.fillText(CONFIG.sharing.url, width / 2, height * 0.85);
    }
    
    // Mostrar días restantes para el lanzamiento
    const daysUntilRelease = getDaysUntilRelease();
    if (daysUntilRelease > 0) {
        // Crear un banner para los días restantes
        const bannerY = height * 0.9;
        const bannerHeight = 80;
        
        // Dibujar fondo del banner
        shareCtx.fillStyle = CONFIG.visualizer.colors.primary;
        shareCtx.fillRect(0, bannerY, width, bannerHeight);
        
        // Texto de días restantes
        shareCtx.font = 'bold 40px Arial';
        shareCtx.fillStyle = '#ffffff';
        shareCtx.textAlign = 'center';
        shareCtx.fillText(`¡${daysUntilRelease} días para el lanzamiento!`, width / 2, bannerY + 55);
    }
    
    // Compartir la imagen
    shareImageToSocial();
}

/**
 * Comparte la imagen generada usando Web Share API
 */
async function shareImageToSocial() {
    const shareCanvas = document.getElementById('share-canvas');
    
    try {
        // Convertir canvas a blob
        const blob = await new Promise(resolve => {
            shareCanvas.toBlob(resolve, 'image/png');
        });
        
        // Crear archivo para compartir
        const file = new File([blob], 'disonancia-preview.png', { type: 'image/png' });
        
        // Verificar si Web Share API está disponible
        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: `${CONFIG.songInfo.artist} - ${CONFIG.songInfo.title}`,
                text: CONFIG.sharing.text,
                files: [file]
            });
            console.log('Imagen compartida exitosamente');
        } else {
            // Fallback: descargar la imagen
            const link = document.createElement('a');
            link.download = 'disonancia-preview.png';
            link.href = shareCanvas.toDataURL('image/png');
            link.click();
            console.log('Web Share API no disponible, imagen descargada');
        }
    } catch (error) {
        console.error('Error al compartir:', error);
        alert('No se pudo compartir la imagen. Intenta de nuevo.');
    }
}

/**
 * Dibuja una imagen con bordes redondeados
 */
function roundedImage(ctx, x, y, width, height, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

/**
 * Calcula los días restantes hasta la fecha de lanzamiento
 */
function getDaysUntilRelease() {
    const now = new Date();
    const releaseDate = CONFIG.releaseDate;
    
    // Si la fecha de lanzamiento ya pasó, retornar 0
    if (now >= releaseDate) {
        return 0;
    }
    
    // Calcular diferencia en días
    const diffTime = Math.abs(releaseDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}