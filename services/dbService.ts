
import { User, DailyLessonRecord, WritingSubmission, VocabProgressRecord, VocabularyWord } from '../types';

const USERS_KEY = 'ielts_master_users';
const LESSONS_KEY = 'ielts_master_daily_lessons';
const WRITING_KEY = 'ielts_master_writing_submissions';
const VOCAB_PROGRESS_KEY = 'ielts_master_vocab_progress';

export const dbService = {
  // User Operations
  getUser: (): User | null => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (user: User) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(user));
  },

  // Daily Lesson Operations
  getLessons: (userId: string): DailyLessonRecord[] => {
    const data = localStorage.getItem(LESSONS_KEY);
    const all: DailyLessonRecord[] = data ? JSON.parse(data) : [];
    return all.filter(l => l.user_id === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveLesson: (lesson: Omit<DailyLessonRecord, 'id' | 'date'>): DailyLessonRecord => {
    const data = localStorage.getItem(LESSONS_KEY);
    const all: DailyLessonRecord[] = data ? JSON.parse(data) : [];
    
    const newRecord: DailyLessonRecord = {
      ...lesson,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    all.push(newRecord);
    localStorage.setItem(LESSONS_KEY, JSON.stringify(all));
    return newRecord;
  },

  updateLessonStatus: (id: string, completed: boolean) => {
    const data = localStorage.getItem(LESSONS_KEY);
    if (!data) return;
    const all: DailyLessonRecord[] = JSON.parse(data);
    const index = all.findIndex(l => l.id === id);
    if (index !== -1) {
      all[index].completed = completed;
      localStorage.setItem(LESSONS_KEY, JSON.stringify(all));
    }
  },

  // Writing Submission Operations
  getWritingSubmissions: (userId: string): WritingSubmission[] => {
    const data = localStorage.getItem(WRITING_KEY);
    const all: WritingSubmission[] = data ? JSON.parse(data) : [];
    return all.filter(s => s.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  saveWritingSubmission: (submission: Omit<WritingSubmission, 'id' | 'created_at'>): WritingSubmission => {
    const data = localStorage.getItem(WRITING_KEY);
    const all: WritingSubmission[] = data ? JSON.parse(data) : [];
    
    const newSubmission: WritingSubmission = {
      ...submission,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    
    all.push(newSubmission);
    localStorage.setItem(WRITING_KEY, JSON.stringify(all));
    return newSubmission;
  },

  // Vocabulary Spaced Repetition (SRS) Operations
  getAtRiskVocab: (userId: string, count: number = 3): VocabProgressRecord[] => {
    const data = localStorage.getItem(VOCAB_PROGRESS_KEY);
    const all: VocabProgressRecord[] = data ? JSON.parse(data) : [];
    return all
      .filter(v => v.user_id === userId)
      .sort((a, b) => a.familiarity - b.familiarity) // Weakest first
      .slice(0, count);
  },

  updateVocabFamiliarity: (userId: string, word: VocabularyWord, increment: number) => {
    const data = localStorage.getItem(VOCAB_PROGRESS_KEY);
    const all: VocabProgressRecord[] = data ? JSON.parse(data) : [];
    const index = all.findIndex(v => v.user_id === userId && v.word === word.word);
    
    if (index !== -1) {
      all[index].familiarity = Math.max(1, Math.min(5, all[index].familiarity + increment));
      all[index].last_review = new Date().toISOString();
    } else {
      all.push({
        user_id: userId,
        word_id: word.id,
        word: word.word,
        familiarity: 1 + increment,
        last_review: new Date().toISOString(),
        topic: 'General'
      });
    }
    localStorage.setItem(VOCAB_PROGRESS_KEY, JSON.stringify(all));
  },

  getVocabStats: (userId: string) => {
    const data = localStorage.getItem(VOCAB_PROGRESS_KEY);
    const all: VocabProgressRecord[] = data ? JSON.parse(data) : [];
    const userVocab = all.filter(v => v.user_id === userId);
    return {
      mastered: userVocab.filter(v => v.familiarity >= 4).length,
      learning: userVocab.filter(v => v.familiarity < 4).length,
      total: userVocab.length
    };
  }
};
