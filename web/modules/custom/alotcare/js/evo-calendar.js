(function (factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory)
  } else if (typeof exports !== 'undefined') {
    module.exports = factory(require('jquery'))
  } else {
    factory(jQuery)
  }
}(function ($) {
  'use strict';
  var EvoCalendar = window.EvoCalendar || {};
  EvoCalendar = (function () {
    var instanceUid = 0;

    function EvoCalendar(element, settings) {
      var _ = this;
      _.defaults = {
        theme: 'Midnight Blue',
        format: 'mm/dd/yyyy',
        titleFormat: 'MM yyyy',
        eventHeaderFormat: 'MM d, yyyy',
        firstDayOfWeek: 0,
        language: 'en',
        todayHighlight: !0,
        sidebarDisplayDefault: !1,
        sidebarToggler: !0,
        eventDisplayDefault: !0,
        eventListToggler: !1,
        calendarEvents: null,
        actionButton: null
      };
      _.options = $.extend({}, _.defaults, settings);
      _.initials = {
        default_class: $(element)[0].classList.value, validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g, dates: {
          en: {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
          },
          es: {
            days: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
            daysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
            daysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
            months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
            monthsShort: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
          },
          de: {
            days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
            daysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
            months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
            monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
          }
        }
      }
      _.initials.weekends = {
        sun: _.initials.dates[_.options.language].daysShort[0],
        sat: _.initials.dates[_.options.language].daysShort[6]
      }
      if (_.options.calendarEvents != null) {
        for (var i = 0; i < _.options.calendarEvents.length; i++) {
          if (!_.options.calendarEvents[i].id) {
            console.log("%c Event named: \"" + _.options.calendarEvents[i].name + "\" doesn't have a unique ID ", "color:white;font-weight:bold;background-color:#e21d1d;")
          }
          if (_.isValidDate(_.options.calendarEvents[i].date)) {
            _.options.calendarEvents[i].date = _.formatDate(_.options.calendarEvents[i].date, _.options.format)
          }
        }
      }
      _.startingDay = null;
      _.monthLength = null;
      _.$current = {
        month: (isNaN(this.month) || this.month == null) ? new Date().getMonth() : this.month,
        year: (isNaN(this.year) || this.year == null) ? new Date().getFullYear() : this.year,
        date: _.formatDate(_.initials.dates[_.defaults.language].months[new Date().getMonth()] + ' ' + new Date().getDate() + ' ' + new Date().getFullYear(), _.options.format)
      }
      _.$active = {
        month: _.$current.month,
        year: _.$current.year,
        date: _.$current.date,
        event_date: _.$current.date,
        events: []
      }
      _.$label = {
        days: [],
        months: _.initials.dates[_.defaults.language].months,
        days_in_month: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
      }
      _.$markups = {calendarHTML: '', mainHTML: '', sidebarHTML: '', eventHTML: ''}
      _.$elements = {
        calendarEl: $(element),
        innerEl: null,
        sidebarEl: null,
        eventEl: null,
        sidebarToggler: null,
        eventListToggler: null,
        activeDayEl: null,
        activeMonthEl: null,
        activeYearEl: null
      }
      _.$breakpoints = {tablet: 768, mobile: 425}
      _.formatDate = $.proxy(_.formatDate, _);
      _.selectDate = $.proxy(_.selectDate, _);
      _.selectMonth = $.proxy(_.selectMonth, _);
      _.selectYear = $.proxy(_.selectYear, _);
      _.selectEvent = $.proxy(_.selectEvent, _);
      _.toggleSidebar = $.proxy(_.toggleSidebar, _);
      _.toggleEventList = $.proxy(_.toggleEventList, _);
      _.instanceUid = instanceUid++;
      _.init(!0)
    }

    return EvoCalendar
  }());
  EvoCalendar.prototype.init = function (init) {
    var _ = this;
    var windowW = $(window).width();
    if (!$(_.$elements.calendarEl).hasClass('calendar-initialized')) {
      $(_.$elements.calendarEl).addClass('evo-calendar calendar-initialized');
      if (windowW <= _.$breakpoints.tablet) {
        $(_.$elements.calendarEl).addClass('sidebar-hide event-hide')
      } else {
        if (!_.options.sidebarDisplayDefault) $(_.$elements.calendarEl).addClass('sidebar-hide');
        if (!_.options.eventDisplayDefault) $(_.$elements.calendarEl).addClass('event-hide')
      }
      if (_.options.theme) _.setTheme(_.options.theme);
      _.buildTheBones()
    }
  };
  EvoCalendar.prototype.destroy = function () {
    var _ = this;
    _.destroyEventListener();
    if (_.$elements.calendarEl) {
      _.$elements.calendarEl.removeClass('calendar-initialized');
      _.$elements.calendarEl.removeClass('evo-calendar');
      _.$elements.calendarEl.removeClass('sidebar-hide');
      _.$elements.calendarEl.removeClass('event-hide')
    }
    _.$elements.calendarEl.empty();
    _.$elements.calendarEl.attr('class', _.initials.default_class);
    $(_.$elements.calendarEl).trigger("destroy", [_])
  }
  EvoCalendar.prototype.limitTitle = function (title, limit) {
    var newTitle = [];
    limit = limit === undefined ? 18 : limit;
    if ((title).split(' ').join('').length > limit) {
      var t = title.split(' ');
      for (var i = 0; i < t.length; i++) {
        if (t[i].length + newTitle.join('').length <= limit) {
          newTitle.push(t[i])
        }
      }
      return newTitle.join(' ') + '...'
    }
    return title
  }
  EvoCalendar.prototype.parseFormat = function (format) {
    var _ = this;
    if (typeof format.toValue === 'function' && typeof format.toDisplay === 'function')
      return format;
    var separators = format.replace(_.initials.validParts, '\0').split('\0'),
      parts = format.match(_.initials.validParts);
    if (!separators || !separators.length || !parts || parts.length === 0) {
      console.log("%c Invalid date format ", "color:white;font-weight:bold;background-color:#e21d1d;")
    }
    return {separators: separators, parts: parts}
  };
  EvoCalendar.prototype.formatDate = function (date, format, language) {
    var _ = this;
    if (!date)
      return '';
    language = language ? language : _.defaults.language
    if (typeof format === 'string')
      format = _.parseFormat(format);
    if (format.toDisplay)
      return format.toDisplay(date, format, language);
    var ndate = new Date(date);
    var val = {
      d: ndate.getDate(),
      D: _.initials.dates[language].daysShort[ndate.getDay()],
      DD: _.initials.dates[language].days[ndate.getDay()],
      m: ndate.getMonth() + 1,
      M: _.initials.dates[language].monthsShort[ndate.getMonth()],
      MM: _.initials.dates[language].months[ndate.getMonth()],
      yy: ndate.getFullYear().toString().substring(2),
      yyyy: ndate.getFullYear()
    };
    val.dd = (val.d < 10 ? '0' : '') + val.d;
    val.mm = (val.m < 10 ? '0' : '') + val.m;
    date = [];
    var seps = $.extend([], format.separators);
    for (var i = 0, cnt = format.parts.length; i <= cnt; i++) {
      if (seps.length)
        date.push(seps.shift());
      date.push(val[format.parts[i]])
    }
    return date.join('')
  };
  EvoCalendar.prototype.setTheme = function (themeName) {
    var _ = this;
    var prevTheme = _.options.theme;
    _.options.theme = themeName.toLowerCase().split(' ').join('-');
    if (_.options.theme) $(_.$elements.calendarEl).removeClass(prevTheme);
    if (_.options.theme !== 'default') $(_.$elements.calendarEl).addClass(_.options.theme)
  }
  EvoCalendar.prototype.resize = function () {
    var _ = this;
    var hasSidebar = !_.$elements.calendarEl.hasClass('sidebar-hide');
    var hasEvent = !_.$elements.calendarEl.hasClass('event-hide');
    var windowW = $(window).width();
    if (windowW <= _.$breakpoints.tablet && windowW > _.$breakpoints.mobile) {
      if (hasSidebar) _.toggleSidebar();
      if (hasEvent) _.toggleEventList();
      $(window).off('click.evocalendar.evo-' + _.instanceUid).on('click.evocalendar.evo-' + _.instanceUid, $.proxy(_.toggleOutside, _))
    } else if (windowW <= _.$breakpoints.mobile) {
      if (hasSidebar) _.toggleSidebar(!1);
      if (hasEvent) _.toggleEventList(!1);
      $(window).off('click.evocalendar.evo-' + _.instanceUid)
    } else {
      $(window).off('click.evocalendar.evo-' + _.instanceUid)
    }
  }
  EvoCalendar.prototype.initEventListener = function () {
    var _ = this;
    $(window).off('resize.evocalendar.evo-' + _.instanceUid).on('resize.evocalendar.evo-' + _.instanceUid, $.proxy(_.resize, _));
    if (_.options.sidebarToggler) {
      _.$elements.sidebarToggler.off('click.evocalendar').on('click.evocalendar', _.toggleSidebar)
    }
    if (_.options.eventListToggler) {
      _.$elements.eventListToggler.off('click.evocalendar').on('click.evocalendar', _.toggleEventList)
    }
    _.$elements.sidebarEl.find('[data-month-val]').off('click.evocalendar').on('click.evocalendar', _.selectMonth);
    _.$elements.sidebarEl.find('[data-year-val]').off('click.evocalendar').on('click.evocalendar', _.selectYear);
    _.$elements.eventEl.find('[data-event-index]').off('click.evocalendar').on('click.evocalendar', _.selectEvent)
  };
  EvoCalendar.prototype.destroyEventListener = function () {
    var _ = this;
    $(window).off('resize.evocalendar.evo-' + _.instanceUid);
    $(window).off('click.evocalendar.evo-' + _.instanceUid);
    if (_.options.sidebarToggler) {
      _.$elements.sidebarToggler.off('click.evocalendar')
    }
    if (_.options.eventListToggler) {
      _.$elements.eventListToggler.off('click.evocalendar')
    }
    _.$elements.innerEl.find('.calendar-day').children().off('click.evocalendar')
    _.$elements.sidebarEl.find('[data-month-val]').off('click.evocalendar');
    _.$elements.sidebarEl.find('[data-year-val]').off('click.evocalendar');
    _.$elements.eventEl.find('[data-event-index]').off('click.evocalendar')
  };
  EvoCalendar.prototype.calculateDays = function () {
    var _ = this, nameDays, weekStart, firstDay;
    _.monthLength = _.$label.days_in_month[_.$active.month];
    if (_.$active.month == 1) {
      if ((_.$active.year % 4 == 0 && _.$active.year % 100 != 0) || _.$active.year % 400 == 0) {
        _.monthLength = 29
      }
    }
    nameDays = _.initials.dates[_.options.language].daysShort;
    weekStart = _.options.firstDayOfWeek;
    while (_.$label.days.length < nameDays.length) {
      if (weekStart == nameDays.length) {
        weekStart = 0
      }
      _.$label.days.push(nameDays[weekStart]);
      weekStart++
    }
    firstDay = new Date(_.$active.year, _.$active.month).getDay() - weekStart;
    _.startingDay = firstDay < 0 ? (_.$label.days.length + firstDay) : firstDay
  }
  EvoCalendar.prototype.buildTheBones = function () {
    var _ = this;
    _.calculateDays();
    if (!_.$elements.calendarEl.html()) {
      var markup;
      markup = '<div class="calendar-sidebar">' + '<div class="calendar-year">' + '<button class="icon-button" role="button" data-year-val="prev" title="Previous year">' + '<span class="chevron-arrow-left"></span>' + '</button>' + '&nbsp;<p></p>&nbsp;' + '<button class="icon-button" role="button" data-year-val="next" title="Next year">' + '<span class="chevron-arrow-right"></span>' + '</button>' + '</div><div class="month-list">' + '<ul class="calendar-months">';
      for (var i = 0; i < _.$label.months.length; i++) {
        markup += '<li class="month" role="button" data-month-val="' + i + '">' + _.initials.dates[_.options.language].months[i] + '</li>'
      }
      markup += '</ul>';
      markup += '</div></div>';
      markup += '<div class="calendar-inner">' + '<table class="calendar-table">' + '<tr><th colspan="7"></th></tr>' + '<tr class="calendar-header">';
      for (var i = 0; i < _.$label.days.length; i++) {
        var headerClass = "calendar-header-day";
        if (_.$label.days[i] === _.initials.weekends.sat || _.$label.days[i] === _.initials.weekends.sun) {
          headerClass += ' --weekend'
        }
        markup += '<td class="' + headerClass + '">' + _.$label.days[i] + '</td>'
      }
      markup += '</tr></table>' + '</div>';
      markup += '<div class="calendar-events">' + '<div class="event-header"><p></p></div>';
      markup += '<div class="event-list"></div>' + '</div>';
      _.$elements.calendarEl.html(markup);
      if (!_.$elements.sidebarEl) _.$elements.sidebarEl = $(_.$elements.calendarEl).find('.calendar-sidebar');
      if (!_.$elements.innerEl) _.$elements.innerEl = $(_.$elements.calendarEl).find('.calendar-inner');
      if (!_.$elements.eventEl) _.$elements.eventEl = $(_.$elements.calendarEl).find('.calendar-events');
      if (_.options.sidebarToggler) {
        $(_.$elements.sidebarEl).append('<span id="sidebarToggler" role="button" aria-pressed title="Close sidebar"><button class="icon-button"><span class="bars"></span></button></span>');
        if (!_.$elements.sidebarToggler) _.$elements.sidebarToggler = $(_.$elements.sidebarEl).find('span#sidebarToggler')
      }
      if (_.options.eventListToggler) {
        $(_.$elements.calendarEl).append('<span id="eventListToggler" role="button" aria-pressed title="Close event list"><button class="icon-button"><span class="chevron-arrow-right"></span></button></span>');
        if (!_.$elements.eventListToggler) _.$elements.eventListToggler = $(_.$elements.calendarEl).find('span#eventListToggler')
      }
    }
    _.buildSidebarYear();
    _.buildSidebarMonths();
    _.buildCalendar();
    _.buildEventList();
    _.initEventListener();
    _.resize()
  }
  EvoCalendar.prototype.buildEventList = function () {
    var _ = this, hasEventToday = !1;
    _.$active.events = [];
    var title = _.formatDate(_.$active.date, _.options.eventHeaderFormat, _.options.language);
    _.$elements.eventEl.find('.event-header > p').text(title);
    var eventListEl = _.$elements.eventEl.find('.event-list');
    if (eventListEl.children().length > 0) eventListEl.empty();
    if (_.options.calendarEvents) {
      for (var i = 0; i < _.options.calendarEvents.length; i++) {
        if (_.$active.date === _.options.calendarEvents[i].date) {
          hasEventToday = !0;
          _.addEventList(_.options.calendarEvents[i])
        } else if (_.options.calendarEvents[i].everyYear) {
          var d = _.formatDate(_.$active.date, 'mm/dd');
          var dd = _.formatDate(_.options.calendarEvents[i].date, 'mm/dd');
          if (d == dd) {
            hasEventToday = !0;
            _.addEventList(_.options.calendarEvents[i])
          }
        }
      }
    }
    if(_.$active.date >= _.$current.date && _.options.actionButton) {
      eventListEl.prepend(_.options.actionButton);
    }
  }
  EvoCalendar.prototype.addEventList = function (event_data) {
    var _ = this, markup;
    var eventListEl = _.$elements.eventEl.find('.event-list');
    // if (eventListEl.find('[data-event-index]').length === 0) eventListEl.empty();
    _.$active.events.push(event_data);
    var eventClass = event_data.class ? ' ' + event_data.class : '';
    markup = '<div class="event-container' + eventClass + '" role="button" data-event-index="' + (event_data.id) + '">';
    markup += '<div class="event-icon"><div class="event-bullet-' + event_data.type + '"></div></div>';
    markup += '<div class="event-info"><p>' + _.limitTitle(event_data.name) + '</p></div>';
    markup += '</div>';
    eventListEl.append(markup);
    _.$elements.eventEl.find('[data-event-index="' + (event_data.id) + '"]').off('click.evocalendar').on('click.evocalendar', _.selectEvent);
  }
  EvoCalendar.prototype.removeEventList = function (event_data) {
    var _ = this, markup;
    var eventListEl = _.$elements.eventEl.find('.event-list');
    if (eventListEl.find('[data-event-index="' + event_data + '"]').length === 0) return;
    eventListEl.find('[data-event-index="' + event_data + '"]').remove();
    if (eventListEl.find('[data-event-index]').length === 0) {
      eventListEl.empty();
      if(_.$active.date >= _.$current.date && _.options.actionButton) {
        eventListEl.prepend(_.options.actionButton);
      }
    }
  }
  EvoCalendar.prototype.buildSidebarYear = function () {
    var _ = this;
    _.$elements.sidebarEl.find('.calendar-year > p').text(_.$active.year)
  }
  EvoCalendar.prototype.buildSidebarMonths = function () {
    var _ = this;
    _.$elements.sidebarEl.find('.calendar-months > [data-month-val]').removeClass('active-month');
    _.$elements.sidebarEl.find('.calendar-months > [data-month-val="' + _.$active.month + '"]').addClass('active-month')
  }
  EvoCalendar.prototype.buildCalendar = function () {
    var _ = this, markup, title;
    _.calculateDays();
    title = _.formatDate(new Date(_.$label.months[_.$active.month] + ' 1 ' + _.$active.year), _.options.titleFormat, _.options.language);
    _.$elements.innerEl.find('.calendar-table th').text(title);
    _.$elements.innerEl.find('.calendar-body').remove();
    markup += '<tr class="calendar-body">';
    var day = 1;
    for (var i = 0; i < 9; i++) {
      for (var j = 0; j < _.$label.days.length; j++) {
        if (day <= _.monthLength && (i > 0 || j >= _.startingDay)) {
          var dayClass = "calendar-day";
          if (_.$label.days[j] === _.initials.weekends.sat || _.$label.days[j] === _.initials.weekends.sun) {
            dayClass += ' --weekend'
          }
          markup += '<td class="' + dayClass + '">';
          var thisDay = _.formatDate(_.$label.months[_.$active.month] + ' ' + day + ' ' + _.$active.year, _.options.format);
          markup += '<div class="day" role="button" data-date-val="' + thisDay + '">' + day + '</div>';
          day++
        } else {
          markup += '<td>'
        }
        markup += '</td>'
      }
      if (day > _.monthLength) {
        break
      } else {
        markup += '</tr><tr class="calendar-body">'
      }
    }
    markup += '</tr>';
    _.$elements.innerEl.find('.calendar-table').append(markup);
    if (_.options.todayHighlight) {
      _.$elements.innerEl.find("[data-date-val='" + _.$current.date + "']").addClass('calendar-today')
    }
    _.$elements.innerEl.find('.calendar-day').children().off('click.evocalendar').on('click.evocalendar', _.selectDate)
    var selectedDate = _.$elements.innerEl.find("[data-date-val='" + _.$active.date + "']");
    if (selectedDate) {
      _.$elements.innerEl.children().removeClass('calendar-active');
      selectedDate.addClass('calendar-active')
    }
    if (_.options.calendarEvents != null) {
      _.buildEventIndicator()
    }
  };
  EvoCalendar.prototype.addEventIndicator = function (active_date, type) {
    var _ = this, htmlToAppend, thisDate = _.$elements.innerEl.find('[data-date-val="' + active_date + '"]');
    if (thisDate.find('span.event-indicator').length === 0) {
      thisDate.append('<span class="event-indicator"></span>')
    }
    if (thisDate.find('span.event-indicator > .type-bullet > .type-' + type).length === 0) {
      htmlToAppend = '<div class="type-bullet"><div class="type-' + type + '"></div></div>';
      thisDate.find('.event-indicator').append(htmlToAppend)
    }
  }
  EvoCalendar.prototype.removeEventIndicator = function (active_date, type) {
    var _ = this;
    var eventLength = 0;
    if (_.$elements.innerEl.find('[data-date-val="' + active_date + '"] span.event-indicator').length === 0) {
      return
    }
    for (var i = 0; i < _.options.calendarEvents.length; i++) {
      if (active_date === _.options.calendarEvents[i].date && type === _.options.calendarEvents[i].type) {
        eventLength++
      }
    }
    if (eventLength === 0) {
      _.$elements.innerEl.find('[data-date-val="' + active_date + '"] span.event-indicator > .type-bullet > .type-' + type).parent().remove()
    }
  }
  EvoCalendar.prototype.buildEventIndicator = function () {
    var _ = this;
    _.$elements.innerEl.find('.calendar-day > day > .event-indicator').empty();
    for (var i = 0; i < _.options.calendarEvents.length; i++) {
      for (var x = 0; x < _.monthLength; x++) {
        var active_date = _.formatDate(_.$label.months[_.$active.month] + ' ' + (x + 1) + ' ' + _.$active.year, _.options.format);
        if (active_date == _.options.calendarEvents[i].date) {
          _.addEventIndicator(active_date, _.options.calendarEvents[i].type)
        } else if (_.options.calendarEvents[i].everyYear) {
          var d = _.formatDate(active_date, 'mm/dd');
          var dd = _.formatDate(_.options.calendarEvents[i].date, 'mm/dd');
          if (d == dd) {
            _.addEventIndicator(active_date, _.options.calendarEvents[i].type)
          }
        }
      }
    }
  };
  EvoCalendar.prototype.selectEvent = function (event) {
    var _ = this;
    var el = $(event.target).closest('.event-container');
    var id = $(el).data('eventIndex').toString();
    var index = _.options.calendarEvents.map(function (event) {
      return event.id.toString();
    }).indexOf(id);
    $(_.$elements.calendarEl).trigger("selectEvent", [_.options.calendarEvents[index]])
  }
  EvoCalendar.prototype.selectYear = function (event) {
    var _ = this;
    var el, yearVal;
    var windowW = $(window).width();
    var hasSidebar = !_.$elements.calendarEl.hasClass('sidebar-hide');
    if (typeof event === 'string' || typeof event === 'number') {
      if ((parseInt(event)).toString().length === 4) {
        yearVal = parseInt(event)
      }
    } else {
      el = $(event.target).closest('[data-year-val]');
      yearVal = $(el).data('yearVal')
    }
    if (yearVal == "prev") {
      --_.$active.year
    } else if (yearVal == "next") {
      ++_.$active.year
    } else if (typeof yearVal === 'number') {
      _.$active.year = yearVal
    }
    if (windowW <= _.$breakpoints.mobile) {
      if (hasSidebar) _.toggleSidebar(!1)
    }
    _.buildSidebarYear();
    _.buildCalendar()
  };
  EvoCalendar.prototype.selectMonth = function (event) {
    var _ = this;
    var windowW = $(window).width();
    var hasSidebar = !_.$elements.calendarEl.hasClass('sidebar-hide');
    if (typeof event === 'string' || typeof event === 'number') {
      if (event >= 0 && event <= _.$label.months.length) {
        _.$active.month = (event).toString()
      }
    } else {
      _.$active.month = $(event.currentTarget).data('monthVal')
    }
    if (windowW <= _.$breakpoints.tablet) {
      if (hasSidebar) _.toggleSidebar(!1)
    }
    _.buildSidebarMonths();
    _.buildCalendar()
  };
  EvoCalendar.prototype.selectDate = function (event) {
    var _ = this;
    var oldDate = _.$active.date;
    var date, year, month, activeDayEl, isSameDate;
    if (typeof event === 'string' || typeof event === 'number' || event instanceof Date) {
      date = _.formatDate(new Date(event), _.options.format)
      year = new Date(date).getFullYear();
      month = new Date(date).getMonth();
      if (_.$active.year !== year) _.selectYear(year);
      if (_.$active.month !== month) _.selectMonth(month);
      activeDayEl = _.$elements.innerEl.find("[data-date-val='" + date + "']")
    } else {
      activeDayEl = $(event.currentTarget);
      date = activeDayEl.data('dateVal')
    }
    isSameDate = _.$active.date === date;
    _.$active.date = date;
    _.$active.event_date = date;
    _.$elements.innerEl.find('[data-date-val]').removeClass('calendar-active');
    activeDayEl.addClass('calendar-active');
    if (!isSameDate) _.buildEventList();
    $(_.$elements.calendarEl).trigger("selectDate", [_.$active.date, oldDate])
  };
  EvoCalendar.prototype.getActiveDate = function () {
    var _ = this;
    return _.$active.date
  }
  EvoCalendar.prototype.getActiveEvents = function () {
    var _ = this;
    return _.$active.events
  }
  EvoCalendar.prototype.toggleOutside = function (event) {
    var _ = this, hasSidebar, hasEvent, isInnerClicked;
    hasSidebar = !_.$elements.calendarEl.hasClass('sidebar-hide');
    hasEvent = !_.$elements.calendarEl.hasClass('event-hide');
    isInnerClicked = event.target === _.$elements.innerEl[0];
    if (hasSidebar && isInnerClicked) _.toggleSidebar(!1);
    if (hasEvent && isInnerClicked) _.toggleEventList(!1)
  }
  EvoCalendar.prototype.toggleSidebar = function (event) {
    var _ = this, hasSidebar, hasEvent, windowW;
    windowW = $(window).width();
    if (event === undefined || event.originalEvent) {
      $(_.$elements.calendarEl).toggleClass('sidebar-hide')
    } else {
      if (event) {
        $(_.$elements.calendarEl).removeClass('sidebar-hide')
      } else {
        $(_.$elements.calendarEl).addClass('sidebar-hide')
      }
    }
    if (windowW <= _.$breakpoints.tablet && windowW > _.$breakpoints.mobile) {
      hasSidebar = !_.$elements.calendarEl.hasClass('sidebar-hide');
      hasEvent = !_.$elements.calendarEl.hasClass('event-hide');
      if (hasSidebar && hasEvent) _.toggleEventList()
    }
  };
  EvoCalendar.prototype.toggleEventList = function (event) {
    var _ = this, hasSidebar, hasEvent, windowW;
    windowW = $(window).width();
    if (event === undefined || event.originalEvent) {
      $(_.$elements.calendarEl).toggleClass('event-hide')
    } else {
      if (event) {
        $(_.$elements.calendarEl).removeClass('event-hide')
      } else {
        $(_.$elements.calendarEl).addClass('event-hide')
      }
    }
    if (windowW <= _.$breakpoints.tablet && windowW > _.$breakpoints.mobile) {
      hasEvent = !_.$elements.calendarEl.hasClass('event-hide');
      hasSidebar = !_.$elements.calendarEl.hasClass('sidebar-hide');
      if (hasEvent && hasSidebar) _.toggleSidebar()
    }
  };
  EvoCalendar.prototype.addCalendarEvent = function (arr) {
    var _ = this;

    function addEvent(data) {
      if (!data.id) {
        console.log("%c Event named: \"" + data.name + "\" doesn't have a unique ID ", "color:white;font-weight:bold;background-color:#e21d1d;")
      }
      if (_.isValidDate(data.date)) {
        data.date = _.formatDate(new Date(data.date), _.options.format);
        if (!_.options.calendarEvents) _.options.calendarEvents = [];
        _.options.calendarEvents.push(data);
        _.addEventIndicator(data.date, data.type);
        if (_.$active.event_date === data.date) _.addEventList(data);
        _.$elements.innerEl.find("[data-date-val='" + data.date + "']")
      } else {
        console.log("%c Event named: \"" + data.name + "\" has invalid date ", "color:white;font-weight:bold;background-color:#e21d1d;")
      }
    }

    if (arr instanceof Array) {
      for (var i = 0; i < arr.length; i++) {
        addEvent(arr[i])
      }
    } else if (typeof arr === 'object') {
      addEvent(arr)
    }
  };
  EvoCalendar.prototype.removeCalendarEvent = function (arr) {
    var _ = this;

    function deleteEvent(data) {
      var index = _.options.calendarEvents.map(function (event) {
        return event.id
      }).indexOf(data);
      if (index >= 0) {
        var active_date = _.options.calendarEvents[index].date;
        var type = _.options.calendarEvents[index].type;
        _.options.calendarEvents.splice(index, 1);
        _.removeEventList(data);
        _.removeEventIndicator(active_date, type)
      } else {
        console.log("%c " + data + ": ID not found ", "color:white;font-weight:bold;background-color:#e21d1d;")
      }
    }

    if (arr instanceof Array) {
      for (var i = 0; i < arr.length; i++) {
        deleteEvent(arr[i])
      }
    } else {
      deleteEvent(arr)
    }
  };
  EvoCalendar.prototype.isValidDate = function (d) {
    return new Date(d) && !isNaN(new Date(d).getTime())
  }
  $.fn.evoCalendar = function () {
    var _ = this, opt = arguments[0], args = Array.prototype.slice.call(arguments, 1), l = _.length, i, ret;
    for (i = 0; i < l; i++) {
      if (typeof opt == 'object' || typeof opt == 'undefined')
        _[i].evoCalendar = new EvoCalendar(_[i], opt); else ret = _[i].evoCalendar[opt].apply(_[i].evoCalendar, args);
      if (typeof ret != 'undefined') return ret
    }
    return _
  }
}))
