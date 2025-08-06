document.addEventListener('DOMContentLoaded', function() {
    const corpoTabella = document.querySelector('#tabella-prodotti tbody');
    const bottoneAggiungi = document.getElementById('aggiungi-riga');
    const bottoneSalva = document.getElementById('salva-prodotto');
    const bottoneCarica = document.getElementById('carica-prodotti');
    const passwordInput = document.getElementById('password-input');

    // Funzione per caricare i prodotti dal database
    async function caricaProdotti() {
        const password = passwordInput.value;
        if (!password) {
            alert('Per favore, inserisci la password.');
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/get-products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': password // Invia la password nell'header
                }
            });

            if (!response.ok) {
                throw new Error('Errore di autenticazione. Password non valida.');
            }

            const prodotti = await response.json();
            corpoTabella.innerHTML = ''; // Svuota la tabella
            prodotti.forEach(prodotto => {
                const nuovaRiga = document.createElement('tr');
                nuovaRiga.innerHTML = `
                    <td>${prodotto.nome}</td>
                    <td>${prodotto.codice}</td>
                    <td>${prodotto.descrizione}</td>
                    <td>${prodotto.prezzo}</td>
                `;
                corpoTabella.appendChild(nuovaRiga);
            });
        } catch (error) {
            alert(`Errore: ${error.message}`);
        }
    }

    // Funzione per aggiungere un nuovo prodotto
    async function aggiungiProdotto(nuovoProdotto) {
        const password = passwordInput.value;
        if (!password) {
            alert('Per favore, inserisci la password.');
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/add-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': password // Invia la password nell'header
                },
                body: JSON.stringify(nuovoProdotto)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante l\'aggiunta del prodotto');
            }

            alert('Prodotto aggiunto con successo!');
            caricaProdotti(); // Ricarica la tabella per mostrare il nuovo prodotto
        } catch (error) {
            alert(`Errore: ${error.message}`);
        }
    }

    // Event listener per il bottone di caricamento
    bottoneCarica.addEventListener('click', caricaProdotti);

    // Event listener per il bottone "Aggiungi Prodotto"
    bottoneAggiungi.addEventListener('click', function() {
        // Aggiunge una riga con input per un nuovo prodotto
        const nuovaRiga = document.createElement('tr');
        nuovaRiga.innerHTML = `
            <td><input type="text" placeholder="Nome Prodotto"></td>
            <td><input type="text" placeholder="Codice"></td>
            <td><input type="text" placeholder="Descrizione"></td>
            <td><input type="text" placeholder="Prezzo"></td>
        `;
        corpoTabella.appendChild(nuovaRiga);
        bottoneAggiungi.style.display = 'none';
        bottoneSalva.style.display = 'block';
    });

    // Event listener per il bottone "Salva"
    bottoneSalva.addEventListener('click', function() {
        const ultimaRiga = corpoTabella.lastElementChild;
        const inputs = ultimaRiga.querySelectorAll('input');
        const nuovoProdotto = {
            nome: inputs[0].value,
            codice: inputs[1].value,
            descrizione: inputs[2].value,
            prezzo: inputs[3].value
        };

        if (nuovoProdotto.nome && nuovoProdotto.codice) {
            aggiungiProdotto(nuovoProdotto);
            // Ripristina i bottoni
            bottoneAggiungi.style.display = 'block';
            bottoneSalva.style.display = 'none';
        } else {
            alert('Nome e codice del prodotto sono obbligatori.');
        }
    });

    // All'avvio, prova a caricare i prodotti (se l'utente inserisce la password subito)
    // caricaProdotti(); 
});