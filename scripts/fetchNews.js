require('dotenv').config({ path: '../.env' });
const newsService = require('../services/newsService');

async function main() {
  try {
    console.log('Starting manual news fetch...');
    const result = await newsService.fetchAndSaveNews();
    console.log('Manual fetch completed:', result);
    process.exit(0);
  } catch (error) {
    console.error('Manual fetch failed:', error.message);
    process.exit(1);
  }
}

main();
