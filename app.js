// const API_URL = 'https://personal-goal-assistant-back-end.vercel.app/api/agent';

// class GoalPlannerChatbot {
//     constructor() {
//         // Add error checking for required elements
//         this.chatMessages = document.getElementById('chatMessages');
//         this.messageInput = document.getElementById('messageInput');
//         this.sendButton = document.getElementById('sendButton');
//         this.loadingOverlay = document.getElementById('loadingOverlay');
        
//         // Check if required elements exist
//         if (!this.chatMessages || !this.messageInput || !this.sendButton) {
//             console.error('Required DOM elements not found');
//             return;
//         }
        
//         // Use your specific endpoint
//         this.apiEndpoint = API_URL;
        
//         this.initializeEventListeners();
//         this.initializeTypingIndicator();
//     }
    
//     initializeEventListeners() {
//         // Send message on button click
//         this.sendButton.addEventListener('click', () => this.sendMessage());
        
//         // Send message on Enter key press
//         this.messageInput.addEventListener('keypress', (e) => {
//             if (e.key === 'Enter' && !e.shiftKey) {
//                 e.preventDefault();
//                 this.sendMessage();
//             }
//         });
        
//         // Auto-resize input
//         this.messageInput.addEventListener('input', () => {
//             this.messageInput.style.height = 'auto';
//             this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
//         });
        
//         // Feature item clicks
//         document.querySelectorAll('.feature-item').forEach(item => {
//             item.addEventListener('click', () => {
//                 const goal = item.querySelector('span').textContent;
//                 this.messageInput.value = `I want to work on ${goal.toLowerCase()}`;
//                 this.messageInput.focus();
//             });
//         });
//     }
    
//     async sendMessage() {
//         const message = this.messageInput.value.trim();
//         if (!message) return;
        
//         // Add user message to chat
//         this.addMessage(message, 'user');
        
//         // Clear input and disable send button
//         this.messageInput.value = '';
//         this.messageInput.style.height = 'auto';
//         this.sendButton.disabled = true;
        
//         // Show loading
//         this.showLoading();
        
//         try {
//             // Call the backend API
//             const response = await this.callAPI(message);
            
//             // Hide loading
//             this.hideLoading();
            
//             // Add bot response to chat
//             this.addMessage(response, 'bot');
            
//         } catch (error) {
//             console.error('Error:', error);
//             this.hideLoading();
//             this.addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'bot');
//         } finally {
//             this.sendButton.disabled = false;
//             this.messageInput.focus();
//         }
//     }
    
//     async callAPI(message) {
//         const response = await fetch(this.apiEndpoint, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 message: message,
//                 timestamp: new Date().toISOString()
//             })
//         });
        
//         if (!response.ok) {
//             const errorText = await response.text();
//             throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
//         }
        
//         const data = await response.json();
//         return data.plan || data.message || data.response || 'I apologize, but I couldn\'t generate a plan for you at this time.';
//     }
    
//     addMessage(content, sender) {
//         const messageDiv = document.createElement('div');
//         messageDiv.className = `message ${sender}-message`;
        
//         const avatar = document.createElement('div');
//         avatar.className = 'message-avatar';
//         avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
//         const messageContent = document.createElement('div');
//         messageContent.className = 'message-content';
        
//         const messageBubble = document.createElement('div');
//         messageBubble.className = 'message-bubble';
        
//         // Format the message content
//         if (sender === 'bot' && this.isPlanMessage(content)) {
//             messageBubble.innerHTML = this.formatPlanMessage(content);
//         } else {
//             messageBubble.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
//         }
        
//         const messageTime = document.createElement('div');
//         messageTime.className = 'message-time';
//         messageTime.textContent = this.getCurrentTime();
        
//         messageContent.appendChild(messageBubble);
//         messageContent.appendChild(messageTime);
        
//         messageDiv.appendChild(avatar);
//         messageDiv.appendChild(messageContent);
        
//         this.chatMessages.appendChild(messageDiv);
//         this.scrollToBottom();
//     }
    
//     isPlanMessage(content) {
//         // Check if the content looks like a structured plan
//         return content.includes('Week') || content.includes('Step') || 
//                content.includes('Phase') || content.includes('•') || 
//                content.includes('1.') || content.includes('2.');
//     }
    
//     formatPlanMessage(content) {
//         // Convert plain text plan to formatted HTML
//         let formatted = this.escapeHtml(content);
        
//         // Convert numbered lists
//         formatted = formatted.replace(/(\d+\.\s)/g, '<br><strong>$1</strong>');
        
//         // Convert bullet points
//         formatted = formatted.replace(/•\s/g, '<br>• ');
        
