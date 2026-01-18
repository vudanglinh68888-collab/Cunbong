
import { WritingAnalysisResult, WritingSuggestion, WritingWarning, AcademicFunction } from '../types';

// I. DATABASE PHỤC VỤ GỢI Ý (Minimal Representative Set)
const ACADEMIC_CORE_DB: WritingSuggestion[] = [
  // 1. Argument & Opinion (Intro/Body)
  { word: "it is widely believed that", function: "Argument & Opinion", meaning_vn: "nhiều người tin rằng", usage_tip: "Use in Introduction to state a general view.", collocation: "It is widely believed that education is key." },
  { word: "advocates of this view", function: "Argument & Opinion", meaning_vn: "người ủng hộ quan điểm này", usage_tip: "Use in Body to introduce a side.", collocation: "Advocates of this view argue that..." },
  { word: "opponents argue that", function: "Argument & Opinion", meaning_vn: "người phản đối cho rằng", usage_tip: "Use to introduce counter-arguments.", collocation: "However, opponents argue that..." },
  { word: "from my perspective", function: "Argument & Opinion", meaning_vn: "theo quan điểm của tôi", usage_tip: "Use to give your own opinion clearly.", collocation: "From my perspective, this is valid." },
  
  // 2. Cause – Effect (Body)
  { word: "contribute to", function: "Cause – Effect", meaning_vn: "góp phần vào", usage_tip: "Link a cause to a problem/benefit.", collocation: "contribute to climate change" },
  { word: "stem from", function: "Cause – Effect", meaning_vn: "bắt nguồn từ", usage_tip: "Explain the root cause.", collocation: "stem from poor management" },
  { word: "have a detrimental impact on", function: "Cause – Effect", meaning_vn: "gây hại cho", usage_tip: "Describe negative results.", collocation: "have a detrimental impact on health" },
  { word: "result in", function: "Cause – Effect", meaning_vn: "dẫn đến", usage_tip: "Show a direct consequence.", collocation: "result in serious consequences" },

  // 3. Comparison & Contrast (Body)
  { word: "in contrast", function: "Comparison & Contrast", meaning_vn: "ngược lại", usage_tip: "Start a sentence comparing two things.", collocation: "In contrast, rural areas are..." },
  { word: "whereas", function: "Comparison & Contrast", meaning_vn: "trong khi", usage_tip: "Connect two contrasting clauses.", collocation: "He is rich, whereas she is poor." },
  { word: "outweigh", function: "Comparison & Contrast", meaning_vn: "lớn hơn/quan trọng hơn", usage_tip: "Compare advantages vs disadvantages.", collocation: "The benefits outweigh the drawbacks." },

  // 4. Solution (Body/Conclusion)
  { word: "implement strict policies", function: "Solution & Recommendation", meaning_vn: "áp dụng chính sách nghiêm ngặt", usage_tip: "Suggest government action.", collocation: "Governments should implement strict policies." },
  { word: "raise public awareness", function: "Solution & Recommendation", meaning_vn: "nâng cao nhận thức", usage_tip: "Suggest educational solution.", collocation: "Campaigns to raise public awareness." },
  { word: "mitigate", function: "Solution & Recommendation", meaning_vn: "giảm nhẹ", usage_tip: "Reduce a problem's impact.", collocation: "mitigate the effects of..." },
  { word: "take steps to", function: "Solution & Recommendation", meaning_vn: "thực hiện các bước để", usage_tip: "General call to action.", collocation: "take steps to address the issue" },

  // 5. Evaluation (Body/Conclusion)
  { word: "play a pivotal role", function: "Evaluation & Evidence", meaning_vn: "đóng vai trò then chốt", usage_tip: "Emphasize importance.", collocation: "play a pivotal role in development" },
  { word: "be of paramount importance", function: "Evaluation & Evidence", meaning_vn: "quan trọng tối cao", usage_tip: "Stronger than 'important'.", collocation: "It is of paramount importance to..." },
];

const OVERUSE_WATCHLIST = [
  { simple: "important", limit: 2, alternatives: ["crucial", "vital", "pivotal", "essential", "significant"] },
  { simple: "bad", limit: 1, alternatives: ["detrimental", "adverse", "harmful", "negative"] },
  { simple: "good", limit: 2, alternatives: ["beneficial", "advantageous", "positive", "favorable"] },
  { simple: "think", limit: 2, alternatives: ["believe", "argue", "assert", "maintain", "claim"] },
  { simple: "problem", limit: 2, alternatives: ["issue", "challenge", "obstacle", "dilemma"] },
];

export const writingAssistant = {
  analyze: (text: string): WritingAnalysisResult => {
    // 1. Detect Position
    const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
    let position: 'Introduction' | 'Body Paragraph' | 'Conclusion' = 'Introduction';
    
    if (paragraphs.length >= 1 && paragraphs.length <= 1) position = 'Introduction';
    else if (paragraphs.length >= 2 && paragraphs.length < 4) position = 'Body Paragraph';
    else if (paragraphs.length >= 4) position = 'Conclusion';

    const normalizedText = text.toLowerCase();
    
    // 2. Detect Overuse Errors
    const warnings: WritingWarning[] = [];
    OVERUSE_WATCHLIST.forEach(check => {
      // Regex to count occurrences of whole words
      const regex = new RegExp(`\\b${check.simple}\\b`, 'gi');
      const count = (text.match(regex) || []).length;
      if (count >= check.limit) {
        warnings.push({
          type: 'overuse',
          word: check.simple,
          message: `You used '${check.simple}' ${count} times. Consider upgrading.`,
          alternatives: check.alternatives
        });
      }
    });

    // 3. Generate Suggestions based on Position & Usage
    let relevantFunctions: AcademicFunction[] = [];
    if (position === 'Introduction') relevantFunctions = ['Argument & Opinion'];
    else if (position === 'Body Paragraph') relevantFunctions = ['Cause – Effect', 'Comparison & Contrast', 'Evaluation & Evidence'];
    else relevantFunctions = ['Solution & Recommendation', 'Evaluation & Evidence'];

    // Filter logic: Match function AND ensure not already used
    const suggestions = ACADEMIC_CORE_DB.filter(item => {
      const isRelevant = relevantFunctions.includes(item.function);
      const isUsed = normalizedText.includes(item.word.toLowerCase());
      return isRelevant && !isUsed;
    })
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 5); // Take top 5

    return {
      position,
      suggestions,
      warnings
    };
  }
};
