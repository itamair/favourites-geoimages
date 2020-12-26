(function ($, Drupal) {

  'use strict';

  const zoomDefaultIconSize = 12;

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

  function updateMarkersSizesOnZoom(map, markers, markersOriginalSizes) {
    let iconSizeRate = getIconSizeRate(map);
    for (let i in markers) {
      if (markers.hasOwnProperty(i) && !markers[i].setStyle) {
        updateIconSize(i, markers[i], iconSizeRate, markersOriginalSizes);
      }
    }
  }

// React on leafletMapInit event.
  $(document).on('leafletMapInit', function (e, settings, lMap, mapid) {
    let map = lMap;
    let markers = Drupal.Leaflet[mapid].markers;
    let markersOriginalSizes = setMarkersOriginalSizes(markers);

    updateMarkersSizesOnZoom(map, markers, markersOriginalSizes);

    // Resizing on zoom
    map.on('zoomend', function() {
      updateMarkersSizesOnZoom(map, markers, markersOriginalSizes);
    });
  });

})(jQuery, Drupal);


