const form = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');
const chatBody = document.getElementById('chatBody');
const submitBtn = document.getElementById('submitBtn');

// Your Vercel backend endpoint
//const API_URL = 'https://<your-vercel-app>.vercel.app/api/agent';
const API_URL = 'http://localhost:5000/api/agent';

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const goal = goalInput.value.trim();
  if (!goal) return;

  appendMessage('user', goal);
  goalInput.value = '';
  submitBtn.disabled = true;

  const agentMessageElement = appendMessage('agent', 'Thinking...');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal }),
    });

    const data = await res.json();
    const messageContent = agentMessageElement.querySelector('.message-content');
    messageContent.textContent = '';

    if (!res.ok) {
      const errorMessage = data.error || JSON.stringify(data, null, 2);
      typeText(messageContent, `Error: ${errorMessage}`);
    } else {
      const plan = data.result || JSON.stringify(data, null, 2);
      typeText(messageContent, plan);
    }
  } catch (err) {
    const messageContent = agentMessageElement.querySelector('.message-content');
    messageContent.textContent = '';
    typeText(messageContent, `Request failed: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
  }
});

function appendMessage(sender, text) {
  const messageWrapper = document.createElement('div');
  messageWrapper.classList.add('chat-message', sender);

  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.textContent = sender === 'user' ? 'You' : '🤖';

  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');
  messageContent.textContent = text;

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

function typeText(element, text) {
  let i = 0;
  const typing = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      chatBody.scrollTop = chatBody.scrollHeight;
    } else {
      clearInterval(typing);
    }
  }, 20);
}
