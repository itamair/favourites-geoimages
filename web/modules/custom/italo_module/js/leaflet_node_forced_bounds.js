(function ($, Drupal, drupalSettings) {

  'use strict';

  Drupal.behaviors.leafletNodeForcedBounds = {
    attach: function(context) {

      // React on leafletMapInit event.
      $(context).on('leafletMapInit', function (e, settings, lMap, mapid, data_markers) {

        // Eventually Force Bounds for the Specific Node View.
        if (drupalSettings.path.currentPath && drupalSettings.leaflet.node_forced_bounds && drupalSettings.leaflet.node_forced_bounds.node_id && drupalSettings.path.currentPath === 'node/' + drupalSettings.leaflet.node_forced_bounds.node_id) {
          const node_id = drupalSettings.leaflet.node_forced_bounds.node_id;
          const features = drupalSettings.leaflet.node_forced_bounds.geofields;
          let forced_bounds = [];
          for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            if (feature.type === 'point') {
              forced_bounds.push([feature.lat, feature.lon]);
            }
            else {
              const lFeature = Drupal.Leaflet.prototype.create_geometry(feature);
              forced_bounds.push(lFeature.getBounds().getSouthWest(), lFeature.getBounds().getNorthEast());
            }
          }
          if (forced_bounds.length > 0) {
            forced_bounds = new L.LatLngBounds(forced_bounds);
            Drupal.Leaflet[mapid].start_center = forced_bounds.getCenter();
            Drupal.Leaflet[mapid].start_zoom = lMap.getBoundsZoom(forced_bounds) -1;
            lMap.setView(Drupal.Leaflet[mapid].start_center, Drupal.Leaflet[mapid].start_zoom);
            let map_reset_view_options = Drupal.Leaflet[mapid].reset_view_control.options;
            map_reset_view_options.latlng = Drupal.Leaflet[mapid].start_center;
            map_reset_view_options.zoom = Drupal.Leaflet[mapid].start_zoom;
            lMap.removeControl(Drupal.Leaflet[mapid].reset_view_control);
            Drupal.Leaflet[mapid].reset_view_control = L.control.resetView(map_reset_view_options).addTo(lMap);
          }
          let node_markers = [];
          let node_paths = [];
          for (let step = 0; step < 5; step++) {
            const node_marker = data_markers[node_id + '-' + step];
            if (node_marker && node_marker.setStyle) {
              node_paths.push(node_marker);
            }
            else if (node_marker) {
              node_markers.push(node_marker);
            }
          }
          if (node_markers.length > 0) {
            node_markers.forEach(marker => {
              marker.bindTooltip(marker._tooltip._content, {
                permanent: true,
                direction: "top"
              });
            })
          }
          else if (node_paths.length > 0) (
            node_paths.forEach(path => {
              path.bindTooltip(path._tooltip._content, {
                permanent: true,
                direction: "center"
              });
            })
          )
        }

      });
    }
  };

})(jQuery, Drupal, drupalSettings);
