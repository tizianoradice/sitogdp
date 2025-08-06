// netlify/functions/add-product.js
import { neon } from '@neondatabase/serverless';

export const handler = async (event, context) => {
  // Ensure the function only responds to POST requests.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the JSON data sent from the client.
    const { nome, codice, descrizione, prezzo } = JSON.parse(event.body);
    
    // Connect to the database using the environment variable.
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    // Insert the new product data into the 'prodotti' table.
    await sql`
      INSERT INTO prodotti (nome, codice, descrizione, prezzo)
      VALUES (${nome}, ${codice}, ${descrizione}, ${prezzo});
    `;

    return {
      statusCode: 201, // 201 Created status code indicates success.
      body: JSON.stringify({ message: 'Product added successfully' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to add product' }),
    };
  }
};