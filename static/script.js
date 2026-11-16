
// ======================================
// CHATBOT ELEMENTS
// ======================================

const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const sendButton = document.getElementById("sendButton");


// ======================================
// SESSION MANAGEMENT
// ======================================

let sessionId = sessionStorage.getItem("sessionId");

if (!sessionId) {

    sessionId = "portfolio-" + crypto.randomUUID();

    sessionStorage.setItem("sessionId", sessionId);

}


// ======================================
// DISPLAY CHAT MESSAGES
// ======================================

function addMessage(message, sender) {

    const wrapper = document.createElement("div");

    wrapper.className =
        sender === "You"
            ? "message user-message"
            : "message bot-message";


    const avatar = document.createElement("div");

    avatar.className = "message-avatar";

    avatar.textContent = sender === "You" ? "You" : "AI";


    const content = document.createElement("div");

    content.className = "message-content";


    const name = document.createElement("span");

    name.className = "message-sender";

    name.textContent =
        sender === "You" ? "You" : "AI Assistant";


    const bubble = document.createElement("div");

    bubble.className = "message-bubble";

    bubble.textContent = message;


    content.appendChild(name);

    content.appendChild(bubble);

    wrapper.appendChild(avatar);

    wrapper.appendChild(content);


    chatMessages.appendChild(wrapper);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    return wrapper;

}


// ======================================
// EXTRACT ANSWER FROM N8N
// ======================================

function extractAnswer(result) {

    let data;

    try {

        data = JSON.parse(result);

    } catch (error) {

        // If response is plain text
        return result;

    }


    // Example response:
    // [{"output": "Hello!"}]

    if (Array.isArray(data)) {

        data = data[0];

    }


    // Extract answer from object

    if (data && typeof data === "object") {

        return (
            data.output ??
            data.text ??
            data.response ??
            data.answer ??
            data.message ??
            JSON.stringify(data)
        );

    }


    return String(data);

}


// ======================================
// TYPING ANIMATION
// ======================================

function showTyping() {

    const typing = document.createElement("div");

    typing.className = "message bot-message";

    typing.id = "typingIndicator";


    typing.innerHTML = `

        <div class="message-avatar">AI</div>

        <div class="message-content">

            <span class="message-sender">
                AI Assistant
            </span>

            <div class="typing-bubble">

                <span></span>
                <span></span>
                <span></span>

            </div>

        </div>

    `;


    chatMessages.appendChild(typing);

    chatMessages.scrollTop = chatMessages.scrollHeight;

}


// ======================================
// REMOVE TYPING ANIMATION
// ======================================

function removeTyping() {

    const typing = document.getElementById("typingIndicator");

    if (typing) {

        typing.remove();

    }

}


// ======================================
// SEND QUESTION TO FLASK
// ======================================

chatForm.addEventListener("submit", async function(event) {

    event.preventDefault();


    const question = userInput.value.trim();

    if (!question) return;


    // Display user's question

    addMessage(question, "You");


    // Clear input

    userInput.value = "";


    // Disable send button

    sendButton.disabled = true;

    sendButton.querySelector("span").textContent = "Wait";


    // Display typing animation

    showTyping();


    try {

        // Send request to Flask backend

        const response = await fetch("/chat", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                chatInput: question,

                sessionId: sessionId

            })

        });


        const result = await response.text();


        // Check server response

        if (!response.ok) {

            throw new Error(
                result || "Server error: " + response.status
            );

        }


        // Extract clean answer from n8n

        const answer = extractAnswer(result);


        // Remove typing animation

        removeTyping();


        // Display AI response

        addMessage(String(answer), "Bot");


    } catch (error) {

        console.error("Chatbot error:", error);


        removeTyping();


        addMessage(
            "Sorry! I couldn't connect to the AI assistant. Please try again.",
            "Bot"
        );

    } finally {

        // Enable send button

        sendButton.disabled = false;

        sendButton.querySelector("span").textContent = "Send";

        userInput.focus();

    }

});


// ======================================
// SUGGESTED QUESTIONS
// ======================================

document.querySelectorAll(".suggestion-btn").forEach(button => {

    button.addEventListener("click", function() {

        userInput.value = this.textContent.trim();

        chatForm.requestSubmit();

    });

});
