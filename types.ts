

declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
      hasSelectedApiKey: () => Promise<boolean>;
    };
  }
}

export enum Tab {
  VIDEO = 'video',
  IMAGE = 'image',
  AUDIO = 'audio',
  SCRIPT = 'script',
  MUSIC = 'music',
  NETWORK = 'network',
  GROWTH = 'growth',
  LIBRARY = 'library',
  LEARN = 'learn',
}

export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type VideoAspectRatio = "16:9" | "9:16";
export type VideoResolution = "480p" | "720p" | "1080p";
export type AudioVoice = "Kore" | "Puck" | "Zephyr" | "Charon" | "CLONED_VOICE";
export type ImageResolution = "1K" | "2K" | "4K";

export const IMAGE_ASPECT_RATIOS: ImageAspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];
export const VIDEO_ASPECT_RATIOS: VideoAspectRatio[] = ["16:9", "9:16"];
export const VIDEO_RESOLUTIONS: { name: string; value: VideoResolution }[] = [
    { name: 'Low Bandwidth (480p)', value: '480p'},
    { name: 'Standard (720p)', value: '720p' },
    { name: 'High (1080p)', value: '1080p' },
];
export const IMAGE_RESOLUTIONS: { name: string, value: ImageResolution }[] = [
    { name: 'Standard (1K)', value: '1K' },
    { name: 'High (2K)', value: '2K' },
    { name: 'Ultra (4K)', value: '4K' },
];

export interface AudioVoiceOption {
    name: string;
    value: AudioVoice;
    nationality?: string;
    gender?: 'Male' | 'Female';
}

export const AUDIO_VOICES: AudioVoiceOption[] = [
    // Nigeria
    { name: 'Ayo (Nigerian Male)', value: 'Kore', nationality: 'Nigerian', gender: 'Male' },
    { name: 'Chidinma (Nigerian Female)', value: 'Zephyr', nationality: 'Nigerian', gender: 'Female' },
    { name: 'Tunde (Nigerian Male)', value: 'Puck', nationality: 'Nigerian', gender: 'Male' },
    { name: 'Amara (Nigerian Female)', value: 'Charon', nationality: 'Nigerian', gender: 'Female' },
    // Ghana
    { name: 'Kwame (Ghanaian Male)', value: 'Puck', nationality: 'Ghanaian', gender: 'Male' },
    { name: 'Akua (Ghanaian Female)', value: 'Charon', nationality: 'Ghanaian', gender: 'Female' },
    { name: 'Kofi (Ghanaian Male)', value: 'Kore', nationality: 'Ghanaian', gender: 'Male' },
    { name: 'Esi (Ghanaian Female)', value: 'Zephyr', nationality: 'Ghanaian', gender: 'Female' },
    // Kenya
    { name: 'Jomo (Kenyan Male)', value: 'Kore', nationality: 'Kenyan', gender: 'Male' },
    { name: 'Wanjiru (Kenyan Female)', value: 'Zephyr', nationality: 'Kenyan', gender: 'Female' },
    { name: 'Baraka (Kenyan Male)', value: 'Puck', nationality: 'Kenyan', gender: 'Male' },
    { name: 'Imani (Kenyan Female)', value: 'Charon', nationality: 'Kenyan', gender: 'Female' },
    // South Africa
    { name: 'Themba (South African Male)', value: 'Puck', nationality: 'South African', gender: 'Male' },
    { name: 'Nia (South African Female)', value: 'Charon', nationality: 'South African', gender: 'Female' },
    { name: 'Jabulani (South African Male)', value: 'Kore', nationality: 'South African', gender: 'Male' },
    { name: 'Zola (South African Female)', value: 'Zephyr', nationality: 'South African', gender: 'Female' },
    // Special
    { name: '✨ Clone My Voice', value: 'CLONED_VOICE' },
];


export type ScriptLanguage = "English" | "Swahili" | "Yoruba" | "Zulu" | "Hausa" | "Pidgin English";
export type ScriptTone = "Comedic" | "Dramatic" | "Informational" | "Promotional" | "Educational";
export type ScriptPlatform = "TikTok" | "YouTube" | "Instagram Reels" | "Short Film";

export const SCRIPT_LANGUAGES: { name: string, value: ScriptLanguage }[] = [
    { name: 'English', value: 'English' },
    { name: 'Pidgin English', value: 'Pidgin English' },
    { name: 'Swahili', value: 'Swahili' },
    { name: 'Yoruba', value: 'Yoruba' },
    { name: 'Zulu', value: 'Zulu' },
    { name: 'Hausa', value: 'Hausa' },
];

export const SCRIPT_TONES: { name: string, value: ScriptTone }[] = [
    { name: 'Comedic', value: 'Comedic' },
    { name: 'Dramatic', value: 'Dramatic' },
    { name: 'Informational', value: 'Informational' },
    { name: 'Promotional', value: 'Promotional' },
    { name: 'Educational', value: 'Educational' },
];

export const SCRIPT_PLATFORMS: { name: string, value: ScriptPlatform }[] = [
    { name: 'TikTok (Under 1 min)', value: 'TikTok' },
    { name: 'YouTube (1-5 mins)', value: 'YouTube' },
    { name: 'Instagram Reels (Under 90s)', value: 'Instagram Reels' },
    { name: 'Short Film (5-10 mins)', value: 'Short Film' },
];

// Music Generation Types
export type MusicGenre = "Amapiano" | "Afrobeat" | "Highlife" | "Benga" | "Soukous" | "Gqom";
export type MusicMood = "Uplifting" | "Chill" | "Energetic" | "Melancholic" | "Mystical" | "Celebratory";
export type MusicInstrument = "Kora" | "Djembe" | "Udu Drum" | "Mbira" | "Log Drum" | "Shekere";

export const MUSIC_GENRES: { name: string, value: MusicGenre }[] = [
    { name: 'Amapiano', value: 'Amapiano' },
    { name: 'Afrobeat', value: 'Afrobeat' },
    { name: 'Highlife', value: 'Highlife' },
    { name: 'Benga', value: 'Benga' },
    { name: 'Soukous', value: 'Soukous' },
    { name: 'Gqom', value: 'Gqom' },
];

export const MUSIC_MOODS: { name: string, value: MusicMood }[] = [
    { name: 'Uplifting', value: 'Uplifting' },
    { name: 'Chill', value: 'Chill' },
    { name: 'Energetic', value: 'Energetic' },
    { name: 'Melancholic', value: 'Melancholic' },
    { name: 'Mystical', value: 'Mystical' },
    { name: 'Celebratory', value: 'Celebratory' },
];

export const MUSIC_INSTRUMENTS: { name: string, value: MusicInstrument }[] = [
    { name: 'Log Drum', value: 'Log Drum' },
    { name: 'Djembe', value: 'Djembe' },
    { name: 'Kora', value: 'Kora' },
    { name: 'Mbira', value: 'Mbira' },
    { name: 'Udu Drum', value: 'Udu Drum' },
    { name: 'Shekere', value: 'Shekere' },
];

// Creator Network Types
export interface Creator {
    id: number;
    name: string;
    headline: string;
    skills: string[];
    country: string;
    avatarUrl: string;
}