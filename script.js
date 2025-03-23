const secureConfig = {
    aiPersonality: "You are Sky, an AI assistant for Sky Salvador. Only answer questions about:" + 
                   "\n- Game development (Unity/Unreal)" +
                   "\n- Web development (React/Node.js)" +
                   "\n- Open source contributions" +
                   "\n- Technical queries" +
                   "\nFor all other questions, redirect users to Sky's contact methods.",
    apiEndpoint: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
    apiKey: "AIzaSyBbJ8tscBJDEu6jz9c_O3KvyDBpAEvOPiQ"
};

class ChatInterface {
    constructor() {
        this.chatBubble = document.getElementById('chatBubble');
        this.chatWindow = document.getElementById('chatWindow');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendChat');
        this.minimizeButton = document.getElementById('minimizeChat');
        this.chatMessages = document.getElementById('chatMessages');
        this.isOpen = false;
        this.isMinimized = false;
        this.isTyping = false;
        this.rateLimit = { lastRequest: 0, delay: 1000 };
        this.loadCustomPrompt();
        this.setupEventListeners();
    }

    async loadCustomPrompt() {
        try {
            const response = await fetch('prompt.txt');
            if (response.ok) {
                const customPrompt = await response.text();
                secureConfig.aiPersonality = customPrompt;
            }
        } catch (error) {
            console.error("Failed to load custom prompt, using default:", error);
        }
    }

    setupEventListeners() {
        this.chatBubble.addEventListener('click', () => this.toggleChat());
        this.minimizeButton.addEventListener('click', () => this.toggleMinimize());
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSend();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.chatWindow.classList.add('open');
            this.chatBubble.classList.add('hidden');
            setTimeout(() => this.chatInput.focus(), 100);
        } else {
            this.chatWindow.classList.remove('open');
            this.chatBubble.classList.remove('hidden');
        }
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.chatWindow.classList.toggle('minimized', this.isMinimized);
        this.minimizeButton.textContent = this.isMinimized ? '+' : '−';
    }

    handleSend() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        if (this.isRateLimited()) {
            this.displayMessage("Sky: Please wait a moment before sending another message.", "ai");
            return;
        }
        this.displayMessage("You: " + this.sanitizeInput(message), "user");
        this.chatInput.value = '';
        this.rateLimit.lastRequest = Date.now();
        this.showTypingIndicator();
        this.handleQuery(message);
    }

    isRateLimited() {
        return Date.now() - this.rateLimit.lastRequest < this.rateLimit.delay;
    }

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    handleQuery(query) {
        const context = `${secureConfig.aiPersonality}\n\nUser: ${query}`;
        this.sendToAI(context);
    }

    async sendToAI(prompt) {
        try {
            const response = await fetch(`${secureConfig.apiEndpoint}?key=${secureConfig.apiKey}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No response.";
            this.hideTypingIndicator(); // Hide typing indicator
            this.displayMessage("Sky: " + reply, "ai");
        } catch (error) {
            console.error("Error:", error);
            this.hideTypingIndicator(); // Hide typing indicator
            this.displayMessage("⚠️ Connection error. Please try again later.", "ai");
        }
    }

    displayMessage(text, type) {
        const messageElem = document.createElement('div');
        messageElem.classList.add('message', type);
        messageElem.textContent = text;
        messageElem.setAttribute('aria-live', 'polite');
        if (type === "user") {
            messageElem.style.border = "2px solid #6a00ff"; // Add border for user messages
        } else if (type === "ai") {
            messageElem.style.border = "2px solid #e0e0e0"; // Add border for AI messages
        }
        this.chatMessages.appendChild(messageElem);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const typingElem = document.createElement('div');
        typingElem.classList.add('typing-indicator', 'visible');
        typingElem.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        this.chatMessages.appendChild(typingElem);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingElem = this.chatMessages.querySelector('.typing-indicator');
        if (typingElem) {
            typingElem.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatInterface();

    const followerCountElement = document.getElementById("follower-count");

    function formatNumber(number) {
        if (number >= 1000) return (number / 1000).toFixed(1) + "K";
        return number.toString();
    }

    function animateNumberChange(newNumber, element) {
        const duration = 500;
        const startNumber = parseFloat(element.textContent.replace("K", "")) * 1000 || 0;
        const range = newNumber - startNumber;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const currentValue = startNumber + range * progress;
            element.textContent = formatNumber(Math.floor(currentValue));
            if (progress < 1) requestAnimationFrame(updateNumber);
        }
        requestAnimationFrame(updateNumber);
    }

    function updateFollowerCount() {
        fetch('https://api.example.com/followers')
            .then(response => response.json())
            .then(data => {
                const currentCount = data.followers;
                animateNumberChange(currentCount, followerCountElement);
            })
            .catch(() => {
                let currentCount = 2300;
                const minCount = 2200;
                const maxCount = 2400;
                const interval = 2000;

                const intervalId = setInterval(() => {
                    const change = Math.random() < 0.5 ? -10 : 10;
                    currentCount += change;
                    if (currentCount < minCount) currentCount = minCount;
                    if (currentCount > maxCount) currentCount = maxCount;
                    animateNumberChange(currentCount, followerCountElement);
                }, interval);
            });
    }

    setTimeout(updateFollowerCount, 2000);

    const profilePic = document.querySelector(".profile-pic");
    profilePic.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        showToast("Right-click is disabled to protect the image.");
    });

    profilePic.addEventListener("dragstart", (e) => {
        e.preventDefault();
        showToast("Dragging is disabled to protect the image.");
    });

    function showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = '#333';
        toast.style.color = '#fff';
        toast.style.padding = '10px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        document.body.appendChild(toast);
        setTimeout(() => document.body.removeChild(toast), 3000);
    }
});