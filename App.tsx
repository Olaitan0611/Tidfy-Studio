import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import AudioGenerator from './components/AudioGenerator';
import ScriptGenerator from './components/ScriptGenerator';
import ContentLibrary from './components/ContentLibrary';
import MusicGenerator from './components/MusicGenerator';
import AfricanSongGenerator from './components/AfricanSongGenerator';
import AfricanFashionGenerator from './components/AfricanFashionGenerator';
import CreatorNetwork from './components/CreatorNetwork';
import GrowthAnalytics from './components/GrowthAnalytics';
import LearningHub from './components/LearningHub';
import WelcomeScreen from './components/WelcomeScreen';
import LoginModal from './components/LoginModal';
import SettingsModal from './components/SettingsModal';
import { PhotoIcon, DocumentTextIcon, RectangleStackIcon, ChartBarIcon, AcademicCapIcon, GlobeAltIcon, SparklesIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { EgungunVideoIcon, SankofaGalleryIcon, TalkingDrumIcon, NkonsonkonsonUserIcon } from './components/CustomIcons';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

type Language = 'en' | 'sw';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.AFRICAN_FASHION); // Default to a feature tab for showcase
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [loginModalState, setLoginModalState] = useState<'none' | 'login' | 'download'>('none');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authReady, setAuthReady] = useState<boolean>(false);

  // New state for settings and accessibility
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('en');
  const [lowBandwidth, setLowBandwidth] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setLoginModalState('none');
      } else {
        setIsAuthenticated(false);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [showWelcome]);

  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
        setShowWelcome(false);
    }, 4000); // Welcome screen lasts for a shorter time now

    return () => clearTimeout(welcomeTimer);
  }, []);
  
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
    // Handled by onAuthStateChanged
  };
  
  const translations = {
    en: {
      aiContentStudio: "AI Content Studio",
      chooseTool: "Choose a tool to start creating with the power of Gemini.",
      videoStudio: 'Video Studio',
      imageStudio: 'Image Studio',
      audioStudio: 'Audio Studio',
      musicStudio: 'Music Studio',
      africanSong: 'African Song',
      africanFashion: 'African Fashion',
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
      africanSong: 'Nyimbo za Kiafrika',
      africanFashion: 'Mitindo ya Kiafrika',
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
      case Tab.AFRICAN_SONG:
        return <AfricanSongGenerator isAuthenticated={isAuthenticated} onRequestLogin={() => setLoginModalState('download')} />;
      case Tab.AFRICAN_FASHION:
        return <AfricanFashionGenerator isAuthenticated={isAuthenticated} onRequestLogin={() => setLoginModalState('download')} />;
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
    { id: Tab.VIDEO, name: t('videoStudio'), icon: EgungunVideoIcon },
    { id: Tab.IMAGE, name: t('imageStudio'), icon: SankofaGalleryIcon },
    { id: Tab.AUDIO, name: t('audioStudio'), icon: TalkingDrumIcon },
    { id: Tab.MUSIC, name: t('musicStudio'), icon: TalkingDrumIcon },
    { id: Tab.AFRICAN_SONG, name: t('africanSong'), icon: GlobeAltIcon },
    { id: Tab.AFRICAN_FASHION, name: t('africanFashion'), icon: SparklesIcon },
    { id: Tab.SCRIPT, name: t('scriptStudio'), icon: DocumentTextIcon },
    { id: Tab.NETWORK, name: t('network'), icon: NkonsonkonsonUserIcon },
    { id: Tab.GROWTH, name: t('growth'), icon: ChartBarIcon },
    { id: Tab.LIBRARY, name: t('library'), icon: RectangleStackIcon },
    { id: Tab.LEARN, name: t('learn'), icon: AcademicCapIcon },
  ];

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <>
      {loginModalState !== 'none' && (
          <LoginModal 
              onLogin={handleLogin} 
              onClose={() => setLoginModalState('none')}
              isDownloadPrompt={loginModalState === 'download'}
          />
      )}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        lowBandwidth={lowBandwidth}
        setLowBandwidth={setLowBandwidth}
      />
      <div className={`min-h-screen text-text-primary font-sans flex flex-col transition-filter duration-500 ${loginModalState !== 'none' || isSettingsOpen ? 'blur-sm' : ''}`}>
        <Header 
            onSettingsClick={() => setIsSettingsOpen(true)} 
            onLoginClick={() => setLoginModalState('login')}
            isOnline={isOnline} 
        />
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