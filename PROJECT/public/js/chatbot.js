document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});

function sendMessage() {
    let userInput = document.getElementById("user-input").value.trim();
    if (userInput === "") return;

    let chatBox = document.getElementById("chat-box");

    // Append User Message
    let userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = userInput;
    chatBox.appendChild(userMessage);

    // Auto Scroll
    chatBox.scrollTop = chatBox.scrollHeight;

    // Simulate Bot Response
    setTimeout(() => {
        let botMessage = document.createElement("div");
        botMessage.className = "bot-message";
        botMessage.textContent = getBotResponse(userInput);
        chatBox.appendChild(botMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 1000);

    document.getElementById("user-input").value = "";
}

function getBotResponse(input) {
    input = input.toLowerCase();
    if (input.includes("protein")) return "🍗 Foods high in protein: Chicken, Lentils, Eggs.";
    if (input.includes("vitamins")) return "🍊 Oranges, Carrots, and Spinach are rich in vitamins!";
    if (input.includes("calories")) return "🔥 A balanced diet keeps your calorie intake healthy!";
    return "🤔 I'm here to help! Ask me about nutrition.";
}
