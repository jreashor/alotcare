<?php

namespace Drupal\alotcare\Controller;

use Drupal\Component\Serialization\Json;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Mail\MailManager;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns responses for AlotCare routes.
 */
class ApiMessageUserController extends ControllerBase {

  /**
   * The plugin.manager.mail service.
   *
   * @var \Drupal\Core\Mail\MailManager
   */
  protected MailManager $mailManager;

  /**
   * The controller constructor.
   *
   * @param \Drupal\Core\Mail\MailManager $mail_manager
   *   The plugin.manager.mail service.
   */
  public function __construct(MailManager $mail_manager) {
    $this->mailManager = $mail_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.mail')
    );
  }

  /**
   * Sends the message.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The response.
   */
  public function send() {
    // Todo: get email for uid.
    $request_body = \Drupal::request()->getContent();
    $data = Json::decode($request_body);
    // Todo: Validate data.
    $user = User::load($data['id']);
    $to = $user->getEmail();
    $params['subject'] = "subject....";
    $params['message'] = $data['message'];
    $langcode = $user->getPreferredLangcode();

    // Todo: Log message.
    $result = $this->mailManager->mail('alotcare', 'message_user', $to, $langcode, $params, NULL, TRUE);
    if ($result['result'] !== TRUE) {
      $b = '';
//      drupal_set_message(t('There was a problem sending your message and it was not sent.'), 'error');
    }
    else {
      $b = '';
//      drupal_set_message(t('Your message has been sent.'));
    }

    return new ModifiedResourceResponse();
  }

}
