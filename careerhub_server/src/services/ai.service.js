import genAI from "../config/ai.js";

/**
 * Send a prompt to Gemini and return the text response.
 * @param {string} prompt
 * @param {string} [model="gemini-1.5-flash"]
 * @returns {Promise<string>}
 */
const generateAIResponse = async (prompt, model = "gemini-1.5-flash") => {
  const generativeModel = genAI.getGenerativeModel({ model });
  const result = await generativeModel.generateContent(prompt);
  return result.response.text();
};

export { generateAIResponse };
