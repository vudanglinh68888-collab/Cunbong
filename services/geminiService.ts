
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  VocabularyItem, Story, QuizQuestion, WritingTask, UserProfile, 
  AssistantResponse, AssessmentQuestion, AssessmentResult, LearningPath, LearningGoal, Skill,
  User, Feedback, DailyLessonRecord, WritingSubmission, ListeningPractice, ReadingPractice,
  VocabularyLesson, VocabularyWord
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseJSON = (text: string | undefined) => {
  if (!text) return null;
  return JSON.parse(text.replace(/```json|```/g, '').trim());
};

/**
 * Tạo danh sách từ vựng có hình ảnh minh họa cho bé
 */
export const generateVocabularyItems = async (profile: UserProfile, topic: string): Promise<VocabularyItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo 8 từ vựng tiếng Anh chủ đề "${topic}" cho học sinh Lớp ${profile.grade}. 
    Yêu cầu: "readingGuide" là mẹo phát âm vui nhộn bằng tiếng Việt. "imagePrompt" là mô tả hình ảnh hoạt hình dễ thương.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            readingGuide: { type: Type.STRING },
            definition: { type: Type.STRING },
            vietnamese: { type: Type.STRING },
            example: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
          },
          required: ["word", "phonetic", "readingGuide", "definition", "vietnamese", "example", "imagePrompt"]
        }
      }
    }
  });
  return parseJSON(response.text) || [];
};

/**
 * Trợ lý Gấu Teddy trò chuyện với bé
 */
export const askAssistant = async (profile: UserProfile, message: string): Promise<AssistantResponse> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bé nói: "${message}"`,
    config: {
      systemInstruction: `Bạn là Gấu Teddy, gia sư tiếng Anh cực kỳ đáng yêu cho bé lớp ${profile.grade}. 
      Trả lời ngắn gọn, khích lệ bé, xen kẽ tiếng Anh và tiếng Việt giải thích.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: { type: Type.STRING },
          hint: { type: Type.STRING },
          example: { type: Type.STRING }
        },
        required: ["answer"]
      }
    }
  });
  return parseJSON(response.text);
};

/**
 * Tạo truyện ngắn AI cho bé
 */
export const generateStory = async (profile: UserProfile, mode: string): Promise<Story> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Viết một câu chuyện ngắn thú vị cho trẻ em lớp ${profile.grade} về chủ đề "${profile.topic}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          imagePrompt: { type: Type.STRING },
          vietnameseTitle: { type: Type.STRING },
          vietnameseContent: { type: Type.STRING }
        },
        required: ["title", "content", "imagePrompt"]
      }
    }
  });
  return parseJSON(response.text);
};

/**
 * Game trắc nghiệm nghe - chọn hình
 */
export const generateQuiz = async (profile: UserProfile | string, mode?: string): Promise<QuizQuestion[]> => {
  const topic = typeof profile === 'string' ? profile : profile.topic;
  const grade = typeof profile === 'string' ? 'elementary' : `grade ${profile.grade}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo 5 câu đố từ vựng cho bé trình độ ${grade} về chủ đề ${topic}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["word", "options", "correctAnswer", "explanation"]
        }
      }
    }
  });
  return parseJSON(response.text) || [];
};

/**
 * Chuyển văn bản thành giọng nói (Giọng Gấu Teddy)
 */
export const textToSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: { 
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

/**
 * Phát âm thanh từ Base64
 */
export const playAudio = async (base64: string, ctx: AudioContext) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const dataInt16 = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
};

/**
 * Sinh hình ảnh từ mô tả
 */
export const generateImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Cute cartoon illustration for kids, vibrant colors, white background: ${prompt}` }] }
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : "";
};

/**
 * Tạo bài tập viết từ/câu
 */
export const generateWritingTask = async (profile: UserProfile, mode: string): Promise<WritingTask> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo bài tập viết cho bé lớp ${profile.grade} chủ đề ${profile.topic}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          imagePrompt: { type: Type.STRING },
          targetText: { type: Type.STRING },
          hint: { type: Type.STRING },
          type: { type: Type.STRING, enum: ["word", "sentence"] }
        },
        required: ["imagePrompt", "targetText", "hint", "type"]
      }
    }
  });
  return parseJSON(response.text);
};

// Các hàm đánh giá và lộ trình
export const generateAssessmentQuestion = async (profile: UserProfile, history: any[], diff: string): Promise<AssessmentQuestion> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tạo câu hỏi đánh giá trình độ lớp ${profile.grade}. Độ khó: ${diff}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
          question: { type: Type.STRING },
          vietnameseInstruction: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          answer: { type: Type.STRING },
          difficulty: { type: Type.STRING }
        },
        required: ["id", "question", "options", "answer", "difficulty"]
      }
    }
  });
  return parseJSON(response.text);
};

export const finalizeAssessment = async (profile: UserProfile, history: any[]): Promise<AssessmentResult> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Phân tích kết quả kiểm tra của bé lớp ${profile.grade}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          proficiency: { type: Type.STRING },
          score: { type: Type.NUMBER },
          explanation: { type: Type.STRING }
        },
        required: ["proficiency", "score", "explanation"]
      }
    }
  });
  return parseJSON(response.text);
};

