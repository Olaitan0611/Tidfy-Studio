import React, { useState } from 'react';
import Spinner from './Spinner';
import { generateScript, getCulturalInspiration, ScriptGenerationOptions } from '../services/geminiService';
import { SparklesIcon, ExclamationTriangleIcon, DocumentTextIcon, ClipboardDocumentIcon, CheckIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ScriptLanguage, ScriptTone, ScriptPlatform, SCRIPT_LANGUAGES, SCRIPT_TONES, SCRIPT_PLATFORMS } from '../types';

const InspirationModal: React.FC<{ inspiration: string; onClose: () => void; }> = ({ inspiration, onClose }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(inspiration);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-2xl p-6 animate-slideUpFadeIn flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-text-primary flex items-center"><LightBulbIcon className="w-6 h-6 mr-2 text-accent"/>Cultural Inspiration</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-secondary hover:bg-surface-input">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 flex-grow">
                    <pre className="whitespace-pre-wrap text-text-primary font-sans text-base leading-relaxed">{inspiration}</pre>
                </div>
                 <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center bg-surface hover:bg-border text-text-primary font-semibold py-2 px-4 rounded-lg text-sm transition-colors mt-4"
                >
                    {copied ? <CheckIcon className="w-5 h-5 mr-2 text-green-500" /> : <ClipboardDocumentIcon className="w-5 h-5 mr-2" />}
                    {copied ? 'Copied!' : 'Copy Inspiration'}
                </button>
            </div>
        </div>
    );
};


const ScriptGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [language, setLanguage] = useState<ScriptLanguage>('English');
    const [tone, setTone] = useState<ScriptTone>('Comedic');
    const [platform, setPlatform] = useState<ScriptPlatform>('TikTok');
    const [isLoading, setIsLoading] = useState(false);
    const [script, setScript] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // New state for inspiration
    const [isInspirationLoading, setIsInspirationLoading] = useState(false);
    const [inspiration, setInspiration] = useState<string | null>(null);
    const [showInspirationModal, setShowInspirationModal] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a script idea.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setScript(null);
        try {
            const options: ScriptGenerationOptions = { prompt, language, tone, platform };
            const generatedScript = await generateScript(options);
            setScript(generatedScript);
        } catch (err: any) {
            const errorMessage = err.message || 'An unknown error occurred while generating the script.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetInspiration = async () => {
        if (!prompt.trim()) {
            setError('Please enter a script idea to get inspiration.');
            return;
        }
        setIsInspirationLoading(true);
        setError(null);
        setInspiration(null);
        try {
            const result = await getCulturalInspiration({ topic: prompt, language });
            setInspiration(result);
            setShowInspirationModal(true);
        } catch(err: any) {
            setError(err.message || 'Could not fetch inspiration.');
        } finally {
            setIsInspirationLoading(false);
        }
    };

    const handleCopy = () => {
        if (!script) return;
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
        {showInspirationModal && inspiration && <InspirationModal inspiration={inspiration} onClose={() => setShowInspirationModal(false)}/>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Left Panel: Controls */}
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="prompt-script" className="block text-sm font-medium text-text-primary">Script Idea</label>
                        <button
                            onClick={handleGetInspiration}
                            disabled={isInspirationLoading || isLoading}
                            className="flex items-center text-sm text-accent hover:text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isInspirationLoading ? <Spinner className="w-5 h-5 mr-1.5"/> : <LightBulbIcon className="w-5 h-5 mr-1.5" />}
                            {isInspirationLoading ? 'Thinking...' : 'Get Cultural Inspiration'}
                        </button>
                    </div>
                    <textarea
                        id="prompt-script"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., A funny skit about two friends arguing over the last piece of jollof rice..."
                        className="w-full h-32 p-4 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none text-base"
                        disabled={isLoading || isInspirationLoading}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <div>
                        <label htmlFor="language-script" className="block text-sm font-medium text-text-primary mb-2">Language</label>
                        <select
                            id="language-script"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as ScriptLanguage)}
                            disabled={isLoading || isInspirationLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {SCRIPT_LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="tone-script" className="block text-sm font-medium text-text-primary mb-2">Tone</label>
                        <select
                            id="tone-script"
                            value={tone}
                            onChange={(e) => setTone(e.target.value as ScriptTone)}
                            disabled={isLoading || isInspirationLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {SCRIPT_TONES.map(t => <option key={t.value} value={t.value}>{t.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="platform-script" className="block text-sm font-medium text-text-primary mb-2">Platform</label>
                        <select
                            id="platform-script"
                            value={platform}
                            onChange={(e) => setPlatform(e.target.value as ScriptPlatform)}
                            disabled={isLoading || isInspirationLoading}
                            className="w-full p-3 bg-surface-input border-2 border-border rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary transition"
                        >
                            {SCRIPT_PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || isInspirationLoading}
                    className="flex items-center justify-center w-full bg-secondary hover:bg-secondary-hover disabled:bg-secondary/20 disabled:cursor-not-allowed text-text-on-secondary font-bold py-3 px-8 rounded-lg transition-all duration-300"
                >
                    {isLoading ? <Spinner /> : <SparklesIcon className="w-6 h-6 mr-2" />}
                    {isLoading ? 'Writing Script...' : 'Generate Script'}
                </button>
                 {error && !isLoading && (
                 <div className="flex items-center p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
                )}
            </div>
            {/* Right Panel: Output */}
            <div className="bg-surface-input/50 rounded-xl border-2 border-dashed border-border flex flex-col min-h-[500px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-secondary">
                        <Spinner className="w-16 h-16" />
                        <span className="mt-4">The AI is writing...</span>
                    </div>
                ) : script ? (
                    <div className="relative h-full flex flex-col">
                        <div className="p-6 overflow-y-auto flex-grow">
                             <pre className="whitespace-pre-wrap text-text-primary font-sans text-base leading-relaxed">{script}</pre>
                        </div>
                        <div className="sticky bottom-0 bg-surface-input/80 backdrop-blur-sm p-3 border-t border-border mt-auto">
                            <button
                                onClick={handleCopy}
                                className="w-full flex items-center justify-center bg-surface hover:bg-border text-text-primary font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
                            >
                                {copied ? <CheckIcon className="w-5 h-5 mr-2 text-green-500" /> : <ClipboardDocumentIcon className="w-5 h-5 mr-2" />}
                                {copied ? 'Copied!' : 'Copy to Clipboard'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-text-tertiary p-8 flex flex-col items-center justify-center h-full">
                        <DocumentTextIcon className="w-16 h-16 mx-auto mb-4"/>
                        <p>Your generated script will appear here</p>
                    </div>
                )}
            </div>
        </div>
        </>
    );
};

export default ScriptGenerator;