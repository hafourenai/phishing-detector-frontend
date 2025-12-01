const CONFIG = {
  SERVER_URL: "https://phising-detector-production.up.railway.app",
  TECH_LINES_COUNT: 8,
  CIRCUIT_DOTS_COUNT: 50,
  REQUEST_TIMEOUT: 15000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

// Cache storage
let urlCache = new Map();

function initializeTechEffects() {
  // Create animated background lines
  for (let i = 0; i < CONFIG.TECH_LINES_COUNT; i++) {
    createTechLine("horizontal");
    createTechLine("vertical");
  }

  // Create circuit dots
  for (let i = 0; i < CONFIG.CIRCUIT_DOTS_COUNT; i++) {
    createCircuitDot();
  }

  // Create gradient definitions for SVG
  createSVGGradient();
}

function createTechLine(orientation) {
  const line = document.createElement("div");
  line.className = `tech-line ${orientation}`;

  if (orientation === "horizontal") {
    line.style.top = `${Math.random() * 100}%`;
    line.style.width = `${200 + Math.random() * 300}px`;
  } else {
    line.style.left = `${Math.random() * 100}%`;
    line.style.height = `${200 + Math.random() * 300}px`;
  }

  line.style.animationDelay = `${Math.random() * 10}s`;
  line.style.animationDuration = `${8 + Math.random() * 8}s`;
  document.body.appendChild(line);
}

function createCircuitDot() {
  const dot = document.createElement("div");
  dot.className = "circuit-dot";
  dot.style.left = `${Math.random() * 100}%`;
  dot.style.top = `${Math.random() * 100}%`;
  dot.style.animationDelay = `${Math.random() * 4}s`;
  dot.style.width = `${3 + Math.random() * 5}px`;
  dot.style.height = dot.style.width;
  document.body.appendChild(dot);
}

function createSVGGradient() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.position = "absolute";
  svg.style.width = "0";
  svg.style.height = "0";

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

  const gradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "linearGradient"
  );
  gradient.setAttribute("id", "gradient");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "0%");
  gradient.setAttribute("x2", "100%");
  gradient.setAttribute("y2", "100%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#29c4ff");

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#7928ca");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);
  document.body.appendChild(svg);
}

