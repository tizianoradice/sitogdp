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

    // Controlla se ci sono modifiche da elaborare
    if (!updates || updates.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Nessun dato fornito per l\'aggiornamento.' }),
      };
    }

    // Mappiamo le modifiche in un array di promesse per eseguire le query
    const promises = updates.map(update => {
      // Per ogni aggiornamento, costruiamo la query UPDATE in modo sicuro
      if (!update.id) {
        throw new Error('ID prodotto mancante per l\'aggiornamento');
      }

      const fields = [];
      const values = [];

      // Aggiungiamo i campi da aggiornare solo se sono presenti
      if (update.nome) { fields.push('nome = $' + (fields.length + 1)); values.push(update.nome); }
      if (update.codice) { fields.push('codice = $' + (fields.length + 1)); values.push(update.codice); }
      if (update.descrizione) { fields.push('descrizione = $' + (fields.length + 1)); values.push(update.descrizione); }

      // Aggiungiamo l'ID del prodotto come ultimo valore per la clausola WHERE
      values.push(update.id);
      
      const query = `UPDATE prodotti SET ${fields.join(', ')} WHERE id = $${values.length}`;
      return sql.raw(query, values);
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