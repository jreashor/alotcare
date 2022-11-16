<?php

namespace Drupal\alotcare\Controller;

use Drupal\alotcare\Availability;
use Drupal\Core\Controller\ControllerBase;
use Drupal\rest\ModifiedResourceResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns responses for AlotCare routes.
 */
class ApiAvailabilityController extends ControllerBase {

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
   * Get the availability.
   *
   * @param string|null $date
   *   An optional date to filter by.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The response.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  public function get(string $date = NULL) {
    return new ModifiedResourceResponse($this->availability->get($date));
  }

}
