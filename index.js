var express = require('express');
var fs 			= require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/otg/events', function(req, res) {
	var url = 'http://offthegridsf.com/wp-admin/admin-ajax.php?action=otg_events_list';
	request(url, function(error, response, html){
    if (!error) {
      var $ = cheerio.load(html);
			var events = [];
			$('.otg-markets-day').each(function(i, $el){
				var parentIndex = i;
				var $this = $(this);
				var day = $this.find('.otg-markets-dayname').text().replace(/[\(\)]/g, '');
				events[i] = {date: day, markets: []};
				$this.find('.otg-markets-event').each(function(index, $elem){
					var $child = $(this);
					if ($child.find('.otg-markets-event-name').length == 0) {
						return false;
					}
					var name = $child.find('.otg-markets-event-name').text();
					var hours = $child.find('.otg-markets-event-hours').text();
					var id = $child.data('otg-market-id');
					events[parentIndex].markets[index] = {
						id: id,
						name: name,
						hours: hours
					};
				});
			});
			return res.json({events});
    }
  });
});

app.listen('3000');

exports = module.exports = app;
