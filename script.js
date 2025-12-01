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

// Enhanced SSL HTML generator
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
        
        // Additional SSL info from enhanced backend
        const tlsVersion = ssl_info.tls_version || 'Tidak diketahui';
        const cipherSuite = ssl_info.cipher_suite || 'Tidak diketahui';
        const sslStrength = ssl_info.ssl_strength || 'Tidak diketahui';
        
        return `
            <div class="ssl-certificate-box">
                <div class="ssl-header">
                    <span style="font-size: 1.3em;">🔒</span>
                    <strong>Analisis Sertifikat SSL/TLS</strong>
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
                        <div class="ssl-info-item">
                            <span class="ssl-label">🔐 TLS Version:</span>
                            <span class="ssl-value">${tlsVersion}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">⚡ Cipher Suite:</span>
                            <span class="ssl-value">${cipherSuite}</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">🛡️ SSL Strength:</span>
                            <span class="ssl-value" style="color: ${sslStrength === 'strong' ? '#4caf50' : '#ff9800'}">
                                ${sslStrength === 'strong' ? '✅ Kuat' : '⚠️ Lemah'}
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

// New function for DNS Analysis
function generateDNSHTML(checks) {
    const dns_info = checks?.dns;
    
    if (!dns_info || !dns_info.success) return '';
    
    let dnsHTML = `
        <div class="ssl-certificate-box" style="margin-top: 15px;">
            <div class="ssl-header">
                <span style="font-size: 1.3em;">🌐</span>
                <strong>Analisis DNS</strong>
            </div>
            <div class="ssl-content">
    `;
    
    // DNS Issues
    if (dns_info.issues && dns_info.issues.length > 0) {
        dnsHTML += `
            <div class="ssl-status" style="background: #ff9800; margin-bottom: 15px;">
                ⚠️ ${dns_info.issues.length} masalah DNS ditemukan
            </div>
        `;
    }
    
    // DNS Records
    const records = dns_info.records || {};
    if (Object.keys(records).length > 0) {
        dnsHTML += '<div class="ssl-info-grid">';
        
        if (records.A && records.A.length > 0) {
            dnsHTML += `
                <div class="ssl-info-item">
                    <span class="ssl-label">📍 IP Address:</span>
                    <span class="ssl-value">${records.A.join(', ')}</span>
                </div>
            `;
        }
        
        if (records.MX && records.MX.length > 0) {
            dnsHTML += `
                <div class="ssl-info-item">
                    <span class="ssl-label">📧 Mail Server:</span>
                    <span class="ssl-value">${records.MX.join(', ')}</span>
                </div>
            `;
        }
        
        if (records.NS && records.NS.length > 0) {
            dnsHTML += `
                <div class="ssl-info-item">
                    <span class="ssl-label">🌐 Name Servers:</span>
                    <span class="ssl-value">${records.NS.join(', ')}</span>
                </div>
            `;
        }
        
        dnsHTML += '</div>';
    }
    
    dnsHTML += '</div></div>';
    return dnsHTML;
}

// New function for WHOIS Analysis
function generateWHOISHTML(checks) {
    const whois_info = checks?.whois;
    
    if (!whois_info || !whois_info.success) return '';
    
    const age_days = whois_info.age_days;
    const registrar = whois_info.registrar || 'Tidak diketahui';
    const creation_date = whois_info.creation_date || 'Tidak diketahui';
    
    let ageColor = '#4caf50';
    let ageIcon = '✅';
    let ageStatus = 'Baik';
    
    if (age_days < 7) {
        ageColor = '#f44336';
        ageIcon = '🚨';
        ageStatus = 'Sangat Baru (Risk Tinggi)';
    } else if (age_days < 30) {
        ageColor = '#ff9800';
        ageIcon = '⚠️';
        ageStatus = 'Baru (Mencurigakan)';
    } else if (age_days < 365) {
        ageColor = '#ff9800';
        ageIcon = '📅';
        ageStatus = 'Relatif Baru';
    }
    
    return `
        <div class="ssl-certificate-box" style="margin-top: 15px;">
            <div class="ssl-header">
                <span style="font-size: 1.3em;">📅</span>
                <strong>Informasi Domain (WHOIS)</strong>
            </div>
            <div class="ssl-content">
                <div class="ssl-info-grid">
                    <div class="ssl-info-item">
                        <span class="ssl-label">${ageIcon} Usia Domain:</span>
                        <span class="ssl-value" style="color: ${ageColor}; font-weight: bold;">
                            ${age_days} hari (${ageStatus})
                        </span>
                    </div>
                    <div class="ssl-info-item">
                        <span class="ssl-label">🏢 Registrar:</span>
                        <span class="ssl-value">${registrar}</span>
                    </div>
                    <div class="ssl-info-item">
                        <span class="ssl-label">📅 Tanggal Pembuatan:</span>
                        <span class="ssl-value">${creation_date}</span>
                    </div>
                </div>
                ${whois_info.issues && whois_info.issues.length > 0 ? `
                    <div style="margin-top: 15px; padding: 10px; background: rgba(244, 67, 54, 0.1); border-radius: 8px; border-left: 4px solid #f44336;">
                        <strong style="color: #f44336;">⚠️ Issues:</strong>
                        <ul style="margin: 5px 0 0 15px; color: rgba(255, 255, 255, 0.9); font-size: 0.9em;">
                            ${whois_info.issues.map(issue => `<li>${issue}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Enhanced API Results Display
function generateAPIResultsHTML(checks) {
    let html = '';
    
    // VirusTotal
    const vt_data = checks?.virustotal;
    if (vt_data && vt_data.success) {
        const vtColor = vt_data.malicious > 0 ? '#f44336' : '#4caf50';
        const vtIcon = vt_data.malicious > 0 ? '🚨' : '✅';
        
        html += `
            <div class="ssl-certificate-box" style="margin-top: 15px;">
                <div class="ssl-header">
                    <span style="font-size: 1.3em;">🛡️</span>
                    <strong>VirusTotal Analysis</strong>
                </div>
                <div class="ssl-content">
                    <div class="ssl-status" style="background: ${vtColor};">
                        ${vtIcon} ${vt_data.malicious > 0 ? 
                            `${vt_data.malicious} engine mendeteksi malicious` : 
                            'Tidak ditemukan ancaman'}
                    </div>
                    <div class="ssl-info-grid">
                        <div class="ssl-info-item">
                            <span class="ssl-label">🚫 Malicious:</span>
                            <span class="ssl-value" style="color: ${vt_data.malicious > 0 ? '#f44336' : '#4caf50'}">
                                ${vt_data.malicious}
                            </span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">⚠️ Suspicious:</span>
                            <span class="ssl-value" style="color: #ff9800">
                                ${vt_data.suspicious || 0}
                            </span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">✅ Harmless:</span>
                            <span class="ssl-value" style="color: #4caf50">
                                ${vt_data.harmless || 0}
                            </span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">🔢 Total Engines:</span>
                            <span class="ssl-value">${vt_data.total_engines || 0}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // IPQualityScore
    const ipqs_data = checks?.ipqualityscore;
    if (ipqs_data && ipqs_data.success) {
        const riskScore = ipqs_data.risk_score || 0;
        let riskColor = '#4caf50';
        let riskLevel = 'Rendah';
        
        if (riskScore > 70) {
            riskColor = '#f44336';
            riskLevel = 'Sangat Tinggi';
        } else if (riskScore > 50) {
            riskColor = '#ff9800';
            riskLevel = 'Tinggi';
        } else if (riskScore > 30) {
            riskColor = '#ffeb3b';
            riskLevel = 'Sedang';
        }
        
        html += `
            <div class="ssl-certificate-box" style="margin-top: 15px;">
                <div class="ssl-header">
                    <span style="font-size: 1.3em;">📊</span>
                    <strong>IPQualityScore Reputation</strong>
                </div>
                <div class="ssl-content">
                    <div class="ssl-status" style="background: ${riskColor};">
                        ${riskScore > 50 ? '⚠️' : '✅'} Risk Score: ${riskScore}/100 (${riskLevel})
                    </div>
                    <div class="ssl-info-grid">
                        <div class="ssl-info-item">
                            <span class="ssl-label">🎭 Phishing:</span>
                            <span class="ssl-value" style="color: ${ipqs_data.phishing ? '#f44336' : '#4caf50'}">
                                ${ipqs_data.phishing ? '✅ Terdeteksi' : '❌ Tidak terdeteksi'}
                            </span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">🦠 Malware:</span>
                            <span class="ssl-value" style="color: ${ipqs_data.malware ? '#f44336' : '#4caf50'}">
                                ${ipqs_data.malware ? '✅ Terdeteksi' : '❌ Tidak terdeteksi'}
                            </span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">🤔 Suspicious:</span>
                            <span class="ssl-value" style="color: ${ipqs_data.suspicious ? '#ff9800' : '#4caf50'}">
                                ${ipqs_data.suspicious ? '✅ Ya' : '❌ Tidak'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // RapidAPI Phishing
    const rapidapi_data = checks?.rapidapi_phishing;
    if (rapidapi_data && rapidapi_data.success) {
        const phishingData = rapidapi_data.data || {};
        if (phishingData.is_phishing) {
            html += `
                <div class="ssl-certificate-box" style="margin-top: 15px;">
                    <div class="ssl-header">
                        <span style="font-size: 1.3em;">🔍</span>
                        <strong>Phishing Risk API</strong>
                    </div>
                    <div class="ssl-content">
                        <div class="ssl-status" style="background: #f44336;">
                            🚨 Terdeteksi sebagai Phishing
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.9); padding: 10px; background: rgba(244, 67, 54, 0.1); border-radius: 8px; font-size: 0.9em;">
                            Confidence: ${phishingData.confidence || 'N/A'}%<br>
                            Risk Level: ${phishingData.risk_level || 'N/A'}
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    return html;
}

// Enhanced function for Telegram HTML
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

// Enhanced issues display
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

// Enhanced result display
function displayResult(data) {
    const resultDiv = document.getElementById('result');
    const { url, risk_score, status, status_class, issues, warnings, checks, confidence, recommendation } = data;

    let icon, advice, headerClass;
    
    switch(status_class) {
        case 'critical':
            icon = '🚨';
            advice = 'JANGAN BUKA LINK INI! Website ini sangat berbahaya dan terdeteksi sebagai phishing.';
            headerClass = 'danger';
            break;
        case 'danger':
            icon = '🚫';
            advice = 'Hindari website ini! Ada indikasi kuat bahwa website ini berbahaya.';
            headerClass = 'danger';
            break;
        case 'warning':
            icon = '⚠️';
            advice = 'Berhati-hatilah! Ada beberapa indikator mencurigakan pada website ini.';
            headerClass = 'warning';
            break;
        case 'caution':
            icon = '🔶';
            advice = 'Secara umum aman, tapi tetap perhatikan URL dan jangan masukkan data sensitif.';
            headerClass = 'warning';
            break;
        default:
            icon = '✅';
            advice = 'Website ini terlihat aman untuk dikunjungi berdasarkan analisis kami.';
            headerClass = 'safe';
    }

    // Use recommendation from backend if available
    const finalAdvice = recommendation || advice;
    
    resultDiv.className = `result ${headerClass}`;
    
    const sslHTML = generateSSLHTML(checks, url);
    const dnsHTML = generateDNSHTML(checks);
    const whoisHTML = generateWHOISHTML(checks);
    const apiHTML = generateAPIResultsHTML(checks);
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
                <h2>${status}</h2>
                <p style="font-size: 0.9em; opacity: 0.8; margin-top: 5px;">${finalAdvice}</p>
            </div>
            <div class="score-circle" style="position: relative;">
                ${risk_score}
                <div style="position: absolute; bottom: -25px; width: 100%; text-align: center; font-size: 0.7em; color: rgba(255, 255, 255, 0.7);">
                    Score
                </div>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 15px 0; padding: 10px; background: rgba(0, 0, 0, 0.3); border-radius: 8px;">
            <div style="text-align: center;">
                <div style="font-size: 0.8em; opacity: 0.7;">Confidence</div>
                <div style="font-size: 1.2em; font-weight: bold; color: #64c8ff;">${confidence || checkSuccessRate}%</div>
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
        
        <div class="details-box">
            <strong>🔗 URL yang dicek:</strong><br/>
            <span style="word-break: break-all; font-family: monospace; font-size: 0.9em;">${url}</span>
            <div style="margin-top: 5px; font-size: 0.85em; opacity: 0.7;">
                Hostname: ${data.hostname || url.split('/')[2]}
            </div>
        </div>
        
        ${sslHTML}
        ${dnsHTML}
        ${whoisHTML}
        ${apiHTML}
        ${telegramHTML}
        ${issuesHTML}
        
        <div style="margin-top: 20px; padding: 15px; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(10px); border-radius: 10px; text-align: center; font-size: 0.85em; border: 1px solid rgba(100, 200, 255, 0.15); color: rgba(255, 255, 255, 0.8);">
            🔐 <strong style="color: #64c8ff;">SUPER ENHANCED ANALYSIS</strong><br/>
            <small style="opacity: 0.7; margin-top: 6px; display: block; font-size: 0.8em;">
                • VirusTotal (70+ engines) • IPQualityScore • Google Safe Browsing<br/>
                • WHOIS Analysis • DNS Analysis • SSL Certificate Analysis • Content Analysis
            </small>
        </div>
    `;

    resultDiv.style.display = 'block';
    
    // Smooth scroll to result with delay for animation
    setTimeout(() => {
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
}

// Enhanced error handling
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
        
        // Show success notification
        if (data.status_class === 'safe') {
            showNotification('✅ Website terdeteksi aman!', 'success');
        } else if (data.status_class === 'critical' || data.status_class === 'danger') {
            showNotification('🚨 Website berbahaya terdeteksi!', 'error');
        }

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
                • Server URL: ${CONFIG.SERVER_URL}
            </div>
        `;
        resultDiv.style.display = 'block';
        
        showNotification('❌ Gagal menghubungi server', 'error');
    } finally {
        hideLoading();
    }
}

// Add notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.2em;">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? 'rgba(244, 67, 54, 0.9)' : type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(33, 150, 243, 0.9)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add CSS animations for notification
const style = document.createElement('style');
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

async function checkServerHealth() {
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}/health`, {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Server terhubung dengan baik!', data);
            console.log('📡 Backend URL:', CONFIG.SERVER_URL);
            
            // Show server status in console
            if (data.api_status) {
                console.log('📊 API Status:', data.api_status);
            }
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
    console.log('🚀 SUPER ENHANCED URL Safety Checker initialized');
    console.log('📡 Backend:', CONFIG.SERVER_URL);
    
    initializeTechEffects();
    checkServerHealth();

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
    
    // Add example URLs for testing
    document.getElementById('urlInput').addEventListener('focus', () => {
        const examples = [
            'https://google.com',
            'https://facebook.com',
            'https://example.com'
        ];
        
        // Add placeholder rotation
        const input = document.getElementById('urlInput');
        let exampleIndex = 0;
        
        setInterval(() => {
            input.placeholder = `Contoh: ${examples[exampleIndex]}`;
            exampleIndex = (exampleIndex + 1) % examples.length;
        }, 3000);
    });
});