// netlify/functions/get-products.js
import { neon } from '@neondatabase/serverless';

export const handler = async (event, context) => {
  try {
    // The NETLIFY_DATABASE_URL environment variable is automatically provided by Netlify.
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    // Query the database to get all products, ordered by their ID.
    const prodotti = await sql`SELECT * FROM prodotti ORDER BY id ASC`; 
    
    return {
      statusCode: 200,
      body: JSON.stringify(prodotti),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch products' }),
    };
  }
};