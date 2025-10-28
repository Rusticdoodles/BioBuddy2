"use client";

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, MessageSquare, FileText, Sparkles, Scaling, BadgeInfo, Plus, Dot, Download, FileImage, Info } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: <Sparkles className="w-16 h-16 text-blue-600 dark:text-blue-400 -mb-2" />,
      title: <h2 className="text-3xl mb-8">Welcome to BioBuddy!</h2>,
      description: <p>Transform your study notes and questions into interactive concept maps powered by AI.</p>,
    },
    {
      icon: <MessageSquare className="w-16 h-16 text-green-600 dark:text-green-400 -mb-2" />,
      title: <h2 className="text-3xl mb-10">Two Ways to Learn</h2>,
      description: (
        <div className="space-y-4">
          <div>
            <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-2">💬 Chat Mode</p>
            <p className="text-sm">Ask questions and get instant explanations with auto-generated concept maps.</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-2 mt-8">📝 Notes Mode</p>
            <p className="text-sm">Paste your study notes and we&apos;ll extract key concepts and relationships.</p>
          </div>
        </div>
      ),
    },
    {
      icon: <Scaling className="w-16 h-16 text-orange-600 dark:text-orange-400 -mb-2" />,
      title: <h2 className="text-3xl mb-10">Map Too Small?</h2>,
      description: <p>Click the <ChevronRight className="inline w-4 h-4 align-[-0.125em]" aria-hidden="true" /> at the top right of the left panel to collapse it, giving you more room for the concept map! </p>
    },
    {
      icon: <FileText className="w-16 h-16 text-purple-600 dark:text-purple-400" />,
      title: <h2 className="text-3xl mb-10">Make It Your Own</h2>,
      description: (
        <ul className="ml-8 text-sm space-y-2 text-left">
          <li>• Edit nodes and connections directly on the map</li>
          <li>• Use &quot;Simplify&quot; or &quot;Add Detail&quot; to refine explanations</li>
          <li>• Export as PNG or JSON to save your work</li>
          <li>• Everything saves automatically - never lose progress</li>
        </ul>
      ),
    },
    {
      icon: <BadgeInfo className="w-16 h-16 text-yellow-600 dark:text-yellow-400 -mb-2" />,
      title: <h2 className="text-3xl mb-6">How to Use the Map</h2>,
      description: (
        <div className="space-y-4 ">
          <div>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">Adding Nodes</p>
            <p className="text-sm">To add a node, click on the <Plus className="inline w-4 h-4 align-[-0.125em]" aria-hidden="true" /> icon on the right panel.</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">Adding Connections</p>
            <p className="text-sm">To add connections between nodes, click on the &quot;<Dot className="inline w-4 h-4 align-[-0.125em]" aria-hidden="true" />&quot; icons on the concept nodes.</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">Exporting and Importing Saved Maps</p>
            <p className="text-sm">To export and import saved maps, click on the <FileText className="inline w-4 h-4 align-[-0.125em]" aria-hidden="true" /> and <Download className="inline w-4 h-4 align-[-0.125em]" aria-hidden="true"/> icons respectively.</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-red-600 dark:text-red-400">Saving an Image of the Map</p>
            <p className="text-sm">To take a screenshot of the map, click on the <FileImage className="inline w-4 h-4 align-[-0.125em]" aria-hidden="true" /> icon.</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">Accessing the Legend</p>
            <p className="text-sm">To access the legend, click on the <Info className="inline w-4 h-4 align-[-0.125em]" aria-hidden="true" /> icon.</p>
          </div>    
        </div>

      )
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-blue-600'
                    : index < currentStep
                    ? 'w-2 bg-blue-400'
                    : 'w-2 bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            {steps[currentStep].icon}
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {steps[currentStep].title}
          </h2>
          
          <div className="text-slate-600 dark:text-slate-300 mb-8">
            {steps[currentStep].description}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Skip
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              {currentStep === steps.length - 1 ? (
                <>Get Started! ✓</>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
