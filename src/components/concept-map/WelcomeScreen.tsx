'use client';

import React, { useCallback, useState } from 'react';
import { NewTopicModal } from '@/components/NewTopicModal';

interface WelcomeScreenProps {
  onCreateTopic: (name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateTopic }) => {
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);

  const handleOpenModal = useCallback(() => {
    setIsNewTopicModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsNewTopicModalOpen(false);
  }, []);

  const handleConfirmTopic = useCallback(
    (name: string) => {
      onCreateTopic(name);
      setIsNewTopicModalOpen(false);
    },
    [onCreateTopic],
  );

  return (
    <>
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Welcome to BioBuddy
          </h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Create your first topic to start generating concept maps and learning!
          </p>
          <button
            onClick={handleOpenModal}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isNewTopicModalOpen}
          >
            Create Your First Topic
          </button>
        </div>
      </div>

      <NewTopicModal
        isOpen={isNewTopicModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmTopic}
      />
    </>
  );
};

