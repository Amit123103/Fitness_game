import { create } from 'zustand';

export interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  portrait?: string;
  choices?: {
    text: string;
    nextNodeId: string;
    alignmentChange?: number; // Positive for Light, Negative for Dark
  }[];
}

interface StoryState {
  moralAlignment: number; // -100 to 100
  currentDialogue: DialogueNode | null;
  storyProgress: string[];
  
  startDialogue: (node: DialogueNode) => void;
  makeChoice: (choice: { text: string; nextNodeId: string; alignmentChange?: number }) => void;
  endDialogue: () => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  moralAlignment: 0,
  currentDialogue: null,
  storyProgress: [],

  startDialogue: (node) => set({ currentDialogue: node }),
  
  makeChoice: (choice) => {
    const { moralAlignment } = get();
    const newAlignment = Math.min(Math.max(moralAlignment + (choice.alignmentChange || 0), -100), 100);
    
    // In a real app, we would fetch the next node from a content manager
    // For now, we set the dialogue to null and assume the caller will handle the nextNodeId
    set({ moralAlignment: newAlignment, currentDialogue: null });
  },

  endDialogue: () => set({ currentDialogue: null }),
}));
