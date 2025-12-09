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
    <div className="bg-surface border border-secondary/30 rounded-lg p-8 text-center flex flex-col items-center">
      <h2 className="text-2xl font-bold text-text-primary mb-4">API Key Required for {featureName}</h2>
      <p className="text-text-secondary mb-6 max-w-md">
        To use this feature, you must select an API key from a paid Google Cloud project. This is a one-time setup.
      </p>
      <button
        onClick={handleSelectKey}
        className="bg-secondary hover:bg-secondary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-secondary"
      >
        Select API Key
      </button>
      <p className="text-xs text-text-tertiary mt-4">
        By continuing, you agree to the associated costs. Learn more about{' '}
        <a
          href="https://ai.google.dev/gemini-api/docs/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:underline"
        >
          billing
        </a>.
      </p>
    </div>
  );
};

export default ApiKeySelector;