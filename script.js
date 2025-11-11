const CONFIG = {
    SERVER_URL: 'phising-detector-production.up.railway.app',
    TECH_LINES_COUNT: 5,
    CIRCUIT_DOTS_COUNT: 30
};

function initializeTechEffects() {
    for (let i = 0; i < CONFIG.TECH_LINES_COUNT; i++) {
        createTechLine('horizontal');
        createTechLine('vertical');
    }
    
    for (let i = 0; i < CONFIG.CIRCUIT_DOTS_COUNT; i++) {
        createCircuitDot();
    }
}

function createTechLine(orientation) {
    const line = document.createElement('div');
    line.className = `tech-line ${orientation}`;
    
    if (orientation === 'horizontal') {
        line.style.top = `${Math.random() * 100}%`;
    } else {
        line.style.left = `${Math.random() * 100}%`;
    }
    
    line.style.animationDelay = `${Math.random() * 5}s`;
    document.body.appendChild(line);
}

function createCircuitDot() {
    const dot = document.createElement('div');
    dot.className = 'circuit-dot';
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.top = `${Math.random() * 100}%`;
    dot.style.animationDelay = `${Math.random() * 2}s`;
    document.body.appendChild(dot);
}

function isValidURL(url) {
    try {
        new URL(url);
        return url.startsWith('http://') || url.startsWith('https://');
    } catch {
        return false;
    }
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result').style.display = 'none';
    document.getElementById('btnText').textContent = '⏳ Menganalisis...';
    document.querySelector('.check-btn').disabled = true;
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('btnText').textContent = '🔍 Cek Sekarang';
    document.querySelector('.check-btn').disabled = false;
}

function generateSSLHTML(checks, url) {
    const ssl_info = checks?.ssl;
    
    if (!ssl_info) {
        if (!url.startsWith('https://')) {
            return `
                <div class="ssl-certificate-box">
                    <div class="ssl-header">
                        <span style="font-size: 1.3em;">⚠️</span>
                        <strong>Tidak Ada Sertifikat SSL</strong>
                    </div>
                    <div class="ssl-content">
                        <div class="ssl-status" style="background: #ff9800;">
                            ⚠️ Website tidak menggunakan HTTPS
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 0.9em;">
                            Website ini tidak memiliki sertifikat SSL. Koneksi Anda <strong>tidak terenkripsi</strong> dan data yang Anda kirim dapat dibaca oleh pihak ketiga.
                        </div>
                    </div>
                </div>
            `;
        }
        return '';
    }

    if (ssl_info.success) {
        const validIcon = ssl_info.is_valid ? '✅' : '❌';
        const validText = ssl_info.is_valid ? 'Valid' : 'Tidak Valid / Kadaluarsa';
        const statusColor = ssl_info.is_valid ? '#4caf50' : '#f44336';
        
        let daysColor = '#4caf50';
        if (ssl_info.days_remaining < 30) daysColor = '#ff9800';
        if (ssl_info.days_remaining < 7) daysColor = '#f44336';
        
        return `
            <div class="ssl-certificate-box">
                <div class="ssl-header">
                    <span style="font-size: 1.3em;">🔒</span>
                    <strong>Informasi Sertifikat SSL</strong>
                </div>
                <div class="ssl-content">
                    <div class="ssl-status" style="background: ${statusColor};">
                        ${validIcon} Status: <strong>${validText}</strong>
                    </div>
                    <div class="ssl-info-grid">
                        <div class="ssl-info-item">
                            <span class="ssl-label">📝 Issued To:</span>
                            <span class="ssl-value">${ssl_info.issued_to}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">🏢 Issuer:</span>
                            <span class="ssl-value">${ssl_info.issuer}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">📅 Valid From:</span>
                            <span class="ssl-value">${ssl_info.valid_from}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">📅 Valid Until:</span>
                            <span class="ssl-value">${ssl_info.valid_until}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">⏰ Sisa Waktu:</span>
                            <span class="ssl-value" style="color: ${daysColor}; font-weight: bold;">
                                ${ssl_info.days_remaining} hari
                                ${ssl_info.days_remaining < 30 ? ' ⚠️' : ' ✅'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="ssl-certificate-box">
                <div class="ssl-header">
                    <span style="font-size: 1.3em;">❌</span>
                    <strong>Sertifikat SSL Bermasalah</strong>
                </div>
                <div class="ssl-content">
                    <div class="ssl-status" style="background: #f44336;">
                        ❌ Sertifikat Tidak Valid
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 0.9em;">
                        <strong>Error:</strong> ${ssl_info.message}<br/>
                        <small style="opacity: 0.8;">${ssl_info.error || 'Tidak dapat memverifikasi sertifikat SSL'}</small>
                    </div>
                </div>
            </div>
        `;
    }
}

