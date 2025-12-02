import { GoogleGenAI, Modality } from "@google/genai";
// FIX: Added ImageResolution to the import from types.ts.
import { ImageAspectRatio, VideoAspectRatio, VideoResolution, AudioVoice, ImageResolution } from '../types';


// A new instance is created before each API call in the components to ensure the latest API key is used.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

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


export const generateAudio = async (prompt: string, voice: AudioVoice): Promise<string> => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
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
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
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