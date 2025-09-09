const API_URL = 'https://personal-goal-assistant-back-end.vercel.app/api/agent';

const form = document.getElementById('goalForm');
const goalInput = document.getElementById('goalInput');
const chatBody = document.getElementById('chatBody');
const submitBtn = document.getElementById('submitBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');

// Plexus animation for #plexus-canvas
const canvas = document.getElementById("plexus-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
const numParticles = 80;
const maxDistance = 120;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Create particles
for (let i = 0; i < numParticles; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw particles
  ctx.fillStyle = "rgba(233,69,96,0.8)"; // neon pink dots
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fill();

    // Move particles
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
  });

  // Draw lines
  ctx.strokeStyle = "rgba(233,69,96,0.2)";
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDistance) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animate);
}

animate();

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
  messageContent.innerHTML = '';

  try {
    await streamAgentResponse(goal, messageContent);
  } catch (err) {
    typeText(messageContent, `Request failed: ${err.message}`);
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
    let errorMessage = 'An error occurred.';
    try {
      const data = await res.json();
      errorMessage = data.error || JSON.stringify(data, null, 2);
    } catch {
      errorMessage = 'Response could not be parsed as JSON.';
    }
    typeText(messageContent, `Error: ${errorMessage}`);
    return;
  }

  if (!res.body) {
    typeText(messageContent, "No response body from server.");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done = false;

  // For streaming Markdown, accumulate and render
  let accumulated = '';

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      buffer += decoder.decode(value, { stream: true });
      const parts = buffer.split('\n\n');
      buffer = parts.pop();
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
            accumulated += data;
            // Render Markdown as HTML
            messageContent.innerHTML = marked.parse(accumulated);
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
 avatar.textContent = sender === 'user' ? '🤖' : '😎';


  const messageContent = document.createElement('div');
  messageContent.classList.add('message-content');

  if (sender === 'agent') {
    // Render Markdown for agent messages
    messageContent.innerHTML = marked.parse(text);
  } else {
    // Render plain text for user messages
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

function typeText(element, text) {
  let i = 0;
  element.innerHTML = ''; // Clear previous content
  const typing = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      chatBody.scrollTop = chatBody.scrollHeight;
    } else {
      clearInterval(typing);
    }
  }, 15);
}

// Download PDF functionality
downloadPdfBtn.addEventListener('click', () => {
  html2canvas(chatBody).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('chat.pdf');
  });
});
