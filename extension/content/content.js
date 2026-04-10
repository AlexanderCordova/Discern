// Content script for DISCERN extension
// Injects floating badge on analyzed pages

let badge = null

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showBadge') {
    showFloatingBadge(request.score)
  }
})

// Listen for messages from webpage (for sign-in flow)
window.addEventListener('message', (event) => {
  // Only accept messages from our domain
  if (event.origin !== 'https://discern-frontend.vercel.app') {
    return
  }

  if (event.data.type === 'DISCERN_USER_SIGNED_IN' && event.data.userId) {
    console.log('Content script received userId, forwarding to extension:', event.data.userId)
    // Forward to extension
    chrome.runtime.sendMessage({
      action: 'userSignedIn',
      userId: event.data.userId
    })
  }
})

function showFloatingBadge(score) {
  // Remove existing badge if present
  if (badge) {
    badge.remove()
  }

  // Create badge element
  badge = document.createElement('div')
  badge.id = 'discern-badge'
  badge.className = 'discern-floating-badge'

  const scoreClass = getScoreClass(score)
  const scoreLabel = getScoreLabel(score)

  badge.innerHTML = `
    <div class="discern-badge-content">
      <div class="discern-badge-header">
        <span class="discern-badge-title">DISCERN</span>
        <button class="discern-badge-close" id="discern-close">×</button>
      </div>
      <div class="discern-badge-score ${scoreClass}">
        ${score}
      </div>
      <div class="discern-badge-label">${scoreLabel}</div>
    </div>
  `

  document.body.appendChild(badge)

  // Add close listener
  document.getElementById('discern-close').addEventListener('click', () => {
    badge.remove()
  })

  // Make draggable (optional enhancement)
  makeDraggable(badge)
}

function makeDraggable(element) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0

  element.onmousedown = dragMouseDown

  function dragMouseDown(e) {
    e.preventDefault()
    pos3 = e.clientX
    pos4 = e.clientY
    document.onmouseup = closeDragElement
    document.onmousemove = elementDrag
  }

  function elementDrag(e) {
    e.preventDefault()
    pos1 = pos3 - e.clientX
    pos2 = pos4 - e.clientY
    pos3 = e.clientX
    pos4 = e.clientY
    element.style.top = element.offsetTop - pos2 + 'px'
    element.style.left = element.offsetLeft - pos1 + 'px'
    element.style.right = 'auto'
    element.style.bottom = 'auto'
  }

  function closeDragElement() {
    document.onmouseup = null
    document.onmousemove = null
  }
}

function getScoreClass(score) {
  if (score >= 80) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

function getScoreLabel(score) {
  if (score >= 80) return 'High Credibility'
  if (score >= 50) return 'Medium Credibility'
  return 'Low Credibility'
}
