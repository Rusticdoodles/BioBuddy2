import { useCallback, useEffect, useState } from 'react';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_COMPLETED_KEY = 'biobuddy-tour-completed';

export const useTour = () => {
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default true, check localStorage

  useEffect(() => {
    // Check if user has seen tour
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY);
    setHasSeenTour(completed === 'true');
  }, []);

  const startTour = useCallback(() => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      progressText: 'Step {{current}} of {{total}}',
      
      popoverClass: 'biobuddy-tour-popover',
      
      onDestroyStarted: () => {
        // Mark as completed when tour ends (either finished or skipped)
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        setHasSeenTour(true);
        driverObj.destroy();
      },

      steps: [
        // Step 1: Welcome
        {
          popover: {
            title: '👋 Welcome to BioBuddy!',
            description: 'Let\'s take a quick tour to show you how to master biology with AI-powered concept maps. Click "Next" to continue!',
            side: 'bottom',
            align: 'center'
          }
        },
        
        // Step 2: Sidebar - Topics
        {
          element: '[data-tour="topics-sidebar"]',
          popover: {
            title: '📚 Study Topics',
            description: 'All your study sessions are organized by topic. Each topic has its own chat history and concept map.',
            side: 'right',
            align: 'start'
          }
        },
        
        // Step 3: Create Topic Button
        {
          element: '[data-tour="create-topic-btn"]',
          popover: {
            title: '➕ Create Your First Topic',
            description: 'Click the + button to create a new study topic. Try creating one now! (You can delete it later)',
            side: 'right',
            align: 'start'
          }
        },
        
        // Step 4: Chat vs Notes Mode Toggle
        {
          element: '[data-tour="notes-mode-toggle"]',
          popover: {
            title: '🔄 Two Learning Modes',
            description: '<strong>Chat Mode:</strong> Ask questions and get instant explanations<br><br><strong>Notes Mode:</strong> Paste your study notes to extract concepts',
            side: 'left',
            align: 'start'
          }
        },
        
        // Step 5: Chat Input
        {
          element: '[data-tour="chat-input"]',
          popover: {
            title: '💬 Ask Biology Questions',
            description: 'Type any biology question here. Try: "How does photosynthesis work?" or "Explain DNA replication"',
            side: 'top',
            align: 'center'
          }
        },
        
        // Step 6: Auto-Generate Toggle
        {
          element: '[data-tour="auto-generate-toggle"]',
          popover: {
            title: '🎨 Auto-Generate Maps',
            description: 'When enabled, BioBuddy automatically creates concept maps for your first question in each topic. You can toggle this off for chat-only mode.',
            side: 'top',
            align: 'start'
          }
        },
        
        // Step 7: Concept Map Area
        {
          element: '[data-tour="concept-map"]',
          popover: {
            title: '🗺️ Interactive Concept Map',
            description: 'Your AI-generated concept map appears here! It shows relationships between biological concepts visually.',
            side: 'left',
            align: 'center'
          }
        },
        
        // Step 8: Map Controls
        {
          element: '[data-tour="map-controls"]',
          popover: {
            title: '🛠️ Map Tools',
            description: '<ul class="text-sm space-y-1 text-left"><li>• <strong>Add Node:</strong> Create custom concepts</li><li>• <strong>Tidy Layout:</strong> Reorganize the map</li><li>• <strong>Export:</strong> Save as JSON</li><li>• <strong>Legend:</strong> Understand node types</li></ul>',
            side: 'left',
            align: 'end'
          }
        },
        
        // Step 9: Edit Nodes
        {
          element: '[data-tour="concept-map"]',
          popover: {
            title: '✏️ Customize Your Map',
            description: '<strong>Double-click</strong> any node to edit its label<br><br><strong>Click dots</strong> on nodes to create connections<br><br><strong>Drag nodes</strong> to rearrange',
            side: 'left',
            align: 'center'
          }
        },
        
        // Step 10: Completion
        {
          popover: {
            title: '🎉 You\'re Ready to Learn!',
            description: 'You now know how to use BioBuddy! Create a topic, ask questions, and build your knowledge with concept maps.<br><br>💡 Tip: Click the Help button (?) in the navbar to replay this tour anytime.',
            side: 'center',
            align: 'center'
          }
        }
      ] as DriveStep[]
    });

    driverObj.drive();
    console.log('🎯 Tour started');
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    setHasSeenTour(false);
    console.log('🔄 Tour reset - will show on next visit');
  }, []);

  return {
    hasSeenTour,
    startTour,
    resetTour
  };
};

