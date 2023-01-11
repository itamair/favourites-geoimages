<?php

namespace Drupal\italo_module;

use Drupal\Core\Field\FieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;
use Drupal\media\MediaInterface;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\image\Entity\ImageStyle;

/**
 * Generates a GeoMarkerIconUrlFieldItemList.
 */
class GeoMarkerIconUrlFieldItemList extends FieldItemList {

  use ComputedItemListTrait;

  /**
   * Whether the value has been calculated.
   *
   * @var bool
   */
  protected $isCalculated = FALSE;

  /**
   * {@inheritdoc}
   *
   * Generate the Value for the Geo Marker Icon Url Path.
   */
  protected function computeValue() {
    if (!$this->isCalculated) {
      $entity = $this->getEntity();
      $image_style = NULL;
      $value = '';
      if ($entity instanceof ParagraphInterface) {
        $paragraph_type = $entity->bundle();
        switch ($paragraph_type) {
          case "geoimage":
            $media = $entity->field_geoimage->entity;
            $image_style = 'image_map_marker';
            break;

          case "image":
            $media = $entity->field_image->entity;
            $image_style = 'image_map_marker';
            break;

          case "location":
            $media = $entity->field_image->entity;
            if (!$media instanceof MediaInterface) {
              $media = $entity->field_location_type->entity->field_place_type_icon->entity;
            }
            break;
        }

        if (isset($media) && $media instanceof MediaInterface && isset($media->field_media_image)) {
          $image_uri = $media->field_media_image->entity->getFileUri();
          if (isset($image_style)) {
            $style = ImageStyle::load('image_map_marker');
            $value = \Drupal::service('file_url_generator')->generateAbsoluteString($style->buildUri($image_uri));
          }
          else {
            $value = \Drupal::service('file_url_generator')->generateAbsoluteString($image_uri);
          }
        }
      }
      $this->list[0] = $this->createItem(0, $value);
      $this->isCalculated = TRUE;
    }
  }

}
