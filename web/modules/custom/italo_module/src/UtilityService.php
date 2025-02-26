<?php

namespace Drupal\italo_module;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\media_library_importer\MediaLibraryImporterService;
use Drupal\media\MediaInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * Provides an Utility Service class.
 */
class UtilityService {

  use StringTranslationTrait;

  /**
   * Media Library Importer Settings.
   *
   * @var \Drupal\Core\Config\ImmutableConfig
   */
  protected ImmutableConfig $mediaLibraryImporterSettings;

  /**
   * Media Library Importer Service.
   *
   * @var \Drupal\media_library_importer\MediaLibraryImporterService
   */
  protected MediaLibraryImporterService $mediaLibraryImporterService;

  /**
   * Italo Module Utility Service  constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config
   *   A config factory for retrieving required config objects.
   * @param \Drupal\media_library_importer\MediaLibraryImporterService $media_library_importer_service
   *  The Media Library Importer Service.
   */
  public function __construct(
    protected ConfigFactoryInterface      $config,
    protected MediaLibraryImporterService $media_library_importer_service
  ) {
    $this->mediaLibraryImporterSettings = $this->config->get('media_library_importer.settings');
    $this->mediaLibraryImporterService = $media_library_importer_service;
  }

  /**
   * Generate the Project/Event Term Id for the Media Image Url being imported.
   *
   * @param \Drupal\media\MediaInterface $file_url
   *   The File Url path of the Media Image being imported
   *
   * @return int|null
   *   The Term Name Id for the Media being imported
   */
  public function getMediaProjectEventTid(string $file_url): int|null {
    $tid = NULL;
    // Generate the field_project_event term id from the $media image url.
    $parts = explode('/', $file_url);
    $media_folder_name = $parts[count($parts) - 2];

    // Get the Media Library Importer main folder.
    $media_library_importer_configs = \Drupal::configFactory()
      ->get('media_library_importer.settings');
    $media_library_importer_path = $media_library_importer_configs->get('import_folder');
    $media_library_importer_folder = basename($media_library_importer_path);

    // If the Media is nested into a inner folder, generate a new
    // project/event taxonomy term with that name, and assign it to the
    // hosting node.
    if ($media_library_importer_folder && $media_folder_name !== $media_library_importer_folder) {
      $vid = 'project_event';
      try {
        $taxonomy_storage = \Drupal::entityTypeManager()
          ->getStorage('taxonomy_term');
        $terms = $taxonomy_storage->loadByProperties([
          'name' => $media_folder_name,
          'vid' => $vid,
        ]);
        if ($terms) {
          // Only use the first term returned; there should only be one anyways if we do this right.
          $term = reset($terms);
        }
        else {
          $term = Term::create([
            'name' => $media_folder_name,
            'vid' => $vid,
          ]);
          $term->save();
        }
        $tid = $term->id();
      }
      catch (\Exception $e) {
      }
    }
    return $tid;
  }

}
