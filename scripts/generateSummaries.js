require('dotenv').config();
const pool = require('../config/database');
const summaryService = require('../services/summaryService');

async function generateSummariesForExistingArticles() {
  try {
    console.log('Starting summary generation for existing articles...');
    
    // Initialize the summary service
    await summaryService.initialize();
    
    // Get articles without summaries
    const result = await pool.query(`
      SELECT id, title, description 
      FROM articles 
      WHERE summary IS NULL OR summary = ''
      ORDER BY created_at DESC
    `);
    
    console.log(`Found ${result.rows.length} articles without summaries`);
    
    let processed = 0;
    let errors = 0;
    
    for (const article of result.rows) {
      try {
        console.log(`Processing article ${article.id}: ${article.title.substring(0, 50)}...`);
        
        const summary = await summaryService.summarizeArticle(article);
        
        if (summary) {
          await pool.query(
            'UPDATE articles SET summary = $1 WHERE id = $2',
            [summary, article.id]
          );
          console.log(`✓ Generated summary for article ${article.id}`);
        } else {
          console.log(`⚠ No summary generated for article ${article.id}`);
        }
        
        processed++;
      } catch (error) {
        console.error(`✗ Error processing article ${article.id}:`, error.message);
        errors++;
      }
    }
    
    console.log(`\nSummary generation completed:`);
    console.log(`- Processed: ${processed}`);
    console.log(`- Errors: ${errors}`);
    
  } catch (error) {
    console.error('Error in generateSummariesForExistingArticles:', error.message);
  } finally {
    await pool.end();
  }
}

// Test the summarization service
async function testSummarization() {
  try {
    console.log('Testing summarization service...');
    
    await summaryService.initialize();
    
    const testArticle = {
      title: "Breaking: Major Tech Company Announces Revolutionary AI Breakthrough",
      description: "A leading technology company has announced a groundbreaking artificial intelligence system that can process natural language with unprecedented accuracy. The new system, developed over three years by a team of 200 researchers, promises to revolutionize how computers understand and interact with human language. The company's CEO stated that this breakthrough represents a significant leap forward in AI capabilities and could have applications across multiple industries including healthcare, education, and customer service. The announcement comes at a time when AI technology is rapidly advancing and becoming more integrated into everyday applications."
    };
    
    console.log('Original text:');
    console.log(`${testArticle.title}. ${testArticle.description}`);
    console.log(`\nWord count: ${(testArticle.title + ' ' + testArticle.description).split(' ').length}`);
    
    const summary = await summaryService.summarizeArticle(testArticle);
    
    console.log('\nGenerated summary:');
    console.log(summary);
    console.log(`\nSummary word count: ${summary ? summary.split(' ').length : 0}`);
    
  } catch (error) {
    console.error('Error testing summarization:', error.message);
  }
}

// Run the appropriate function based on command line arguments
const args = process.argv.slice(2);

if (args.includes('--test')) {
  testSummarization();
} else {
  generateSummariesForExistingArticles();
}
