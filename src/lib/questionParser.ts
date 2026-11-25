export interface ParsedQuestion {
  type: 'TWK' | 'TIU' | 'TKP' | string;
  number: number;
  question: string;
  correct: string;
  explanation: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
    e: string;
  };
  scores: {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
  };
}

export const QUESTION_TEMPLATE_TEXT = `TYPE: TWK
NUMBER: 1
QUESTION: Pancasila sebagai ideologi terbuka memiliki makna bahwa...
A. Pancasila dapat berubah sesuai perkembangan zaman
B. Pancasila dapat menerima nilai-nilai baru yang positif tanpa mengubah nilai dasar
C. Pancasila dapat diganti dengan ideologi lain
D. Pancasila hanya berlaku untuk generasi awal kemerdekaan
E. Pancasila bersifat kaku dan tidak perlu dikembangkan
CORRECT: B
POINTS: 5
EXPLANATION: Ideologi terbuka berarti mampu berinteraksi dengan perkembangan zaman dan menerima nilai-nilai positif baru tanpa mengubah nilai dasarnya (Ketuhanan, Kemanusiaan, Persatuan, Kerakyatan, Keadilan).

---

TYPE: TIU
NUMBER: 2
QUESTION: Jika $2x + 6 = 14$, maka nilai dari $3x - 2$ adalah...
A. 8
B. 9
C. 10
D. 11
E. 12
CORRECT: C
POINTS: 5
EXPLANATION: $2x + 6 = 14 \\Rightarrow 2x = 8 \\Rightarrow x = 4$. Maka $3x - 2 = 3(4) - 2 = 12 - 2 = 10$.

---

TYPE: TKP
NUMBER: 3
QUESTION: Ketika melihat rekan kerja melakukan kesalahan input data laporan yang mendesak, sikap Anda adalah...
A. Diam saja karena bukan merupakan tanggung jawab divisi saya
B. Melaporkan langsung ke atasan agar segera diberi teguran
C. Mengingatkan dengan sopan dan membantu memperbaikinya agar laporan tepat waktu
D. Ikut membiarkannya agar tidak menimbulkan konflik
E. Pura-pura tidak tahu karena sibuk dengan pekerjaan sendiri
CORRECT: C
SCORE_A: 2
SCORE_B: 4
SCORE_C: 5
SCORE_D: 1
SCORE_E: 3
EXPLANATION: Aspek Kerja Sama & Profesionalisme: Mengingatkan dengan santun sekaligus memberikan solusi bantuan langsung meraih poin tertinggi (5).
`;

/**
 * Mengunduh file template soal .txt yang valid dan siap diisi
 */
export function downloadQuestionTemplate(filename = 'template-soal-cpns.txt') {
  const blob = new Blob([QUESTION_TEMPLATE_TEXT], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parser TXT ke array soal (Mendukung Multi-line, LaTeX, dan HTML)
 */
export function parseQuestionsFromText(text: string): ParsedQuestion[] {
  const questionsList: ParsedQuestion[] = [];
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalizedText.split(/---+\n?/).filter(block => block.trim());

  for (let bIndex = 0; bIndex < blocks.length; bIndex++) {
    const block = blocks[bIndex];
    const lines = block.split('\n');
    const question: any = {
      type: 'TWK',
      number: null,
      question: '',
      correct: '',
      explanation: '',
      options: {},
      scores: { a: 1, b: 2, c: 3, d: 4, e: 5 }
    };

    let currentField: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.trim();

      if (!line && !currentField) continue;

      if (/^TYPE:\s*/i.test(line)) {
        question.type = line.replace(/^TYPE:\s*/i, '').trim().toUpperCase();
        currentField = null;
      } else if (/^NUMBER:\s*/i.test(line)) {
        const num = parseInt(line.replace(/^NUMBER:\s*/i, '').trim());
        if (!isNaN(num)) question.number = num;
        currentField = null;
      } else if (/^QUESTION:\s*/i.test(line)) {
        question.question = rawLine.replace(/^\s*QUESTION:\s*/i, '');
        currentField = 'question';
      } else if (/^CORRECT:\s*/i.test(line)) {
        question.correct = line.replace(/^CORRECT:\s*/i, '').trim().toUpperCase();
        currentField = null;
      } else if (/^POINTS:\s*/i.test(line)) {
        currentField = null;
      } else if (/^EXPLANATION:\s*/i.test(line)) {
        question.explanation = rawLine.replace(/^\s*EXPLANATION:\s*/i, '');
        currentField = 'explanation';
      } else if (/^([A-E])[:\.\)]\s*/i.test(line)) {
        const match = rawLine.match(/^\s*([A-E])[:\.\)]\s*(.*)$/i);
        if (match) {
          const optKey = match[1].toLowerCase();
          question.options[optKey] = match[2];
          currentField = `option_${optKey}`;
        }
      } else if (/^SCORE_([A-E]):\s*/i.test(line)) {
        const match = line.match(/^SCORE_([A-E]):\s*(\d+)/i);
        if (match) {
          const optKey = match[1].toLowerCase();
          question.scores[optKey] = parseInt(match[2]);
        }
        currentField = null;
      } else {
        // Lanjutan multi-line untuk question, explanation, atau options
        if (currentField === 'question') {
          question.question += (question.question ? '\n' : '') + rawLine;
        } else if (currentField === 'explanation') {
          question.explanation += (question.explanation ? '\n' : '') + rawLine;
        } else if (currentField && currentField.startsWith('option_')) {
          const optKey = currentField.replace('option_', '');
          question.options[optKey] += (question.options[optKey] ? '\n' : '') + rawLine;
        }
      }
    }

    if (!question.number) question.number = bIndex + 1;

    question.question = (question.question || '').trim();
    question.explanation = (question.explanation || '').trim();
    for (const key of ['a', 'b', 'c', 'd', 'e']) {
      if (question.options[key] !== undefined) {
        question.options[key] = question.options[key].trim();
      }
    }

    // Jawaban terbaik untuk TKP jika tidak ditulis CORRECT
    if (question.type === 'TKP' && !question.correct) {
      let maxScore = -1;
      let bestOpt = 'A';
      for (const opt of ['a', 'b', 'c', 'd', 'e']) {
        if ((question.scores[opt] || 0) > maxScore) {
          maxScore = question.scores[opt];
          bestOpt = opt.toUpperCase();
        }
      }
      question.correct = bestOpt;
    }

    const optA = question.options.a !== undefined ? question.options.a : question.options.A;
    const optB = question.options.b !== undefined ? question.options.b : question.options.B;

    if (question.question && optA !== undefined && optB !== undefined) {
      question.options = {
        a: optA || '',
        b: optB || '',
        c: question.options.c || question.options.C || '',
        d: question.options.d || question.options.D || '',
        e: question.options.e || question.options.E || ''
      };
      if (!question.correct) question.correct = 'A';

      questionsList.push(question as ParsedQuestion);
    }
  }

  return questionsList;
}
