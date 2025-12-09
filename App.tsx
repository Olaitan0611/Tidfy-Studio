import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import AudioGenerator from './components/AudioGenerator';
import ScriptGenerator from './components/ScriptGenerator';
import ContentLibrary from './components/ContentLibrary';
import MusicGenerator from './components/MusicGenerator';
import CreatorNetwork from './components/CreatorNetwork';
import GrowthAnalytics from './components/GrowthAnalytics';
import LearningHub from './components/LearningHub';
import WelcomeScreen from './components/WelcomeScreen';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import { VideoCameraIcon, PhotoIcon, SpeakerWaveIcon, DocumentTextIcon, RectangleStackIcon, MusicalNoteIcon, UserGroupIcon, ChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

type Language = 'en' | 'sw';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VIDEO);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // New state for settings and accessibility
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [lowBandwidth, setLowBandwidth] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    // Session check could be added here in a real app
    const welcomeTimer = setTimeout(() => {
        setShowWelcome(false);
        if (!isAuthenticated) {
            setShowLoginModal(true);
        }
    }, 10000); // Welcome screen lasts for 10 seconds

    return () => clearTimeout(welcomeTimer);
  }, [isAuthenticated]);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };
  
  const translations = {
    en: {
      aiContentStudio: "AI Content Studio",
      chooseTool: "Choose a tool to start creating with the power of Gemini.",
      videoStudio: 'Video Studio',
      imageStudio: 'Image Studio',
      audioStudio: 'Audio Studio',
      musicStudio: 'Music Studio',
      scriptStudio: 'Script Studio',
      network: 'Network',
      growth: 'Growth',
      library: 'Library',
      learn: 'Learn',
    },
    sw: {
      aiContentStudio: "Studio ya Maudhui ya AI",
      chooseTool: "Chagua zana ili uanze kuunda kwa nguvu ya Gemini.",
      videoStudio: 'Studio ya Video',
      imageStudio: 'Studio ya Picha',
      audioStudio: 'Studio ya Sauti',
      musicStudio: 'Studio ya Muziki',
      scriptStudio: 'Studio ya Hati',
      network: 'Mtandao',
      growth: 'Ukuaji',
      library: 'Maktaba',
      learn: 'Jifunze',
    }
  };

  const t = (key: keyof typeof translations['en']) => translations[language][key] || translations['en'][key];


  const renderContent = () => {
    switch (activeTab) {
      case Tab.VIDEO:
        return <VideoGenerator lowBandwidth={lowBandwidth} />;
      case Tab.IMAGE:
        return <ImageGenerator />;
      case Tab.AUDIO:
        return <AudioGenerator />;
      case Tab.SCRIPT:
        return <ScriptGenerator />;
      case Tab.MUSIC:
        return <MusicGenerator />;
      case Tab.NETWORK:
        return <CreatorNetwork />;
      case Tab.GROWTH:
        return <GrowthAnalytics />;
      case Tab.LIBRARY:
        return <ContentLibrary />;
      case Tab.LEARN:
        return <LearningHub />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: Tab.VIDEO, name: t('videoStudio'), icon: VideoCameraIcon },
    { id: Tab.IMAGE, name: t('imageStudio'), icon: PhotoIcon },
    { id: Tab.AUDIO, name: t('audioStudio'), icon: SpeakerWaveIcon },
    { id: Tab.MUSIC, name: t('musicStudio'), icon: MusicalNoteIcon },
    { id: Tab.SCRIPT, name: t('scriptStudio'), icon: DocumentTextIcon },
    { id: Tab.NETWORK, name: t('network'), icon: UserGroupIcon },
    { id: Tab.GROWTH, name: t('growth'), icon: ChartBarIcon },
    { id: Tab.LIBRARY, name: t('library'), icon: RectangleStackIcon },
    { id: Tab.LEARN, name: t('learn'), icon: AcademicCapIcon },
  ];

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <>
      {showLoginModal && <LoginModal onLogin={handleLogin} />}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        lowBandwidth={lowBandwidth}
        setLowBandwidth={setLowBandwidth}
      />
      <div className={`min-h-screen text-text-primary font-sans flex flex-col transition-filter duration-500 ${showLoginModal || isSettingsOpen ? 'blur-sm' : ''}`}>
        <Header onSettingsClick={() => setIsSettingsOpen(true)} isOnline={isOnline} />
        <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-screen-2xl mx-auto w-full">
          <div className="bg-surface/50 backdrop-blur-sm border border-border rounded-xl shadow-2xl p-4 sm:p-6 md:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">{t('aiContentStudio')}</h2>
              <p className="text-text-secondary mb-8">{t('chooseTool')}</p>
              
              <div className="mb-8">
                  <div className="flex space-x-2 sm:space-x-4 bg-surface/60 p-2 rounded-lg overflow-x-auto pb-3">
                  {tabs.map((tab) => (
                      <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                          w-full flex-1 group inline-flex items-center justify-center py-3 px-2 rounded-md font-medium text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary
                          ${
                          activeTab === tab.id
                              ? 'bg-secondary text-text-on-secondary shadow'
                              : 'text-text-secondary hover:bg-surface-input/50 hover:text-text-primary'
                          }
                      `}
                      >
                      <tab.icon className="-ml-0.5 mr-2 h-5 w-5" aria-hidden="true" />
                      <span>{tab.name}</span>
                      </button>
                  ))}
                  </div>
              </div>

              <div>{renderContent()}</div>
          </div>
        </main>
      </div>
    </>
  );
};

export default App;