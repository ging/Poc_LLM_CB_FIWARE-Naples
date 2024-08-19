import { createThreadAssistant, sendMessage } from './thread_openai.mjs';

(function() {
const chatInput = 
	document.querySelector('.chat-input textarea');
const sendChatBtn = 
	document.querySelector('.chat-input button');
const chatbox = document.querySelector(".chatbox");

let userMessage;
let thread;
let assistant;

(async () => {
	//console.log('Creating thread...⏳');
	[thread, assistant] = await createThreadAssistant();
  })();


const createChatLi = (message, className) => {
	const chatLi = document.createElement("li");
	chatLi.classList.add("chat", className);
	let chatContent = 
		className === "chat-outgoing" ? `<p>${message}</p>` : `<p>${message}</p>`;
	chatLi.innerHTML = chatContent;
	return chatLi;
}

const generateResponse = async (incomingChatLi) => {
	const messageElement = incomingChatLi
	.querySelector("p");
    
	try {
		console.log(`Sending message...⏳ ${userMessage}`);
		const response = await sendMessage(thread.id, assistant.id, userMessage);
		console.log('Message sent! ✅');
		messageElement.textContent = response;
	} catch(error) {
		console.log('error:', error)
		messageElement.textContent = 'Oops! Something went wrong. Please try again!'
	}
	chatbox.scrollTo(0, chatbox.scrollHeight)

}

// Add event listener to chat input to handle Enter as send
ttext.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		handleChat();
	}
});

const handleChat = async () => {
	userMessage = chatInput.value.trim();
	chatInput.value = "";
	console.log('User message:', userMessage);
	if (!userMessage) {
		return;
	}
	chatbox
	.appendChild(createChatLi(userMessage, "chat-outgoing"));
	chatbox
	.scrollTo(0, chatbox.scrollHeight);

	setTimeout(async () => {
		const incomingChatLi = createChatLi("Thinking...", "chat-incoming")
		chatbox.appendChild(incomingChatLi);
		chatbox.scrollTo(0, chatbox.scrollHeight);
		generateResponse(incomingChatLi);
	}, 600);
}

sendChatBtn.addEventListener("click", handleChat);
})();