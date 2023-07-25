<?php

namespace Drupal\italo_module\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\entity_reference_revisions\Plugin\Field\FieldFormatter\EntityReferenceRevisionsEntityFormatter;
use Drupal\paragraphs\Entity\Paragraph;

/**
 * Plugin implementation of the 'entity reference rendered entity' formatter.
 *
 * @FieldFormatter(
 *   id = "leaflet_popup_components_entity_view",
 *   label = @Translation("Leaflet Popup Components"),
 *   description = @Translation("Display the Leaflet Popup Components rendered by entity_view()."),
 *   field_types = {
 *     "entity_reference_revisions"
 *   }
 * )
 */
class LeafletPopupComponentsEntityFormatter extends EntityReferenceRevisionsEntityFormatter {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $view_mode = $this->getSetting('view_mode');
    $elements = [];

    $locations_limit_reached = FALSE;
    $images_limit_reached = FALSE;

    foreach ($this->getEntitiesToView($items, $langcode) as $delta => $entity) {
      // Protect ourselves from recursive rendering.
      static $depth = 0;
      $depth++;
      if ($depth > 20) {
        $this->loggerFactory->get('entity')->error(
          'Recursive rendering detected when rendering entity
          @entity_type @entity_id. Aborting rendering.', [
            '@entity_type' => $entity->getEntityTypeId(),
            '@entity_id' => $entity->id(),
          ]);
        return $elements;
      }
      if ($entity instanceof Paragraph &&
        in_array($entity->bundle(), ['image', 'location', 'geoimage'])
      ) {
        if (in_array($entity->bundle(), ['image', 'geoimage'])) {
          if ($images_limit_reached) {
            continue;
          }
          else {
            $images_limit_reached = TRUE;
          }
        }
        if ($entity->bundle() == ['location']) {
          if ($locations_limit_reached) {
            continue;
          }
          else {
            $locations_limit_reached = TRUE;
          }
        }
        $view_builder = \Drupal::entityTypeManager()->getViewBuilder($entity->getEntityTypeId());

        // Set image or geoimage always first in the order.
        if (in_array($entity->bundle(), ['image', 'geoimage'])) {
          array_unshift($elements, $view_builder->view($entity, $view_mode, $entity->language()->getId()));
        }
        else {
          $elements[$delta] = $view_builder->view($entity, $view_mode, $entity->language()
            ->getId());
        }

        // Add a resource attribute to set the mapping property's value to the
        // entity's url. Since we don't know what the markup of the entity will
        // be, we shouldn't rely on it for structured data such as RDFa.
        if (!empty($items[$delta]->_attributes) && !$entity->isNew() && $entity->hasLinkTemplate('canonical')) {
          $items[$delta]->_attributes += ['resource' => $entity->toUrl()->toString()];
        }
        $depth = 0;
      }
      elseif ($locations_limit_reached && $images_limit_reached) {
        break;
      }
    }

    return $elements;
  }

}
