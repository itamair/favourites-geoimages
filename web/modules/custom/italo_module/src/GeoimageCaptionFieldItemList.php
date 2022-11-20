<?php

namespace Drupal\italo_module;

use Drupal\Core\Field\FieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;
use Drupal\node\NodeInterface;

/**
 * Generates a GeoimageCaptionFieldItemList.
 */
class GeoimageCaptionFieldItemList extends FieldItemList {

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
      if ($entity instanceof NodeInterface && $entity->bundle() === "geoimage") {
        /** @var \Drupal\node\NodeInterface $enity */
        /** @var \Drupal\user\UserInterface $entity_author */
        $entity_author = $entity->getOwner();
        $forename = $entity_author->field_forename->value;
        $surname = $entity_author->field_surname->value;
        $value = $this->t('<div class="geoimage-caption"><span class="geoimage-title">@title</span> <span class="geoimage-credits">(©Credits: @forename @surname)</span></div>', [
          '@title' => $entity->label(),
          '@forename' => $forename,
          '@surname' => $surname,
        ]);
        // $this->setValue($value);
        $this->list[0] = $this->createItem(0, $value);
        $this->isCalculated = TRUE;
      }
    }
  }

}
