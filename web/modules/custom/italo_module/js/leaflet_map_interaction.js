(function ($, Drupal) {

  'use strict';

  let markers, features;
  let hidden_markers = [];

  const zoomDefaultIconSize = 18;

  /**
   * Update Icon Size.
   *
   * @param i
   * @param marker
   * @param iconSizeRate
   * @param markersOriginSizes
   */
  function updateIconSize(i, marker, iconSizeRate, markersOriginSizes) {
    let icon = marker.options.icon;
    icon.options.iconSize.x = markersOriginSizes[i].x*iconSizeRate;
    icon.options.iconSize.y = markersOriginSizes[i].y*iconSizeRate;
    icon.options.iconAnchor = new L.Point(icon.options.iconSize.x/2, icon.options.iconSize.y);
    marker.setIcon(icon);
  }

  /**
   * Get IconSizeRate.
   *
   * @param map
   * @returns {number}
   */
  function getIconSizeRate(map) {
    //return Math.exp(Math.sqrt(map.getZoom()));
    return Math.pow(map.getZoom()/zoomDefaultIconSize, 3);
  }

  /**
   * Set MarkersOriginalSizes.
   *
   * @param markers
   * @returns {{}}
   */
  function setMarkersOriginalSizes(markers) {
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
  }

  function reactOnZoomEnd(mapid, map, markers, markersOriginalSizes) {
    let iconSizeRate = getIconSizeRate(map);
    let zoomLevel = map.getZoom();
    for (let i in markers) {
      if (markers.hasOwnProperty(i)) {
        let hidden_marker_index = hidden_markers.indexOf(i);
        // Only in case of Points (setStyle undefined), update Icon size.
        if (!markers[i].setStyle) {
          updateIconSize(i, markers[i], iconSizeRate, markersOriginalSizes);
        }
        if (features.hasOwnProperty(i) && features[i] && features[i]['min_zoom_visibility'] && zoomLevel <= features[i]['min_zoom_visibility']) {
          map.removeLayer(markers[i]);
          if (hidden_marker_index === -1) {
            hidden_markers.push(i);
          }

        }
        else if (markers.hasOwnProperty(i) && hidden_marker_index > -1) {
          markers[i].addTo(map);
          hidden_markers.splice(hidden_marker_index, 1);
        }
      }
    }
  }

// React on leafletMapInit event.
  $(document).on('leafletMapInit', function (e, settings, lMap, mapid) {
    let map = lMap;
    markers = Drupal.Leaflet[mapid].markers;
    features = Drupal.Leaflet[mapid].features;
    let markersOriginalSizes = setMarkersOriginalSizes(markers);

    reactOnZoomEnd(mapid, map, markers, markersOriginalSizes);

    // Resizing on zoom
    map.on('zoomend', function() {
      reactOnZoomEnd(mapid, map, markers, markersOriginalSizes);
    });
  });

})(jQuery, Drupal);


