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

        // Trigger/Process Initial Actions
        self.processInitialActions(mapid, map, features, markers, markersOriginalSizes);

        // Set Actions on every Zoom End
        map.on('zoomend', function() {
          // Markers resize on Zoomend.
          self.markersResizeOnZoomEnd(mapid, map, features, markers, markersOriginalSizes);
        });
      });

      // Interact with each feature created and added to the map.
      $(context).on('leaflet.feature', function(e, lFeature, feature, add_features) {

        // Add Arrows effect to Paths.
        if (feature.type !== 'point' && feature.path) {
          const feature_path = feature.path instanceof Object ? feature.path : JSON.parse(feature.path);
          if (feature_path['arrowed'] === "1") {
            lFeature.arrowheads();
          }
        }

/*        // Add an event listener on the popup open to dynamically pan to the center.
        lFeature.on('popupopen', function (popup) {
          const zoom = popup.target._map.getZoom();
          const zoom_pow = Math.pow(zoom , 3);
          const lat_addition = zoom < 17 ? 12/zoom_pow: 3/zoom_pow;
          popup.target._map.panTo([popup.target._latlng.lat + lat_addition, popup.target._latlng.lng])
        });*/
      });
    },
    zoomDefaultIconSize: 18,
    hidden_markers: [],


    /**
     * Process all Initial Action.
     *
     * @param mapid
     * @param map
     * @param features
     * @param markers
     * @param markersOriginalSizes
     */
    processInitialActions: function(mapid, map, features, markers, markersOriginalSizes) {
      // Trigger an Initial React on Zoom End function.
      this.markersResizeOnZoomEnd(mapid, map, features, markers, markersOriginalSizes);
      // Ajax Import all Markers Popups.
      this.ajaxImportAllMarkersPopups(markers);
    },

    ajaxImportAllMarkersPopups: function(markers) {
      for (let i in markers) {
        let popup = markers[i].getPopup();
        if (popup) {
          let element = document.createElement('div');
          element.innerHTML = popup._source._popup._content;
          let content = $('[data-leaflet-ajax-popup]', element);
          if (content.length) {
            let url = content.data('leaflet-ajax-popup');
            $.get({'url': url}).done(function (response) {
              popup.setContent(response[2].data);
            })
          }
        }
      }
    },

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
    markersResizeOnZoomEnd: function(mapid, map, features, markers, markersOriginalSizes) {
      let self = this;
      let iconSizeRate = this.getIconSizeRate(map);
      let zoomLevel = map.getZoom();
      for (let i in markers) {
        if (markers.hasOwnProperty(i)) {
          let hidden_marker_index = self.hidden_markers.indexOf(i);
          // Update Icon size, only in case of Points (setStyle undefined),
          if (!markers[i].setStyle) {
            this.updateIconSize(i, markers[i], iconSizeRate, markersOriginalSizes);
          }
          // Set Feature visibility, if properties['min_zoom_visibility'] is set.
          if (features.hasOwnProperty(i) && features[i] && features[i]['properties'] && features[i]['properties'].length > 0) {
            const properties = JSON.parse(features[i]['properties']);
            if (properties['min_zoom_visibility'] && zoomLevel <= properties['min_zoom_visibility']) {
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
    }

  };

})(jQuery, Drupal);
