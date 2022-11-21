/**
 * We are overriding the adding features functionality of the Leaflet module.
 */

/**
 * Extend Map Bounds with new lFeature/feature.
 *
 * @param lFeature
 *   The Leaflet Feature
 * @param feature
 *   The Feature coming from Drupal settings.
 *   (this parameter should be kept to eventually extend this method with
 *   conditional logics on feature properties)
 */
Drupal.Leaflet.prototype.extend_map_bounds = function(lFeature, feature) {
  const feature_properties = feature.hasOwnProperty('properties') ? JSON.parse(feature['properties']) : {
    exclude_from_map_bounds: false,
  };
  if (feature.type === 'point' && (!parseInt(feature_properties.exclude_from_map_bounds) || Object.keys(this.features).length === 0)) {
    this.bounds.push([feature.lat, feature.lon]);
  } else if (!parseInt(feature_properties.exclude_from_map_bounds || Object.keys(this.features).length === 0)) {
    this.bounds.push(lFeature.getBounds().getSouthWest(), lFeature.getBounds().getNorthEast());
  }
};

(function($, Drupal) {
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