//         // Convert week headers
//         formatted = formatted.replace(/(Week \d+)/gi, '<br><h4 style="color: #667eea; margin: 15px 0 10px 0;">$1</h4>');
        
//         // Convert step headers
//         formatted = formatted.replace(/(Step \d+)/gi, '<br><h4 style="color: #667eea; margin: 15px 0 10px 0;">$1</h4>');
        
//         // Convert phase headers
//         formatted = formatted.replace(/(Phase \d+)/gi, '<br><h4 style="color: #667eea; margin: 15px 0 10px 0;">$1</h4>');
        
//         // Add some styling to the plan
//         formatted = `<div style="background: linear-gradient(135deg, #f8fafc, #e2e8f0); padding: 20px; border-radius: 15px; border-left: 4px solid #667eea; margin: 10px 0;">${formatted}</div>`;
        
//         return formatted;
//     }
    
//     escapeHtml(text) {
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }
    
//     getCurrentTime() {
//         const now = new Date();
//         return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     }
    
//     scrollToBottom() {
//         this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
//     }
    
//     showLoading() {
//         if (this.loadingOverlay) {
//             this.loadingOverlay.classList.add('show');
//         }
//         this.showTypingIndicator();
//     }
    
//     hideLoading() {
//         if (this.loadingOverlay) {
//             this.loadingOverlay.classList.remove('show');
//         }
//         this.hideTypingIndicator();
//     }
    
//     initializeTypingIndicator() {
//         // Create typing indicator element
//         this.typingIndicator = document.createElement('div');
//         this.typingIndicator.className = 'message bot-message typing-indicator-message';
//         this.typingIndicator.innerHTML = `
//             <div class="message-avatar">
//                 <i class="fas fa-robot"></i>
//             </div>
//             <div class="message-content">
//                 <div class="message-bubble typing-indicator">
//                     <div class="typing-dots">
//                         <span></span>
//                         <span></span>
//                         <span></span>
//                     </div>
//                 </div>
//             </div>
//         `;
        
//         // Add CSS for typing indicator
//         const style = document.createElement('style');
//         style.textContent = `
//             .typing-indicator {
//                 background: #f1f5f9;
//                 border-radius: 20px;
//                 padding: 15px 20px;
//                 width: fit-content;
//             }
            
//             .typing-dots {
//                 display: flex;
//                 gap: 4px;
//                 justify-content: center;
//             }
            
//             .typing-dots span {
//                 width: 8px;
//                 height: 8px;
//                 background: #94a3b8;
//                 border-radius: 50%;
//                 animation: typing 1.4s infinite ease-in-out;
//             }
            
//             .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
//             .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
            
//             @keyframes typing {
//                 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
//                 40% { transform: scale(1); opacity: 1; }
//             }
            
//             .typing-indicator-message {
//                 display: none;
//             }
//         `;
//         document.head.appendChild(style);
//     }
    
//     showTypingIndicator() {
//         if (this.chatMessages && this.typingIndicator) {
//             this.chatMessages.appendChild(this.typingIndicator);
//             this.typingIndicator.style.display = 'flex';
//             this.scrollToBottom();
//         }
//     }
    
//     hideTypingIndicator() {
//         if (this.typingIndicator && this.typingIndicator.parentNode) {
//             this.typingIndicator.parentNode.removeChild(this.typingIndicator);
//         }
//     }
// }

// // Initialize with error handling
// document.addEventListener('DOMContentLoaded', () => {
//     try {
//         new GoalPlannerChatbot();
//     } catch (error) {
//         console.error('Failed to initialize chatbot:', error);
//     }
// });

// // Add example goals for quick testing
// const exampleGoals = [
//     "I want to learn how to play the guitar in 5 weeks",
//     "I want to get in shape and lose 20 pounds in 3 months",
//     "I want to learn Spanish fluently in 6 months",
//     "I want to start a successful online business in 1 year",
//     "I want to learn how to code in Python in 4 months"
// ];

// // Placeholder rotation
// let placeholderIndex = 0;
// const placeholderTexts = [
//     "I want to learn how to play the guitar in 5 weeks",
//     "I want to get in shape and lose 20 pounds in 3 months",
//     "I want to learn Spanish fluently in 6 months",
//     "I want to start a successful online business in 1 year",
//     "I want to learn how to code in Python in 4 months"
// ];

// function rotatePlaceholder() {
//     const input = document.getElementById('messageInput');
//     if (input && !input.value && !input.matches(':focus')) {
//         input.placeholder = placeholderTexts[placeholderIndex];
//         placeholderIndex = (placeholderIndex + 1) % placeholderTexts.length;
//     }
// }

