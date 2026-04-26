const { createClient } = require('redis');
require('dotenv').config();

async function clearCache() {
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  await client.connect();
  console.log('Connected to Redis');
  
  const keys = await client.keys('school:*');
  if (keys.length > 0) {
    await client.del(keys);
    console.log(`Deleted ${keys.length} keys`);
  } else {
    console.log('No keys found matching school:*');
  }
  
  await client.quit();
}

clearCache().catch(console.error);
