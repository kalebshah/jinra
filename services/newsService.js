const axios = require('axios');
const pool = require('../config/database');
const summaryService = require('./summaryService');

class NewsService {
  constructor() {
    this.apiKey = process.env.NEWS_API_KEY;
    this.baseUrl = 'https://newsapi.org/v2';
  }

  async fetchTopHeadlines() {
    try {
      console.log('Fetching top headlines from NewsAPI...');
      
      const response = await axios.get(`${this.baseUrl}/top-headlines`, {
        params: {
          apiKey: this.apiKey,
          country: 'us',
          pageSize: 100,
          sortBy: 'publishedAt'
        }
      });

      if (response.data.status === 'ok') {
        return response.data.articles;
      } else {
        throw new Error(`NewsAPI error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error fetching news:', error.message);
      throw error;
    }
  }

  async saveArticles(articles) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let savedCount = 0;
      let duplicateCount = 0;

      for (const article of articles) {
        try {
          // Check if article already exists by URL
          const existingArticle = await client.query(
            'SELECT id FROM articles WHERE url = $1',
            [article.url]
          );

          if (existingArticle.rows.length > 0) {
            duplicateCount++;
            continue;
          }

          // Generate summary for the article
          const summary = await summaryService.summarizeArticle({
            title: article.title,
            description: article.description
          });

          // Insert new article
          await client.query(`
            INSERT INTO articles (title, description, summary, url, image_url, source, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            article.title,
            article.description,
            summary,
            article.url,
            article.urlToImage,
            article.source?.name || 'Unknown',
            new Date(article.publishedAt)
          ]);

          savedCount++;
        } catch (error) {
          console.error('Error saving article:', error.message);
          // Continue with other articles even if one fails
        }
      }

      await client.query('COMMIT');
      console.log(`Saved ${savedCount} new articles, skipped ${duplicateCount} duplicates`);
      
      return { saved: savedCount, duplicates: duplicateCount };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async fetchAndSaveNews() {
    try {
      const articles = await this.fetchTopHeadlines();
      const result = await this.saveArticles(articles);
      return result;
    } catch (error) {
      console.error('Error in fetchAndSaveNews:', error.message);
      throw error;
    }
  }
}

module.exports = new NewsService();
