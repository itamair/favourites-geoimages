(function ($, Drupal) {

  'use strict';

  Drupal.behaviors.leafletInteractions = {
    attach: function(context) {
      let self = this;

      // React on leafletMapInit event.
      // Resizing Markers.
      $(context).on('leafletMapInit', function (e, settings, lMap, mapid) {
        let map = lMap;
        let markers = Drupal.Leaflet[mapid].markers;
        let features = Drupal.Leaflet[mapid].features;
        let markersOriginalSizes = self.setMarkersOriginalSizes(markers);

        self.reactOnZoomEnd(mapid, map, features, markers, markersOriginalSizes);

        // Resizing on zoom
        map.on('zoomend', function() {
          self.reactOnZoomEnd(mapid, map, features, markers, markersOriginalSizes);
        });
      });

      // Interact with each feature created and added to the map.
/*      $(context).on('leaflet.feature', function(e, lFeature, feature, add_features) {

        // Add an event listener on the popup open to dynamically pan to the center.
        lFeature.on('popupopen', function (popup) {
          const zoom = popup.target._map.getZoom();
          const zoom_pow = Math.pow(zoom , 3);
          const lat_addition = zoom < 17 ? 12/zoom_pow: 3/zoom_pow;
          popup.target._map.panTo([popup.target._latlng.lat + lat_addition, popup.target._latlng.lng])
        });
      });*/
    },

    zoomDefaultIconSize: 18,
    hidden_markers: [],

    /**
     * Update Icon Size.
     *
     * @param i
     * @param marker
     * @param iconSizeRate
     * @param markersOriginSizes
     */
    updateIconSize: function(i, marker, iconSizeRate, markersOriginSizes) {
      let icon = marker.options.icon;
      icon.options.iconSize.x = markersOriginSizes[i].x*iconSizeRate;
      icon.options.iconSize.y = markersOriginSizes[i].y*iconSizeRate;
      //icon.options.iconAnchor = new L.Point(icon.options.iconSize.x/2, icon.options.iconSize.y);
      marker.setIcon(icon);
    },

    /**
     * Get IconSizeRate.
     *
     * @param map
     * @returns {number}
     */
    getIconSizeRate: function(map) {
      //return Math.exp(Math.sqrt(map.getZoom()));
      return Math.pow(map.getZoom()/this.zoomDefaultIconSize, 3);
    },

    /**
     * Set MarkersOriginalSizes.
     *
     * @param markers
     * @returns {{}}
     */
    setMarkersOriginalSizes: function(markers) {
      let markersOriginalSizes = {};
      for (let i in markers) {
        if (markers.hasOwnProperty(i) && !markers[i].setStyle) {
          let icon = markers[i].options.icon;
          markersOriginalSizes[i] = {
            x: icon.options.iconSize.x,
            y: icon.options.iconSize.y,
          };
        }
      }
      return markersOriginalSizes;
    },

    /**
     * Set React on Zoom End
     *
     * Updates Marker Icon Sizes and Show/Hide Features with Zoom Limits.
     *
     * @param mapid
     * @param map
     * @param features
     * @param markers
     * @param markersOriginalSizes
     */
    reactOnZoomEnd: function(mapid, map, features, markers, markersOriginalSizes) {
      let self = this;
      let iconSizeRate = this.getIconSizeRate(map);
      let zoomLevel = map.getZoom();
      for (let i in markers) {
        if (markers.hasOwnProperty(i)) {
          let hidden_marker_index = self.hidden_markers.indexOf(i);
          // Only in case of Points (setStyle undefined), update Icon size.
          if (!markers[i].setStyle) {
            this.updateIconSize(i, markers[i], iconSizeRate, markersOriginalSizes);
          }
          if (features.hasOwnProperty(i) && features[i] && features[i]['min_zoom_visibility'] && zoomLevel <= features[i]['min_zoom_visibility']) {
            map.removeLayer(markers[i]);
            if (hidden_marker_index === -1) {
              self.hidden_markers.push(i);
            }

          }
          else if (markers.hasOwnProperty(i) && hidden_marker_index > -1) {
            markers[i].addTo(map);
            self.hidden_markers.splice(hidden_marker_index, 1);
          }
        }
      }
    }

  };

  Drupal.Leaflet.prototype.create_linestring = function(polyline) {
    let latlngs = [];
    for (let i = 0; i < polyline.points.length; i++) {
      let latlng = new L.LatLng(polyline.points[i].lat, polyline.points[i].lon);
      latlngs.push(latlng);
    }
    return new L.Polyline(latlngs);
  };

  Drupal.Leaflet.prototype.create_polygon = function(polygon) {
    let latlngs = [];
    for (let i = 0; i < polygon.points.length; i++) {
      let latlng = new L.LatLng(polygon.points[i].lat, polygon.points[i].lon);
      latlngs.push(latlng);
    }
    return new L.Polygon(latlngs);
  };

  Drupal.Leaflet.prototype.create_multipolygon = function(multipolygon) {
    let polygons = [];
    for (let x = 0; x < multipolygon.component.length; x++) {
      let latlngs = [];
      let polygon = multipolygon.component[x];
      for (let i = 0; i < polygon.points.length; i++) {
        let latlng = new L.LatLng(polygon.points[i].lat, polygon.points[i].lon);
        latlngs.push(latlng);
      }
      polygons.push(latlngs);
    }
    return new L.Polygon(polygons);
  };

  // Override the original leaflet.drupal.js method not to use the
  // L.PolygonClusterable object.
  Drupal.Leaflet.prototype.create_multipoly = function(multipoly) {
    let polygons = [];
    for (let x = 0; x < multipoly.component.length; x++) {
      let latlngs = [];
      let polygon = multipoly.component[x];
      for (let i = 0; i < polygon.points.length; i++) {
        let latlng = new L.LatLng(polygon.points[i].lat, polygon.points[i].lon);
        latlngs.push(latlng);
      }
      polygons.push(latlngs);
    }
    if (multipoly.multipolyline) {
      return new L.Polyline(polygons);
    }
    else {
      return new L.Polygon(polygons);
    }
  };

})(jQuery, Drupal);
