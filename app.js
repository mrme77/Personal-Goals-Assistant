const API_URL = 'https://personal-goal-assistant-back-end.vercel.app/api/agent';

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

  try {
    await streamAgentResponse(goal, messageContent);
  } catch (err) {
    console.error('Stream error:', err);
    messageContent.innerHTML = `<p><strong>Error:</strong> ${err.message}</p>`;
  } finally {
    submitBtn.disabled = false;
  }
}

async function streamAgentResponse(goal, messageContent) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal }),
  });

  if (!res.ok) {
    let errorMessage = 'Request failed';
    try {
      const data = await res.json();
      errorMessage = data.error || `HTTP ${res.status}`;
    } catch {
      errorMessage = `HTTP ${res.status} - ${res.statusText}`;
    }
    messageContent.innerHTML = `<p><strong>Error:</strong> ${errorMessage}</p>`;
    return;
  }

  if (!res.body) {
    messageContent.innerHTML = '<p><strong>Error:</strong> No response body from server.</p>';
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';
  let done = false;

  // Clear the "Thinking..." message
  messageContent.innerHTML = '';

  try {
    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete SSE messages
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // Remove 'data: ' prefix
            
            if (data === '[DONE]') {
              done = true;
              break;
            } else if (data.startsWith('Error:')) {
              messageContent.innerHTML = `<p><strong>Error:</strong> ${data.slice(6)}</p>`;
              return;
            } else if (data.trim()) {
              // Accumulate the data
              accumulated += data;
              
              // Re-render the complete markdown
              try {
                messageContent.innerHTML = marked.parse(accumulated);
                
                // Auto-scroll to bottom
                chatBody.scrollTop = chatBody.scrollHeight;
              } catch (markdownError) {
                console.error('Markdown parsing error:', markdownError);
                // Fallback to plain text if markdown fails
                messageContent.innerHTML = `<pre>${accumulated}</pre>`;
              }
            }
          }
        }
      }
    }
  } catch (streamError) {
    console.error('Stream processing error:', streamError);
    messageContent.innerHTML = `<p><strong>Stream Error:</strong> ${streamError.message}</p>`;
  }

  // Final render to ensure everything is displayed
  if (accumulated.trim()) {
    try {
      messageContent.innerHTML = marked.parse(accumulated);
    } catch (finalError) {
      console.error('Final markdown error:', finalError);
      messageContent.innerHTML = `<pre>${accumulated}</pre>`;
    }
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
    // For agent messages, we'll handle markdown in the streaming function
    messageContent.innerHTML = text;
  } else {
    // Plain text for user messages
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
