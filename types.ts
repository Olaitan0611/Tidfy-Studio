

export enum Tab {
  VIDEO = 'video',
  IMAGE = 'image',
  AUDIO = 'audio',
}

export type ImageAspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type VideoAspectRatio = "16:9" | "9:16";
export type VideoResolution = "720p" | "1080p";
export type AudioVoice = "Kore" | "Puck" | "Zephyr" | "Charon" | "CLONED_VOICE";
export type ImageResolution = "1K" | "2K" | "4K";

export const IMAGE_ASPECT_RATIOS: ImageAspectRatio[] = ["1:1", "16:9", "9:16", "4:3", "3:4"];
export const VIDEO_ASPECT_RATIOS: VideoAspectRatio[] = ["16:9", "9:16"];
export const VIDEO_RESOLUTIONS: VideoResolution[] = ["720p", "1080p"];
export const IMAGE_RESOLUTIONS: { name: string, value: ImageResolution }[] = [
    { name: 'Standard (1K)', value: '1K' },
    { name: 'High (2K)', value: '2K' },
    { name: 'Ultra (4K)', value: '4K' },
];
export const AUDIO_VOICES: { name: string, value: AudioVoice }[] = [
    { name: 'Zephyr (Female)', value: 'Zephyr' },
    { name: 'Charon (Female)', value: 'Charon' },
    { name: 'Kore (Male)', value: 'Kore' },
    { name: 'Puck (Male)', value: 'Puck' },
    { name: '✨ Clone My Voice', value: 'CLONED_VOICE' },
];