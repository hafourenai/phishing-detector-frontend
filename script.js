const CONFIG = {
    SERVER_URL: 'https://phising-detector-production.up.railway.app',
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

// Enhanced error notification
function showNotification(message, type = 'info', duration = 3000) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let icon = 'ℹ️';
    if (type === 'error') icon = '❌';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px;">
            <span style="font-size: 1.2em;">${icon}</span>
            <span>${message}</span>
        </div>
    `;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(244, 67, 54, 0.95)' : 
                    type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 
                    type === 'warning' ? 'rgba(255, 152, 0, 0.95)' : 
                    'rgba(33, 150, 243, 0.95)'};
        color: white;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-size: 0.95em;
    `;
    
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Add CSS animations for notification
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
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
                            <span class="ssl-value">${ssl_info.issued_to || 'Tidak diketahui'}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">🏢 Issuer:</span>
                            <span class="ssl-value">${ssl_info.issuer || 'Tidak diketahui'}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">📅 Valid From:</span>
                            <span class="ssl-value">${ssl_info.valid_from || 'Tidak diketahui'}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">📅 Valid Until:</span>
                            <span class="ssl-value">${ssl_info.valid_until || 'Tidak diketahui'}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">⏰ Sisa Waktu:</span>
                            <span class="ssl-value" style="color: ${daysColor}; font-weight: bold;">
                                ${ssl_info.days_remaining !== undefined ? ssl_info.days_remaining + ' hari' : 'Tidak diketahui'}
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
                        <strong>Error:</strong> ${ssl_info.message || 'Tidak dapat memverifikasi SSL'}<br/>
                        ${ssl_info.error ? `<small style="opacity: 0.8;">${ssl_info.error}</small>` : ''}
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
                    ${statusIcon} ${telegram.status || 'Status tidak diketahui'}
                </div>
                <div class="ssl-info-grid">
                    <div class="ssl-info-item">
                        <span class="ssl-label">👤 Username:</span>
                        <span class="ssl-value">@${telegram.username || 'tidak-diketahui'}</span>
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

function generateIssuesHTML(issues, warnings) {
    let html = '';
    
    if (issues && issues.length > 0) {
        html += `
            <div class="issues-list">
                <h3>🚨 Masalah yang Ditemukan:</h3>
                ${issues.map(issue => `
                    <div class="issue-item">
                        <span style="color: #ff6b6b;">●</span> ${issue}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Tambah support untuk warnings jika ada
    if (warnings && warnings.length > 0) {
        html += `
            <div class="issues-list" style="margin-top: 15px; background: rgba(255, 152, 0, 0.1); border-left: 4px solid #ff9800;">
                <h3 style="color: #ff9800;">⚠️ Peringatan:</h3>
                ${warnings.map(warning => `
                    <div class="issue-item">
                        <span style="color: #ff9800;">●</span> ${warning}
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    if (!issues?.length && !warnings?.length) {
        html += `
            <div class="issues-list" style="background: rgba(76, 175, 80, 0.1); border-left: 4px solid #4caf50;">
                <h3 style="color: #4caf50;">✨ Tidak ada masalah yang ditemukan!</h3>
                <div class="issue-item">✅ Website ini tampak aman berdasarkan analisis kami</div>
            </div>
        `;
    }
    
    return html;
}

function displayResult(data) {
    const resultDiv = document.getElementById('result');
    
    // Handle both old and new data formats
    const url = data.url || '';
    const score = data.risk_score || data.score || 0;
    const status = data.status || 'Hasil Analisis';
    const status_class = data.status_class || 'unknown';
    const issues = data.issues || [];
    const warnings = data.warnings || [];
    const checks = data.checks || {};
    const confidence = data.confidence;
    const recommendation = data.recommendation;

    let icon, advice;

    if (status_class === 'critical' || status_class === 'danger') {
        icon = '🚫';
        advice = 'Jangan mengunjungi website ini! Ada indikasi kuat bahwa website ini berbahaya.';
    } else if (status_class === 'warning') {
        icon = '⚠️';
        advice = 'Berhati-hatilah! Ada beberapa indikator mencurigakan pada website ini.';
    } else if (status_class === 'caution') {
        icon = '🔶';
        advice = 'Secara umum aman, tapi tetap waspada terhadap website ini.';
    } else {
        icon = '✅';
        advice = 'Website ini terlihat aman untuk dikunjungi berdasarkan analisis kami.';
    }

    // Gunakan recommendation dari backend jika ada
    const finalAdvice = recommendation || advice;
    
    resultDiv.className = `result ${status_class}`;
    
    const sslHTML = generateSSLHTML(checks, url);
    const telegramHTML = generateTelegramHTML(checks);
    const issuesHTML = generateIssuesHTML(issues, warnings);
    const gsbFlagged = checks?.google_safe_browsing?.flagged || false;

    // Count successful checks untuk confidence
    const successfulChecks = Object.values(checks || {}).filter(check => 
        (typeof check === 'object' && check !== null && check.success !== false) || 
        (check && typeof check === 'object' && !check.error)
    ).length;
    
    const totalChecks = Object.keys(checks || {}).length;
    const checkSuccessRate = totalChecks > 0 ? Math.round((successfulChecks / totalChecks) * 100) : 0;

    resultDiv.innerHTML = `
        <div class="result-header">
            <div>
                <div class="result-icon">${icon}</div>
                <h2>${status}</h2>
            </div>
            <div class="score-circle">${score}</div>
        </div>
        <p style="font-size: 1.05em; margin-bottom: 15px;">${finalAdvice}</p>
        
        ${confidence !== undefined ? `
            <div style="margin: 15px 0; padding: 10px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; text-align: center;">
                <div style="font-size: 0.9em; opacity: 0.7;">Confidence Score</div>
                <div style="font-size: 1.5em; font-weight: bold; color: #64c8ff;">${confidence}%</div>
            </div>
        ` : ''}
        
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
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

async function checkURL() {
    const urlInput = document.getElementById('urlInput');
    const url = urlInput.value.trim();

    if (!url) {
        showNotification('❌ Mohon masukkan URL terlebih dahulu!', 'error');
        return;
    }

    if (!isValidURL(url)) {
        showNotification('❌ URL tidak valid! Pastikan menggunakan format http:// atau https://', 'error');
        return;
    }

    showLoading();

    try {
        console.log(`🔄 Mengirim request ke: ${CONFIG.SERVER_URL}/check`);
        console.log(`📡 URL yang dicek: ${url}`);
        
        const response = await fetch(`${CONFIG.SERVER_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        
        // Handle non-200 responses dengan lebih baik
        if (!response.ok) {
            let errorMessage = `Server error: ${response.status}`;
            
            // Coba dapatkan detail error dari response
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } catch (e) {
                // Jika response bukan JSON, baca sebagai text
                try {
                    const text = await response.text();
                    if (text && text.length > 0) {
                        errorMessage = `Server error ${response.status}: ${text.substring(0, 100)}`;
                    }
                } catch (textError) {
                    // Ignore text parsing error
                }
            }
            
            throw new Error(errorMessage);
        }

        // Parse successful response
        const data = await response.json();
        console.log('✅ Response berhasil diterima:', data);
        
        displayResult(data);
        
        // Show success notification
        if (data.status_class === 'safe') {
            showNotification('✅ Website terdeteksi aman!', 'success');
        } else if (data.status_class === 'critical' || data.status_class === 'danger') {
            showNotification('🚨 Website berbahaya terdeteksi!', 'error');
        } else {
            showNotification('⚠️ Hasil analisis siap', 'warning');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        
        // Tampilkan error yang lebih informatif
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
                <h3>🔍 Error Details:</h3>
                <div class="issue-item" style="color: rgba(255, 255, 255, 0.9);">
                    <strong>Message:</strong> ${error.message}
                </div>
                <div class="issue-item" style="color: rgba(255, 255, 255, 0.9);">
                    <strong>Endpoint:</strong> ${CONFIG.SERVER_URL}/check
                </div>
                <div class="issue-item" style="color: rgba(255, 255, 255, 0.9);">
                    <strong>URL Checked:</strong> ${url}
                </div>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: rgba(0, 0, 0, 0.3); backdrop-filter: blur(10px); border-radius: 10px; font-size: 0.9em; border: 1px solid rgba(100, 200, 255, 0.1); color: rgba(255, 255, 255, 0.8);">
                <strong>💡 Troubleshooting Steps:</strong><br/>
                1. Cek apakah backend server sedang berjalan<br/>
                2. Buka <a href="${CONFIG.SERVER_URL}/health" target="_blank" style="color: #64c8ff;">${CONFIG.SERVER_URL}/health</a> di browser<br/>
                3. Lihat console untuk detail error (F12)<br/>
                4. Pastikan CORS di backend sudah dikonfigurasi
            </div>
            <div style="margin-top: 15px; text-align: center;">
                <button id="retryBtn" style="background: #64c8ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    🔄 Coba Lagi
                </button>
            </div>
        `;
        resultDiv.style.display = 'block';
        
        // Add event listener untuk retry button
        setTimeout(() => {
            const retryBtn = document.getElementById('retryBtn');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    resultDiv.style.display = 'none';
                    checkURL();
                });
            }
        }, 100);
        
        showNotification('❌ Gagal menghubungi server backend', 'error');
        
    } finally {
        hideLoading();
    }
}

async function checkServerHealth() {
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/health`, {
            method: 'GET',
            timeout: 5000
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Server terhubung dengan baik!', data);
            console.log('📡 Backend URL:', CONFIG.SERVER_URL);
            return true;
        } else {
            console.warn('⚠️ Server merespons tapi ada error:', response.status);
            return false;
        }
    } catch (error) {
        console.warn('⚠️ Tidak dapat terhubung ke server:', error.message);
        console.warn('💡 Pastikan backend sudah deploy di Railway');
        console.warn('🔧 Server URL:', CONFIG.SERVER_URL);
        return false;
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 URL Safety Checker initialized');
    console.log('📡 Backend:', CONFIG.SERVER_URL);
    
    initializeTechEffects();
    
    // Test koneksi saat load
    checkServerHealth().then(isConnected => {
        if (!isConnected) {
            showNotification('⚠️ Backend server tidak terhubung', 'warning', 5000);
        } else {
            showNotification('✅ Backend server terhubung', 'success', 3000);
        }
    });

    document.getElementById('checkBtn').addEventListener('click', checkURL);

    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkURL();
        }
    });
    
    // Enhanced visual feedback pada input
    document.getElementById('urlInput').addEventListener('input', (e) => {
        const url = e.target.value.trim();
        const inputElement = e.target;
        
        if (url === '') {
            inputElement.style.borderColor = 'rgba(100, 200, 255, 0.3)';
            inputElement.style.boxShadow = 'none';
            return;
        }
        
        if (isValidURL(url)) {
            inputElement.style.borderColor = '#4caf50';
            inputElement.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        } else {
            inputElement.style.borderColor = '#f44336';
            inputElement.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        }
    });
    
    // Example URL rotation untuk placeholder
    const examples = [
        'https://google.com',
        'https://facebook.com',
        'https://example.com',
        'https://t.me/example'
    ];
    
    let exampleIndex = 0;
    const urlInput = document.getElementById('urlInput');
    
    setInterval(() => {
        if (urlInput && !urlInput.value && document.activeElement !== urlInput) {
            urlInput.placeholder = `Contoh: ${examples[exampleIndex]}`;
            exampleIndex = (exampleIndex + 1) % examples.length;
        }
    }, 3000);
});