function generateTelegramHTML(checks) {
    const telegram = checks?.telegram;
    
    if (!telegram) return '';
    
    const isOfficial = telegram.is_official;
    const statusColor = isOfficial ? '#4caf50' : '#f44336';
    const statusIcon = isOfficial ? '✅' : '❌';
    
    return `
        <div class="ssl-certificate-box" style="margin-top: 15px;">
            <div class="ssl-header">
                <span style="font-size: 1.3em;">📱</span>
                <strong>Verifikasi Telegram Bot</strong>
            </div>
            <div class="ssl-content">
                <div class="ssl-status" style="background: ${statusColor};">
                    ${statusIcon} ${telegram.status}
                </div>
                <div class="ssl-info-grid">
                    <div class="ssl-info-item">
                        <span class="ssl-label">👤 Username:</span>
                        <span class="ssl-value">@${telegram.username}</span>
                    </div>
                    <div class="ssl-info-item">
                        <span class="ssl-label">🔍 Status:</span>
                        <span class="ssl-value" style="color: ${statusColor};">
                            ${isOfficial ? 'Bot Resmi Terdaftar' : 'Bot Tidak Resmi / Tidak Ditemukan'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function generateIssuesHTML(issues) {
    if (issues && issues.length > 0) {
        let html = '<div class="issues-list"><h3>🔍 Masalah yang Ditemukan:</h3>';
        issues.forEach(issue => {
            html += `<div class="issue-item">⚠️ ${issue}</div>`;
        });
        html += '</div>';
        return html;
    } else {
        return '<div class="issues-list"><h3>✨ Tidak ada masalah yang ditemukan!</h3></div>';
    }
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    const { url, score, status, status_class, issues, checks } = data;

    let icon, advice;

    if (status_class === 'danger') {
        icon = '🚫';
        advice = 'Jangan mengunjungi website ini! Ada indikasi kuat bahwa website ini berbahaya.';
    } else if (status_class === 'warning') {
        icon = '⚠️';
        advice = 'Berhati-hatilah! Ada beberapa indikator mencurigakan pada website ini.';
    } else {
        icon = '✅';
        advice = 'Website ini terlihat aman untuk dikunjungi berdasarkan analisis kami.';
    }

    resultDiv.className = `result ${status_class}`;
    
    const sslHTML = generateSSLHTML(checks, url);
    const telegramHTML = generateTelegramHTML(checks);
    const issuesHTML = generateIssuesHTML(issues);
    const gsbFlagged = checks?.google_safe_browsing?.flagged || false;

    resultDiv.innerHTML = `
        <div class="result-header">
            <div>
                <div class="result-icon">${icon}</div>
                <h2>${status}</h2>
            </div>
            <div class="score-circle">${score}</div>
        </div>
        <p style="font-size: 1.05em; margin-bottom: 15px;">${advice}</p>
        <div class="details-box">
            <strong>🔗 URL yang dicek:</strong><br/>
            <span style="word-break: break-all;">${url}</span>
        </div>
        ${sslHTML}
        ${telegramHTML}
        ${issuesHTML}
        <div style="margin-top: 15px; padding: 15px; background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); border-radius: 10px; text-align: center; font-size: 0.85em; border: 1px solid rgba(100, 200, 255, 0.1); color: rgba(255, 255, 255, 0.8);">
            ${gsbFlagged ? '🔐 Diverifikasi oleh <strong style="color: #64c8ff;">Google Safe Browsing</strong>' : '🔐 Analisis berbasis algoritma keamanan'}
            <br/>
            <small style="opacity: 0.7; margin-top: 6px; display: block;">
                Hasil analisis kombinasi: SSL Certificate + Google Safe Browsing + Telegram Verification + Pattern Analysis
            </small>
        </div>
    `;

    resultDiv.style.display = 'block';
    
    // Smooth scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function checkURL() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();

    if (!url) {
        alert('❌ Mohon masukkan URL terlebih dahulu!');
        return;
    }

    if (!isValidURL(url)) {
        alert('❌ URL tidak valid! Pastikan menggunakan format http:// atau https://');
        return;
    }

    showLoading();

    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        displayResult(data);

    } catch (error) {
        console.error('Error:', error);
        
        const resultDiv = document.getElementById('result');
        resultDiv.className = 'result danger';
        resultDiv.innerHTML = `
            <div class="result-header">
                <div>
                    <div class="result-icon">❌</div>
                    <h2>Gagal Terhubung</h2>
                </div>
            </div>
            <div class="issues-list">
                <h3>🔍 Error:</h3>
                <div class="issue-item" style="color: rgba(255, 255, 255, 0.9);">
                    ${error.message}
                </div>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); border-radius: 10px; font-size: 0.9em; border: 1px solid rgba(100, 200, 255, 0.1); color: rgba(255, 255, 255, 0.8);">
                <strong>💡 Tips:</strong><br/>
                • Pastikan backend sudah di-deploy di Railway<br/>
                • Cek apakah URL di CONFIG.SERVER_URL sudah benar<br/>
                • Buka browser console (F12) untuk detail error
            </div>
        `;
        resultDiv.style.display = 'block';
    } finally {
        hideLoading();
    }
}

async function checkServerHealth() {
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/health`, {
            method: 'GET'
        });
        
        if (response.ok) {
            console.log('✅ Server terhubung dengan baik!');
            console.log('📡 Backend URL:', CONFIG.SERVER_URL);
        } else {
            console.warn('⚠️ Server merespons tapi ada error:', response.status);
        }
    } catch (error) {
        console.warn('⚠️ Tidak dapat terhubung ke server');
        console.warn('💡 Pastikan backend sudah deploy di Railway');
        console.warn('🔧 Server URL:', CONFIG.SERVER_URL);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 URL Safety Checker initialized');
    console.log('📡 Backend:', CONFIG.SERVER_URL);
    
    initializeTechEffects();
    checkServerHealth();

    document.getElementById('checkBtn').addEventListener('click', checkURL);

    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkURL();
        }
    });
    
    // Visual feedback pada input
    document.getElementById('urlInput').addEventListener('input', (e) => {
        const url = e.target.value.trim();
        const inputElement = e.target;
        
        if (url === '') {
            inputElement.style.borderColor = 'rgba(100, 200, 255, 0.3)';
            return;
        }
        
        if (isValidURL(url)) {
            inputElement.style.borderColor = '#4caf50';
        } else {
            inputElement.style.borderColor = '#f44336';
        }
    });
});