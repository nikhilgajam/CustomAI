import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/ErrorResponse.js';
import { SuccessResponse } from '../utils/SuccessResponse.js';
import { Data } from '../models/data.models.js';
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export const generateAIResponse = asyncHandler(async (req, res, next) => {
  const { userInput } = req?.body || {};

  if (!userInput) {
    throw new ErrorResponse(400, 'User input is required.');
  }

  try {
    const data = await Data.findOne({ userName: req?.user?.userName });
    let initialPrompt = 'Your Role:\n';
    initialPrompt += data?.initialPrompt || 'You are a helpful AI assistant.';
    const textData = data?.txtData || '';

    if (textData) {
      initialPrompt += '\n\nUser Data for Context:';
      initialPrompt += `\nUser name: ${req?.user?.userName}`;
      initialPrompt += `\nUser email: ${req?.user?.email}`;
      initialPrompt += `\n\nUse the below given data if the user asks something from this context:`;
      initialPrompt += `\n${textData}`;
      initialPrompt += '\n\nOutput generation rules:';
      initialPrompt += '\nGive concise and small output unless user asks for elaborated or detailed answer.';
      initialPrompt += '\nDo not give any special character in the response like * etc.';
      initialPrompt += '\nGive only facts and if question is answerable with above data try to answer from that.';
    }

    const combinedPrompt = `${initialPrompt}\n\nUser Input:\n${userInput}`;

    const response = await ai.models.generateContent({
      model: process.env.GOOGLE_GENAI_MODEL, // Ex: gemini-2.5-flash-lite
      contents: [
        {
          role: 'user',
          parts: [{ text: combinedPrompt }]
        }
      ],
    });

    const result = response?.candidates[0]?.content?.parts[0];
    const text = result?.text || 'No response';

    return res.json(new SuccessResponse(200, text));
  } catch (error) {
    throw new ErrorResponse(500, 'Error generating AI response.', [error?.message]);
  }
});
