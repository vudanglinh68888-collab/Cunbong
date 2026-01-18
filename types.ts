
export type Skill = 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Vocabulary';
export type Grade = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type AppMode = 'Adventure' | 'Test' | 'Assessment' | 'Game';
export type LearningGoal = 'School Exams' | 'Communication' | 'Both';

// IELTS Master Types
export type AcademicFunction = 'Argument & Opinion' | 'Cause – Effect' | 'Comparison & Contrast' | 'Solution & Recommendation' | 'Evaluation & Evidence';

export interface User {
  id: string;
  email: string;
  current_band: number;
  target_band: number;
  created_at: string;
}

export interface Feedback {
  overallScore: number;
  academic_core_usage?: {
    count: number;
    used_words: string[];
    suggested_words: string[];
  };
  criteria: { label: string; score: number; feedback: string }[];
  specificErrors: string[];
  sampleAnswer: string;
}

export interface WritingSubmission {
  id: string;
  user_id: string;
  task_type: string;
  content: string;
  band_score: number;
  feedback: Feedback;
  created_at: string;
}

export interface WritingSuggestion {
  word: string;
  function: AcademicFunction;
  meaning_vn: string;
  usage_tip: string;
  collocation: string;
}

export interface WritingWarning {
  type: string;
  word: string;
  message: string;
  alternatives: string[];
}

export interface WritingAnalysisResult {
  position: 'Introduction' | 'Body Paragraph' | 'Conclusion';
  suggestions: WritingSuggestion[];
  warnings: WritingWarning[];
}

export interface Lesson {
  id: string;
  title: string;
  skill: Skill;
  bandRange?: string;
  duration: string;
  description: string;
}

export interface DailyLessonRecord {
  id: string;
  user_id: string;
  focus_skill: Skill;
  sub_type?: string;
  lesson_content: string;
  completed: boolean;
  date: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  ipa?: string;
  meaning_vn: string;
  example: string;
  collocations: string[];
  function_group?: AcademicFunction;
  image_description?: string;
  writing_position?: string;
  synonyms?: string[];
}

export interface DailyFlowLesson {
  vocabulary: {
    words: VocabularyWord[];
  };
  reading_passage: string;
  writing_prompt: string;
  speaking_cue_card: string;
}

export interface ListeningPractice {
  id: number;
  title: string;
  source: string;
  transcript: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }[];
}

export interface ReadingPractice {
  title: string;
  passage: string;
  matchingHeading: {
    headings: string[];
    questions: { paragraphId: string; answer: string }[];
  };
  multipleChoice: {
    id: number;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }[];
  tfng: {
    id: number;
    statement: string;
    answer: string;
    explanation: string;
  }[];
}

export interface VocabProgressRecord {
  user_id: string;
  word_id: string;
  word: string;
  familiarity: number;
  last_review: string;
  topic: string;
}

export interface MindmapNode {
  center: string;
  branches: {
    label: string;
    icon_hint: string;
    words: string[];
  }[];
}

export interface VocabularyLesson {
  semantic_group_title: string;
  words: VocabularyWord[];
  mindmap_json: MindmapNode;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

// KidoEnglish Types
export interface UserProfile {
  id: string;
  email: string;
  studentName?: string;
  grade: Grade;
  topic: string;
  mode: 'English Only' | 'Bilingual';
  xp: number;
  level: number;
  streak: number;
  proficiency?: 'Beginner' | 'Intermediate' | 'Advanced';
  roadmap?: LearningPath;
  dailyStudyTime: number;
  weeklyStudyTime: number;
  monthlyStudyTime: number;
}

export interface VocabularyItem {
  word: string;
  phonetic: string;
  readingGuide: string;
  definition: string;
  vietnamese: string;
  example: string;
  imagePrompt: string;
}

export interface Story {
  title: string;
  content: string;
  imagePrompt: string;
  vietnameseTitle?: string;
  vietnameseContent?: string;
}

export interface QuizQuestion {
  word: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface WritingTask {
  imagePrompt: string;
  targetText: string;
  hint: string;
  type: 'word' | 'sentence';
}

export interface LearningPath {
  weeks: {
    weekNumber: number;
    title: string;
    vietnameseTitle: string;
    lessons: {
      lesson_id: string;
      objective: string;
      vietnamese_objective: string;
      new_content: string[];
      review_content: string[];
      focus_skill: Skill;
      estimated_time: number;
    }[];
  }[];
  pace: string;
  checkpoints: string[];
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  vietnameseInstruction: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssessmentResult {
  proficiency: string;
  score: number;
  explanation: string;
}

export interface AssistantResponse {
  answer: string;
  hint?: string;
  example?: string;
}
