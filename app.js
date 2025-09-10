

const API_URL = 'https://personal-goal-assistant-back-end.vercel.app/api/agent';

const form = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');
const chatBody = document.getElementById('chatBody');
const submitBtn = document.getElementById('submitBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

form.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(ev) {
  ev.preventDefault();
  const goal = goalInput.value.trim();
  if (!goal) return;

  appendMessage('user', goal);
  goalInput.value = '';
  submitBtn.disabled = true;

  const agentMessageElement = appendMessage('agent', 'Thinking...');
  const messageContent = agentMessageElement.querySelector('.message-content');

  try {
    await getAgentResponse(goal, messageContent);
  } catch (err) {
    console.error('Request error:', err);
    messageContent.innerHTML = `<p><strong>Error:</strong> ${err.message}</p>`;
  } finally {
    submitBtn.disabled = false;
  }
}

// **NEW: Simple JSON-based function instead of streaming**
async function getAgentResponse(goal, messageContent) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });

    // Parse JSON response
    const data = await res.json();

    if (!res.ok) {
      const errorMessage = data.error || `HTTP ${res.status} - ${res.statusText}`;
      messageContent.innerHTML = `<p><strong>Error:</strong> ${errorMessage}</p>`;
      return;
    }

    // Check if response was successful
    if (!data.success) {
      messageContent.innerHTML = `<p><strong>Error:</strong> ${data.error || 'Unknown error occurred'}</p>`;
      return;
    }

    // Clear "Thinking..." and display the complete response
    if (data.response && data.response.trim()) {
      try {
        messageContent.innerHTML = marked.parse(data.response);
      } catch (markdownError) {
        console.error('Markdown parsing error:', markdownError);
        // Fallback to plain text with preserved formatting
        messageContent.innerHTML = `<pre>${data.response}</pre>`;
      }
    } else {
      messageContent.innerHTML = '<p><strong>Error:</strong> No response content received.</p>';
    }

    // Auto-scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;

  } catch (error) {
    console.error('Network or parsing error:', error);
    messageContent.innerHTML = `<p><strong>Network Error:</strong> ${error.message}</p>`;
  }
}

function appendMessage(sender, text) {
  const messageWrapper = document.createElement('div');
  messageWrapper.classList.add('chat-message', sender);

  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.textContent = sender === 'user' ? '😎' : '🤖';

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');

  if (sender === 'agent') {
    messageContent.innerHTML = text;
  } else {
    messageContent.textContent = text;
  }

  if (sender === 'user') {
    messageWrapper.appendChild(messageContent);
    messageWrapper.appendChild(avatar);
  } else {
    messageWrapper.appendChild(avatar);
    messageWrapper.appendChild(messageContent);
  }

  chatBody.appendChild(messageWrapper);
  chatBody.scrollTop = chatBody.scrollHeight;
  return messageWrapper;
}

// Keep your PDF download function as-is
downloadPdfBtn.addEventListener('click', () => {
  html2canvas(chatBody).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('goal-plan.pdf');
  });
});


