document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const button = document.getElementById('analyzeBtn');
  const loading = document.getElementById('loading');
  const results = document.getElementById('results');
  const error = document.getElementById('error');

  // Reset UI
  button.disabled = true;
  loading.style.display = 'block';
  results.style.display = 'none';
  error.style.display = 'none';

  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Inject a script into the page to get its text content
    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getPageText,
    });

    const pageText = injectionResults[0].result;

    if (!pageText || pageText.trim().length < 50) {
      throw new Error('Not enough text content found on this page to analyze.');
    }

    // Send text to Python backend
    const response = await fetch('http://127.0.0.1:5000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: pageText })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // Display results
    displayResults(data);

  } catch (err) {
    console.error('Analysis error:', err);
    showError(err.message || 'Could not analyze this page. Make sure the backend server is running.');
  } finally {
    button.disabled = false;
    loading.style.display = 'none';
  }
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('results').style.display = 'none';
  document.getElementById('resultContent').innerHTML = '';
  document.getElementById('error').style.display = 'none';
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const resultContent = document.getElementById('resultContent');
  if (resultContent.innerText) {
    navigator.clipboard.writeText(resultContent.innerText)
      .then(() => {
        document.getElementById('copyBtn').textContent = 'Copied!';
        setTimeout(() => {
          document.getElementById('copyBtn').textContent = 'Copy Results';
        }, 1500);
      });
  }
});

document.getElementById('retryBtn').addEventListener('click', () => {
  document.getElementById('analyzeBtn').click();
  document.getElementById('retryBtn').style.display = 'none';
});

// Update showError to show retry button and more descriptive messages
function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message + ' Please check your connection or try again.';
  error.style.display = 'block';
  document.getElementById('retryBtn').style.display = 'block';
}

// Update displayResults to hide retry button
function displayResults(data) {
  const results = document.getElementById('results');
  const resultContent = document.getElementById('resultContent');
  const biasColor = getBiasColor(data.bias);
  const scoreDisplay = data.score ? data.score.toFixed(2) : 'N/A';
  resultContent.innerHTML = `
    <div class="bias-score" style="color: ${biasColor};">
      ${data.bias}
    </div>
    <div>Score: ${scoreDisplay}</div>
    <div class="confidence">Confidence: ${data.confidence || 'Unknown'}</div>
  `;
  results.style.display = 'block';
  document.getElementById('retryBtn').style.display = 'none';
}

function getBiasColor(bias) {
  if (bias.includes('Right') || bias.includes('Conservative')) {
    return '#ff6b6b';
  } else if (bias.includes('Left') || bias.includes('Liberal')) {
    return '#4ecdc4';
  } else {
    return '#95e1d3';
  }
}

// This function is injected into the webpage to extract its text
function getPageText() {
  // Try to get main content first
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.post-content',
    '.article-content',
    '.entry-content'
  ];

  for (const selector of mainSelectors) {
    const element = document.querySelector(selector);
    if (element && element.innerText.trim().length > 100) {
      return element.innerText.trim();
    }
  }

  // Fallback to body text, but filter out navigation and ads
  const excludeSelectors = [
    'nav', 'header', 'footer', 'aside',
    '.navigation', '.menu', '.sidebar',
    '.advertisement', '.ads', '.social-share'
  ];

  const bodyClone = document.body.cloneNode(true);

  // Remove excluded elements
  excludeSelectors.forEach(selector => {
    const elements = bodyClone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  return bodyClone.innerText.trim();
}