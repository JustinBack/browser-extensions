/* global window, $, jQuery, getServiceDetails */

function escapeHTML(unsafe) {
  return (`${unsafe}`)
    .replace(/&(?!amp;)/g, '&amp;')
    .replace(/<(?!lt;)/g, '&lt;')
    .replace(/>(?!gt;)/g, '&gt;')
    .replace(/"(?!quot;)/g, '&quot;')
    .replace(/'(?!#039;)/g, '&#039;');
}

jQuery(() => {
  function tosdrPoint(serviceName, dataPoint) {
    let badge;
    let icon;
    // let sign;
    if (dataPoint) {
      if (dataPoint.tosdr.point === 'good') {
        badge = 'badge-success';
        icon = 'thumbs-up';
        // sign = '+';
      } else if (dataPoint.tosdr.point === 'bad') {
        badge = 'badge-warning';
        icon = 'thumbs-down';
        // sign = '-';
      } else if (dataPoint.tosdr.point === 'blocker') {
        badge = 'badge-important';
        icon = 'remove';
        // sign = '×';
      } else if (dataPoint.tosdr.point === 'neutral') {
        badge = 'badge-neutral';
        icon = 'asterisk';
        // sign = '→';
      } else {
        badge = '';
        icon = 'question-sign';
        // sign = '?';
      }
      const pointText = dataPoint.description || '';

      // Extract links from text
      const taggedText = pointText.split(/(<\/?\w+(?:(?:\s+\w+(?:\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>)/gim);
      $(`#popup-point-${serviceName}-${dataPoint.id}`)
        .append($('<div>', { class: dataPoint.point })
          .append($('<h5>')
            .append($('<span>', { class: `badge ${badge}`, title: escapeHTML(dataPoint.point) })
              .append($('<span>', { class: `glyphicon glyphicon-${icon}` })))
            .append($('<span>').text(` ${dataPoint.title} `))
            .append($('<a>', {
              href: escapeHTML(dataPoint.discussion), target: '_blank', class: 'label context', text: 'Discussion',
            }))));

      $(`#popup-point-${serviceName}-${dataPoint.id}`).append($('<p>'));
      if (taggedText.length > 1) {
        taggedText.forEach((t) => {
          $(`#popup-point-${serviceName}-${dataPoint.id} p`).append(t);
        });
      } else {
        $(`#popup-point-${serviceName}-${dataPoint.id} p`).text(pointText);
      }
    }
  }

  const NOT_RATED_TEXT = "We haven't sufficiently reviewed the terms yet. Please contribute to on Phoenix: edit.tosdr.org";
  const RATING_TEXT = {
    0: NOT_RATED_TEXT,
    false: NOT_RATED_TEXT,
    A: 'The terms of service treat you fairly, respect your rights and follows the best practices.',
    B: 'The terms of services are fair towards the user but they could be improved.',
    C: 'The terms of service are okay but some issues need your consideration.',
    D: 'The terms of service are very uneven or there are some important issues that need your attention.',
    E: 'The terms of service raise very serious concerns.',
  };

  const serviceUrl = window.location.hash.substr(1);
  function updatePopup() {
    $('.loading').show();

    getLiveServiceDetails(serviceUrl).then((service) => {
      if (serviceUrl === 'none') {
        $('#page').empty();
        $('#page').append($('<div>', { class: 'modal-body' })
          .append($('<div>', { class: 'tosdr-rating' })
            .append($('<h4>', { text: 'Not rated, yet.' }))
            .append($('<p>', { text: 'Go to https://edit.tosdr.org to help us review it!', class: 'lbldesc' }))));
      } else {
        $('#service_url').attr('href', `https://beta.tosdr.org/en/service/${service.id}`);

        // Update class
        $('#service_class').addClass(service.class);
        if (service.class !== false) {
          $('#service_class').text(`Class ${service.class}`);
          $('#ratingText').text(RATING_TEXT[service.class]);
        } else {
          $('#service_class').text('No Class Yet');
          $('#service_class').remove();
          $('#ratingText').text(RATING_TEXT[service.class]);
        }

        // Points
        service.points.forEach((p) => {
          $('.tosdr-points').append($('<li>', { id: `popup-point-${service.name}-${p}`, class: 'point' }));
          tosdrPoint(service.name, service.pointsData[p]);
        });

        // links inside of the dataPoints should open in a new window
        $('.tosdr-points a').attr('target', '_blank');

        if (service.links.length > 0) {
          $('#linksList')
            .append($('<h4>', { text: 'Read the Terms' }))
            .append($('<ul>', { class: 'tosback2' }));

          service.links.forEach((d) => {
            $('.tosback2').append($('<li>')
              .append($('<a>', { href: escapeHTML(d.url), target: '_blank', text: d.name })));
          });
        }
      }
      // [x] Button
      $('#closeButton,.close').click(() => {
        window.close();
      });

      $('.loading').hide();
    });
  }

  updatePopup();
});
