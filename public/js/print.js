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
    </div>
  `;

  function loadEvents() {
    var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "/events";
    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        var loadEvents = JSON.parse(xhr.responseText);
        events = _.uniqBy(loadEvents, function(ev) {
            return ev['name'];
        });
        renderEvents(events);
      }
    };
    xhr.send();
  }

  function renderEvents(loadEvents) {
    var tableEl = jQuery.parseHTML('<table></table>');
    $('#slideshow').append(tableEl);

    var rowEl = jQuery.parseHTML('<tr></tr>');
    var rowContent = false;

    for (var i = 0; i < loadEvents.length - 1; i++) {
      var rowContent = true;
      var tdEl = jQuery.parseHTML('<td></td>');
      var event = loadEvents[i];
      var eventEl = elementFromEvent(event, i);
      $(eventEl).addClass(eventStyles[i % (eventStyles.length)]);
      $(tdEl).append(eventEl);
      $(rowEl).append(tdEl);

      if (i % 2) {
        $(tableEl).append(rowEl);
        rowEl = jQuery.parseHTML('<tr></tr>');
        var rowContent = false;
      }
      eventEls.push(eventEl);
    }

    if (rowContent) {
      $(tableEl).append(rowEl);
    }
  }

  function elementFromEvent(event, index) {
    var el = jQuery.parseHTML(eventTemplate);

    var eventTime = new Date(event.start_datetime);
    var hours = eventTime.getUTCHours();
    var pm = false;
    if (hours > 12 ) {
      pm = true;
      hours = hours - 12;
    }

    var formattedTime = dayNames[eventTime.getUTCDay()]
      + ' ' + monthNames[eventTime.getUTCMonth()]
      + ' ' + eventTime.getUTCDate()
      + ' ' + hours + ':' + ("00" +  eventTime.getUTCMinutes()).slice(-2);

    if (pm) {
      formattedTime += ' PM';
    } else {
      formattedTime += ' AM';
    }

    $(el).find('.card-title')[0].innerHTML = event.name;
    $(el).find('.meeting-time')[0].innerHTML = formattedTime;
    $(el).find('.card-body')[0].innerHTML = event.description;

    return el;
  }



  function reloadPage() {
    location.reload(true);
  }

  loadEvents();
  setTimeout(reloadPage, 600000);



});

