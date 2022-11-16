/**
 * @file
 * Flexible event calender custom js file.
 */

(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.evoCalendar = {
    attach: function (context, settings) {
      let evoSettings = {};
      if (settings.evoCalendar.role === 'facility') {
        evoSettings = {
          calendarEvents: settings.evoCalendar.events,
          actionButton: '<button type=button class="btn btn-success btn-block" data-toggle="modal" data-target="#addShiftModal" data-backdrop="static" data-keyboard="false"><span class="icon glyphicon glyphicon-plus" aria-hidden="true"></span> Add Shift</button>',
        }
      } else {
        evoSettings = {
          calendarEvents: settings.evoCalendar.events,
          actionButton: '<button type=button class="btn btn-success btn-block" data-toggle="modal" data-target="#shiftActionModal" data-backdrop="static" data-keyboard="false">Availability</button>'
        }
      }
      const $evo = $('#evoCalendar').evoCalendar(evoSettings);

      function modalAlert(modalId, type, message, icon = '') {
        if (icon.length) {
          icon = '<span class="icon glyphicon glyphicon-' + icon + '" aria-hidden="true"></span>&nbsp; &nbsp;';
        }
        $('.modal-alerts', '#' + modalId).append('<div class="alert alert-' + type + ' alert-dismissible text-align-left" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' + icon + message + '</div>');
      }

      $('button[data-dismiss=modal]').on('click', function (event) {
        // Empty alerts.
        $('.modal-alerts').empty();
        // Enable buttons.
        $('.modal button').prop('disabled', false);
      });

      $evo.on('selectDate', function (event, newDate, oldDate) {
        // Open event list on date click.

        $evo.evoCalendar('toggleEventList', true);
      });

      $evo.on('selectEvent', function (event, activeEvent) {
        console.log(window.App);
        window.App.setShiftId(activeEvent.id);
        $('#editShiftModal').modal({ backdrop: 'static', keyboard: false });
        // Todo
        // Apply - Staff
        // Cancel - Staff
        // Edit - Assign, Remove - Facility
        if (settings.evoCalendar.mode === 'facility') {
        } else {
          if (false) {
            // Todo: open cancel shift if applied to
          } else {
            $('#applyToShiftModal').modal({ backdrop: 'static', keyboard: false });
          }
        }
      });

      $('.add-shift:enabled').on('click', function (event, element) {
        let _ = this;
        let modalId = _.parentElement.closest('.modal').id
        let shiftType = _.dataset.shiftType;
        let shiftDate = $evo.evoCalendar('getActiveDate');
        let postData = {
          type: [{ target_id: 'shift' }],
          field_shift_type: [{ target_id: settings.evoCalendar.shiftTypeToId[shiftType], }],
          // Format nice to play with Drupal.
          field_date: [{ value: window.luxon.DateTime.fromFormat(shiftDate, "MM/dd/yyyy").toFormat("yyyy-MM-dd") }]
        };

        // Track enabled buttons to re-enable after AJAX call.
        let $buttons = $('button:enabled').prop('disabled', true);

        // Start spinner.
        let $icon = $('.glyphicon', _).toggleClass('glyphicon-refresh glyphicon-spin');

        $.get(Drupal.url('session/token')).done(function (csrfToken) {
          $.ajax({
            url: Drupal.url('node?_format=json'),
            method: 'POST',
            data: JSON.stringify(postData),
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken
            },
            success: function (node, status, xhr) {
              modalAlert(modalId, 'success', '<strong>' + $(_).text() + '</strong> shift added. Add another or close.', 'ok');
              // Stop spinner.
              $icon.toggleClass('glyphicon-refresh glyphicon-spin');
              // Enable buttons.
              $buttons.prop('disabled', false);
              // Add the event to the calendar.
              $evo.evoCalendar('addCalendarEvent', [{
                class: 'bg-primary',
                id: node.nid,
                name: node.title,
                type: shiftType,
                date: shiftDate,
              }]);
            }
          });
        });
      });

      $('.remove-shift:enabled').on('click', function (event, element) {
        let _ = this;
        let modal = _.parentElement.closest('.modal');
        let eventId = $(modal).data('eventId')
        let postData = {
          type: [{ target_id: 'shift' }],
          status: [{ value: false }],
        };

        // Track enabled buttons to re-enable after AJAX call.
        let $buttons = $('button:enabled').prop('disabled', true);

        // Start spinner.
        let $icon = $('.glyphicon', _).toggleClass('glyphicon-refresh glyphicon-spin');

        $.get(Drupal.url('session/token')).done(function (csrfToken) {
          $.ajax({
            url: Drupal.url('node/' + eventId + '?_format=json'),
            method: 'PATCH',
            data: JSON.stringify(postData),
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': csrfToken
            },
            success: function (node, status, xhr) {
              modalAlert(modal.id, 'success', 'Shift removed.', 'ok');
              // Remove the event from the calendar.
              $evo.evoCalendar('removeCalendarEvent', eventId);
              // Stop spinner.
              $icon.toggleClass('glyphicon-refresh glyphicon-spin');
              // Enable buttons.
              $buttons.not(_).prop('disabled', false);
            },
            error: function () {
              modalAlert(modal.id, 'danger', 'An error occurred. please try again.');
              // Stop spinner.
              $icon.toggleClass('glyphicon-refresh glyphicon-spin');
              // Enable buttons.
              $buttons.prop('disabled', false);
            },
          });
        });
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
