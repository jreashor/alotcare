<?php
namespace Drupal\alotcare\Normalizer;

use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\TypedData\TypedDataInternalPropertiesHelper;
use Drupal\serialization\Normalizer\NormalizerBase;

/**
 * Normalize data to exclude Drupal's [0]['value'].
 *
 * @see \Drupal\jsonapi\Normalizer\FieldItemNormalizer
 */
class FieldItemNormalizer extends NormalizerBase {

  /**
   * {@inheritdoc}
   */
  protected $supportedInterfaceOrClass = FieldItemInterface::class;

  /**
   * {@inheritdoc}
   */
  public function normalize($field_item, $format = NULL, array $context = []) {
    $values = [];
    if (!empty($field_item->getProperties(TRUE))) {
      // We normalize each individual value, so each can do their own casting,
      // if needed.
      $field_properties = TypedDataInternalPropertiesHelper::getNonInternalProperties($field_item);
      foreach ($field_properties as $property_name => $property) {
        $values[$property_name] = $this->serializer->normalize($property, $format, $context);
      }
      // Flatten if there is only a single property to normalize.
      $flatten = count($field_properties) === 1 && $field_item::mainPropertyName() !== NULL;
      $values = static::rasterizeValueRecursive($flatten ? reset($values) : $values);
    }
    else {
      $values = $field_item->getValue();
    }

    return $values;
  }

  /**
   * Rasterizes a value recursively.
   *
   * @param mixed $value
   *   Either a scalar, an array or a rasterizable object.
   *
   * @return mixed
   *   The rasterized value.
   */
  protected static function rasterizeValueRecursive($value) {
    if (!$value || is_scalar($value)) {
      return $value;
    }

    if (is_array($value)) {
      $output = [];
      foreach ($value as $key => $item) {
        $output[$key] = static::rasterizeValueRecursive($item);
      }

      return $output;
    }

    // If the object can be turned into a string it's better than nothing.
    if (method_exists($value, '__toString')) {
      return $value->__toString();
    }

    // We give up, since we do not know how to rasterize this.
    return NULL;
  }
}
