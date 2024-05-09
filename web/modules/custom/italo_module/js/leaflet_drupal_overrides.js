/**
 * We are overriding the adding features functionality of the Leaflet module.
 */

/**
 * Extend Map Bounds with new lFeature/feature.
 *
 * This overrides the original extend_map_bounds based on the
 * feature boolean property "exclude_from_map_bounds".
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
  } else if (!parseInt(feature_properties.exclude_from_map_bounds) || Object.keys(this.features).length === 0) {
    this.bounds.push(lFeature.getBounds().getSouthWest(), lFeature.getBounds().getNorthEast());
  }
};

/**
 * Add Leaflet Tooltip to the Leaflet Feature.
 *
 * Set the Leaflet Tooltip, with its options,
 * but omit in case of geoimage content type.
 *
 * @param lFeature
 *   The Leaflet Feature
 * @param feature
 *   The Feature coming from Drupal settings.
 */
Drupal.Leaflet.prototype.feature_bind_tooltip = function(lFeature, feature) {
  const feature_properties = feature.hasOwnProperty('properties') ? JSON.parse(feature['properties']) : {};
  if (feature_properties['content_type'] !== "geoimage" && feature.tooltip && feature.tooltip.value.replace(/(<([^>]+)>)/gi, "").trim().length > 0) {
    const tooltip_options = feature.tooltip.options ? JSON.parse(feature.tooltip.options) : {};
    lFeature.bindTooltip(feature.tooltip.value, tooltip_options).openTooltip()
  }
};

(function($, Drupal) {


})(jQuery, Drupal);
