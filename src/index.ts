import ollama from "ollama";
import prompts from "prompts";
import argv from "yargs";

prompts.override(argv);

const models = await ollama
  .list()
  .then((response) => response.models)
  .then((response) =>
    response.map((model) => ({ title: model.name, value: model.name }))
  );

const modelSelected = await prompts({
  type: "select",
  name: "model",
  message: "Which model would you like to use?",
  choices: models,
  initial: 0,
});

console.log(modelSelected.model);

const examplePrompt = await prompts({
  type: "text",
  name: "value",
  message: "Hello, I'm a friendly assistant! Ask me anything.",
  initial: "What is the capital of France?",
});

const response = await ollama.chat({
  model: "dolphin-phi",
  messages: [
    {
      role: "system",
      content: "Hello, I'm a friendly assistant! Ask me anything.",
    },
    {
      role: "user",
      content: examplePrompt.value,
    },
  ],
});

console.log(response.message.content);
