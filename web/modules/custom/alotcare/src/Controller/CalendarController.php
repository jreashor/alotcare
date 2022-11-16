<?php

namespace Drupal\alotcare\Controller;

use Drupal\alotcare\Availability;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\NodeInterface;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns responses for AlotCare routes.
 */
class CalendarController extends ControllerBase {

  /**
   * The alotcare.availability service.
   *
   * @var \Drupal\alotcare\Availability
   */
  protected Availability $availability;

  /**
   * The controller constructor.
   *
   * @param \Drupal\alotcare\Availability $availability
   *   The alotcare.availability service.
   */
  public function __construct(Availability $availability) {
    $this->availability = $availability;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('alotcare.availability')
    );
  }

  /**
   * Builds the response.
   */
  public function shifts() {
    /** @var \Drupal\user\Entity\User $user */
    $user = User::load($this->currentUser()->id());

    $node_storage = $this->entityTypeManager()->getStorage('node');
    $query = $node_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('status', NodeInterface::PUBLISHED)
      ->condition('type', 'shift');

    // Load shifts for the facility only.
    if ($user->hasRole('facility')) {
      if ($user->hasField('field_facility') && !$user->field_facility->isEmpty()) {
        $query->condition('field_facility.target_id', $user->field_facility->entity->tid->value);
      }
    }

    // For Staff, load shifts that are assigned to the current user as well as
    // open ones.
    if ($user->hasRole('staff')) {
      $group = $query->orConditionGroup()
        ->condition('field_assigned_to.target_id', $this->currentUser()->id())
        ->condition('field_assigned_to.target_id', NULL, 'IS NULL');
      $query->condition($group);
    }

    $events = [];
    $results = $query->execute();
    if ($results) {
      $shifts = $node_storage->loadMultiple($results);
      $unsorted_events = [];
      /** @var \Drupal\node\Entity\Node $shift */
      foreach ($shifts as $shift) {
        if (!$shift->field_date->isEmpty() && !$shift->field_shift_type->isEmpty()) {
          /** @var \Drupal\taxonomy\Entity\Term $shift_type_term */
          $shift_type_term = $shift->field_shift_type->entity;

          $unsorted_events[$shift_type_term->getWeight()][] = [
            'id' => $shift->id(),
            'name' => $shift->getTitle(),
            'type' => $shift_type_term->machine_name->value,
            'date' =>  date('m/d/Y', strtotime($shift->field_date->value)),
          ];
        }
      }

      ksort($unsorted_events);
      foreach ($unsorted_events as $events_by_type_weight) {
        $events = array_merge($events, $events_by_type_weight);
      }
    }

    $build['calendar_shifts'] = [
      '#type' => 'evo_calendar',
      '#data' => [
        'events' => $events,
        'role' => 'facility', // Todo: Or staff
      ],
      '#attached' => [
        'library' => [
          'alotcare/calendar_shifts',
        ],
      ],
    ];

    return $build;
  }

  /**
   *
   *
   * @return array
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function availability() {
    $calendar_events = [];

    $nodes = $this->availability->get();
    if (isset($nodes)) {
      /** @var \Drupal\node\Entity\Node $node */
      foreach ($nodes as $node) {
        if (!$node->field_date->isEmpty() && !$node->field_shift_type->isEmpty()) {
          foreach ($node->field_shift_type as $shift_type) {
            /** @var \Drupal\taxonomy\Entity\Term $shift_type_term */
            $shift_type_term = $shift_type->entity;
            $calendar_events[] = [
              'id' => $node->id() . '-' . $shift_type_term->id(),
              'name' => $node->getTitle() . ' - ' . $shift_type_term->getName(),
              'type' => $shift_type_term->machine_name->value,
              'date' => date('m/d/Y', strtotime($node->field_date->value)),
            ];
          }
        }
      }
    }

    /** @var \Drupal\user\Entity\User $user */
    $user = User::load($this->currentUser()->id());
    $build['calendar_availability'] = [
      '#type' => 'evo_calendar',
      '#data' => [
        'events' => $calendar_events,
        // User will never be both facility and staff.
        'role' => $user->hasRole('staff') ? 'staff' : 'facility',
      ],
      '#attached' => [
        'library' => [
          'alotcare/calendar_availability',
        ],
      ],
    ];

    return $build;
  }

}
