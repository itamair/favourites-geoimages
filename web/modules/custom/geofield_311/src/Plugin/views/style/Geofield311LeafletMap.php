<?php

namespace Drupal\geofield_311\Plugin\views\style;

use Drupal\Core\Form\FormStateInterface;
use Drupal\geofield_311\Geofield311SettingsElementsTrait;
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

  use Geofield311SettingsElementsTrait;

  /**
   * {@inheritdoc}
   */
  public function buildOptionsForm(&$form, FormStateInterface $form_state) {
    parent::buildOptionsForm($form,  $form_state);
    $this->getGeofield311AdditionalGeojsonAppLimitSettings($form, $this->options);
  }

  /**
   * {@inheritdoc}
   */
  public function render() {
    $default_settings = $this->getGeofield311AdditionalDefaultSettings();
    $element = parent::render();
    array_unshift($element["#attached"]["library"],'geofield_311/geofield_311');
    $element["#attached"]["drupalSettings"]["leaflet"][$element["#map_id"]]["map"]["geojson_app_limit"]["bounds_zoom_flag"] = $this->options["geojson_app_limit"]["bounds_zoom_flag"] ?? $default_settings['geojson_app_limit']["bounds_zoom_flag"];
    $element["#attached"]["drupalSettings"]["leaflet"][$element["#map_id"]]["map"]["geojson_app_limit"]["bounds_zoom_correction"] = $this->options["geojson_app_limit"]["bounds_zoom_correction"] ?? $default_settings['geojson_app_limit']["bounds_zoom_correction"];
    $element["#attached"]["drupalSettings"]["leaflet"][$element["#map_id"]]["map"]["geojson_app_limit"]["bounds_limit_flag"] = $this->options["geojson_app_limit"]["bounds_limit_flag"] ?? $default_settings['geojson_app_limit']["bounds_limit_flag"];
    $element["#attached"]["drupalSettings"]["leaflet"][$element["#map_id"]]["map"]["geojson_app_limit"]["max_zoom_out"] = $this->options["geojson_app_limit"]["max_zoom_out"] ?? $default_settings['geojson_app_limit']["max_zoom_out"];
    return $element;
  }

}
