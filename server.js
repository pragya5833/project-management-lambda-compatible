const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const { OpenAI } = require("openai");
const res = require("express/lib/response");
const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

// const port = 3000;
// // const AWS = require("aws-sdk");
const openaiApiKey = "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"; // Replace with your API key
const openai = new OpenAI({ apiKey: openaiApiKey });

app.get("/", (req, res) => {
  res.send("Welcome to the Project Management API");
});

// // Function to call OpenAI API for specific content generation
// // Function to call OpenAI API for specific content generation
const fetchOpenAIResponse = async (userInput, contentType) => {
  try {
    let prompt;

    // Construct a prompt based on the content type
    switch (contentType) {
      case "user-stories":
        prompt = `Create user stories based on these requirements:\n\n${userInput}`;
        break;
      case "acceptance-criteria":
        prompt = `Create acceptance criteria for this user story or requirement:\n\n${userInput}`;
        break;
      case "test-cases":
        // Here, we ignore the specific request in the user input and focus on generating test cases
        prompt = `Create test cases based on this description or requirement:\n\n${userInput}`;
        break;
      case "prd":
        prompt = `Develop a product requirements document (PRD) based on these requirements:\n\n${userInput}`;
        break;
      default:
        prompt = userInput;
    }

    const response = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return `Error: ${error.message}`;
  }
};

// Define POST endpoints using the OpenAI function

// POST endpoint for generating user stories
app.post("/generate-user-stories", async (req, res) => {
  const { requirement } = req.body;
  const result = await fetchOpenAIResponse(requirement, "user-stories");
  res.json({ message: "User stories generated", data: result });
});

// POST endpoint for generating acceptance criteria
app.post("/generate-acceptance-criteria", async (req, res) => {
  const { requirement } = req.body;
  const result = await fetchOpenAIResponse(requirement, "acceptance-criteria");
  res.json({ message: "Acceptance criteria generated", data: result });
});

// POST endpoint for generating test cases
app.post("/generate-test-cases", async (req, res) => {
  const { requirement } = req.body;
  const result = await fetchOpenAIResponse(requirement, "test-cases");
  res.json({ message: "Test cases generated", data: result });
});

// POST endpoint for generating PRD
app.post("/generate-prd", async (req, res) => {
  const { requirement } = req.body;
  const result = await fetchOpenAIResponse(requirement, "prd");
  res.json({ message: "PRD generated", data: result });
});

// // app.listen(port, () => {
// //   console.log(`Server listening at http://localhost:${port}`);
// // });

module.exports.handler = serverless(app);

// exports.handler = async function (event, context) {
//   console.log("EVENT: \n" + JSON.stringify(event, null, 2));
//   const result = await fetchOpenAIResponse(event.requirement, "user-stories");
//   console.log(result);
//   return context.logStreamName;
// };
