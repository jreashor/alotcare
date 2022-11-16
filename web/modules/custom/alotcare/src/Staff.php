<?php

namespace Drupal\alotcare;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * Staff helper service.
 */
class Staff {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected AccountInterface $account;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected EntityTypeManagerInterface $entityTypeManager;

  /**
   * Constructs an Availability object.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The current user.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(AccountInterface $account, EntityTypeManagerInterface $entity_type_manager) {
    $this->account = $account;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * Get the oriented staff for the facility.
   *
   * @param string $facility_id
   *   The facility ID.
   *
   * @return \Drupal\Core\Entity\EntityInterface[]
   *   The availability nodes.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function getOriented(string $facility_id) {
    $user_storage = $this->entityTypeManager->getStorage('user');
    $staff_ids = $user_storage->getQuery()
      ->condition('field_preferred_facilities.entity.field_facility.target_id', $facility_id)
      ->execute();

    // Check if staff are oriented for the facility.
    if ($staff_ids) {
      $staff_users = $user_storage->loadMultiple($staff_ids);
      /** @var \Drupal\user\Entity\User $staff_user */
      $oriented_staff_ids = [];
      foreach ($staff_users as $staff_user) {
        if ($staff_user->hasField('field_preferred_facilities') && !$staff_user->field_preferred_facilities->isEmpty()) {
          /** @var \Drupal\paragraphs\Entity\Paragraph $preferred_facility */
          foreach ($staff_user->field_preferred_facilities as $preferred_facility) {
            if ($preferred_facility->entity->field_facility->target_id == $facility_id && $preferred_facility->entity->field_orientation_complete->value) {
              $oriented_staff_ids[] = $staff_user->id();
            }
          }
        }
      }
    }

    return $oriented_staff_ids ?? [];
  }

}
