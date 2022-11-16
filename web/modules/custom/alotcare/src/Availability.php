<?php

namespace Drupal\alotcare;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\node\NodeInterface;
use Drupal\user\Entity\User;

/**
 * Availability helper service.
 */
class Availability {

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
   * The staff helper service.
   *
   * @var \Drupal\alotcare\Staff
   */
  protected Staff $staff;

  /**
   * Constructs an Availability object.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The current user.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\alotcare\Staff $staff
   *   The staff helper service.
   */
  public function __construct(AccountInterface $account, EntityTypeManagerInterface $entity_type_manager, Staff $staff) {
    $this->account = $account;
    $this->entityTypeManager = $entity_type_manager;
    $this->staff = $staff;
  }

  /**
   * Get the availability nodes.
   *
   * @param string|null $date
   *   The date to filter the availability by.
   *
   * @return \Drupal\Core\Entity\EntityInterface[]
   *   The availability nodes.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function get(string $date = NULL) {
    $node_storage = $this->entityTypeManager->getStorage('node');
    $query = $node_storage->getQuery()
      ->condition('type', 'availability')
      ->condition('status', NodeInterface::PUBLISHED)
      ->accessCheck(FALSE);
    if ($date) {
      $query->condition('field_date', $date);
    }

    // Todo: Limit number of nodes returned.

    /** @var \Drupal\user\Entity\User $user */
    $user = User::load($this->account->id());

    // For staff users load availability for the current user.
    if ($user->hasRole('staff')) {
      $query->condition('uid', $this->account->id());
    }

    // For facility users load availability for oriented staff.
    if ($user->hasRole('facility')) {
      if ($user->hasField('field_facility') && !$user->field_facility->isEmpty()) {
        // Load staff with the facility set as a preferred facility.
        $facility_id = $user->field_facility->entity->id();
        $oriented_staff_ids = $this->staff->getOriented($facility_id);
        $query->condition('uid', $oriented_staff_ids, 'IN');

        // Only load availability that have a shift type selected.
        $query->condition('field_shift_type', NULL, 'IS NOT NULL');
      }
    }

    $node_ids = $query->execute();
    if ($node_ids) {
      $nodes = $node_storage->loadMultiple($node_ids);
      // Reset array indexes to play nice with JavaScript.
      $nodes = array_values($nodes);
    }
    return $nodes ?? [];
  }

}
