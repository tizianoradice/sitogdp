// netlify/functions/update-product.js
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
    const { updates } = JSON.parse(event.body);
    const sql = neon(process.env.NETLIFY_DATABASE_URL);

    if (!updates || updates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nessun dato fornito per l\'aggiornamento.' }),
      };
    }

    const promises = updates.map(update => {
      const { id, nome, codice, descrizione } = update;
      return sql`
        UPDATE prodotti
        SET nome = ${nome}, codice = ${codice}, descrizione = ${descrizione}
        WHERE id = ${id};
      `;
    });

    await Promise.all(promises);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Modifiche salvate con successo' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Errore durante l'aggiornamento dei prodotti: ${error.message}` }),
    };
  }
};