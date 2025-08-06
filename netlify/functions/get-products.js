import { neon } from '@neondatabase/serverless';

export const handler = async (event, context) => {
  // Eseguiamo la verifica della password
  const password = event.headers['x-password'];
  if (password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: 'Unauthorized: Invalid password' };
  }
  
  try {
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    // Recupera tutti i prodotti
    const prodotti = await sql`SELECT * FROM prodotti ORDER BY id ASC`; 
    
    return {
      statusCode: 200,
      body: JSON.stringify(prodotti),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Errore durante il recupero dei prodotti: ${error.message}` }),
    };
  }
};