function isValidURL(url) {
  try {
    const urlObj = new URL(url);

    // Check if URL has a valid scheme
    if (!urlObj.protocol.startsWith("http")) {
      return false;
    }

    // Check if hostname is valid
    const hostname = urlObj.hostname;
    if (!hostname || hostname.length > 253) {
      return false;
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^[0-9]{1,3}(\.[0-9]{1,3}){3}$/, // IP address
      /^[0-9]{1,3}(\.[0-9]{1,3}){3}:[0-9]+$/, // IP with port
      /[<>"']/, // Dangerous characters
      /\s/, // Whitespace
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

function normalizeURL(url) {
  url = url.trim();

  // Remove leading/trailing whitespace
  url = url.trim();

  // Add https:// if no protocol specified
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  // Remove www. for consistency
  url = url.replace(/^https?:\/\/www\./, "https://");

  return url;
}

function showLoading() {
  const loading = document.getElementById("loading");
  const checkBtn = document.querySelector(".check-btn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");
  const result = document.getElementById("result");

  // Show loading animation
  loading.style.display = "block";

  // Update button state
  checkBtn.disabled = true;
  btnText.textContent = "Analyzing...";
  btnLoader.style.display = "block";

  // Hide previous result
  result.style.display = "none";

  // Animate loading steps
  animateLoadingSteps();
}

function hideLoading() {
  const loading = document.getElementById("loading");
  const checkBtn = document.querySelector(".check-btn");
  const btnText = document.getElementById("btnText");
  const btnLoader = document.getElementById("btnLoader");

  // Hide loading animation
  loading.style.display = "none";

  // Reset button state
  checkBtn.disabled = false;
  btnText.textContent = "🔍 Analyze URL";
  btnLoader.style.display = "none";

  // Reset loading steps
  resetLoadingSteps();
}

function animateLoadingSteps() {
  const steps = document.querySelectorAll(".step");
  let currentStep = 0;

  const interval = setInterval(() => {
    // Remove active class from all steps
    steps.forEach((step) => step.classList.remove("active"));

    // Add active class to current step
    steps[currentStep].classList.add("active");

    // Move to next step
    currentStep = (currentStep + 1) % steps.length;
  }, 800);

  // Store interval ID for cleanup
  window.loadingInterval = interval;
}

function resetLoadingSteps() {
  const steps = document.querySelectorAll(".step");
  steps.forEach((step) => step.classList.remove("active"));

  // Clear interval if exists
  if (window.loadingInterval) {
    clearInterval(window.loadingInterval);
    delete window.loadingInterval;
  }
}

function getFromCache(url) {
  const cached = urlCache.get(url);
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function saveToCache(url, data) {
  urlCache.set(url, {
    data: data,
    timestamp: Date.now(),
  });
}

function generateSSLHTML(checks, url) {
  const ssl_info = checks?.ssl;

  if (!ssl_info) {
    if (!url.startsWith("https://")) {
      return `
                <div class="ssl-certificate-box">
                    <div class="ssl-header">
                        <span style="font-size: 1.3em;">🔓</span>
                        <strong>SSL Certificate Status</strong>
                    </div>
                    <div class="ssl-content">
                        <div class="ssl-status" style="background: #ff9800;">
                            ⚠️ Website Not Using HTTPS
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 0.95em;">
                            Situs web ini tidak menggunakan enkripsi HTTPS. Data apa pun yang Anda kirim akan dikirimkan dalam bentuk teks biasa dan dapat dicegat oleh pihak ketiga.
                        </div>
                    </div>
                </div>
            `;
    }
    return "";
  }

  if (ssl_info.success) {
    const validIcon = ssl_info.is_valid ? "✅" : "❌";
    const validText = ssl_info.is_valid ? "Valid" : "Invalid/Expired";
    const statusColor = ssl_info.is_valid ? "#4caf50" : "#f44336";

    let daysColor = "#4caf50";
    if (ssl_info.days_remaining < 30) daysColor = "#ff9800";
    if (ssl_info.days_remaining < 7) daysColor = "#f44336";

    const issuerIcon = ssl_info.issuer_trust ? "✅" : "⚠️";
    const issuerStatus = ssl_info.issuer_trust
      ? "Trusted Issuer"
      : "Untrusted Issuer";

    return `
            <div class="ssl-certificate-box">
                <div class="ssl-header">
                    <span style="font-size: 1.3em;">🔒</span>
                    <strong>SSL Certificate Details</strong>
                </div>
                <div class="ssl-content">
                    <div class="ssl-status" style="background: ${statusColor};">
                        ${validIcon} Certificate Status: <strong>${validText}</strong>
                        ${
                          ssl_info.certificate_grade
                            ? ` | Grade: ${ssl_info.certificate_grade}`
                            : ""
                        }
                    </div>
                    <div class="ssl-info-grid">
                        <div class="ssl-info-item">
                            <span class="ssl-label">📝 Issued To:</span>
                            <span class="ssl-value">${
                              ssl_info.issued_to || "Unknown"
                            }</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">🏢 Certificate Issuer:</span>
                            <span class="ssl-value">${issuerIcon} ${
      ssl_info.issuer || "Unknown"
    } (${issuerStatus})</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">📅 Valid From:</span>
                            <span class="ssl-value">${
                              ssl_info.valid_from || "Unknown"
                            }</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">📅 Valid Until:</span>
                            <span class="ssl-value">${
                              ssl_info.valid_until || "Unknown"
                            }</span>
                        </div>
                        <div class="ssl-info-item">
                            <span class="ssl-label">⏰ Days Remaining:</span>
                            <span class="ssl-value" style="color: ${daysColor}; font-weight: bold;">
                                ${ssl_info.days_remaining} days
                                ${
                                  ssl_info.days_remaining < 30
                                    ? " ⚠️ Renewal Needed"
                                    : " ✅ Healthy"
                                }
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
                    <strong>SSL Certificate Error</strong>
                </div>
                <div class="ssl-content">
                    <div class="ssl-status" style="background: #f44336;">
                        ❌ SSL Certificate Invalid
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; font-size: 0.95em;">
                        <strong>Error Details:</strong> ${
                          ssl_info.message || "Unknown error"
                        }<br/>
                        <small style="opacity: 0.8;">${
                          ssl_info.error || "Cannot verify SSL certificate"
                        }</small>
                    </div>
                </div>
            </div>
        `;
  }
}

function generateTelegramHTML(checks) {
  const telegram = checks?.telegram;

  if (!telegram) return "";

  const isOfficial = telegram.is_official;
  const statusColor = isOfficial ? "#4caf50" : "#f44336";
  const statusIcon = isOfficial ? "✅" : "❌";

  return `
        <div class="ssl-certificate-box" style="margin-top: 20px;">
            <div class="ssl-header">
                <span style="font-size: 1.3em;">📱</span>
                <strong>Telegram Bot Verification</strong>
            </div>
            <div class="ssl-content">
                <div class="ssl-status" style="background: ${statusColor};">
                    ${statusIcon} ${telegram.status || "Verification Status"}
                </div>
                <div class="ssl-info-grid">
                    <div class="ssl-info-item">
                        <span class="ssl-label">👤 Bot Username:</span>
                        <span class="ssl-value">@${
                          telegram.username || "Unknown"
                        }</span>
                    </div>
                    <div class="ssl-info-item">
                        <span class="ssl-label">🔍 Verification Status:</span>
                        <span class="ssl-value" style="color: ${statusColor}; font-weight: bold;">
                            ${
                              isOfficial
                                ? "✅ Official Telegram Bot"
                                : "❌ Unofficial/Not Found"
                            }
                        </span>
                    </div>
                    ${
                      telegram.first_name
                        ? `
                    <div class="ssl-info-item">
                        <span class="ssl-label">📝 Bot Name:</span>
                        <span class="ssl-value">${telegram.first_name}</span>
                    </div>
                    `
                        : ""
                    }
                    ${
                      telegram.has_description
                        ? `
                    <div class="ssl-info-item">
                        <span class="ssl-label">📄 Description:</span>
                        <span class="ssl-value">Available</span>
                    </div>
                    `
                        : ""
                    }
                </div>
            </div>
        </div>
    `;
}

function generateDetailedAnalysisHTML(checks, score_breakdown) {
  if (!checks && !score_breakdown) return "";

  let html = '<div class="detailed-analysis">';
  html += "<h3>📊 Detailed Analysis Breakdown</h3>";

  // Score Breakdown
  if (score_breakdown && Object.keys(score_breakdown).length > 0) {
    html += '<div class="score-breakdown">';
    html += "<h4>Score Components:</h4>";
    html += '<div class="breakdown-grid">';

    const components = [
      {
        name: "Heuristic Analysis",
        key: "heuristic",
        color: "#ff6b6b",
        icon: "🔍",
      },
      {
        name: "Safe Browsing",
        key: "safe_browsing",
        color: "#4ecdc4",
        icon: "🛡️",
      },
      { name: "VirusTotal", key: "virustotal", color: "#45b7d1", icon: "🦠" },
      {
        name: "IPQualityScore",
        key: "ipqualityscore",
        color: "#96ceb4",
        icon: "📊",
      },
      {
        name: "RapidAPI Phishing",
        key: "rapidapi_phishing",
        color: "#feca57",
        icon: "⚡",
      },
      {
        name: "Content Analysis",
        key: "content",
        color: "#ff9ff3",
        icon: "📄",
      },
      { name: "SSL Security", key: "ssl", color: "#54a0ff", icon: "🔒" },
    ];

    components.forEach((comp) => {
      const score = score_breakdown[comp.key] || 0;
      const width = Math.min(score, 100);
      html += `
                <div class="breakdown-item">
                    <div class="breakdown-label">${comp.icon} ${comp.name}</div>
                    <div class="breakdown-bar">
                        <div class="bar-fill" style="width: ${width}%; background: ${
        comp.color
      };"></div>
                    </div>
                    <div class="breakdown-score">${score.toFixed(1)}</div>
                </div>
            `;
    });

    html += "</div></div>";
  }

  // External API Results
  if (checks) {
    html += '<div class="api-results">';
    html += "<h4>🔍 External API Results:</h4>";

    // VirusTotal
    if (checks.virustotal && typeof checks.virustotal === "object") {
      const vt = checks.virustotal;
      const hasThreats = vt.malicious > 0 || vt.suspicious > 0;

      html += `
                <div class="api-result-card ${hasThreats ? "danger" : "safe"}">
                    <div class="api-header">
                        <span class="api-icon">🦠</span>
                        <strong>VirusTotal</strong>
                        <span class="api-status">${
                          hasThreats ? "⚠️ Threats Detected" : "✅ Clean"
                        }</span>
                    </div>
                    <div class="api-details">
                        <span title="Malicious detections">🛑 Malicious: ${
                          vt.malicious || 0
                        }</span>
                        <span title="Suspicious detections">⚠️ Suspicious: ${
                          vt.suspicious || 0
                        }</span>
                        <span title="Harmless detections">✅ Harmless: ${
                          vt.harmless || 0
                        }</span>
                        ${
                          vt.total_engines
                            ? `<span title="Total scanning engines">🔧 Engines: ${vt.total_engines}</span>`
                            : ""
                        }
                        ${
                          vt.reputation !== undefined
                            ? `<span title="Reputation score">⭐ Rep: ${vt.reputation}</span>`
                            : ""
                        }
                    </div>
                </div>
            `;
    }

    // IPQualityScore
    if (checks.ipqualityscore && typeof checks.ipqualityscore === "object") {
      const ipq = checks.ipqualityscore;
      const isDangerous =
        ipq.phishing ||
        ipq.malware ||
        ipq.suspicious ||
        (ipq.risk_score || 0) > 7;

      html += `
                <div class="api-result-card ${isDangerous ? "danger" : "safe"}">
                    <div class="api-header">
                        <span class="api-icon">📊</span>
                        <strong>IPQualityScore</strong>
                        <span class="api-status">${
                          isDangerous ? "🚫 High Risk" : "✅ Low Risk"
                        }</span>
                    </div>
                    <div class="api-details">
                        <span>Risk Score: ${(
                          (ipq.risk_score || 0) * 10
                        ).toFixed(1)}</span>
                        <span>Phishing: ${ipq.phishing ? "Yes" : "No"}</span>
                        <span>Malware: ${ipq.malware ? "Yes" : "No"}</span>
                        <span>Suspicious: ${
                          ipq.suspicious ? "Yes" : "No"
                        }</span>
                    </div>
                </div>
            `;
    }

    // RapidAPI Phishing
    if (
      checks.rapidapi_phishing &&
      typeof checks.rapidapi_phishing === "object"
    ) {
      const rap = checks.rapidapi_phishing;

      html += `
                <div class="api-result-card ${
                  rap.is_phishing ? "danger" : "safe"
                }">
                    <div class="api-header">
                        <span class="api-icon">⚡</span>
                        <strong>RapidAPI Phishing</strong>
                        <span class="api-status">${
                          rap.is_phishing ? "🚫 Phishing Detected" : "✅ Clean"
                        }</span>
                    </div>
                    <div class="api-details">
                        <span>Confidence: ${(
                          (rap.confidence || 0) * 100
                        ).toFixed(1)}%</span>
                        <span>Risk Level: ${rap.risk_level || "Unknown"}</span>
                        ${
                          rap.analysis_time
                            ? `<span>Analyzed: ${rap.analysis_time}</span>`
                            : ""
                        }
                    </div>
                </div>
            `;
    }

    // Safe Browsing
    if (checks.safe_browsing && Array.isArray(checks.safe_browsing)) {
      const sb = checks.safe_browsing;

      html += `
                <div class="api-result-card ${sb[0] ? "danger" : "safe"}">
                    <div class="api-header">
                        <span class="api-icon">🔐</span>
                        <strong>Google Safe Browsing</strong>
                        <span class="api-status">${
                          sb[0] ? "🚫 Blocked" : "✅ Safe"
                        }</span>
                    </div>
                    <div class="api-details">
                        <span>Status: ${sb[1] || "Unknown"}</span>
                        ${
                          sb[2] && sb[2].length > 0
                            ? `<span>Threats: ${sb[2].slice(0, 3).join(", ")}${
                                sb[2].length > 3 ? "..." : ""
                              }</span>`
                            : ""
                        }
                    </div>
                </div>
            `;
    }

    html += "</div>";
  }

  html += "</div>";
  return html;
}

function generateWHOISHtml(whoisData) {
  if (!whoisData || typeof whoisData !== "object") return "";

  // Extract important WHOIS fields
  const importantFields = [
    { label: "Domain Name", key: "domain_name", icon: "🌐" },
    { label: "Registrar", key: "registrar", icon: "🏢" },
    { label: "Creation Date", key: "creation_date", icon: "📅" },
    { label: "Expiration Date", key: "expiration_date", icon: "⏰" },
    { label: "Updated Date", key: "updated_date", icon: "🔄" },
    { label: "Name Servers", key: "name_servers", icon: "🔗" },
    { label: "Status", key: "status", icon: "📊" },
    { label: "Registrant Country", key: "registrant_country", icon: "📍" },
  ];

  let hasData = false;
  let html = '<div class="whois-info">';
  html += "<h4>🌐 WHOIS Information</h4>";
  html += '<div class="whois-grid">';

  importantFields.forEach((field) => {
    const value = whoisData[field.key];
    if (value) {
      hasData = true;
      let displayValue;

      if (Array.isArray(value)) {
        displayValue = value
          .slice(0, 3)
          .map((v) => {
            if (v.length > 30) return v.substring(0, 27) + "...";
            return v;
          })
          .join(", ");
        if (value.length > 3) displayValue += ` (+${value.length - 3} more)`;
      } else if (typeof value === "string") {
        displayValue =
          value.length > 50 ? value.substring(0, 47) + "..." : value;
      } else {
        displayValue = String(value);
      }

      html += `
                <div class="whois-item">
                    <span class="whois-label">${field.icon} ${field.label}:</span>
                    <span class="whois-value">${displayValue}</span>
                </div>
            `;
    }
  });

  html += "</div>";

  if (!hasData) {
    html +=
      '<div style="text-align: center; padding: 20px; color: rgba(255, 255, 255, 0.6);">No WHOIS data available</div>';
  }

  html += "</div>";
  return hasData ? html : "";
}

function generateIssuesHTML(issues) {
  if (!issues || !Array.isArray(issues) || issues.length === 0) {
    return '<div class="issues-list"><h3>✨ No Security Issues Detected!</h3></div>';
  }

  let html = '<div class="issues-list">';
  html += `<h3>🔍 Security Issues Detected (${issues.length}):</h3>`;

  const displayedIssues = issues.slice(0, 10);
  displayedIssues.forEach((issue) => {
    html += `<div class="issue-item">${issue}</div>`;
  });

  if (issues.length > 10) {
    html += `<div class="more-issues">... and ${
      issues.length - 10
    } more security concerns</div>`;
  }

  html += "</div>";
  return html;
}

function displayResult(data) {
  const resultDiv = document.getElementById("result");
  const {
    url,
    score,
    status,
    status_class,
    recommendation,
    issues,
    checks,
    score_breakdown,
    execution_time,
    hostname,
  } = data;

  // Determine icon and color based on status
  let icon, color;

  switch (status_class) {
    case "danger":
      icon = "🚫";
      color = "#f44336";
      break;
    case "warning":
      icon = "⚠️";
      color = "#ff9800";
      break;
    case "caution":
      icon = "🔶";
      color = "#ffc107";
      break;
    case "safe":
    default:
      icon = "✅";
      color = "#4caf50";
  }

  // Set result class and prepare HTML
  resultDiv.className = `result ${status_class}`;

  const sslHTML = generateSSLHTML(checks, url);
  const telegramHTML = generateTelegramHTML(checks);
  const detailedAnalysisHTML = generateDetailedAnalysisHTML(
    checks,
    score_breakdown
  );
  const whoisHTML = checks?.whois ? generateWHOISHtml(checks.whois) : "";
  const issuesHTML = generateIssuesHTML(issues);

  // Build the result HTML
  resultDiv.innerHTML = `
        <div class="result-header">
            <div class="result-header-content">
                <div class="result-icon">${icon}</div>
                <h2>${status}</h2>
                <div class="recommendation">${
                  recommendation || "No specific recommendation available."
                }</div>
            </div>
            <div class="score-circle">
                <span class="score-value">${Math.round(score)}</span>
                <span class="score-label"></span>
            </div>
        </div>
        
        ${
          execution_time
            ? `
        <div class="performance-info">
            ⏱️ Analysis completed in ${execution_time} seconds
            ${
              checks?.content?.features?.redirect_count
                ? ` • 🔄 ${checks.content.features.redirect_count} redirects detected`
                : ""
            }
            ${
              checks?.content?.features?.final_url &&
              checks.content.features.final_url !== url
                ? ` • 🔀 Final URL: ${checks.content.features.final_url}`
                : ""
            }
        </div>
        `
            : ""
        }
        
        <div class="details-box">
            <strong>🔗 URL Analyzed:</strong><br/>
            <span class="url-display">${url}</span>
            ${
              hostname
                ? `<div style="margin-top: 8px;"><small>🌐 Domain: ${hostname}</small></div>`
                : ""
            }
        </div>
        
        ${sslHTML}
        ${telegramHTML}
        ${detailedAnalysisHTML}
        ${whoisHTML}
        ${issuesHTML}
        
        <div class="confidence-banner">
            <div class="confidence-content">
                <span class="confidence-icon">🎯</span>
                <div>
                    <strong>Detection Accuracy: 80%</strong>
                    <small>Powered by 6+ security APIs, AI algorithms, and real-time threat intelligence</small>
                </div>
            </div>
            <div class="confidence-tags">
                <span class="tag">Multi-API</span>
                <span class="tag">AI-Powered</span>
                <span class="tag">Real-time</span>
                <span class="tag">Enterprise</span>
            </div>
        </div>
    `;

  // Show the result
  resultDiv.style.display = "block";

  // Animate the score bars
  setTimeout(() => {
    const bars = resultDiv.querySelectorAll(".bar-fill");
    bars.forEach((bar) => {
      const width = bar.style.width;
      bar.style.width = "0";
      setTimeout(() => {
        bar.style.width = width;
      }, 100);
    });
  }, 300);

  // Smooth scroll to result
  resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function checkURL() {
  const urlInput = document.getElementById("urlInput");
  let url = urlInput.value.trim();

  // Validate input
  if (!url) {
    showNotification("❌ Please enter a URL to analyze", "error");
    urlInput.focus();
    return;
  }

  // Normalize URL
  url = normalizeURL(url);

  // Validate URL format
  if (!isValidURL(url)) {
    showNotification(
      "❌ Invalid URL format. Please use http:// or https://",
      "error"
    );
    urlInput.style.borderColor = "#f44336";
    urlInput.focus();
    return;
  }

  // Check cache first
  const cachedResult = getFromCache(url);
  if (cachedResult) {
    showNotification("✅ Loading cached analysis...", "info");
    displayResult(cachedResult);
    return;
  }

  // Show loading state
  showLoading();

  try {
    // Set timeout for the request
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      CONFIG.REQUEST_TIMEOUT
    );

    // Make API request
    const response = await fetch(`${CONFIG.SERVER_URL}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data = await response.json();

    // Save to cache
    saveToCache(url, data);

    // Display result
    displayResult(data);
  } catch (error) {
    console.error("Analysis Error:", error);

    // Handle specific errors
    let errorMessage = "Failed to analyze URL";
    let errorDetails = "";

    if (error.name === "AbortError") {
      errorMessage = "Request timeout";
      errorDetails =
        "Analysis took too long. The server might be busy or the URL is not responding.";
    } else if (error.message.includes("network")) {
      errorMessage = "Network error";
      errorDetails = "Please check your internet connection and try again.";
    } else if (error.message.includes("CORS")) {
      errorMessage = "Server connection error";
      errorDetails =
        "Cannot connect to the analysis server. Please try again later.";
    } else {
      errorDetails = error.message;
    }

    // Display error
    const resultDiv = document.getElementById("result");
    resultDiv.className = "result danger";
    resultDiv.innerHTML = `
            <div class="result-header">
                <div class="result-header-content">
                    <div class="result-icon">❌</div>
                    <h2>Analysis Failed</h2>
                    <div class="recommendation">${errorMessage}</div>
                </div>
            </div>
            
            <div class="details-box">
                <strong>🔗 URL Attempted:</strong><br/>
                <span class="url-display">${url}</span>
            </div>
            
            <div class="issues-list">
                <h3>🔍 Error Details:</h3>
                <div class="issue-item">${errorDetails}</div>
                <div class="issue-item">Please check the URL and try again</div>
                <div class="issue-item">Make sure the backend server is running</div>
            </div>
            
            <div class="confidence-banner">
                <div class="confidence-content">
                    <span class="confidence-icon">🔧</span>
                    <div>
                        <strong>Troubleshooting Tips</strong>
                        <small>Check server connection, verify URL format, and ensure API keys are configured</small>
                    </div>
                </div>
            </div>
        `;

    resultDiv.style.display = "block";
    resultDiv.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    hideLoading();
  }
}

function showNotification(message, type = "info") {
  // Remove existing notification
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span class="notification-icon">${
          type === "error" ? "❌" : type === "success" ? "✅" : "ℹ️"
        }</span>
        <span class="notification-text">${message}</span>
        <button class="notification-close">&times;</button>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "error"
            ? "#f44336"
            : type === "success"
            ? "#4caf50"
            : "#2196f3"
        };
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 1000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;

  // Add close button functionality
  notification.querySelector(".notification-close").onclick = () => {
    notification.style.animation = "slideOutRight 0.3s ease-out forwards";
    setTimeout(() => notification.remove(), 300);
  };

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = "slideOutRight 0.3s ease-out forwards";
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);

  document.body.appendChild(notification);

  // Add animation keyframes
  const style = document.createElement("style");
  style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
  document.head.appendChild(style);
}

async function checkServerHealth() {
  try {
    const response = await fetch(`${CONFIG.SERVER_URL}/health`, {
      method: "GET",
      timeout: 5000,
    });

    if (response.ok) {
      console.log("✅ Server connected successfully!");
      console.log("📡 Backend URL:", CONFIG.SERVER_URL);

      // Show server status indicator
      const healthIndicator = document.createElement("div");
      healthIndicator.className = "server-health";
      healthIndicator.innerHTML = "✅ Server Online";
      healthIndicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4caf50;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 0.85em;
                z-index: 100;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            `;
      document.body.appendChild(healthIndicator);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (healthIndicator.parentNode) {
          healthIndicator.style.opacity = "0";
          healthIndicator.style.transition = "opacity 0.5s";
          setTimeout(() => healthIndicator.remove(), 500);
        }
      }, 5000);
    } else {
      console.warn("⚠️ Server responded with error:", response.status);
    }
  } catch (error) {
    console.warn("⚠️ Cannot connect to server");
    console.warn("💡 Make sure backend is deployed on Railway");
    console.warn("🔧 Server URL:", CONFIG.SERVER_URL);

    // Show offline indicator
    const healthIndicator = document.createElement("div");
    healthIndicator.className = "server-health";
    healthIndicator.innerHTML = "⚠️ Server Offline";
    healthIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ff9800;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.85em;
            z-index: 100;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        `;
    document.body.appendChild(healthIndicator);
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Advanced Phishing Detector Initialized");
  console.log("📡 Backend Server:", CONFIG.SERVER_URL);
  console.log("🎯 Target Accuracy: 80%");

  // Initialize visual effects
  initializeTechEffects();

  // Check server health
  checkServerHealth();

  // Setup event listeners
  const checkBtn = document.getElementById("checkBtn");
  const urlInput = document.getElementById("urlInput");

  // Click event for check button
  checkBtn.addEventListener("click", checkURL);

  // Enter key event for input
  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      checkURL();
    }
  });

  // Real-time URL validation
  urlInput.addEventListener("input", (e) => {
    const url = e.target.value.trim();

    if (url === "") {
      urlInput.style.borderColor = "rgba(100, 200, 255, 0.3)";
      return;
    }

    const normalizedUrl = normalizeURL(url);
    if (isValidURL(normalizedUrl)) {
      urlInput.style.borderColor = "#4caf50";
    } else {
      urlInput.style.borderColor = "#f44336";
    }
  });

  // Focus effects
  urlInput.addEventListener("focus", () => {
    urlInput.style.boxShadow = "0 0 0 3px rgba(41, 196, 255, 0.1)";
  });

  urlInput.addEventListener("blur", () => {
    urlInput.style.boxShadow = "";
  });

  // Add example URLs on click
  const exampleUrls = [
    "https://google.com",
    "https://github.com",
    "https://example.com",
    "https://facebook.com",
    "https://appleid.apple.com",
  ];

  urlInput.addEventListener("click", (e) => {
    if (urlInput.value === "") {
      urlInput.placeholder =
        exampleUrls[Math.floor(Math.random() * exampleUrls.length)];
    }
  });

  // Add tooltip for input
  urlInput.title =
    "Masukkan URL lengkap dengan http:// atau https:// untuk analisis";

  // Log initialization complete
  console.log("✅ Application ready for analysis");
  console.log("✨ Features: Multi-API, AI Analysis, 80% Accuracy");
});

// Service Worker for offline functionality (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("ServiceWorker registration successful");
      },
      (err) => {
        console.log("ServiceWorker registration failed: ", err);
      }
    );
  });
}

// Export functions for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    isValidURL,
    normalizeURL,
    generateSSLHTML,
    generateTelegramHTML,
    generateDetailedAnalysisHTML,
    generateWHOISHtml,
    generateIssuesHTML,
  };
}
