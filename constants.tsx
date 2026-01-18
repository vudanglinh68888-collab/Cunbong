
import React from 'react';
import { Lesson, Skill } from './types';

export const LESSONS: Lesson[] = [
  {
    id: 'l1',
    title: 'Mastering Section 1 Strategies',
    skill: 'Listening',
    bandRange: '4.0 - 5.5',
    duration: '15 mins',
    description: 'Learn how to identify keywords and avoid common distractors in basic conversations.'
  },
  {
    id: 'l2',
    title: 'Skimming & Scanning Techniques',
    skill: 'Reading',
    bandRange: '5.0 - 7.0',
    duration: '20 mins',
    description: 'Speed up your reading without losing comprehension of the main ideas.'
  },
  {
    id: 'l3',
    title: 'Argumentative Essay Structures',
    skill: 'Writing',
    bandRange: '6.0 - 8.0',
    duration: '25 mins',
    description: 'Structuring your thoughts for Task 2 to maximize coherence and cohesion.'
  },
  {
    id: 'l4',
    title: 'Speaking Part 2: Long Turn Mastery',
    skill: 'Speaking',
    bandRange: '5.5 - 7.5',
    duration: '10 mins',
    description: 'How to speak fluently for 2 minutes using simple mind-mapping techniques.'
  }
];

// Added missing 'Vocabulary' color to match the Skill type definition
export const SKILL_COLORS: Record<Skill, string> = {
  Listening: 'bg-blue-500',
  Reading: 'bg-green-500',
  Writing: 'bg-orange-500',
  Speaking: 'bg-purple-500',
  Vocabulary: 'bg-emerald-500'
};
