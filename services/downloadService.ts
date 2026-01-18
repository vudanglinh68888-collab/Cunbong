
import { VocabularyItem, Story } from '../types';

/**
 * Base styles for offline documents to ensure they look good without external CSS.
 */
const BASE_STYLES = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap');
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #334155; padding: 40px; background-color: #f8fafc; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    h1 { color: #0284c7; font-size: 2.5rem; text-align: center; margin-bottom: 10px; font-weight: 900; }
    h2 { color: #0f172a; margin-top: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    .meta { text-align: center; color: #64748b; margin-bottom: 40px; font-style: italic; }
    
    /* Vocabulary Cards */
    .vocab-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
    .vocab-card { border: 2px solid #e2e8f0; border-radius: 20px; padding: 20px; display: flex; align-items: flex-start; gap: 20px; page-break-inside: avoid; }
    .vocab-img { width: 100px; height: 100px; object-fit: contain; border-radius: 15px; background: #f1f5f9; border: 1px solid #cbd5e1; }
    .vocab-content { flex: 1; }
    .vocab-word { font-size: 1.5rem; font-weight: 900; color: #0284c7; margin: 0; }
    .vocab-phonetic { color: #64748b; font-family: monospace; font-size: 1.1rem; }
    .vocab-meaning { font-size: 1.2rem; font-weight: bold; color: #f59e0b; margin: 5px 0; }
    .vocab-example { background: #f0f9ff; padding: 10px 15px; border-radius: 10px; color: #0c4a6e; font-style: italic; margin-top: 5px; }
    
    /* Story */
    .story-img { width: 100%; max-height: 400px; object-fit: cover; border-radius: 20px; margin-bottom: 30px; border: 4px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
    .story-content { font-size: 1.2rem; white-space: pre-wrap; margin-bottom: 20px; }
    .story-translation { background: #f8fafc; border-left: 4px solid #0284c7; padding: 20px; color: #475569; font-style: italic; }
    
    /* Lesson */
    .lesson-section { margin-bottom: 20px; }
    .lesson-title { font-size: 1.5rem; color: #0284c7; font-weight: bold; margin-bottom: 15px; }
    ul { padding-left: 20px; }
    li { margin-bottom: 5px; }
    blockquote { background: #fef3c7; padding: 15px; border-radius: 10px; border-left: 5px solid #f59e0b; margin: 20px 0; font-style: italic; }
    strong { color: #4f46e5; }
    
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; border: none; width: 100%; max-width: 100%; padding: 0; }
      .no-print { display: none; }
    }
  </style>
`;

/**
 * Helper to trigger download
 */
const saveFile = (filename: string, content: string) => {
  const fullHTML = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${filename}</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="container">
        ${content}
        <div style="margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #94a3b8; font-size: 0.9rem;">
          Tài liệu được tạo tự động bởi <strong>KidoEnglish AI</strong>
        </div>
      </div>
      <script>
        // Auto print prompt on open
        // window.onload = () => window.print();
      </script>
    </body>
    </html>
  `;
  
  const blob = new Blob([fullHTML], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadService = {
  downloadVocabulary: (items: VocabularyItem[], topic: string, images: Record<string, string>) => {
    const cardsHTML = items.map(item => `
      <div class="vocab-card">
        ${images[item.word] ? `<img src="${images[item.word]}" class="vocab-img" alt="${item.word}" />` : ''}
        <div class="vocab-content">
          <h3 class="vocab-word">${item.word} <span class="vocab-phonetic">/${item.phonetic}/</span></h3>
          <p class="vocab-meaning">${item.vietnamese}</p>
          <p class="vocab-example">"${item.example}"</p>
          <p style="font-size: 0.9rem; color: #64748b; margin-top: 5px;">Tip: ${item.readingGuide}</p>
        </div>
      </div>
    `).join('');

    const content = `
      <h1>Bộ từ vựng: ${topic}</h1>
      <div class="meta">Dành cho bé ôn tập tại nhà</div>
      <div class="vocab-grid">
        ${cardsHTML}
      </div>
    `;
    
    saveFile(`Tu_vung_${topic.replace(/\s+/g, '_')}`, content);
  },

  downloadStory: (story: Story, imageUrl: string) => {
    const content = `
      <h1>${story.title}</h1>
      ${story.vietnameseTitle ? `<h3 style="text-align:center; color:#64748b; margin-top:-10px">${story.vietnameseTitle}</h3>` : ''}
      <div class="meta">Truyện song ngữ Anh - Việt</div>
      
      ${imageUrl ? `<img src="${imageUrl}" class="story-img" />` : ''}
      
      <div class="story-content">
        ${story.content}
      </div>
      
      ${story.vietnameseContent ? `
        <div class="story-translation">
          <h3>Dịch nghĩa:</h3>
          ${story.vietnameseContent}
        </div>
      ` : ''}
    `;
    
    saveFile(`Truyen_${story.title.replace(/\s+/g, '_')}`, content);
  },

  downloadLesson: (lessonContent: string, topic: string) => {
    // Simple Markdown to HTML conversion for the lesson content
    const formattedContent = lessonContent
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="lesson-title">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\n/gim, '<br />');

    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="background:#e0f2fe; color:#0369a1; padding: 5px 15px; border-radius: 20px; font-weight:bold; font-size: 0.9rem;">DAILY LESSON</span>
      </div>
      ${formattedContent}
    `;

    saveFile(`Bai_hoc_${topic.replace(/\s+/g, '_')}`, content);
  }
};
