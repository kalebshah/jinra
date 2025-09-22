const express = require('express');
const pool = require('../config/database');
const router = express.Router();

// GET /api/articles - Get paginated articles
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const countResult = await pool.query('SELECT COUNT(*) FROM articles');
    const totalArticles = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalArticles / limit);

    // Get articles for current page
    const articlesResult = await pool.query(`
      SELECT id, title, description, summary, url, image_url, source, published_at, created_at
      FROM articles 
      ORDER BY published_at DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      articles: articlesResult.rows,
      pagination: {
        page,
        limit,
        total: totalArticles,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/articles/search/:query - Search articles with fuzzy matching
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // PostgreSQL full-text search with ranking
    const searchQuery = query.trim().toLowerCase();
    
    const result = await pool.query(`
      SELECT 
        id, title, description, summary, url, image_url, source, published_at, created_at,
        -- Calculate relevance score
        (
          CASE WHEN LOWER(title) LIKE $1 THEN 100 ELSE 0 END +
          CASE WHEN LOWER(title) LIKE $2 THEN 50 ELSE 0 END +
          CASE WHEN LOWER(description) LIKE $2 THEN 30 ELSE 0 END +
          CASE WHEN LOWER(summary) LIKE $2 THEN 20 ELSE 0 END +
          CASE WHEN LOWER(source) LIKE $2 THEN 10 ELSE 0 END
        ) as relevance_score
      FROM articles 
      WHERE 
        LOWER(title) LIKE $2 OR 
        LOWER(description) LIKE $2 OR 
        LOWER(summary) LIKE $2 OR 
        LOWER(source) LIKE $2
      ORDER BY relevance_score DESC, published_at DESC
      LIMIT $3
    `, [`%${searchQuery}%`, `%${searchQuery}%`, limit]);

    res.json({
      query: query,
      results: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/articles/:id - Get single article
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT id, title, description, summary, url, image_url, source, published_at, created_at
      FROM articles 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ article: result.rows[0] });
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
