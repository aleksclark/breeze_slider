$( document ).ready(function() {

  function loadEvents() {
    var xhr = new XMLHttpRequest(),
    method = "GET",
    url = "/events";
    xhr.open(method, url, true);
    xhr.onreadystatechange = function () {
      if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        var events = JSON.parse(xhr.responseText);
        renderEvents(events);
      }
    };
    xhr.send();
  }

  function renderEvents(events) {
    for (var i = events.length - 1; i >= 0; i--) {
      var event = events[i];
      $('#slideshow').append(elementFromEvent(event));
    }
  }

  function elementFromEvent(event) {
    var el = document.createElement('li');
    el.innerHTML = event.name;
    $(el).attr('class', 'inactive');
    $(el).css('display', 'none');
    return el;
  }

  function animateElements() {
    var selectedIndex = null;
    var lastIndex = $('li').length - 1;
    $.each($('li'), function(index, el) {
      if ($(el).attr("class") === 'active') {
        selectedIndex = index;
        $(el).attr("class", 'inactive');
      } else {
        $(el).css('display', 'none');
      }
    });

    if (selectedIndex === null || (selectedIndex >= lastIndex)) {
      selectedIndex = 0;
    } else {
      selectedIndex = selectedIndex + 1;
    }
    $($('li')[selectedIndex]).css('display', 'block');
    $($('li')[selectedIndex]).attr("class", 'active');

  }

  loadEvents();

  setInterval(animateElements, 15000);
});

