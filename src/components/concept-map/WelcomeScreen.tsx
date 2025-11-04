import React from 'react';

interface WelcomeScreenProps {
  onCreateTopic: (name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateTopic }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Welcome to BioBuddy
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Create your first topic to start generating concept maps and learning!
        </p>
        <button
          onClick={() => {
            const name = prompt('What topic would you like to study?');
            if (name) onCreateTopic(name);
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Create Your First Topic
        </button>
      </div>
    </div>
  );
};

