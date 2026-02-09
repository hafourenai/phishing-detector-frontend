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

  // Progress Bars
  const domainAgeBar = document.getElementById("domainAgeBar");
  const urlLengthBar = document.getElementById("urlLengthBar");
  const sslStatusBar = document.getElementById("sslStatusBar");
  const contentAnalysisBar = document.getElementById("contentAnalysisBar");

  // API Configuration
  // Uses local backend for development, Railway backend for production
  const API_BASE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === ""
      ? "http://127.0.0.1:5000"
      : "https://hafourenai-phishing-detector-backend.hf.space";

  scanBtn.addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) {
      alert("Silakan masukkan URL untuk dipindai.");
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
        "Terjadi kesalahan saat pemindaian. Pastikan backend sudah berjalan."
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
      statusText.innerText = "AMAN";
      statusIcon.setAttribute("data-lucide", "check-circle");
      riskScoreValue.style.color = "#22c55e";
    }
    lucide.createIcons();

    riskScoreValue.innerText = `${score}%`;
    analysisText.innerText = `Rekomendasi: ${data.recommendation}`;

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
    const vtResults =
      detections.find((d) => d.name === "virustotal") || {};
    const sbResults =
      detections.find((d) => d.name === "safe_browsing") || {};
    const ipqResults =
      detections.find((d) => d.name === "ipqualityscore") || {};
    const tgResults =
      detections.find((d) => d.name === "telegram") || {};
    const cntResults =
      detections.find((d) => d.name === "content") || {};

    // SSL Status
    let sslVal = 10; // Default safe
    let sslText = "Valid";
    if (!sslDetails.has_ssl) {
      sslVal = 100;
      sslText = "Tanpa SSL / Kedaluwarsa";
    } else if (sslDetails.days_remaining < 30) {
      sslVal = 70;
      sslText = `${sslDetails.days_remaining} hari tersisa`;
    } else {
      sslText = `${sslDetails.days_remaining} hari tersisa`;
    }
    sslStatusBar.style.width = `${sslVal}%`;
    document.getElementById("sslStatusValue").innerText = sslText;
    updateBarColor(sslStatusBar, sslVal);

    // URL Length
    const urlLenImpact = Math.min((data.url.length / 100) * 100, 100);
    urlLengthBar.style.width = `${urlLenImpact}%`;
    document.getElementById(
      "urlLengthValue"
    ).innerText = `${data.url.length} kar`;
    updateBarColor(urlLengthBar, urlLenImpact);

    // Domain Age
    let ageVal = 15;
    let ageText = "Lama";
    if (whoisDetails.age_years !== undefined) {
      const years = whoisDetails.age_years;
      ageText =
        years < 1
          ? `${Math.round(whoisDetails.age_days)} hari`
          : `${years.toFixed(1)} tahun`;
      ageVal = years < 0.5 ? 90 : years < 1 ? 50 : 10;
    } else {
      ageText = "Tidak Diketahui";
      ageVal = 40;
    }
    domainAgeBar.style.width = `${ageVal}%`;
    document.getElementById("domainAgeValue").innerText = ageText;
    updateBarColor(domainAgeBar, ageVal);

    // Content Analysis
    const contentVal = Math.round(cntResults.score || 0);
    contentAnalysisBar.style.width = `${contentVal}%`;
    document.getElementById(
      "contentAnalysisValue"
    ).innerText = `${contentVal}%`;
    updateBarColor(contentAnalysisBar, contentVal);

    // Update Analysis Reasons
    reasonsList.innerHTML = "";
    const totalIssues = data.total_issues || [];

    if (totalIssues.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-reason";
      li.innerHTML = '<i data-lucide="info"></i> Tidak ada ancaman signifikan yang terdeteksi.';
      reasonsList.appendChild(li);
    } else {
      totalIssues.forEach((issue) => {
        const li = document.createElement("li");
        li.className = "phishing-reason";
        li.innerHTML = `<i data-lucide="alert-circle"></i> ${issue}`;
        reasonsList.appendChild(li);
      });
    }
    lucide.createIcons();

    // Update External API Status
    const vtStatus = document.getElementById("vtStatus");
    const sbStatus = document.getElementById("sbStatus");
    const ipqStatus = document.getElementById("ipqStatus");
    const tgStatus = document.getElementById("tgStatus");

    updateApiStatus(vtStatus, (vtResults.score || 0) < 1);
    updateApiStatus(sbStatus, (sbResults.score || 0) < 1);
    updateApiStatus(ipqStatus, (ipqResults.score || 0) < 50);
    updateApiStatus(tgStatus, (tgResults.score || 0) < 10);
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
      badge.innerText = "BERSIH";
      icon.setAttribute("data-lucide", "check-circle");
    } else {
      element.classList.add("suspicious");
      badge.innerText = "MENCURIGAKAN";
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
