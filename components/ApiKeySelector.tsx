import React from 'react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
  featureName: string;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected, featureName }) => {
  const handleSelectKey = async () => {
    // This function is assumed to be provided by the execution environment
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      // As per guidelines, assume success and proceed.
      onKeySelected();
    } else {
      alert("API key selection is not available in this environment.");
    }
  };

  return (
    <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-8 text-center flex flex-col items-center">
      <h2 className="text-2xl font-bold text-white mb-4">API Key Required for {featureName}</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        To use this feature, you must select an API key from a paid Google Cloud project. This is a one-time setup.
      </p>
      <button
        onClick={handleSelectKey}
        className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500"
      >
        Select API Key
      </button>
      <p className="text-xs text-gray-500 mt-4">
        By continuing, you agree to the associated costs. Learn more about{' '}
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:underline"
        >
          billing
        </a>.
      </p>
    </div>
  );
};

export default ApiKeySelector;