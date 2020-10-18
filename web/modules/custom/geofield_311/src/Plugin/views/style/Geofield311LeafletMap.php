<?php

namespace Drupal\geofield_311\Plugin\views\style;

use Drupal\leaflet_views\Plugin\views\style\LeafletMap;


/**
 * Style plugin to render a View output as a Leaflet map.
 *
 * @ingroup views_style_plugins
 *
 * Attributes set below end up in the $this->definition[] array.
 *
 * @ViewsStyle(
 *   id = "geofield_311_leaflet_map",
 *   title = @Translation("Geofield 311 Leaflet Map"),
 *   help = @Translation("Displays a View as a Leaflet map, enhanced with Geofield 311."),
 *   display_types = {"normal"},
 *   theme = "leaflet-map"
 * )
 */
class Geofield311LeafletMap extends LeafletMap {
  /**
   * Renders the View.
   */
  public function render() {
    $element = parent::render();
    array_unshift($element["#attached"]["library"],'geofield_311/geofield_311');
    return $element;
  }

}
