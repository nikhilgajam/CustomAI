import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/ErrorResponse.js';
import { SuccessResponse } from '../utils/SuccessResponse.js';
import { Data } from '../models/data.models.js';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export const generateAIResponse = asyncHandler(async (req, res, next) => {
  const { userInput } = req?.body || {};

  if (userInput === undefined || userInput === null) {
    throw new ErrorResponse(400, 'User input is required.');
  }

  try {
    const data = await Data.findOne({ userName: req?.user?.userName });
    let initialPrompt = data?.initialPrompt || 'You are a helpful AI assistant.';
    const textData = data?.txtData || '';

    if (textData) {
      initialPrompt += '\nUser Data:';
      initialPrompt += `\nUser name: ${req?.user?.userName}`;
      initialPrompt += `\nUser email: ${req?.user?.email}`;
      initialPrompt += `\n\nUse the below given data if the user asks something from this context:`;
      initialPrompt += `\n${textData}`;
    }

    const userPrompt = userInput || 'No user input provided.';

    const response = await ai.models.generateContent({
      model: process.env.GOOGLE_GENAI_MODEL, // Ex: gemini-2.5-flash-lite
      contents: [
        {
          role: 'system',
          parts: [{ text: initialPrompt }]
        },
        {
          role: 'user',
          parts: [{ text: userPrompt }]
        }
      ],
    });
    return res.json(new SuccessResponse(200, response?.text));
  } catch (error) {
    throw new ErrorResponse(500, 'Error generating AI response.', [error?.message]);
  }
});
