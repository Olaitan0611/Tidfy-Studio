import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import Header from './components/Header';
import VideoGenerator from './components/VideoGenerator';
import ImageGenerator from './components/ImageGenerator';
import AudioGenerator from './components/AudioGenerator';
import WelcomeScreen from './components/WelcomeScreen';
import LoginModal from './components/LoginModal';
import { VideoCameraIcon, PhotoIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VIDEO);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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

  const handleLogin = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.VIDEO:
        return <VideoGenerator />;
      case Tab.IMAGE:
        return <ImageGenerator />;
      case Tab.AUDIO:
        return <AudioGenerator />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: Tab.VIDEO, name: 'Video Studio', icon: VideoCameraIcon },
    { id: Tab.IMAGE, name: 'Image Studio', icon: PhotoIcon },
    { id: Tab.AUDIO, name: 'Audio Studio', icon: SpeakerWaveIcon },
  ];

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  return (
    <>
      {showLoginModal && <LoginModal onLogin={handleLogin} />}
      <div className={`min-h-screen text-gray-100 font-sans flex flex-col transition-filter duration-500 ${showLoginModal ? 'blur-sm' : ''}`}>
        <Header />
        <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-screen-2xl mx-auto w-full">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl p-4 sm:p-6 md:p-8">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">AI Content Studio</h2>
              <p className="text-gray-400 mb-8">Choose a tool to start creating with the power of Gemini.</p>
              
              <div className="mb-8">
                  <div className="flex space-x-2 sm:space-x-4 bg-gray-800/60 p-2 rounded-lg">
                  {tabs.map((tab) => (
                      <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                          w-full flex-1 group inline-flex items-center justify-center py-3 px-2 rounded-md font-medium text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500
                          ${
                          activeTab === tab.id
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
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