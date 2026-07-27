import React, { useState, useEffect } from 'react';
import { generateAfricanSongSample } from '../services/geminiService';
import { PlayIcon, LockClosedIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const AFRICAN_COUNTRIES = {
  "Nigeria": ["Yoruba", "Igbo", "Hausa", "Pidgin English", "Edo", "Tiv"],
  "South Africa": ["Zulu", "Xhosa", "Afrikaans", "Sotho", "Tswana"],
  "Kenya": ["Swahili", "Kikuyu", "Luo", "Kamba", "Kalenjin"],
  "Ghana": ["Twi", "Ewe", "Ga", "Fante", "Dagbani"],
  "Tanzania": ["Swahili", "Sukuma", "Chaga", "Gogo", "Haya"],
  "Ethiopia": ["Amharic", "Oromo", "Somali", "Tigrinya", "Sidama"],
  "Egypt": ["Arabic", "Nubian", "Domari"],
  "Morocco": ["Arabic", "Tamazight", "French"],
  "Uganda": ["Luganda", "Swahili", "Runyakitara", "Lusoga"],
  "Senegal": ["Wolof", "Pulaar", "Serer", "Jola", "Mandinka"]
};

const MUSIC_STYLES = ["Afrobeats", "Amapiano", "Hip-hop", "Highlife", "Gospel", "Chill"];

const AfricanSongGenerator: React.FC = () => {
    const [lyrics, setLyrics] = useState('');
    const [country, setCountry] = useState(Object.keys(AFRICAN_COUNTRIES)[0]);
    const [language, setLanguage] = useState(AFRICAN_COUNTRIES[Object.keys(AFRICAN_COUNTRIES)[0] as keyof typeof AFRICAN_COUNTRIES][0]);
    const [style, setStyle] = useState(MUSIC_STYLES[0]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [samples, setSamples] = useState<string[]>([]);
    
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Update languages when country changes
    useEffect(() => {
        const countryLangs = AFRICAN_COUNTRIES[country as keyof typeof AFRICAN_COUNTRIES];
        if (countryLangs && countryLangs.length > 0) {
            setLanguage(countryLangs[0]);
        }
    }, [country]);

    const handleGenerate = async () => {
        if (!lyrics.trim()) {
            setError("Please paste some lyrics first.");
            return;
        }
        
        setLoading(true);
        setError('');
        setSamples([]);

        try {
            // Generate two samples concurrently
            const [sample1, sample2] = await Promise.all([
                generateAfricanSongSample({ lyrics, country, language, style, variation: 1 }),
                generateAfricanSongSample({ lyrics, country, language, style, variation: 2 })
            ]);

            setSamples([
                `data:audio/wav;base64,${sample1}`,
                `data:audio/wav;base64,${sample2}`
            ]);
        } catch (err: any) {
            setError(err.message || 'Failed to generate song samples.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadClick = () => {
        if (!isSubscribed) {
            setShowUpgradeModal(true);
        } else {
            alert("Downloading full-quality track... (Simulated)");
        }
    };

    return (
        <div className="animate-fadeInUp max-w-4xl mx-auto space-y-8">
            <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-text-primary mb-6">Create Your African Song</h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-2">
                            Song Lyrics <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            placeholder="Paste your song lyrics here..."
                            maxLength={2500}
                            rows={6}
                            className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary resize-y"
                        />
                        <div className="text-right text-xs text-text-tertiary mt-1">
                            {lyrics.length}/2500
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">African Country</label>
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {Object.keys(AFRICAN_COUNTRIES).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Native Language</label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {(AFRICAN_COUNTRIES[country as keyof typeof AFRICAN_COUNTRIES] || []).map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Music Style</label>
                            <select
                                value={style}
                                onChange={(e) => setStyle(e.target.value)}
                                className="w-full p-3 bg-surface-input border border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition text-text-primary appearance-none"
                            >
                                {MUSIC_STYLES.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !lyrics.trim()}
                        className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Creating your song samples...</span>
                            </>
                        ) : (
                            <>
                                <PlayIcon className="h-5 w-5" />
                                <span>Generate My Song</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {samples.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary">Your Previews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {samples.map((sample, index) => (
                            <div key={index} className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-2">
                                    <PlayIcon className="h-8 w-8 text-secondary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg text-text-primary">Sample {index + 1}</h4>
                                    <p className="text-sm text-text-tertiary">20-30s Watermarked Preview</p>
                                </div>
                                
                                <audio controls src={sample} className="w-full mt-4" />
                                
                                <button
                                    onClick={handleDownloadClick}
                                    className={`w-full mt-6 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                                        isSubscribed 
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-surface-input border border-border text-text-secondary hover:text-text-primary'
                                    }`}
                                >
                                    {isSubscribed ? (
                                        <span>Download Full Track</span>
                                    ) : (
                                        <>
                                            <LockClosedIcon className="h-5 w-5" />
                                            <span>Download Full Track</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg p-8 animate-slideUpFadeIn relative">
                        <button 
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                                <LockClosedIcon className="h-8 w-8 text-accent" />
                            </div>
                            <h2 className="text-2xl font-bold text-text-primary mb-2">Unlock Full-Quality Downloads</h2>
                            <p className="text-text-secondary">
                                Subscribe to access unwatermarked, full-length audio files generated from your lyrics.
                            </p>
                        </div>

                        <div className="bg-surface-input rounded-xl p-6 border border-secondary/30 mb-8">
                            <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-text-primary">Pro Creator Plan</h3>
                                    <p className="text-sm text-text-tertiary">Unlimited full track downloads</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-text-primary">$9.99</span>
                                    <span className="text-sm text-text-tertiary">/mo</span>
                                </div>
                            </div>
                            
                            <ul className="space-y-3">
                                <li className="flex items-center text-sm text-text-secondary">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                    Full 3-minute song generations
                                </li>
                                <li className="flex items-center text-sm text-text-secondary">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                    High-fidelity WAV uncompressed audio
                                </li>
                                <li className="flex items-center text-sm text-text-secondary">
                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                    Commercial usage rights
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => {
                                setIsSubscribed(true);
                                setShowUpgradeModal(false);
                            }}
                            className="w-full bg-secondary hover:bg-secondary-hover text-white font-bold py-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            Subscribe to Unlock (Simulated)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AfricanSongGenerator;
