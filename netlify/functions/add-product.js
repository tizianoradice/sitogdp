import { neon } from '@neondatabase/serverless';

export const handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const password = event.headers['x-password'];
  if (password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: 'Unauthorized: Invalid password' };
  }

  try {
    const { nome, codice, descrizione } = JSON.parse(event.body);
    const sql = neon(process.env.NETLIFY_DATABASE_URL);
    
    // Inserisce il nuovo prodotto nel database
    await sql`
      INSERT INTO prodotti (nome, codice, descrizione)
      VALUES (${nome}, ${codice}, ${descrizione});
    `;

    return {
      statusCode: 201, 
      body: JSON.stringify({ message: 'Prodotto aggiunto con successo' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Errore durante l'aggiunta del prodotto: ${error.message}` }),
    };
  }
};