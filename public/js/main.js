$( document ).ready(function() {

  var events = [];
  var showingEvent = true;
  var eventIndex = 0;
  var eventEls = [];
  var eventStyles = ['event-1', 'event-2'];

  var monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec',
  ];

  var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

  var eventTemplate = `
    <div class="event">
      <div class="card">
        <div class="card-header">
          <div class="card-title">
          </div>

          <div class="next-meeting">
            Next Meeting:
          </div>

          <div class="meeting-time">
          </div>
        </div>
        <div class="card-body">
        </div>
      </div>
      <div class="logo"></div>
    </div>
  `;

  function loadEvents() {
    var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "/events";
    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        events = JSON.parse(xhr.responseText);
        events = _.sortedUniqBy(events, function(ev) { return ev.name; });
        renderEvents(events);
      }
    };
    xhr.send();
  }

  function renderEvents(events) {
    for (var i = events.length - 1; i >= 0; i--) {
      var event = events[i];
      var eventEl = elementFromEvent(event, i);
      $(eventEl).addClass(eventStyles[i % (eventStyles.length)]);
      $('#slideshow').append(eventEl);
      eventEls.push(eventEl);
    }
    animateElements();
  }

  function elementFromEvent(event, index) {
    var el = jQuery.parseHTML(eventTemplate);

    var eventTime = new Date(event.start_datetime);
    var hours = eventTime.getHours();
    var pm = false;
    if (hours > 12 ) {
      pm = true;
      hours = hours - 12;
    }

    var formattedTime = dayNames[eventTime.getDay()]
      + ' ' + monthNames[eventTime.getMonth()]
      + ' ' + eventTime.getDate()
      + ' ' + hours + ':' + ("00" +  eventTime.getMinutes()).slice(-2);

    if (pm) {
      formattedTime += ' PM';
    } else {
      formattedTime += ' AM';
    }

    $(el).find('.card-title')[0].innerHTML = event.name;
    $(el).find('.meeting-time')[0].innerHTML = formattedTime;
    $(el).find('.card-body')[0].innerHTML = event.description;
    $(el).addClass('inactive');
    $(el).css('display', 'none');
    return el;
  }

  function animateElements() {
    if (showingEvent) {
      $('.event').css('display', 'none');
      $('.event').removeClass('inactive');
      $('.event').removeClass('active');
      $('.invited').addClass('inactive');
      $('.invited').removeClass('active');

      showingEvent = false;

      var selected = eventEls[eventIndex];

      $(selected).css('display', 'flex');
      $(selected).addClass('active');
      eventIndex = eventIndex + 1;
      if (eventIndex > (events.length - 1)) {
        eventIndex = 0;
      }
      setTimeout(animateElements, 15000);
    } else {
      $('.event').addClass('inactive');
      $('.invited').removeClass('inactive');
      $('.invited').addClass('active');
      showingEvent = true;
      setTimeout(animateElements, 5000);
    }

  }

  function reloadPage() {
    location.reload(true);
  }

  loadEvents();
  setTimeout(reloadPage, 600000);



});

