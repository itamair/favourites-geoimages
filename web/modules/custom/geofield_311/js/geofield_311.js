(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.geofield311 = {
    attach: function (context, settings) {

      let widerMapBounds = (bounds, val) => {
        let widingVal = (val) ? val : 0.3;
        bounds._northEast.lat += widingVal;
        bounds._northEast.lng += widingVal;
        bounds._southWest.lat -= widingVal;
        bounds._southWest.lng -= widingVal;
        return bounds;
      };

      // React on leafletMapInit event.
      $(context).on('leafletMapInit', function (e, settings, lMap, mapid) {
        let map = lMap;
        // Geojson Overlays
        // If there is Geojson valid file inputed.
        if (settings.geojson_app_limit && settings.geojson_app_limit.file.length > 0) {
          let geojsonAppLimitSettings = settings.geojson_app_limit;
          $.getJSON(settings.geojson_app_limit.file, function (data) {

            let geojsonFeatures = data;
            let myStyle = {
              color: geojsonAppLimitSettings.stroke_color,
              weight: geojsonAppLimitSettings.stroke_weight,
              opacity: 1,
              fillColor: "blue",
              fillOpacity: 0,
              interactive: false,
            };

            let geojsonOptions = {
              style: myStyle,
              onEachFeature: function (feature, layer) {
                let layerBounds = layer.getBounds();
                map.boundsCenter = layerBounds.getCenter();
                map.boundsZoom = map.getBoundsZoom(layerBounds) + parseInt(geojsonAppLimitSettings.bounds_zoom_correction);
                if (geojsonAppLimitSettings.bounds_zoom_flag ?? false) {
                  map.setView(map.boundsCenter, map.boundsZoom);
                }
                if (geojsonAppLimitSettings.bounds_limit_flag ?? false) {
                  map.options.minZoom = map.boundsZoom + parseInt(geojsonAppLimitSettings.max_zoom_out);
                  // Set MaxBounds to a wider value of the geojson Feature bounds.
                  let bounds_widing_val = 0.5;
                  map.setMaxBounds(widerMapBounds(layerBounds, bounds_widing_val));
                }
              },
              pmIgnore: true
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

