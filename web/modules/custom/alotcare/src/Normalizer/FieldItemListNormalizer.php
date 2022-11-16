<?php

namespace Drupal\alotcare\Normalizer;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\serialization\Normalizer\NormalizerBase;

/**
 * Convert fields to an array.
 */
class FieldItemListNormalizer extends NormalizerBase {

  /**
   * {@inheritdoc}
   */
  protected $supportedInterfaceOrClass = FieldItemListInterface::class;

  /**
   * {@inheritdoc}
   */
  public function normalize($field, $format = NULL, array $context = []) {
    /** @var \Drupal\Core\Field\FieldItemListInterface $field */
    if (!$field->isEmpty()) {
      $normalizer_items = [];
      foreach ($field as $field_item) {
        /** @var \Drupal\Core\Field\FieldItemListInterface $field_item */
        $normalizer_items[] = $this->serializer->normalize($field_item, $format, $context);
      }
      $normalizer_items = !$field->getFieldDefinition()->getFieldStorageDefinition()->isMultiple() ? $normalizer_items[0] : $normalizer_items;
    }

    return $normalizer_items ?? '';
  }
}
