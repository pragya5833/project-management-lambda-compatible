const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const { OpenAI } = require("openai");
const { body, validationResult } = require("express-validator");
const app = express();

// Configure CORS for security
const corsOptions = {
  origin: "http://projectmanagementfecall.s3-website.ap-south-1.amazonaws.com", // Adjust this to match your frontend's domain
};
app.use(cors(corsOptions));
app.use(express.json());

// Set up the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: openaiApiKey });

app.get("/", (req, res) => {
  res.send("Welcome to the Project Management API");
});

// Function to call OpenAI API for specific content generation
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
        prompt = `Create test cases based on this description or requirement:\n\n${userInput}`;
        break;
      case "prd":
        prompt = `Develop a product requirements document (PRD) based on these requirements:\n\n${userInput}`;
        break;
      default:
        return `Unsupported content type. Please specify a valid content type such as 'user-stories', 'acceptance-criteria', 'test-cases', or 'prd'.`;
    }

    const response = await openai.chat.completions.create({
      messages: [{ role: "system", content: prompt }],
      model: "gpt-3.5-turbo",
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(
      `Failed to generate content due to server error: ${error.message}`
    );
  }
};

// Define POST endpoints using the OpenAI function

// POST endpoint for generating user stories
// Adding input validation to POST endpoints
app.post(
  "/generate-user-stories",
  [
    body("requirement")
      .trim()
      .notEmpty()
      .withMessage("Requirement is required and cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { requirement } = req.body;
    const result = await fetchOpenAIResponse(requirement, "user-stories");
    res.json({ message: "User stories generated", data: result });
  }
);

app.post(
  "/generate-acceptance-criteria",
  [
    body("requirement")
      .trim()
      .notEmpty()
      .withMessage("Requirement is required and cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { requirement } = req.body;
    const result = await fetchOpenAIResponse(
      requirement,
      "acceptance-criteria"
    );
    res.json({ message: "Acceptance criteria generated", data: result });
  }
);

app.post(
  "/generate-test-cases",
  [
    body("requirement")
      .trim()
      .notEmpty()
      .withMessage("Requirement is required and cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { requirement } = req.body;
    const result = await fetchOpenAIResponse(requirement, "test-cases");
    res.json({ message: "Test cases generated", data: result });
  }
);

app.post(
  "/generate-prd",
  [
    body("requirement")
      .trim()
      .notEmpty()
      .withMessage("Requirement is required and cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { requirement } = req.body;
    const result = await fetchOpenAIResponse(requirement, "prd");
    res.json({ message: "PRD generated", data: result });
  }
);
// Handler for serverless deployment
module.exports.handler = serverless(app);
