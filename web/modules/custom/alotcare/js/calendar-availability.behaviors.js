/**
 * @file
 * Flexible event calender custom js file.
 */

(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.evoCalendar = {
    attach: function (context, settings) {
      let evoSettings = {
        eventDisplayDefault: 0,
        calendarEvents: settings.evoCalendar.events,
      };
      const $evo = $('#evoCalendar').evoCalendar(evoSettings);

      $evo.on('selectDate', function (event, newDate, oldDate) {
        window.App.openAvailability();
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
