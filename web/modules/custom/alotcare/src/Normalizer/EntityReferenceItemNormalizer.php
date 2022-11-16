<?php

namespace Drupal\alotcare\Normalizer;

use Drupal\Core\Field\Plugin\Field\FieldType\EntityReferenceItem;
use Drupal\file\FileInterface;
use Drupal\serialization\Normalizer\NormalizerBase;

/**
 * Convert references to full entities.
 */
class EntityReferenceItemNormalizer extends NormalizerBase {

  /**
   * {@inheritdoc}
   */
  protected $supportedInterfaceOrClass = EntityReferenceItem::class;

  /**
   * {@inheritdoc}
   */
  public function normalize($field_item, $format = NULL, array $context = []) {
    /** @var \Drupal\Core\Field\FieldItemInterface $field_item */
    $target_entity = $field_item->get('entity')->getValue();

    if (!is_null($target_entity) && $target_entity instanceof FileInterface) {
      $normalized = $field_item->getValue();
      $normalized['url'] = $target_entity->createFileUrl(FALSE);
      $normalized['uuid'] = $target_entity->uuid();
    }
    else {
      $normalized = $this->serializer->normalize($target_entity, $format, $context);
    }

    return $normalized;
  }
}
