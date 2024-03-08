import ollama from "ollama";
import prompts from "prompts";
import argv from "yargs";
import PDFParser from "pdf2json";
import fs from "fs/promises";
import path from "path";

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

const allFiles = await fs.readdir("./files");
const pdfs = allFiles.filter(
  (file) => path.extname(file).toLowerCase() === ".pdf"
);

const choices = pdfs.map((pdf) => ({ title: pdf, value: pdf }));

const pdfSelected = await prompts({
  type: "select",
  name: "pdf",
  message: "Which PDF would you like to summarize?",
  choices,
});

interface PatchedPDFParser extends PDFParser {
  getRawTextContent: () => string;
}

const filename = `./files/${pdfSelected.pdf}`;

const parse = (filename: string) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(undefined, 1) as PatchedPDFParser;
    pdfParser.on("pdfParser_dataReady", (_pdfData) => {
      try {
        const data = pdfParser.getRawTextContent();
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
    pdfParser.on("pdfParser_dataError", (errData) => reject(errData));
    pdfParser.loadPDF(filename);
  });
};

const text = await parse(filename);

const response = await ollama.chat({
  model: modelSelected.model,
  messages: [
    {
      role: "system",
      content: "Summarize the following PDF document in 3 sentences or less.",
    },
    {
      role: "user",
      content: "PDF content:\n" + text,
    },
  ],
});

console.log(response.message.content);
