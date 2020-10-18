(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.geofield311 = {
    attach: function (context, settings) {

      function widerMapBounds(bounds, val) {
        var widingVal = (val) ? val : 0.3;
        bounds._northEast.lat += widingVal;
        bounds._northEast.lng += widingVal;
        bounds._southWest.lat -= widingVal;
        bounds._southWest.lng -= widingVal;
        return bounds;
      }

      // React on leafletMapInit event.
      $(context).on('leafletMapInit', function (e, settings, lMap, mapid) {
        let map = lMap;
        // Geojson Overlays
        // If there is Geojson valid file inputed.
        if (settings.geojson_app_limit && settings.geojson_app_limit.file.length > 0) {

          $.getJSON(settings.geojson_app_limit.file, function (data) {

            let geojsonFeatures = data;
            let myStyle = {
              color: settings.geojson_app_limit.stroke_color,
              weight: settings.geojson_app_limit.stroke_weight,
              opacity: 1,
              fillColor: "blue",
              fillOpacity: 0,
              interactive: false
            };

            let geojsonOptions = {
              style: myStyle,
              onEachFeature: function (feature, layer) {
                let layerBounds = layer.getBounds();
                let bounds_widing_val = 0.5;
                map.boundsCenter = layerBounds.getCenter();
                map.boundsZoom = map.getBoundsZoom(layerBounds) + 1;
                map.setView(map.boundsCenter, map.boundsZoom);
                map.options.minZoom = map.boundsZoom - 3;
                // Set MaxBounds to a wider value of the geojson Feature bounds.
                map.setMaxBounds(widerMapBounds(layerBounds, bounds_widing_val));
              }
            };

            // Create the geoJson layer, add it to the map and bring it back.
            let LeafletGeoJson = L.geoJson(geojsonFeatures, geojsonOptions);
            LeafletGeoJson.addTo(map).bringToBack();
            // Set the Map Reset Control settings.
            Drupal.Leaflet[mapid].start_center = map.boundsCenter;
            Drupal.Leaflet[mapid].start_zoom = map.boundsZoom;

          });
        }


      });
    }
  };

})(jQuery, Drupal);

