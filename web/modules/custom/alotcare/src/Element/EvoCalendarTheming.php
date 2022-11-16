<?php

namespace Drupal\alotcare\Element;

use Drupal\Core\Render\Element\RenderElement;

/**
 * Render element for evo calendar.
 *
 * @RenderElement("evo_calendar")
 */
class EvoCalendarTheming extends RenderElement {

  /**
   * {@inheritdoc}
   */
  public function getInfo() {
    return [
      '#theme' => 'evo_calendar',
      '#data' => [],
      '#pre_render' => [
        [self::class, 'preRenderEvoCalendarTheming'],
      ],
      '#attached' => [
        'library' => [
          'alotcare/evo_calendar',
        ],
      ],
    ];
  }

  /**
   * Element pre render callback.
   */
  public static function preRenderEvoCalendarTheming($element) {
    $shift_type_terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadByProperties([
      'vid' => 'shift_type',
    ]);
    $shift_types = [];
    $shift_type_to_id = [];
    /** @var \Drupal\taxonomy\Entity\Term $shift_type_term */
    // Term machine names map to the calendar types (event, birthday, holiday).
    foreach ($shift_type_terms as $shift_type_term) {
      $shift_types[$shift_type_term->machine_name->value] = $shift_type_term->toArray();
      $shift_type_to_id[$shift_type_term->machine_name->value] = $shift_type_term->id();
    }

    $element['#attached']['drupalSettings']['evoCalendar'] = [
      'events' => $element['#data']['events'],
      'shiftTypes' => $shift_types,
      'shiftTypeToId' => $shift_type_to_id,
      'role' => $element['#data']['role'],
    ];
    return $element;
  }

}
