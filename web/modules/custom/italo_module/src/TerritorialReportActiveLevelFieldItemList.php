<?php

namespace Drupal\italo_module;

use Drupal\Core\Field\FieldItemList;
use Drupal\Core\TypedData\ComputedItemListTrait;
use Drupal\node\NodeInterface;

/**
 * Generates a TerritorialReportActiveLevelFieldItemList.
 */
class TerritorialReportActiveLevelFieldItemList extends FieldItemList {

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
      $value = '';
      $entity_bundles = ['territorial_report'];
      if ($entity instanceof NodeInterface && in_array($entity->bundle(), $entity_bundles) && intval($entity->field_active->value)) {
        $value = $entity->field_territorial_reports_type->value;
      }
      $this->list[0] = $this->createItem(0, $value);
      $this->isCalculated = TRUE;
    }
  }

}
