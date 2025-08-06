(function() {
    'use strict';

    function rwdImageMap() {
        var img = document.getElementById('mappa-immagine');
        if (!img) return;

        var map = document.getElementsByName(img.useMap.substring(1))[0];
        if (!map) return;

        if (!img.complete) {
            img.addEventListener('load', function() {
                resizeMap(img, map);
            });
        } else {
            resizeMap(img, map);
        }

        window.addEventListener('resize', function() {
            resizeMap(img, map);
        });
    }

    function resizeMap(img, map) {
        // Salva le coordinate originali solo la prima volta
        if (!map.dataset.originalCoords) {
            var areas = map.getElementsByTagName('area');
            var coordsArray = [];
            for (var i = 0; i < areas.length; i++) {
                coordsArray.push(areas[i].coords);
            }
            map.dataset.originalCoords = JSON.stringify(coordsArray);
        }

        var originalCoords = JSON.parse(map.dataset.originalCoords);
        var areas = map.getElementsByTagName('area');
        
        // Calcola il rapporto di scala
        var ratio = img.width / (img.naturalWidth || img.width);

        // Ricalcola le coordinate per ogni area
        for (var i = 0; i < areas.length; i++) {
            var coords = originalCoords[i].split(',');
            var newCoords = [];
            for (var j = 0; j < coords.length; j++) {
                newCoords.push(Math.round(parseInt(coords[j]) * ratio));
            }
            areas[i].coords = newCoords.join(',');
        }
    }

    // Avvia la funzione
    rwdImageMap();

})();