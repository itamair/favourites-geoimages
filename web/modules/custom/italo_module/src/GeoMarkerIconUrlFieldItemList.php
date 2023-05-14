<?php

namespace Drupal\italo_module;

use Drupal\Core\Field\FieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;
use Drupal\media\MediaInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\file\FileInterface;
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
            $image_style = 'image_map_marker';
            if (!$media instanceof MediaInterface && $entity->field_location_type->entity instanceof ContentEntityInterface) {
              $media = $entity->field_location_type->entity->field_place_type_icon->entity;
            }
            break;
        }

        if (isset($media) && $media instanceof MediaInterface && isset($media->field_media_image) && $media->field_media_image->entity instanceof FileInterface) {
          $value = $this->getImageValue($media->field_media_image->entity, $image_style);
        }
      }
      $this->list[0] = $this->createItem(0, $value);
      $this->isCalculated = TRUE;
    }
  }

  /**
   * Get Image Value from FileInterface and Image Style.
   *
   * @param \Drupal\file\FileInterface $file_entity
   *   The file entity.
   * @param string|null $image_style
   *   The Image Style string.
   *
   * @return array
   *   The Image value array.
   */
  protected function getImageValue(FileInterface $file_entity, ?string $image_style) {
    $image_uri = $file_entity->getFileUri();
    // If there is an image style requested, and it is not an SVG file.
    if (isset($image_style) && strpos($file_entity->getMimeType(), 'svg') === FALSE) {
      $style = ImageStyle::load($image_style);
      $value = \Drupal::service('file_url_generator')
        // Generate Absolute Path to fix the pan of geoimages under their
        // location. Would align to the up-left corner of the image, otherwise.
        ->generateAbsoluteString($style->buildUri($image_uri));
    }
    else {
      $value = \Drupal::service('file_url_generator')
        // Generate Absolute Path to fix the pan of geoimages under their
        // location. Would align to the up-left corner of the image, otherwise.
        ->generateAbsoluteString($image_uri);
    }
    return $value;
  }

}
