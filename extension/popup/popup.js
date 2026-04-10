const API_URL = 'https://discern-backend-tnxh.onrender.com'
const WEBSITE_URL = 'https://discern-frontend.vercel.app'

const app = document.getElementById('app')

// State
let currentUrl = ''
let userId = null

// Initialize - check if user is signed in
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  currentUrl = tabs[0].url
})

console.log('Extension popup loaded')

chrome.storage.sync.get(['userId'], (result) => {
  console.log('Storage result:', result)
  if (result.userId) {
    console.log('User ID found:', result.userId)
    userId = result.userId
    showAnalyzeButton()
  } else {
    console.log('No user ID found, showing sign-in prompt')
    showSignInPrompt()
  }
})

function showSignInPrompt() {
  app.innerHTML = `
    <div class="sign-in-prompt">
      <div class="sign-in-icon">🔒</div>
      <h2>Sign in required</h2>
      <p>Sign in to analyze this page and track your credibility checks</p>
      <button class="btn btn-primary" id="signInBtn">Sign in with Google</button>
    </div>
  `

  document.getElementById('signInBtn').addEventListener('click', signIn)
}

function signIn() {
  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'userSignedIn' && message.userId) {
      console.log('Received userId from website:', message.userId)
      userId = message.userId
      chrome.storage.sync.set({ userId }, () => {
        showAnalyzeButton()
      })
    }
  })

  // Open website in new tab for sign-in
  chrome.tabs.create({
    url: `${WEBSITE_URL}/api/auth/signin?callbackUrl=/extension-connect`
  }, () => {
    // Show waiting state
    app.innerHTML = `
      <div class="sign-in-prompt">
        <div class="spinner"></div>
        <h2>Sign in to continue</h2>
        <p>Complete the sign-in in the new tab. This popup will update automatically when you're done.</p>
      </div>
    `
  })
}

function showAnalyzeButton() {
  app.innerHTML = `
    <div class="container">
      <button id="analyzeBtn" class="analyze-button">
        Analyze This Page
      </button>
      <button class="btn btn-secondary" id="signOutBtn" style="margin-top: 12px; width: 100%;">
        Sign Out
      </button>
    </div>
  `

  document.getElementById('analyzeBtn').addEventListener('click', analyzePage)
  document.getElementById('signOutBtn').addEventListener('click', signOut)
}

function signOut() {
  chrome.storage.sync.remove('userId', () => {
    userId = null
    showSignInPrompt()
  })
}

async function analyzePage() {
  try {
    showLoading()

    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.url || tab.url.startsWith('chrome://')) {
      showError('Cannot analyze Chrome internal pages')
      return
    }

    // Analyze URL
    const response = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        type: 'url',
        content: tab.url,
        demoMode: false,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Analysis failed')
    }

    showResult(data.data)

    // Send message to content script to show badge
    chrome.tabs.sendMessage(tab.id, {
      action: 'showBadge',
      score: data.data.score,
    })
  } catch (error) {
    showError(error.message)
  }
}

function showLoading() {
  app.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Analyzing page credibility...</p>
    </div>
  `
}

function showResult(result) {
  const scoreClass = getScoreClass(result.score)

  app.innerHTML = `
    <div class="result">
      <div class="score-display">
        <div class="score-value ${scoreClass}">${result.score}</div>
        <div class="score-label">Credibility Score</div>
      </div>

      <div class="summary">
        <h3>Summary</h3>
        <p>${result.summary}</p>
      </div>

      <div class="factors">
        <h3 style="margin-bottom: 12px; font-size: 14px; color: #111827;">Scoring Factors</h3>
        ${renderFactor('Bias', result.factors.bias, 25)}
        ${renderFactor('Source Rep.', result.factors.source_reputation, 25)}
        ${renderFactor('Evidence', result.factors.evidence, 25)}
        ${renderFactor('Logic', result.factors.logic, 25)}
      </div>

      <div class="actions">
        <button class="btn btn-primary" id="viewFullBtn">View Full Report</button>
        <button class="btn btn-secondary" id="retryBtn">Retry</button>
      </div>
    </div>
  `

  document.getElementById('viewFullBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: `${WEBSITE_URL}/analyze?url=${encodeURIComponent(currentUrl)}` })
  })

  document.getElementById('retryBtn').addEventListener('click', () => {
    app.innerHTML = `
      <div class="container">
        <button id="analyzeBtn" class="analyze-button">
          Analyze This Page
        </button>
      </div>
    `
    document.getElementById('analyzeBtn').addEventListener('click', analyzePage)
  })
}

function renderFactor(name, value, max) {
  const percentage = (value / max) * 100
  const factorClass = percentage >= 80 ? 'factor-high' : percentage >= 50 ? 'factor-medium' : 'factor-low'

  return `
    <div class="factor">
      <div class="factor-header">
        <span class="factor-name">${name}</span>
        <span class="factor-value">${value}/${max}</span>
      </div>
      <div class="factor-bar">
        <div class="factor-fill ${factorClass}" style="width: ${percentage}%"></div>
      </div>
    </div>
  `
}

function showError(message) {
  app.innerHTML = `
    <div class="error">
      <div class="error-icon">⚠️</div>
      <p class="error-message">${message}</p>
      <button class="btn btn-primary" id="retryBtn">Try Again</button>
    </div>
  `

  document.getElementById('retryBtn').addEventListener('click', () => {
    app.innerHTML = `
      <div class="container">
        <button id="analyzeBtn" class="analyze-button">
          Analyze This Page
        </button>
      </div>
    `
    document.getElementById('analyzeBtn').addEventListener('click', analyzePage)
  })
}

function getScoreClass(score) {
  if (score >= 80) return 'score-high'
  if (score >= 50) return 'score-medium'
  return 'score-low'
}
