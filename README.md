# 📚 Jinri

**Jinri** - A smart news feed with AI-powered summaries. Get the latest news with clean, concise 60-word summaries perfect for quick reading.

## ✨ Features

- **🤖 AI-Powered Summaries** - Smart 60-word summaries without metadata
- **📱 Beautiful Frontend** - Swipeable cards with keyboard navigation
- **⚡ Real-time Updates** - Fetches news every 30 minutes
- **🗄️ PostgreSQL Database** - Reliable data storage
- **🔄 RESTful API** - Clean pagination and endpoints
- **🚫 Duplicate Prevention** - Smart URL checking
- **⏰ Background Jobs** - Automatic news fetching

## Setup

### 1. Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- NewsAPI key (already configured: dfff1b70ac824c66a499b0f9ecabb4de)

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp config.env .env
```

### 3. Database Setup

```bash
# Create database
createdb news_feed

# Run schema
psql -d news_feed -f database/schema.sql
```

### 4. Environment Configuration

The `config.env` file is already configured with your NewsAPI key. Update the database credentials if needed:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=news_feed
DB_USER=postgres
DB_PASSWORD=password
NEWS_API_KEY=dfff1b70ac824c66a499b0f9ecabb4de
PORT=3000
```

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# Manual news fetch
npm run fetch-news

# Generate summaries for existing articles
npm run generate-summaries

# Test summarization
npm run test-summary
```

## API Endpoints

### GET /api/articles
Get paginated articles

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Articles per page (default: 20)

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "Breaking News Story",
      "description": "Short description of the news...",
      "summary": "Clean 60-word summary without metadata...",
      "url": "https://example.com/article",
      "image_url": "https://example.com/image.jpg",
      "source": "CNN",
      "published_at": "2025-01-14T10:00:00Z",
      "created_at": "2025-01-14T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### GET /api/articles/:id
Get single article by ID

**Response:**
```json
{
  "article": {
    "id": 1,
    "title": "Breaking News",
    "description": "News description...",
    "summary": "Clean 60-word summary without metadata...",
    "url": "https://example.com",
    "image_url": "https://example.com/image.jpg",
    "source": "CNN",
    "published_at": "2025-01-14T10:00:00Z",
    "created_at": "2025-01-14T10:30:00Z"
  }
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-14T10:30:00.000Z"
}
```

## Background Jobs

The application automatically fetches news from NewsAPI every 30 minutes. You can also trigger a manual fetch:

```bash
npm run fetch-news
```

## Database Schema

```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  summary TEXT,
  url TEXT NOT NULL UNIQUE,
  image_url TEXT,
  source TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL:**
   ```bash
   createdb news_feed
   psql -d news_feed -f database/schema.sql
   ```

3. **Update database credentials in `config.env` if needed**

4. **Start the server:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/articles
   ```

The backend will automatically start fetching news and serve them through the REST API!
