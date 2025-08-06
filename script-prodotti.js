document.addEventListener('DOMContentLoaded', function() {
    const bottoneAggiungi = document.getElementById('aggiungi-riga');
    const corpoTabella = document.querySelector('#tabella-prodotti tbody');

    bottoneAggiungi.addEventListener('click', function() {
        const nuovaRiga = document.createElement('tr');
        nuovaRiga.innerHTML = `
            <td><input type="text" placeholder="Nome Prodotto"></td>
            <td><input type="text" placeholder="Codice"></td>
            <td><input type="text" placeholder="Descrizione"></td>
            <td><input type="text" placeholder="Prezzo"></td>
        `;
        corpoTabella.appendChild(nuovaRiga);
    });
});