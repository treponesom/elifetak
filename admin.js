// LocalStorage'dan linkleri yükle
function loadLinks() {
    const links = localStorage.getItem('videoLinks');
    return links ? JSON.parse(links) : [];
}

// Linkleri LocalStorage'a kaydet
function saveLinks(links) {
    localStorage.setItem('videoLinks', JSON.stringify(links));
}

// Benzersiz link kodu oluştur
function generateLinkCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Yeni link oluştur
function createLink() {
    const viewLimit = parseInt(document.getElementById('viewLimit').value);
    
    if (isNaN(viewLimit) || viewLimit < 1) {
        showNotification('Lütfen geçerli bir izleme limiti girin!', 'error');
        return;
    }

    const links = loadLinks();
    const linkCode = generateLinkCode();
    
    const newLink = {
        code: linkCode,
        viewLimit: viewLimit,
        remainingViews: viewLimit,
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    links.push(newLink);
    saveLinks(links);
    
    renderLinks();
    showNotification(`Link başarıyla oluşturuldu! Kod: ${linkCode}`);
    
    // Formu sıfırla
    document.getElementById('viewLimit').value = '1';
}

// Linkleri tabloda göster
function renderLinks() {
    const links = loadLinks();
    const tableBody = document.getElementById('linksTableBody');
    const noLinks = document.getElementById('noLinks');
    const linksTable = document.getElementById('linksTable');

    if (links.length === 0) {
        tableBody.innerHTML = '';
        noLinks.style.display = 'block';
        linksTable.style.display = 'none';
        return;
    }

    noLinks.style.display = 'none';
    linksTable.style.display = 'table';

    tableBody.innerHTML = links.map((link, index) => {
        const createdAt = new Date(link.createdAt).toLocaleString('tr-TR');
        const statusClass = link.remainingViews > 0 ? 'status-active' : 'status-expired';
        const statusText = link.remainingViews > 0 ? 'Aktif' : 'Doldu';
        
        return `
            <tr>
                <td><span class="link-code">${link.code}</span></td>
                <td>${link.viewLimit}</td>
                <td>${link.remainingViews}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>${createdAt}</td>
                <td>
                    <button class="copy-btn" onclick="copyLink('${link.code}')">📋 Kopyala</button>
                    <button class="delete-btn" onclick="deleteLink(${index})">🗑️ Sil</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Linki kopyala
function copyLink(code) {
    const linkUrl = `${window.location.origin}${window.location.pathname.replace('admin.html', '')}viewer.html?code=${code}`;
    navigator.clipboard.writeText(linkUrl).then(() => {
        showNotification('Link kopyalandı!');
    }).catch(err => {
        showNotification('Link kopyalanamadı!', 'error');
    });
}

// Linki sil
function deleteLink(index) {
    if (confirm('Bu linki silmek istediğinizden emin misiniz?')) {
        const links = loadLinks();
        links.splice(index, 1);
        saveLinks(links);
        renderLinks();
        showNotification('Link silindi!');
    }
}

// Bildirim göster
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification';
    
    if (type === 'error') {
        notification.style.background = '#dc3545';
    } else {
        notification.style.background = '#28a745';
    }
    
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Sayfa yüklendiğinde linkleri göster
document.addEventListener('DOMContentLoaded', renderLinks);
