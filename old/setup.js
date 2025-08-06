import { neon } from '@neondatabase/serverless';

export const handler = async () => {
    try {
        const sql = neon(process.env.NETLIFY_DATABASE_URL);
        await sql`
            CREATE TABLE prodotti (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                codice VARCHAR(255) NOT NULL,
                descrizione TEXT,
                prezzo NUMERIC(10, 2)
            );
        `;
        return { statusCode: 200, body: 'Tabella creata con successo!' };
    } catch (error) {
        return { statusCode: 500, body: `Errore: ${error.message}` };
    }
};