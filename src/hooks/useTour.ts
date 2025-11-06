import { useCallback, useEffect, useState } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_COMPLETED_KEY = 'biobuddy-tour-completed';
const TOUR_PART1_COMPLETED_KEY = 'biobuddy-tour-part1-completed';
const TOUR_PART2_COMPLETED_KEY = 'biobuddy-tour-part2-completed';

export const useTour = () => {
  const [hasSeenTour, setHasSeenTour] = useState(true);
  const [hasSeenPart1, setHasSeenPart1] = useState(false);
  const [hasSeenPart2, setHasSeenPart2] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    const part1 = localStorage.getItem(TOUR_PART1_COMPLETED_KEY);
    const part2 = localStorage.getItem(TOUR_PART2_COMPLETED_KEY);
    
    setHasSeenTour(completed === 'true');
    setHasSeenPart1(part1 === 'true');
    setHasSeenPart2(part2 === 'true');
  }, []);

  // Steps 1-7: UI and Chat (before map exists)
  const getInitialSteps = (): DriveStep[] => [
    {
      popover: {
        title: '👋 Welcome to BioBuddy!',
        description: 'Let\'s take a quick tour to show you how to master biology with AI-powered concept maps. Click "Next" to continue!',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="topics-sidebar"]',
      popover: {
        title: '📚 Study Topics',
        description: 'All your study sessions are organized by topic. Each topic has its own chat history and concept map.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="create-topic-btn"]',
      popover: {
        title: '➕ Create Your First Topic',
        description: 'Click the + button to create a new study topic. You just created one!',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="notes-mode-toggle"]',
      popover: {
        title: '🔄 Two Learning Modes',
        description: '<strong>Chat Mode:</strong> Ask questions and get instant explanations<br><br><strong>Notes Mode:</strong> Paste your study notes to extract concepts',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '[data-tour="chat-input"]',
      popover: {
        title: '💬 Ask Biology Questions',
        description: 'Type any biology question here. Try: "How does photosynthesis work?" or "Explain DNA replication"',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="auto-generate-toggle"]',
      popover: {
        title: '🎨 Auto-Generate Maps',
        description: 'When enabled, BioBuddy automatically creates concept maps for your first question in each topic.',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '[data-tour="concept-map"]',
      popover: {
        title: '🗺️ Interactive Concept Map',
        description: 'Your AI-generated concept map will appear here after you ask your first question!<br><br><strong>Go ahead and try it now!</strong> The tour will continue automatically once your map loads. ✨',
        side: 'left',
        align: 'center'
      }
    }
  ];

  // Steps 8-10: Map Controls (after map exists)
  const getMapSteps = (): DriveStep[] => [
    {
      popover: {
        title: '🎉 Your First Concept Map!',
        description: 'Great! Now let me show you how to work with your concept map.',
        align: 'center'
      }
    },
    {
      element: '[data-tour="map-controls"]',
      popover: {
        title: '🛠️ Map Tools',
        description: '<ul class="text-sm space-y-1 text-left"><li>• <strong>Add Node:</strong> Create custom concepts</li><li>• <strong>Export:</strong> Save as JSON</li><li>• <strong>Legend:</strong> Understand node types</li></ul>',
        side: 'left',
        align: 'end'
      }
    },
    {
      element: '[data-tour="concept-map"]',
      popover: {
        title: '✏️ Customize Your Map',
        description: '<strong>Double-click</strong> any node to edit its label<br><br><strong>Click dots</strong> on nodes to create connections<br><br><strong>Drag nodes</strong> to rearrange',
        side: 'left',
        align: 'center'
      }
    },
    {
      popover: {
        title: '🎓 You\'re Ready to Learn!',
        description: 'You now know how to use BioBuddy! Create topics, ask questions, and build your knowledge with concept maps.<br><br>💡 Tip: Click the Help button (?) in the navbar to replay this tour anytime.',
        align: 'center'
      }
    }
  ];

  // All steps for manual replay
  const getAllSteps = (): DriveStep[] => [
    {
      popover: {
        title: '👋 Welcome to BioBuddy!',
        description: 'Let\'s take a quick tour to show you how to master biology with AI-powered concept maps.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="topics-sidebar"]',
      popover: {
        title: '📚 Study Topics',
        description: 'All your study sessions are organized by topic. Each topic has its own chat history and concept map.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="create-topic-btn"]',
      popover: {
        title: '➕ Create Topics',
        description: 'Click the + button to create a new study topic.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="notes-mode-toggle"]',
      popover: {
        title: '🔄 Two Learning Modes',
        description: '<strong>Chat Mode:</strong> Ask questions and get instant explanations<br><br><strong>Notes Mode:</strong> Paste your study notes to extract concepts',
        side: 'left',
        align: 'start'
      }
    },
    {
      element: '[data-tour="chat-input"]',
      popover: {
        title: '💬 Ask Biology Questions',
        description: 'Type any biology question here to get explanations and concept maps.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="auto-generate-toggle"]',
      popover: {
        title: '🎨 Auto-Generate Maps',
        description: 'When enabled, BioBuddy automatically creates concept maps for your first question in each topic.',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '[data-tour="concept-map"]',
      popover: {
        title: '🗺️ Interactive Concept Map',
        description: 'Your AI-generated concept map appears here showing relationships between biological concepts.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '[data-tour="map-controls"]',
      popover: {
        title: '🛠️ Map Tools',
        description: '<ul class="text-sm space-y-1 text-left"><li>• <strong>Add Node:</strong> Create custom concepts</li><li>• <strong>Export:</strong> Save as JSON</li><li>• <strong>Legend:</strong> Understand node types</li></ul>',
        side: 'left',
        align: 'end'
      }
    },
    {
      element: '[data-tour="concept-map"]',
      popover: {
        title: '✏️ Customize Your Map',
        description: '<strong>Double-click</strong> any node to edit its label<br><br><strong>Click dots</strong> on nodes to create connections<br><br><strong>Drag nodes</strong> to rearrange',
        side: 'left',
        align: 'center'
      }
    },
    {
      popover: {
        title: '🎓 You\'re Ready to Learn!',
        description: 'You now know how to use BioBuddy! Create topics, ask questions, and build your knowledge with concept maps.<br><br>💡 Tip: Click the Help button (?) in the navbar to replay this tour anytime.',
        align: 'center'
      }
    }
  ];

  // Part 1: Initial tour (steps 1-7)
  const startInitialTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Step {{current}} of {{total}}',
      popoverClass: 'biobuddy-tour-popover',
      
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_PART1_COMPLETED_KEY, 'true');
        setHasSeenPart1(true);
        driverObj.destroy();
        console.log('✅ Part 1 of tour completed - waiting for map to load');
      },

      steps: getInitialSteps()
    });

    driverObj.drive();
    console.log('🎯 Tour Part 1 started (steps 1-7)');
  }, []);

  // Part 2: Map controls tour (steps 8-10)
  const startMapTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Step {{current}} of {{total}}',
      popoverClass: 'biobuddy-tour-popover',
      
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_PART2_COMPLETED_KEY, 'true');
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        setHasSeenPart2(true);
        setHasSeenTour(true);
        driverObj.destroy();
        console.log('✅ Tour fully completed!');
      },

      steps: getMapSteps()
    });

    driverObj.drive();
    console.log('🎯 Tour Part 2 started (steps 8-10)');
  }, []);

  // Full tour for manual replay (all steps 1-10)
  const startFullTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Step {{current}} of {{total}}',
      popoverClass: 'biobuddy-tour-popover',
      
      onDestroyStarted: () => {
        driverObj.destroy();
        console.log('✅ Full tour replay completed');
      },

      steps: getAllSteps()
    });

    driverObj.drive();
    console.log('🎯 Full tour started (steps 1-10)');
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    localStorage.removeItem(TOUR_PART1_COMPLETED_KEY);
    localStorage.removeItem(TOUR_PART2_COMPLETED_KEY);
    setHasSeenTour(false);
    setHasSeenPart1(false);
    setHasSeenPart2(false);
    console.log('🔄 Tour reset - will show on next visit');
  }, []);

  return {
    hasSeenTour,
    hasSeenPart1,
    hasSeenPart2,
    startInitialTour,  // For first-time users (steps 1-7)
    startMapTour,      // After map loads (steps 8-10)
    startFullTour,     // For Help button (steps 1-10)
    resetTour
  };
};