<?php

namespace Drupal\italo_module;

use Drupal\Core\Field\FieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;
use Drupal\node\NodeInterface;

/**
 * Generates a GeoimageStoringFolderFieldItemList.
 */
class GeoimageStoringFolderFieldItemList extends FieldItemList {

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
   * Generate the Value for the Geoimage Caption Field,
   * only for the Geoimage Node Bundle.
   */
  protected function computeValue() {
    if (!$this->isCalculated) {
      $entity = $this->getEntity();
      if ($entity instanceof NodeInterface) {
        switch ($entity->bundle()) {
          case "geoimage":
          case "event":
            $value = 'photo_albums/Taranto_Images';
            break;

          case "territorial_report":
            $value = 'media_geoimage';
            break;

          default:
            $value = '';
        }
        $this->list[0] = $this->createItem(0, $value);
        $this->isCalculated = TRUE;
      }
    }
  }

}
