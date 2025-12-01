const CONFIG = {
    SERVER_URL: 'https://phising-detector-production.up.railway.app',
    TECH_LINES_COUNT: 5,
    CIRCUIT_DOTS_COUNT: 30,
    FALLBACK_MODE: false,
    REQUEST_TIMEOUT: 15000 // 15 seconds
};

// Helper: Fetch dengan timeout
function fetchWithTimeout(url, options = {}, timeout = CONFIG.REQUEST_TIMEOUT) {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Request timeout setelah ${timeout}ms`)), timeout)
        )
    ]);
}

// Helper: Test backend connection
async function testBackendConnection() {
    try {
        console.log('🔗 Testing backend connection to:', CONFIG.SERVER_URL);
        const response = await fetchWithTimeout(`${CONFIG.SERVER_URL}/health`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        }, 5000);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected successfully:', data);
            return { 
                connected: true, 
                data: data,
                message: 'Backend siap digunakan' 
            };
        } else {
            console.warn('⚠️ Backend response not OK:', response.status);
            return { 
                connected: false, 
                error: `HTTP ${response.status}: ${response.statusText}`,
                message: 'Backend merespons dengan error'
            };
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
        return { 
            connected: false, 
            error: error.message,
            message: 'Tidak dapat terhubung ke backend server'
        };
    }
}

// Tech effects
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

// URL validation
function isValidURL(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
        return false;
    }
}

// Loading state
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

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'error') icon = '❌';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2em;">${icon}</span>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(244, 67, 54, 0.95)' : 
                    type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 
                    type === 'warning' ? 'rgba(255, 152, 0, 0.95)' : 
                    'rgba(33, 150, 243, 0.95)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
        font-size: 0.95em;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Generate SSL HTML
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

// Generate Issues HTML
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
                <h3 style="color: #4caf50;">✨ Tidak ada masalah atau peringatan yang ditemukan!</h3>
                <div class="issue-item">✅ Website ini tampak aman berdasarkan analisis kami</div>
            </div>
        `;
    }
    
    return html;
}

// Generate Telegram HTML
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

