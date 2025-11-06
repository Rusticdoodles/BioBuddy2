import { toast } from 'sonner';

/**
 * Delightful success feedback for user actions
 * Makes every win feel celebrated!
 */

export const feedback = {
  // ============================================
  // CONCEPT MAP ACTIONS
  // ============================================
  
  mapCreated: (nodeCount: number) => {
    toast.success('🎉 Concept map created!', {
      description: `${nodeCount} concepts ready to explore`,
      duration: 4000,
    });
  },

  mapRegenerated: () => {
    toast.success('✨ Map refreshed!', {
      description: 'New structure generated',
      duration: 3000,
    });
  },

  mapSimplified: (removedCount: number) => {
    toast.success('🎯 Map simplified!', {
      description: `Removed ${removedCount} less important concepts`,
      duration: 3000,
    });
  },

  mapExpanded: (addedCount: number) => {
    toast.success('🔍 More detail added!', {
      description: `${addedCount} new concepts discovered`,
      duration: 3000,
    });
  },

  mapExported: () => {
    toast.success('📥 Map exported!', {
      description: 'Download started',
      duration: 3000,
    });
  },

  mapImported: (nodeCount: number) => {
    toast.success('📤 Map imported!', {
      description: `${nodeCount} concepts loaded`,
      duration: 3000,
    });
  },

  perfectLayout: () => {
    toast.success('✨ Layout optimized!', {
      description: 'Map reorganized for clarity',
      duration: 3000,
    });
  },

  // ============================================
  // NODE ACTIONS
  // ============================================

  nodeAdded: (label: string) => {
    toast.success('➕ Concept added!', {
      description: `"${label}" is now in your map`,
      duration: 3000,
    });
  },

  nodeUpdated: (oldLabel: string, newLabel: string) => {
    toast.success('✏️ Concept updated!', {
      description: `"${oldLabel}" → "${newLabel}"`,
      duration: 3000,
    });
  },

  nodeDeleted: (label: string) => {
    toast.success('🗑️ Concept removed', {
      description: `"${label}" deleted from map`,
      duration: 3000,
    });
  },

  nodesConnected: (source: string, target: string) => {
    toast.success('🔗 Connection created!', {
      description: `${source} → ${target}`,
      duration: 3000,
    });
  },

  connectionRemoved: () => {
    toast.success('🔗 Connection removed', {
      duration: 2000,
    });
  },

  // ============================================
  // MERGE ACTIONS
  // ============================================

  conceptsMerged: (newNodeCount: number, newEdgeCount: number) => {
    toast.success('🎉 Concepts added to your map!', {
      description: `${newNodeCount} new concepts, ${newEdgeCount} new connections`,
      duration: 4000,
    });
  },

  mergeSkipped: (reason: string) => {
    toast.info('💡 ' + reason, {
      duration: 4000,
    });
  },

  noNewConcepts: () => {
    toast.info('💡 No new concepts to add', {
      description: 'All concepts already exist on the map',
      duration: 3000,
    });
  },

  // ============================================
  // TOPIC ACTIONS
  // ============================================

  topicCreated: (name: string) => {
    toast.success('🌟 New topic created!', {
      description: `"${name}" is ready for your questions`,
      duration: 3000,
    });
  },

  topicDeleted: (name: string) => {
    toast.success('🗑️ Topic deleted', {
      description: `"${name}" removed`,
      duration: 3000,
    });
  },

  topicRenamed: (oldName: string, newName: string) => {
    toast.success('✏️ Topic renamed', {
      description: `"${oldName}" → "${newName}"`,
      duration: 3000,
    });
  },

  topicSwitched: (name: string) => {
    toast.success(`📂 Switched to "${name}"`, {
      duration: 2000,
    });
  },

  topicCleared: () => {
    toast.success('🗑️ Topic cleared successfully', {
      duration: 3000,
    });
  },

  // ============================================
  // CHAT ACTIONS
  // ============================================

  questionAnswered: () => {
    toast.success('✅ Question answered!', {
      description: 'Check out the explanation above',
      duration: 3000,
    });
  },

  imagesLoaded: (count: number) => {
    toast.success('🖼️ Visual resources loaded!', {
      description: `${count} helpful ${count === 1 ? 'image' : 'images'} found`,
      duration: 3000,
    });
  },

  mapGenerated: (nodeCount: number, edgeCount: number) => {
    toast.success('🎉 Concept map generated!', {
      description: `Found ${nodeCount} concepts with ${edgeCount} relationships`,
      duration: 4000,
    });
  },

  mapRegeneratedWithConcepts: (conceptCount: number) => {
    toast.success('✨ Mindmap regenerated!', {
      description: `Restructured ${conceptCount} concepts with better organization`,
      duration: 4000,
    });
  },

  imagesUpdated: () => {
    toast.success('🖼️ Updated with Google images!', {
      duration: 3000,
    });
  },

  // ============================================
  // LEARNING MILESTONES
  // ============================================

  firstMap: () => {
    toast.success('🎉 First concept map created!', {
      description: "You're on your way to mastering biology!",
      duration: 5000,
    });
  },

  topicMilestone: (count: number) => {
    const milestones: Record<number, string> = {
      5: '🌟 Learning streak! 5 topics created!',
      10: '🔥 On fire! 10 topics created!',
      25: '🚀 Biology master! 25 topics!',
      50: '🏆 Legend! 50 topics created!',
    };

    if (milestones[count]) {
      toast.success(milestones[count], {
        description: 'Keep up the amazing work!',
        duration: 5000,
      });
    }
  },

  nodeMilestone: (totalNodes: number) => {
    const milestones: Record<number, string> = {
      50: '🧠 50 concepts mapped!',
      100: '💡 100 concepts mastered!',
      250: '🎓 Knowledge champion! 250 concepts!',
      500: '🏅 Biology expert! 500 concepts!',
    };

    if (milestones[totalNodes]) {
      toast.success(milestones[totalNodes], {
        description: "You're building an incredible knowledge base!",
        duration: 5000,
      });
    }
  },

  // ============================================
  // ERRORS (Friendly)
  // ============================================

  error: (message: string, description?: string) => {
    toast.error('Oops! Something went wrong', {
      description: description || message,
      duration: 4000,
    });
  },

  networkError: () => {
    toast.error('📡 Connection issue', {
      description: 'Check your internet and try again',
      duration: 4000,
    });
  },

  failedToGenerate: (message?: string) => {
    toast.error('Failed to generate concept map', {
      description: message || 'Please try again',
      duration: 4000,
    });
  },

  failedToUpdate: (message?: string) => {
    toast.error('Failed to update map', {
      description: message || 'Please try again',
      duration: 4000,
    });
  },

  failedToRegenerate: (message?: string, onRetry?: () => void) => {
    toast.error('Failed to regenerate mindmap', {
      description: message || 'Unknown error',
      action: onRetry ? {
        label: 'Retry',
        onClick: onRetry
      } : undefined,
      duration: 5000,
    });
  },

  failedToImport: (message?: string) => {
    toast.error('Failed to import JSON file', {
      description: message || 'Invalid file format. Please select a valid concept map JSON file.',
      duration: 5000,
    });
  },

  invalidJson: () => {
    toast.error('Invalid JSON file', {
      description: 'Please select a valid concept map JSON file',
      duration: 4000,
    });
  },

  // ============================================
  // INFO MESSAGES
  // ============================================

  copied: (what: string) => {
    toast.success('📋 Copied to clipboard!', {
      description: what,
      duration: 2000,
    });
  },

  saved: () => {
    toast.success('💾 Changes saved', {
      duration: 2000,
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      duration: Infinity, // Manual dismiss
    });
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 4000,
    });
  },

  mapUpdateCancelled: () => {
    toast.info('Map update cancelled', {
      duration: 2000,
    });
  },

  noTopicSelected: () => {
    toast.error('Please select or create a topic first', {
      duration: 3000,
    });
  },

  noMapToUpdate: () => {
    toast.error('No existing map to update', {
      description: 'Please ask a question first to generate a concept map',
      duration: 4000,
    });
  },

  noRecentInfo: () => {
    toast.error('No recent information to add to map', {
      duration: 3000,
    });
  },

  noConversationToRegenerate: () => {
    toast.error('No conversation to regenerate map from', {
      duration: 3000,
    });
  },

  noAiResponses: () => {
    toast.error('No AI responses to regenerate from', {
      duration: 3000,
    });
  },

  noAdditionalImages: () => {
    toast.error('No additional images found', {
      duration: 3000,
    });
  },

  notesTooShort: () => {
    toast.error('Notes too short', {
      description: 'Notes must be at least 50 characters to generate a meaningful concept map.',
      duration: 4000,
    });
  },

  notesTooLong: () => {
    toast.error('Notes too long', {
      description: 'Notes must be less than 10,000 characters.',
      duration: 4000,
    });
  },
};

// Helper to check milestones
export const checkMilestones = (topicCount: number, totalNodes: number) => {
  // Check topic milestones
  if ([5, 10, 25, 50].includes(topicCount)) {
    feedback.topicMilestone(topicCount);
  }

  // Check node milestones
  if ([50, 100, 250, 500].includes(totalNodes)) {
    feedback.nodeMilestone(totalNodes);
  }
};


