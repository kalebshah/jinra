class SummaryService {
  constructor() {
    this.isInitialized = true; // Always use smart text processing
  }

  async initialize() {
    // No initialization needed for smart text processing
    this.isInitialized = true;
    console.log('Smart text summarization ready');
  }

  async generateSummary(text) {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Clean the text by removing metadata and extra whitespace
    const cleanedText = this.cleanText(text);
    
    // If text is already short enough, return as is
    if (cleanedText.split(' ').length <= 60) {
      return cleanedText;
    }

    // Use smart text processing for summarization
    return this.smartSummary(cleanedText);
  }

  cleanText(text) {
    if (!text) return '';
    
    return text
      // Remove common metadata patterns
      .replace(/\[.*?\]/g, '') // Remove [bracketed content]
      .replace(/\(.*?\)/g, '') // Remove (parenthetical content)
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      // Remove common news metadata
      .replace(/^(Reuters|AP|AFP|CNN|BBC|NPR|Associated Press)\s*[-–]\s*/i, '')
      .replace(/\s*[-–]\s*(Reuters|AP|AFP|CNN|BBC|NPR|Associated Press)$/i, '')
      // Remove timestamps and dates
      .replace(/\d{1,2}:\d{2}\s*(AM|PM|am|pm)/g, '')
      .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '')
      .replace(/\d{4}-\d{2}-\d{2}/g, '')
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, '')
      // Remove extra punctuation
      .replace(/[.]{2,}/g, '.')
      .replace(/[,]{2,}/g, ',')
      .trim();
  }

  smartSummary(text) {
    if (!text) return '';
    
    const words = text.split(' ');
    if (words.length <= 60) {
      return text;
    }
    
    // Smart summarization: prioritize important sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      // If only 1-2 sentences, take first 60 words
      return this.fallbackSummary(text);
    }
    
    // Score sentences by importance (length, position, keywords)
    const scoredSentences = sentences.map((sentence, index) => {
      const words = sentence.trim().split(' ');
      const score = this.scoreSentence(sentence, index, sentences.length);
      return { sentence: sentence.trim(), score, wordCount: words.length };
    });
    
    // Sort by score and select sentences that fit in 60 words
    scoredSentences.sort((a, b) => b.score - a.score);
    
    let summary = '';
    let wordCount = 0;
    const targetWords = 60;
    
    for (const { sentence, wordCount: sentenceWords } of scoredSentences) {
      if (wordCount + sentenceWords <= targetWords) {
        summary += (summary ? ' ' : '') + sentence;
        wordCount += sentenceWords;
      } else {
        break;
      }
    }
    
    // If we didn't get enough content, add more from the beginning
    if (wordCount < 40) {
      const remainingWords = targetWords - wordCount;
      const firstSentence = sentences[0];
      const firstWords = firstSentence.split(' ');
      
      if (firstWords.length > remainingWords) {
        summary = firstWords.slice(0, remainingWords).join(' ') + '...';
      } else {
        summary = firstSentence + (summary ? ' ' + summary : '');
      }
    }
    
    return summary.trim();
  }

  scoreSentence(sentence, index, totalSentences) {
    let score = 0;
    const words = sentence.toLowerCase().split(' ');
    
    // Position scoring (first and last sentences are more important)
    if (index === 0) score += 10;
    if (index === totalSentences - 1) score += 5;
    
    // Length scoring (medium length sentences are preferred)
    const length = words.length;
    if (length >= 8 && length <= 25) score += 5;
    else if (length >= 5 && length <= 35) score += 3;
    
    // Keyword scoring (news-related terms)
    const newsKeywords = [
      'breaking', 'announced', 'reported', 'said', 'according', 'officials',
      'government', 'company', 'president', 'minister', 'spokesperson',
      'investigation', 'developing', 'latest', 'update', 'confirmed',
      'denied', 'revealed', 'discovered', 'launched', 'introduced'
    ];
    
    const keywordMatches = newsKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).length;
    
    score += keywordMatches * 2;
    
    // Avoid sentences with too many numbers or special characters
    const specialCharCount = (sentence.match(/[0-9@#$%^&*()_+=\[\]{}|\\:";'<>?,./]/g) || []).length;
    if (specialCharCount > words.length * 0.3) score -= 3;
    
    return score;
  }

  fallbackSummary(text) {
    if (!text) return '';
    
    const words = text.split(' ');
    if (words.length <= 60) {
      return text;
    }
    
    // Take first 60 words and add ellipsis
    const summary = words.slice(0, 60).join(' ');
    return summary.endsWith('.') ? summary : summary + '...';
  }

  async summarizeArticle(article) {
    if (!article) return null;

    // Combine title and description for better context
    const fullText = [article.title, article.description]
      .filter(Boolean)
      .join('. ');

    if (!fullText) return null;

    const summary = await this.generateSummary(fullText);
    return summary;
  }
}

module.exports = new SummaryService();