export const generateLearningPath = async (profile: UserProfile, res: AssessmentResult, goal: LearningGoal): Promise<LearningPath> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Tạo lộ trình 4 tuần học cho bé lớp ${profile.grade} đạt mục tiêu ${goal}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weeks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                weekNumber: { type: Type.NUMBER },
                title: { type: Type.STRING },
                vietnameseTitle: { type: Type.STRING },
                lessons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      lesson_id: { type: Type.STRING },
                      objective: { type: Type.STRING },
                      vietnamese_objective: { type: Type.STRING },
                      new_content: { type: Type.ARRAY, items: { type: Type.STRING } },
                      review_content: { type: Type.ARRAY, items: { type: Type.STRING } },
                      focus_skill: { type: Type.STRING },
                      estimated_time: { type: Type.NUMBER }
                    }
                  }
                }
              }
            }
          },
          pace: { type: Type.STRING },
          checkpoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["weeks", "pace", "checkpoints"]
      }
    }
  });
  return parseJSON(response.text);
};

// IELTS Methods
export const evaluateWriting = async (prompt: string, text: string): Promise<Feedback> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Evaluate this IELTS Task 2 writing. Prompt: "${prompt}". Essay: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              }
            }
          },
          academic_core_usage: {
            type: Type.OBJECT,
            properties: {
              count: { type: Type.NUMBER },
              used_words: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggested_words: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          specificErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
          sampleAnswer: { type: Type.STRING }
        },
        required: ["overallScore", "criteria", "specificErrors", "sampleAnswer"]
      }
    }
  });
  return parseJSON(response.text);
};

export const evaluateSpeaking = async (topic: string, transcript: string): Promise<Feedback> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Evaluate this IELTS speaking transcript. Topic: "${topic}". Transcript: "${transcript}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              }
            }
          },
          specificErrors: { type: Type.ARRAY, items: { type: Type.STRING } },
          sampleAnswer: { type: Type.STRING }
        },
        required: ["overallScore", "criteria", "specificErrors", "sampleAnswer"]
      }
    }
  });
  return parseJSON(response.text);
};

export const generatePersonalizedLesson = async (current: number, target: number, skill: string, duration: number): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a ${duration} minute lesson for IELTS ${skill}. Current band: ${current}, Target: ${target}.`,
  });
  return response.text || "";
};

export const generateDailyFlow = async (target: number, theme: string, reviewWords: string[]): Promise<any> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate an integrated IELTS daily flow lesson. Target band: ${target}. Theme: ${theme}. Review words: ${reviewWords.join(', ')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          vocabulary: {
            type: Type.OBJECT,
            properties: {
              words: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    ipa: { type: Type.STRING },
                    meaning_vn: { type: Type.STRING },
                    example: { type: Type.STRING },
                    collocations: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          },
          reading_passage: { type: Type.STRING },
          writing_prompt: { type: Type.STRING },
          speaking_cue_card: { type: Type.STRING }
        }
      }
    }
  });
  return parseJSON(response.text);
};

export const generateListeningPractice = async (band: string): Promise<ListeningPractice> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate an IELTS listening practice test for band ${band}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.NUMBER },
          title: { type: Type.STRING },
          source: { type: Type.STRING },
          transcript: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return parseJSON(response.text);
};

export const generateReadingPractice = async (band: string): Promise<ReadingPractice> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate an IELTS reading practice test for band ${band}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          passage: { type: Type.STRING },
          matchingHeading: {
            type: Type.OBJECT,
            properties: {
              headings: { type: Type.ARRAY, items: { type: Type.STRING } },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    paragraphId: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  }
                }
              }
            }
          },
          multipleChoice: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              }
            }
          },
          tfng: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                statement: { type: Type.STRING },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return parseJSON(response.text);
};

export const generateWeeklyReport = async (user: User, lessons: DailyLessonRecord[], submissions: WritingSubmission[]): Promise<any> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a strategic IELTS weekly report for ${user.email}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weekStartDate: { type: Type.STRING },
          currentBandEstimate: { type: Type.NUMBER },
          progressInsight: { type: Type.STRING },
          vocabularyFocus: { type: Type.STRING },
          studyStrategyForNextWeek: { type: Type.STRING },
          skillBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                status: { type: Type.STRING },
                feedback: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return parseJSON(response.text);
};

export const generateVocabularyLesson = async (target: number, limit: number, topic: string, mode: string, wordCount: number): Promise<VocabularyLesson> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate an IELTS vocabulary lesson for band ${target}. Mode: ${mode}, Count: ${wordCount}, Topic: ${topic}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          semantic_group_title: { type: Type.STRING },
          words: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                meaning_vn: { type: Type.STRING },
                example: { type: Type.STRING },
                synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
                function_group: { type: Type.STRING },
                image_description: { type: Type.STRING },
                writing_position: { type: Type.STRING }
              }
            }
          },
          mindmap_json: {
            type: Type.OBJECT,
            properties: {
              center: { type: Type.STRING },
              branches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    icon_hint: { type: Type.STRING },
                    words: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  return parseJSON(response.text);
};

export const createChatSession = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: 'You are an English tutor for children and IELTS students. Provide bilingual support and encouragement.',
    }
  });
};

export const generateAudio = textToSpeech;

export const geminiService = {
  generateVocabularyItems,
  askAssistant,
  generateStory,
  generateQuiz,
  textToSpeech,
  playAudio,
  generateImage,
  generateWritingTask,
  generateAssessmentQuestion,
  finalizeAssessment,
  generateLearningPath,
  evaluateWriting,
  evaluateSpeaking,
  generatePersonalizedLesson,
  generateDailyFlow,
  generateListeningPractice,
  generateReadingPractice,
  generateWeeklyReport,
  generateVocabularyLesson,
  createChatSession,
  generateAudio,
  // Alias for components that expect generateVocabulary
  generateVocabulary: (topic: string) => generateQuiz(topic)
};
