
import { GoogleGenAI, Type } from "@google/genai";
import type { GrammarData, ListeningData, SpeakingFeedback, VocabularyData, WritingFeedback } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
const model = 'gemini-2.5-flash';

const generateContentWithSchema = async <T,>(prompt: string, schema: object): Promise<T> => {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as T;
  } catch (error) {
    console.error("Error generating content with schema:", error);
    throw new Error("Failed to get a valid response from the AI. Please try again.");
  }
};

export const generateListeningActivity = async (): Promise<ListeningData> => {
  const prompt = "Generate a short English sentence for an A2-level learner, a multiple-choice question about it with 3 options, and the correct answer. The sentence should be spoken aloud.";
  const schema = {
    type: Type.OBJECT,
    properties: {
      sentence: { type: Type.STRING, description: "A short, clear English sentence." },
      question: { type: Type.STRING, description: "A comprehension question about the sentence." },
      options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3 possible answers." },
      answer: { type: Type.STRING, description: "The correct answer from the options." }
    },
    required: ["sentence", "question", "options", "answer"],
  };
  return generateContentWithSchema<ListeningData>(prompt, schema);
};

export const generateSpeakingQuestion = async (): Promise<string> => {
  const prompt = "Generate a simple, open-ended question for an English learner to answer verbally. For example: 'What did you eat for breakfast today?' or 'What is your favorite color?'";
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text.trim();
};

export const evaluateSpokenAnswer = async (question: string, answer: string): Promise<SpeakingFeedback> => {
  const prompt = `An English learner was asked: "${question}". They replied: "${answer}". 
  Provide encouraging feedback. Politely correct any mistakes and explain why. Keep the tone friendly and supportive.
  If there are no mistakes, just give praise.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      praise: { type: Type.STRING, description: "Encouraging and positive feedback for the user." },
      correction: { type: Type.STRING, description: "The corrected version of the user's sentence. Empty if no mistakes." },
      explanation: { type: Type.STRING, description: "A simple explanation of the correction. Empty if no mistakes." }
    },
    required: ["praise", "correction", "explanation"],
  };
  return generateContentWithSchema<SpeakingFeedback>(prompt, schema);
};

export const generateWritingTopic = async (): Promise<string> => {
  const prompt = `Generate a short, simple daily writing topic for an English learner. For example: "Write 3 lines about your favorite food." or "Describe your morning routine in a few sentences."`;
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text.trim();
};

export const evaluateWriting = async (text: string): Promise<WritingFeedback> => {
  const prompt = `An English learner wrote the following: "${text}". 
  Check for grammar and spelling mistakes. Provide praise for their effort. Then, list the corrections in a structured way. For each correction, provide the original snippet, the corrected version, and a brief explanation. If there are no mistakes, the corrections array should be empty.`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      praise: { type: Type.STRING, description: "Positive praise for the user's writing effort." },
      corrections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            original: { type: Type.STRING },
            corrected: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["original", "corrected", "explanation"],
        }
      }
    },
    required: ["praise", "corrections"],
  };
  return generateContentWithSchema<WritingFeedback>(prompt, schema);
};

export const generateVocabularyWord = async (): Promise<VocabularyData> => {
  const prompt = "Teach one new English word suitable for an intermediate learner. Provide its meaning, an example sentence, and one synonym.";
  const schema = {
    type: Type.OBJECT,
    properties: {
      word: { type: Type.STRING },
      meaning: { type: Type.STRING },
      example: { type: Type.STRING },
      synonym: { type: Type.STRING }
    },
    required: ["word", "meaning", "example", "synonym"],
  };
  return generateContentWithSchema<VocabularyData>(prompt, schema);
};

export const evaluateVocabularySentence = async (word: string, sentence: string): Promise<string> => {
  const prompt = `An English learner was taught the word "${word}" and asked to use it in a sentence. They wrote: "${sentence}".
  Provide friendly feedback on their sentence. Confirm if they used it correctly, or gently correct them if they didn't.`;
  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text.trim();
};


export const generateGrammarQuestion = async (): Promise<GrammarData> => {
  const prompt = `Create a fill-in-the-blank grammar question for an English learner. Provide the question with a blank (___), 3 multiple-choice options, the correct answer, and a short hint for if they get it wrong. Example: "She ___ going to school. (is/are/am)"`;
  const schema = {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: { type: Type.ARRAY, items: { type: Type.STRING } },
      answer: { type: Type.STRING },
      hint: { type: Type.STRING }
    },
    required: ["question", "options", "answer", "hint"],
  };
  return generateContentWithSchema<GrammarData>(prompt, schema);
};
