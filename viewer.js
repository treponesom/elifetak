// URL'den link kodunu al
function getLinkCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

// LocalStorage'dan linkleri yükle
function loadLinks() {
    const links = localStorage.getItem('videoLinks');
    return links ? JSON.parse(links) : [];
}

// Linkleri LocalStorage'a kaydet
function saveLinks(links) {
    localStorage.setItem('videoLinks', JSON.stringify(links));
}

// Link kodunu doğrula
function validateLink(code) {
    const links = loadLinks();
    return links.find(link => link.code === code);
}

// İzleme sayısını azalt
function decrementViewCount(code) {
    const links = loadLinks();
    const linkIndex = links.findIndex(link => link.code === code);
    
    if (linkIndex !== -1) {
        links[linkIndex].remainingViews--;
        
        if (links[linkIndex].remainingViews <= 0) {
            links[linkIndex].status = 'expired';
        }
        
        saveLinks(links);
        return links[linkIndex].remainingViews;
    }
    
    return -1;
}

// Bildirim göster
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') {
        notification.classList.add('error');
    } else {
        notification.classList.remove('error');
    }
    
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Videoyu göster
function showVideo(link) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error').style.display = 'none';
    document.getElementById('videoSection').style.display = 'block';
    
    document.getElementById('linkCode').textContent = link.code;
    document.getElementById('remainingViews').textContent = link.remainingViews;
    document.getElementById('viewCountDisplay').textContent = link.remainingViews;
    
    // YouTube video ID'si - BURAYA YOUTUBE VIDEO ID'SİNİ YAZIN
    const youtubeVideoId = 'YOUTUBE_VIDEO_ID'; // Örnek: 'dQw4w9WgXcQ'
    
    // YouTube embed'i ayarla
    const youtubePlayer = document.getElementById('youtubePlayer');
    youtubePlayer.src = `https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1`;
    
    // İzleme sayısını azalt (sayfa yüklendiğinde)
    if (link.remainingViews > 0) {
        const remaining = decrementViewCount(link.code);
        link.remainingViews = remaining;
        
        document.getElementById('remainingViews').textContent = remaining;
        document.getElementById('viewCountDisplay').textContent = remaining;
        
        if (remaining <= 0) {
            showNotification('İzleme hakkınız doldu!', 'error');
            youtubePlayer.src = '';
            setTimeout(() => {
                window.location.href = 'viewer.html?code=' + link.code;
            }, 2000);
        }
    }
}

// Hata göster
function showError() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('videoSection').style.display = 'none';
    document.getElementById('error').style.display = 'block';
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    const code = getLinkCodeFromUrl();
    
    if (!code) {
        showError();
        return;
    }
    
    const link = validateLink(code);
    
    if (!link) {
        showError();
        return;
    }
    
    if (link.remainingViews <= 0 || link.status === 'expired') {
        document.querySelector('.error-message').textContent = 'İzleme Hakkı Doldu';
        document.querySelector('.error-description').textContent = 'Bu link için izleme hakkınız tükenmiş.';
        showError();
        return;
    }
    
    showVideo(link);
});
