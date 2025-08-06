import { neon } from '@neondatabase/serverless';

export const handler = async (event, context) => {
  const password = event.headers['x-password'];
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  
  try {
    // Se la password è presente e corretta, ritorna l'ID
    if (password && password === process.env.ADMIN_PASSWORD) {
        const prodotti = await sql`SELECT id, nome, codice, descrizione FROM prodotti ORDER BY id ASC`;
        return {
          statusCode: 200,
          body: JSON.stringify(prodotti),
        };
    } else {
        // Se la password non c'è, ritorna solo i dati senza ID
        const prodotti = await sql`SELECT nome, codice, descrizione FROM prodotti ORDER BY id ASC`;
        return {
          statusCode: 200,
          body: JSON.stringify(prodotti),
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Errore durante il recupero dei prodotti: ${error.message}` }),
    };
  }
};