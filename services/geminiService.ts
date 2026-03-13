import { GoogleGenAI, Modality } from "@google/genai";
import { ImageAspectRatio, VideoAspectRatio, VideoResolution, AudioVoice, ImageResolution, ScriptLanguage, ScriptTone, ScriptPlatform, MusicGenre, MusicMood, MusicInstrument } from '../types';


// A new instance is created before each API call in the components to ensure the latest API key is used.
const getAiClient = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio: ImageAspectRatio;
  resolution: ImageResolution;
}

export const generateImage = async (options: ImageGenerationOptions): Promise<string> => {
  const ai = getAiClient();
  // Negative prompts are appended to the main prompt as a common technique.
  const fullPrompt = options.negativePrompt 
    ? `${options.prompt}, do not include: ${options.negativePrompt}` 
    : options.prompt;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: fullPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: options.aspectRatio,
        imageSize: options.resolution,
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const base64Data = part.inlineData.data;
      return `data:${part.inlineData.mimeType};base64,${base64Data}`;
    }
  }

  throw new Error('No image data found in response');
};


export interface AudioGenerationOptions {
  prompt: string;
  voice: AudioVoice;
  rate?: number;
  pitch?: number;
}

export const generateAudio = async (options: AudioGenerationOptions): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: options.prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: options.voice === 'CLONED_VOICE' ? 'Zephyr' : options.voice },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }

    throw new Error('No audio data found in response');
};

export interface VideoGenerationOptions {
  prompt: string;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
}

export const generateVideo = async (options: VideoGenerationOptions): Promise<string> => {
    const ai = getAiClient();
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: options.prompt,
        config: {
            numberOfVideos: 1,
            resolution: options.resolution,
            aspectRatio: options.aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed, no download link found.");
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${import.meta.env.VITE_GEMINI_API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert video blob to data URL."));
            }
        };
        reader.onerror = () => reject(new Error("Error reading video blob."));
        reader.readAsDataURL(videoBlob);
    });
}

export interface ScriptGenerationOptions {
  prompt: string;
  language: ScriptLanguage;
  tone: ScriptTone;
  platform: ScriptPlatform;
}

export const generateScript = async (options: ScriptGenerationOptions): Promise<string> => {
  const ai = getAiClient();
  const fullPrompt = `
    You are an expert scriptwriter specializing in content for African audiences.
    Your task is to generate a script based on the following specifications.
    The script should be properly formatted with character names in all caps, followed by their dialogue. Actions and scene descriptions should be in parentheses.

    - **Topic/Idea:** "${options.prompt}"
    - **Language:** "${options.language}". If the language is Pidgin English, use it naturally. For other languages, write the script primarily in that language with cultural nuances.
    - **Tone:** "${options.tone}"
    - **Platform:** "${options.platform}"

    Please generate the complete script now.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
  });
  
  const text = response.text;
  if (text) {
    return text;
  }
  
  throw new Error('No script data found in response');
};

export interface MusicGenerationOptions {
    prompt: string;
    genre: MusicGenre;
    mood: MusicMood;
    instrument: MusicInstrument;
}

export const generateMusic = async (options: MusicGenerationOptions): Promise<string> => {
    const ai = getAiClient();
    const fullPrompt = `
        Generate a high-quality, royalty-free instrumental music track.
        The track should be approximately 30 seconds long and suitable for use as background music in content.
        Do not include any speech or vocals.

        **Genre:** ${options.genre}
        **Mood:** ${options.mood}
        **Featured Instrument:** ${options.instrument}
        **Description:** ${options.prompt}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }

    throw new Error('No music data found in response. The model may not have been able to generate audio for this prompt.');
};

export interface CulturalInspirationOptions {
  topic: string;
  language: ScriptLanguage;
}

export const getCulturalInspiration = async (options: CulturalInspirationOptions): Promise<string> => {
  const ai = getAiClient();
  const prompt = `
    As a cultural expert for the African continent, provide creative inspiration for a script.
    The script's main topic is: "${options.topic}".
    The primary language and cultural context is: "${options.language}".

    Provide 3-5 concrete ideas formatted in Markdown. For each idea, include:
    1.  **A relevant local proverb or saying** (with a brief explanation).
    2.  **A suggestion based on folklore or a historical event** that connects to the topic.
    3.  **A recommendation for a type of local music or sound** that would enhance the story's mood.

    Keep the suggestions concise, creative, and directly applicable to a storyteller or scriptwriter.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const text = response.text;
  if (text) {
    return text;
  }
  
  throw new Error('Could not get cultural inspiration at this time.');
};
