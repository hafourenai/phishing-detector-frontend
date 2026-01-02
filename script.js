document.addEventListener("DOMContentLoaded", () => {
  const scanBtn = document.getElementById("scanBtn");
  const urlInput = document.getElementById("urlInput");
  const resultsSection = document.getElementById("resultsSection");
  const loading = document.getElementById("loading");

  // UI Elements
  const statusBadge = document.getElementById("statusBadge");
  const statusIcon = document.getElementById("statusIcon");
  const statusText = document.getElementById("statusText");
  const riskScoreValue = document.getElementById("riskScore");
  const analysisText = document.getElementById("analysisText");
  const gaugeFill = document.getElementById("gaugeFill");
  const gaugeValueText = document.getElementById("gaugeValue");
  const reasonsList = document.getElementById("reasonsList");
  const disclaimerSection = document.getElementById("disclaimerSection");

  const mlStatus = document.getElementById("mlStatus");
  const sslStatus = document.getElementById("sslStatus");
  const whoisStatus = document.getElementById("whoisStatus");

  // API Configuration
  // Uses local backend for development, Railway backend for production
  const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:5000"
      : "https://phishing-detector-backend.up.railway.app";

  scanBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) {
      alert("Please enter a URL to scan.");
      return;
    }

    // Reset UI
    resultsSection.style.display = "none";
    loading.style.display = "flex";

    try {
      const apiEndpoint = `${API_BASE_URL}/api/check`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      updateUI(data);
    } catch (error) {
      console.error(error);
      alert(
        "An error occurred during scanning. Please ensure the backend is running."
      );
    } finally {
      loading.style.display = "none";
    }
  });

  // Handle Enter Key
  urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      scanBtn.click();
    }
  });

  function updateUI(data) {
    resultsSection.style.display = "grid";

    const isPhishing = data.is_phishing;
    const score = Math.round(data.score);

    // Update Status
    if (score >= 50) {
      statusBadge.classList.add("phishing");
      statusBadge.classList.remove("safe");
      statusText.innerText = "PHISHING";
      statusIcon.setAttribute("data-lucide", "alert-triangle");
      riskScoreValue.style.color = "#ef4444";
    } else {
      statusBadge.classList.add("safe");
      statusBadge.classList.remove("phishing");
      statusText.innerText = "SAFE";
      statusIcon.setAttribute("data-lucide", "check-circle");
      riskScoreValue.style.color = "#22c55e";
    }
    lucide.createIcons();

    riskScoreValue.innerText = `${score}%`;
    analysisText.innerText = `Recommendation: ${data.recommendation}`;

    // Update Gauge
    const rotation = (score / 100) * 0.5;
    gaugeFill.style.transform = `rotate(${rotation}turn)`;
    document.getElementById("gaugeValue").innerText = `${score}%`;

    // Update Indicators
    const detections = data.detections || [];
    const mlDetails =
      detections.find((d) => d.name === "ml_detector")?.details || {};
    const sslDetails =
      detections.find((d) => d.name === "ssl_detector")?.details || {};
    const whoisDetails =
      detections.find((d) => d.name === "whois_detector")?.details || {};

    // SSL Status
    let sslVal = 10; // Default safe
    let sslText = "Valid";
    if (!sslDetails.has_ssl) {
      sslVal = 100;
      sslText = "No SSL / Expired";
    } else if (sslDetails.days_remaining < 30) {
      sslVal = 70;
      sslText = `${sslDetails.days_remaining} days left`;
    } else {
      sslText = `${sslDetails.days_remaining} days left`;
    }
    sslStatusBar.style.width = `${sslVal}%`;
    document.getElementById("sslStatusValue").innerText = sslText;
    updateBarColor(sslStatusBar, sslVal);

    // URL Length
    const urlLenImpact = Math.min((data.url.length / 100) * 100, 100);
    urlLengthBar.style.width = `${urlLenImpact}%`;
    document.getElementById(
      "urlLengthValue"
    ).innerText = `${data.url.length} chars`;
    updateBarColor(urlLengthBar, urlLenImpact);

    // Domain Age
    let ageVal = 15;
    let ageText = "Old";
    if (whoisDetails.age_years !== undefined) {
      const years = whoisDetails.age_years;
      ageText =
        years < 1
          ? `${Math.round(whoisDetails.age_days)} days`
          : `${years.toFixed(1)} years`;
      ageVal = years < 0.5 ? 90 : years < 1 ? 50 : 10;
    } else {
      ageText = "Unknown";
      ageVal = 40;
    }
    domainAgeBar.style.width = `${ageVal}%`;
    document.getElementById("domainAgeValue").innerText = ageText;
    updateBarColor(domainAgeBar, ageVal);

    // Content Analysis
    const contentVal = Math.round(data.confidence * 100);
    contentAnalysisBar.style.width = `${contentVal}%`;
    document.getElementById(
      "contentAnalysisValue"
    ).innerText = `${contentVal}%`;
    updateBarColor(contentAnalysisBar, 100 - contentVal); // Lower confidence is higher risk

    // Update Analysis Reasons
    reasonsList.innerHTML = "";
    const totalIssues = data.total_issues || [];

    if (totalIssues.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-reason";
      li.innerHTML = '<i data-lucide="info"></i> No significant threats detected.';
      reasonsList.appendChild(li);
    } else {
      totalIssues.forEach((issue) => {
        const li = document.createElement("li");
        li.className = data.is_phishing ? "phishing-reason" : "safe-reason";
        li.innerHTML = `<i data-lucide="${
          data.is_phishing ? "alert-circle" : "shield"
        }"></i> ${issue}`;
        reasonsList.appendChild(li);
      });
    }
    lucide.createIcons();

    // Update External API Status
    updateApiStatus(mlStatus, mlDetails.is_phishing !== true); // ML detector returns is_phishing
    updateApiStatus(sslStatus, sslDetails.has_ssl === true);
    updateApiStatus(whoisStatus, whoisDetails.age_years !== undefined);

    // Show Disclaimer
    disclaimerSection.style.display = "block";
  }

  function updateApiStatus(element, isClean) {
    const badge = element.querySelector(".badge");
    const icon = element.querySelector("i");

    element.classList.remove("clean", "suspicious");
    if (isClean) {
      element.classList.add("clean");
      badge.innerText = "CLEAN";
      icon.setAttribute("data-lucide", "check-circle");
    } else {
      element.classList.add("suspicious");
      badge.innerText = "SUSPICIOUS";
      icon.setAttribute("data-lucide", "alert-circle");
    }
  }

  function updateBarColor(bar, value) {
    bar.classList.remove("green", "yellow", "orange", "red");
    if (value < 30) bar.classList.add("green");
    else if (value < 50) bar.classList.add("yellow");
    else if (value < 80) bar.classList.add("orange");
    else bar.classList.add("red");
  }
});
