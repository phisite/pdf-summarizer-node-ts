import ollama from "ollama";

const response = await ollama.chat({
  model: "dolphin-phi",
  messages: [
    {
      role: "system",
      content: "Hello, I'm a friendly assistant! Ask me anything.",
    },
    {
      role: "user",
      content: "What is the capital of France?",
    },
  ],
});

console.log(response.message.content);