// // Rotate placeholder every 3 seconds
// setInterval(rotatePlaceholder, 3000);
const API_URL = 'https://personal-goal-assistant-back-end.vercel.app/api/agent';

class GoalPlannerChatbot {
  constructor() {
    this.chatMessages = document.getElementById('chatMessages');
    this.messageInput = document.getElementById('messageInput');
    this.sendButton = document.getElementById('sendButton');
    this.loadingOverlay = document.getElementById('loadingOverlay');

    if (!this.chatMessages || !this.messageInput || !this.sendButton) {
      console.error('Required DOM elements not found');
      return;
    }

    this.apiEndpoint = API_URL;
    this.initializeEventListeners();
    this.initializeTypingIndicator();
  }

  initializeEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());

    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.messageInput.addEventListener('input', () => {
      this.messageInput.style.height = 'auto';
      this.messageInput.style.height = this.messageInput.scrollHeight + 'px';
    });

    document.querySelectorAll('.feature-item').forEach(item => {
      item.addEventListener('click', () => {
        const goal = item.querySelector('span').textContent;
        this.messageInput.value = `I want to work on ${goal.toLowerCase()}`;
        this.messageInput.focus();
      });
    });
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');

    this.messageInput.value = '';
    this.messageInput.style.height = 'auto';
    this.sendButton.disabled = true;

    this.showLoading();

    try {
      const response = await this.callAPI(message);
      this.hideLoading();
      this.addMessage(response, 'bot');
    } catch (error) {
      console.error('Error:', error);
      this.hideLoading();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
      this.sendButton.disabled = false;
      this.messageInput.focus();
    }
  }

  async callAPI(message) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, timestamp: new Date().toISOString() })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data.plan || data.message || data.response || 'I apologize, I couldn\'t generate a plan.';
  }

  addMessage(content, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';

    const messageBubble = document.createElement('div');
    messageBubble.className = 'message-bubble';

    if (sender === 'bot') {
      messageBubble.innerHTML = marked.parse(content);
    } else {
      messageBubble.innerHTML = `<p>${this.escapeHtml(content)}</p>`;
    }

    const messageTime = document.createElement('div');
    messageTime.className = 'message-time';
    messageTime.textContent = this.getCurrentTime();

    messageContent.appendChild(messageBubble);
    messageContent.appendChild(messageTime);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }

  showLoading() {
    if (this.loadingOverlay) this.loadingOverlay.classList.add('show');
    this.showTypingIndicator();
  }

  hideLoading() {
    if (this.loadingOverlay) this.loadingOverlay.classList.remove('show');
    this.hideTypingIndicator();
  }

  initializeTypingIndicator() {
    this.typingIndicator = document.createElement('div');
    this.typingIndicator.className = 'message bot-message typing-indicator-message';
    this.typingIndicator.innerHTML = `
      <div class="message-avatar"><i class="fas fa-robot"></i></div>
      <div class="message-content">
        <div class="message-bubble typing-indicator">
          <div class="typing-dots"><span></span><span></span><span></span></div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      .typing-indicator { background: #f1f5f9; border-radius: 20px; padding: 15px 20px; width: fit-content; }
      .typing-dots { display: flex; gap: 4px; justify-content: center; }
      .typing-dots span { width: 8px; height: 8px; background: #94a3b8; border-radius: 50%; animation: typing 1.4s infinite ease-in-out; }
      .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
      .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
      @keyframes typing { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
      .typing-indicator-message { display: none; }
    `;
    document.head.appendChild(style);
  }

  showTypingIndicator() {
    if (this.chatMessages && this.typingIndicator) {
      this.chatMessages.appendChild(this.typingIndicator);
      this.typingIndicator.style.display = 'flex';
      this.scrollToBottom();
    }
  }

  hideTypingIndicator() {
    if (this.typingIndicator && this.typingIndicator.parentNode) {
      this.typingIndicator.parentNode.removeChild(this.typingIndicator);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new GoalPlannerChatbot();
  } catch (error) {
    console.error('Failed to initialize chatbot:', error);
  }
});

// rotating placeholder
const placeholderTexts = [
  "I want to learn how to play the guitar in 5 weeks",
  "I want to get in shape and lose 20 pounds in 3 months",
  "I want to learn Spanish fluently in 6 months",
  "I want to start a successful online business in 1 year",
  "I want to learn how to code in Python in 4 months"
];
let placeholderIndex = 0;
setInterval(() => {
  const input = document.getElementById('messageInput');
  if (input && !input.value && !input.matches(':focus')) {
    input.placeholder = placeholderTexts[placeholderIndex];
    placeholderIndex = (placeholderIndex + 1) % placeholderTexts.length;
  }
}, 3000);
