document.addEventListener('DOMContentLoaded', function() {
    const corpoTabella = document.querySelector('#tabella-prodotti tbody');
    const bottoneAggiungi = document.getElementById('aggiungi-riga');
    const bottoneSalvaNuovo = document.getElementById('salva-prodotto');
    const bottoneCarica = document.getElementById('carica-prodotti');
    const bottoneSalvaModifiche = document.getElementById('salva-modifiche');
    const passwordInput = document.getElementById('password-input');

    // Mappa per tenere traccia delle modifiche da salvare
    const modifiche = {};

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
                    'x-password': password
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore di autenticazione. Password non valida.');
            }

            const prodotti = await response.json();
            corpoTabella.innerHTML = '';
            prodotti.forEach(prodotto => {
                const nuovaRiga = document.createElement('tr');
                nuovaRiga.dataset.id = prodotto.id;
                nuovaRiga.innerHTML = `
                    <td class="editable">${prodotto.nome}</td>
                    <td class="editable">${prodotto.codice}</td>
                    <td class="editable">${prodotto.descrizione}</td>
                `;
                corpoTabella.appendChild(nuovaRiga);
            });
            bottoneSalvaModifiche.style.display = 'none';
        } catch (error) {
            alert(`Errore: ${error.message}`);
        }
    }

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
                    'x-password': password
                },
                body: JSON.stringify(nuovoProdotto)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante l\'aggiunta del prodotto');
            }

            alert('Prodotto aggiunto con successo!');
            caricaProdotti();
        } catch (error) {
            alert(`Errore: ${error.message}`);
        }
    }
    
    // Funzione per inviare le modifiche al backend
    async function salvaModifiche() {
        const password = passwordInput.value;
        if (!password) {
            alert('Per favore, inserisci la password.');
            return;
        }

        const modificheArray = Object.values(modifiche);
        if (modificheArray.length === 0) {
            alert('Nessuna modifica da salvare.');
            return;
        }

        try {
            const response = await fetch('/.netlify/functions/update-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-password': password
                },
                body: JSON.stringify({ updates: modificheArray })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Errore durante il salvataggio delle modifiche.');
            }

            alert('Modifiche salvate con successo!');
            caricaProdotti();
            // Resetta la mappa delle modifiche
            Object.keys(modifiche).forEach(key => delete modifiche[key]);
            bottoneSalvaModifiche.style.display = 'none';
        } catch (error) {
            alert(`Errore: ${error.message}`);
        }
    }


    // Logica di modifica al doppio click
    corpoTabella.addEventListener('dblclick', function(e) {
        const cella = e.target.closest('td.editable');
        if (!cella || cella.querySelector('input')) return;

        const riga = cella.parentElement;
        const colonnaIndex = cella.cellIndex;
        const idProdotto = riga.dataset.id;
        const valoreOriginale = cella.textContent;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = valoreOriginale;

        cella.textContent = '';
        cella.appendChild(input);
        input.focus();

        input.addEventListener('blur', function() {
            const nuovoValore = input.value;
            cella.textContent = nuovoValore;

            // Aggiorna la mappa delle modifiche
            if (!modifiche[idProdotto]) {
                modifiche[idProdotto] = { id: idProdotto };
            }
            if (colonnaIndex === 0) {
                modifiche[idProdotto].nome = nuovoValore;
            } else if (colonnaIndex === 1) {
                modifiche[idProdotto].codice = nuovoValore;
            } else if (colonnaIndex === 2) {
                modifiche[idProdotto].descrizione = nuovoValore;
            }
            bottoneSalvaModifiche.style.display = 'block';
        });
    });

    bottoneCarica.addEventListener('click', caricaProdotti);
    bottoneSalvaModifiche.addEventListener('click', salvaModifiche);

    bottoneAggiungi.addEventListener('click', function() {
        const nuovaRiga = document.createElement('tr');
        nuovaRiga.innerHTML = `
            <td><input type="text" placeholder="Nome Prodotto"></td>
            <td><input type="text" placeholder="Codice"></td>
            <td><input type="text" placeholder="Descrizione"></td>
        `;
        corpoTabella.appendChild(nuovaRiga);
        bottoneAggiungi.style.display = 'none';
        bottoneSalvaNuovo.style.display = 'block';
    });

    bottoneSalvaNuovo.addEventListener('click', function() {
        const ultimaRiga = corpoTabella.lastElementChild;
        const inputs = ultimaRiga.querySelectorAll('input');
        const nuovoProdotto = {
            nome: inputs[0].value,
            codice: inputs[1].value,
            descrizione: inputs[2].value
        };

        if (nuovoProdotto.nome && nuovoProdotto.codice) {
            aggiungiProdotto(nuovoProdotto);
            bottoneAggiungi.style.display = 'block';
            bottoneSalvaNuovo.style.display = 'none';
        } else {
            alert('Nome e codice del prodotto sono obbligatori.');
        }
    });

    caricaProdotti(); 
});