document.addEventListener('DOMContentLoaded', function() {
    const corpoTabella = document.querySelector('#tabella-prodotti tbody');
    const bottoneAggiungi = document.getElementById('aggiungi-riga');
    const bottoneCarica = document.getElementById('carica-prodotti');
    const bottoneSalva = document.getElementById('salva-modifiche');
    const passwordInput = document.getElementById('password-input');

    // Funzione per visualizzare i prodotti
    async function visualizzaProdotti() {
        try {
            const response = await fetch('/.netlify/functions/get-products');
            const prodotti = await response.json();
            
            corpoTabella.innerHTML = '';
            prodotti.forEach(prodotto => {
                const nuovaRiga = document.createElement('tr');
                nuovaRiga.dataset.id = prodotto.id;
                nuovaRiga.innerHTML = `
                    <td class="non-editabile">${prodotto.nome}</td>
                    <td class="non-editabile">${prodotto.codice}</td>
                    <td class="non-editabile">${prodotto.descrizione}</td>
                `;
                corpoTabella.appendChild(nuovaRiga);
            });
            bottoneAggiungi.style.display = 'none';
            bottoneSalva.style.display = 'none';
        } catch (error) {
            console.error('Errore durante il recupero dei prodotti:', error);
            alert('Errore durante il caricamento dei prodotti. Riprova più tardi.');
        }
    }
    
    // Funzione per caricare i prodotti in modalità modifica
    async function caricaModificaProdotti() {
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
                    <td class="editabile">${prodotto.nome}</td>
                    <td class="editabile">${prodotto.codice}</td>
                    <td class="editabile">${prodotto.descrizione}</td>
                `;
                corpoTabella.appendChild(nuovaRiga);
            });
            bottoneAggiungi.style.display = 'block';
            bottoneSalva.style.display = 'block';
        } catch (error) {
            alert(`Errore: ${error.message}`);
        }
    }

    // Funzione per salvare le modifiche e i nuovi prodotti
    async function salvaTutto() {
        const password = passwordInput.value;
        if (!password) {
            alert('Per favore, inserisci la password.');
            return;
        }

        const righeNuove = Array.from(corpoTabella.querySelectorAll('tr[data-id=""]'));
        const righeEsistenti = Array.from(corpoTabella.querySelectorAll('tr[data-id]:not([data-id=""])'));
        
        const modifiche = [];
        const nuovi = [];

        // Raccoglie le modifiche sulle righe esistenti
        righeEsistenti.forEach(riga => {
            const id = riga.dataset.id;
            const nome = riga.cells[0].textContent;
            const codice = riga.cells[1].textContent;
            const descrizione = riga.cells[2].textContent;
            
            const originalValues = JSON.parse(riga.dataset.originalValues || '{}');
            
            // Controlla se i valori sono effettivamente cambiati
            if (nome !== originalValues.nome || codice !== originalValues.codice || descrizione !== originalValues.descrizione) {
                modifiche.push({ id, nome, codice, descrizione });
            }
        });

        // Raccoglie i nuovi prodotti
        righeNuove.forEach(riga => {
            const nome = riga.cells[0].querySelector('input').value;
            const codice = riga.cells[1].querySelector('input').value;
            const descrizione = riga.cells[2].querySelector('input').value;
            if (nome && codice) {
                nuovi.push({ nome, codice, descrizione });
            }
        });

        if (modifiche.length === 0 && nuovi.length === 0) {
            alert('Nessuna modifica da salvare.');
            return;
        }
        
        try {
            if (modifiche.length > 0) {
                const response = await fetch('/.netlify/functions/update-product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-password': password },
                    body: JSON.stringify({ updates: modifiche })
                });
                if (!response.ok) throw new Error('Errore salvataggio modifiche');
            }

            if (nuovi.length > 0) {
                const response = await fetch('/.netlify/functions/add-product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-password': password },
                    body: JSON.stringify(nuovi[0])
                });
                if (!response.ok) throw new Error('Errore salvataggio nuovo prodotto');
            }

            alert('Modifiche salvate con successo!');
            // Dopo il salvataggio, si torna alla modalità visualizzazione per il visitatore
            visualizzaProdotti();
        } catch (error) {
            alert(`Errore: ${error.message}`);
        }
    }


    // Event listener per il doppio click per attivare la modifica
    corpoTabella.addEventListener('dblclick', function(e) {
        const password = passwordInput.value;
        const cella = e.target.closest('td.editabile');
        if (!password || !cella || cella.querySelector('input')) return;

        const riga = cella.parentElement;
        if (!riga.dataset.originalValues) {
             riga.dataset.originalValues = JSON.stringify({
                nome: riga.cells[0].textContent,
                codice: riga.cells[1].textContent,
                descrizione: riga.cells[2].textContent
            });
        }
        
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
            bottoneSalva.style.display = 'block';
        });
    });

    // Event listener per il pulsante "Visualizza Prodotti"
    bottoneCarica.addEventListener('click', function() {
        const password = passwordInput.value;
        if (password) {
            caricaModificaProdotti();
        } else {
            visualizzaProdotti();
        }
    });

    // Gestione dell'aggiunta di una nuova riga con input
    bottoneAggiungi.addEventListener('click', function() {
        const password = passwordInput.value;
        if (!password) {
            alert('Inserisci la password prima di aggiungere un prodotto.');
            return;
        }

        const nuovaRiga = document.createElement('tr');
        nuovaRiga.dataset.id = '';
        nuovaRiga.innerHTML = `
            <td class="editabile"><input type="text" placeholder="Nome Prodotto"></td>
            <td class="editabile"><input type="text" placeholder="Codice"></td>
            <td class="editabile"><input type="text" placeholder="Descrizione"></td>
        `;
        corpoTabella.appendChild(nuovaRiga);
    });

    // Event listener per il pulsante "Salva"
    bottoneSalva.addEventListener('click', salvaTutto);

    visualizzaProdotti();
});