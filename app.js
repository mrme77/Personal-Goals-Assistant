const API_URL = 'https://personal-goal-assistant-back-end.vercel.app';
const form = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');
const chatBody = document.getElementById('chatBody');
const submitBtn = document.getElementById('submitBtn');

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
  messageContent.textContent = '';

  try {
    await streamAgentResponse(goal, messageContent);
  } catch (err) {
    messageContent.textContent = '';
    typeText(messageContent, `Request failed: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
  }
}

async function streamAgentResponse(goal, messageContent) {
  // Directly use the deployed backend URL
  const res = await fetch('https://personal-goal-assistant-back-end.vercel.app/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal }),
  });

  if (!res.ok) {
    let errorMessage;
    try {
      const data = await res.json();
      errorMessage = data.error || JSON.stringify(data, null, 2);
    } catch {
      errorMessage = 'An error occurred and the response could not be parsed as JSON.';
    }
    typeText(messageContent, `Error: ${errorMessage}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop(); // keep incomplete part
      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const data = part.slice(6);
          if (data === '[DONE]') {
            done = true;
            break;
          } else if (data.startsWith('Error:')) {
            typeText(messageContent, data);
            done = true;
            break;
          } else {
            messageContent.textContent += data;
            chatBody.scrollTop = chatBody.scrollHeight;
          }
        }
      }
    }
  }
}

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