// Display Result
function displayResult(data) {
    const resultDiv = document.getElementById('result');
    const { url, risk_score, status, status_class, issues, warnings, checks, confidence, recommendation } = data;

    let icon, advice, headerClass;
    
    // Handle both old and new status_class formats
    const statusClass = status_class || 'unknown';
    
    switch(statusClass.toLowerCase()) {
        case 'critical':
        case 'danger':
            icon = '🚨';
            advice = 'JANGAN BUKA LINK INI! Website ini sangat berbahaya.';
            headerClass = 'danger';
            break;
        case 'warning':
            icon = '⚠️';
            advice = 'Berhati-hatilah! Ada beberapa indikator mencurigakan.';
            headerClass = 'warning';
            break;
        case 'caution':
            icon = '🔶';
            advice = 'Secara umum aman, tapi tetap waspada.';
            headerClass = 'warning';
            break;
        case 'safe':
            icon = '✅';
            advice = 'Website ini terlihat aman untuk dikunjungi.';
            headerClass = 'safe';
            break;
        default:
            icon = '❓';
            advice = 'Status tidak dapat ditentukan.';
            headerClass = 'warning';
    }

    // Use recommendation from backend if available
    const finalAdvice = recommendation || advice;
    
    resultDiv.className = `result ${headerClass}`;
    
    const sslHTML = generateSSLHTML(checks, url);
    const telegramHTML = generateTelegramHTML(checks);
    const issuesHTML = generateIssuesHTML(issues, warnings);
    
    // Count successful checks
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
                <h2>${status || 'Hasil Analisis'}</h2>
                <p style="font-size: 0.9em; opacity: 0.8; margin-top: 5px;">${finalAdvice}</p>
            </div>
            <div class="score-circle" style="position: relative;">
                ${risk_score !== undefined ? risk_score : 'N/A'}
                <div style="position: absolute; bottom: -25px; width: 100%; text-align: center; font-size: 0.7em; color: rgba(255, 255, 255, 0.7);">
                    Risk Score
                </div>
            </div>
        </div>
        
        ${confidence !== undefined ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0; padding: 10px; background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
                <div style="text-align: center;">
                    <div style="font-size: 0.8em; opacity: 0.7;">Confidence</div>
                    <div style="font-size: 1.2em; font-weight: bold; color: #64c8ff;">${confidence}%</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.8em; opacity: 0.7;">Total Checks</div>
                    <div style="font-size: 1.2em; font-weight: bold; color: #64c8ff;">${totalChecks}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.8em; opacity: 0.7;">Successful</div>
                    <div style="font-size: 1.2em; font-weight: bold; color: #4caf50;">${successfulChecks}</div>
                </div>
            </div>
        ` : ''}
        
        <div class="details-box">
            <strong>🔗 URL yang dicek:</strong><br/>
            <span style="word-break: break-all; font-family: monospace; font-size: 0.9em;">${url}</span>
            <div style="margin-top: 5px; font-size: 0.85em; opacity: 0.7;">
                Hostname: ${data.hostname || url.split('/')[2] || 'Tidak diketahui'}
            </div>
        </div>
        
        ${sslHTML}
        ${telegramHTML}
        ${issuesHTML}
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(10px); border-radius: 10px; text-align: center; font-size: 0.85em; border: 1px solid rgba(100, 200, 255, 0.15); color: rgba(255, 255, 255, 0.8);">
            🔐 <strong style="color: #64c8ff;">URL SAFETY CHECKER</strong><br/>
            <small style="opacity: 0.7; margin-top: 6px; display: block; font-size: 0.8em;">
                Analisis berbasis: SSL Certificate + Google Safe Browsing + Telegram Verification + Pattern Analysis
            </small>
        </div>
    `;

    resultDiv.style.display = 'block';
    
    // Smooth scroll to result with delay for animation
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

// FALLBACK MODE - Used when backend is down
function runFallbackAnalysis(url) {
    console.log('🔄 Running fallback analysis for:', url);
    
    // Simple heuristic analysis in frontend
    let riskScore = 30;
    let issues = [];
    let warnings = [];
    
    // Basic checks
    if (!url.startsWith('https://')) {
        riskScore += 25;
        issues.push('Website tidak menggunakan HTTPS');
    }
    
    if (url.includes('t.me/') || url.includes('telegram.me/')) {
        warnings.push('Link Telegram - verifikasi manual diperlukan');
    }
    
    if (url.length > 100) {
        riskScore += 10;
        warnings.push('URL terlalu panjang');
    }
    
    // Determine status
    let status, statusClass;
    if (riskScore >= 70) {
        status = '⚠️ BERBAHAYA (Fallback Mode)';
        statusClass = 'danger';
    } else if (riskScore >= 40) {
        status = '🔶 WASPADA (Fallback Mode)';
        statusClass = 'warning';
    } else {
        status = '✅ AMAN (Fallback Mode)';
        statusClass = 'safe';
    }
    
    return {
        url: url,
        risk_score: riskScore,
        status: status,
        status_class: statusClass,
        issues: issues,
        warnings: warnings,
        checks: {
            heuristic: { score: riskScore, issues: issues },
            ssl: { success: false, message: 'Fallback mode - SSL tidak dicek' }
        },
        confidence: 50,
        recommendation: 'Analisis dalam mode fallback. Backend sedang offline.'
    };
}

// MAIN FUNCTION - Check URL
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
        
        const response = await fetchWithTimeout(`${CONFIG.SERVER_URL}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        console.log(`📥 Response status: ${response.status} ${response.statusText}`);
        
        // Handle non-200 responses
        if (!response.ok) {
            let errorMessage = `Server error: ${response.status} ${response.statusText}`;
            let errorDetail = '';
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
                errorDetail = JSON.stringify(errorData, null, 2);
            } catch (e) {
                // If response is not JSON, read as text
                try {
                    const text = await response.text();
                    if (text) {
                        errorDetail = text.substring(0, 200);
                        errorMessage = `Server error ${response.status}: ${text.substring(0, 100)}...`;
                    }
                } catch (textError) {
                    errorDetail = 'Tidak dapat membaca response body';
                }
            }
            
            console.error('❌ Server error details:', errorDetail);
            
            // If server is down, offer fallback mode
            if (response.status >= 500) {
                const useFallback = confirm(
                    `Server mengalami error (${response.status}).\n` +
                    `Ingin menggunakan analisis fallback mode?\n\n` +
                    `Detail: ${errorMessage}`
                );
                
                if (useFallback) {
                    const fallbackResult = runFallbackAnalysis(url);
                    displayResult(fallbackResult);
                    showNotification('⚠️ Menggunakan fallback mode', 'warning');
                    hideLoading();
                    return;
                }
            }
            
            throw new Error(errorMessage);
        }

        // Parse successful response
        const data = await response.json();
        console.log('✅ Response berhasil diterima:', data);
        
        // Validate response structure
        if (!data || typeof data !== 'object') {
            throw new Error('Response tidak valid dari server');
        }
        
        displayResult(data);
        
        // Show appropriate notification
        if (data.status_class === 'safe') {
            showNotification('✅ Website terdeteksi aman!', 'success');
        } else if (data.status_class === 'critical' || data.status_class === 'danger') {
            showNotification('🚨 Website berbahaya terdeteksi!', 'error');
        } else {
            showNotification('⚠️ Hasil analisis siap', 'warning');
        }

    } catch (error) {
        console.error('❌ Error selama proses check:', error);
        
        // Display detailed error to user
        const resultDiv = document.getElementById('result');
        resultDiv.className = 'result danger';
        
        const errorHtml = `
            <div class="result-header">
                <div>
                    <div class="result-icon">⚠️</div>
                    <h2>Terjadi Kesalahan</h2>
                </div>
            </div>
            <div class="issues-list">
                <h3>🔍 Detail Error:</h3>
                <div class="issue-item">
                    <strong>Pesan:</strong> ${error.message || 'Unknown error'}
                </div>
                <div class="issue-item">
                    <strong>Endpoint:</strong> ${CONFIG.SERVER_URL}/check
                </div>
                <div class="issue-item">
                    <strong>URL yang dicek:</strong> ${url}
                </div>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 10px; font-size: 0.9em; border: 1px solid rgba(100, 200, 255, 0.1); color: rgba(255, 255, 255, 0.8);">
                <strong>💡 Langkah Troubleshooting:</strong><br/>
                1. Cek koneksi internet Anda<br/>
                2. Verifikasi backend server berjalan di <a href="${CONFIG.SERVER_URL}/health" target="_blank" style="color: #64c8ff;">${CONFIG.SERVER_URL}/health</a><br/>
                3. Coba URL yang berbeda (contoh: https://google.com)<br/>
                4. Hubungi administrator jika masalah berlanjut
            </div>
            <div style="margin-top: 15px; text-align: center;">
                <button id="retryBtn" style="background: #64c8ff; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    🔄 Coba Lagi
                </button>
                <button id="fallbackBtn" style="background: #ff9800; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-left: 10px; font-weight: bold;">
                    🛡️ Gunakan Fallback Mode
                </button>
            </div>
        `;
        
        resultDiv.innerHTML = errorHtml;
        resultDiv.style.display = 'block';
        
        // Add event listeners to buttons
        setTimeout(() => {
            const retryBtn = document.getElementById('retryBtn');
            const fallbackBtn = document.getElementById('fallbackBtn');
            
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    resultDiv.style.display = 'none';
                    checkURL();
                });
            }
            
            if (fallbackBtn) {
                fallbackBtn.addEventListener('click', () => {
                    const fallbackResult = runFallbackAnalysis(url);
                    displayResult(fallbackResult);
                    showNotification('⚠️ Menggunakan fallback mode', 'warning');
                });
            }
        }, 100);
        
        showNotification('❌ Gagal menganalisis URL', 'error');
        
    } finally {
        hideLoading();
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 URL Safety Checker initialized');
    console.log('📡 Backend URL:', CONFIG.SERVER_URL);
    
    // Initialize tech effects
    initializeTechEffects();
    
    // Test backend connection on startup
    testBackendConnection().then(result => {
        if (result.connected) {
            console.log('✅ Backend connection test passed');
            showNotification('✅ Backend server terhubung', 'success', 3000);
        } else {
            console.warn('⚠️ Backend connection test failed:', result.error);
            showNotification('⚠️ Backend server tidak terhubung', 'warning', 5000);
            
            // Optionally enable fallback mode
            const enableFallback = confirm(
                'Backend server tidak dapat dihubungi.\n' +
                'Aktifkan fallback mode untuk analisis dasar?\n\n' +
                'Error: ' + result.error
            );
            
            if (enableFallback) {
                CONFIG.FALLBACK_MODE = true;
                showNotification('🛡️ Fallback mode diaktifkan', 'info');
            }
        }
    }).catch(error => {
        console.error('❌ Error testing backend:', error);
    });
    
    // Setup event listeners
    const checkBtn = document.getElementById('checkBtn');
    const urlInput = document.getElementById('urlInput');
    
    if (checkBtn) {
        checkBtn.addEventListener('click', checkURL);
    }
    
    if (urlInput) {
        // Enter key support
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkURL();
            }
        });
        
        // Visual feedback
        urlInput.addEventListener('input', (e) => {
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
        
        // Example URL rotation
        const examples = [
            'https://google.com',
            'https://facebook.com',
            'https://github.com',
            'https://t.me/examplebot'
        ];
        
        let exampleIndex = 0;
        setInterval(() => {
            if (!urlInput.value && document.activeElement !== urlInput) {
                urlInput.placeholder = `Contoh: ${examples[exampleIndex]}`;
                exampleIndex = (exampleIndex + 1) % examples.length;
            }
        }, 3000);
    }
    
    // Add CSS for notifications if not already present
    if (!document.querySelector('style#notification-styles')) {
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
            
            @keyframes pulseGlow {
                0%, 100% { 
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3), 0 0 0 rgba(100, 200, 255, 0.5);
                }
                50% { 
                    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(100, 200, 255, 0.8);
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidURL,
        checkURL,
        testBackendConnection
    };
}