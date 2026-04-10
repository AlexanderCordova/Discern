const accessCodeInput = document.getElementById('accessCode')
const saveBtn = document.getElementById('saveBtn')
const clearBtn = document.getElementById('clearBtn')
const message = document.getElementById('message')

// Load saved access code on page load
chrome.storage.sync.get(['accessCode'], (result) => {
  if (result.accessCode) {
    accessCodeInput.value = result.accessCode
  }
})

// Save access code
saveBtn.addEventListener('click', () => {
  const accessCode = accessCodeInput.value.trim()

  if (!accessCode) {
    showMessage('Please enter an access code', 'error')
    return
  }

  chrome.storage.sync.set({ accessCode }, () => {
    showMessage('Access code saved successfully!', 'success')
  })
})

// Clear access code
clearBtn.addEventListener('click', () => {
  chrome.storage.sync.remove('accessCode', () => {
    accessCodeInput.value = ''
    showMessage('Access code cleared', 'success')
  })
})

// Show message
function showMessage(text, type) {
  message.textContent = text
  message.className = `message ${type}`
  message.style.display = 'block'

  setTimeout(() => {
    message.style.display = 'none'
  }, 3000)
}
