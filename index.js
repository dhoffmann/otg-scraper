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
    } else {
			res.send(404);
		}
  });
});

app.get('/otg/market/:id', function(req, res) {
	var url = 'http://offthegridsf.com/wp-admin/admin-ajax.php?action=otg_market&delta=0&market=' + req.params.id;
	request(url, function(error, response, html){
		if (!error) {
			var $ = cheerio.load(html);
			var market = {};
			market.name = $('.otg-market-data-name').text();
			market.addr = $('.otg-market-data-address a').text();
			market.events = [];
			$('.otg-market-data-vendors').each(function(i, el){
				var $this = $(this);
				var date = $this.prev().text();
				var vendors = [];
				$this.find('.otg-markets-data-vendor-name').each(function(index, elem){
					var name = $(this).text().replace(/.\(.*?\)/g, '');
					vendors[index] = name;
				});
				market.events[i] = {
					date: date,
					vendors: vendors
				}
			});
			res.json(market);
		} else {
			res.send(404);
		}
	});
});

app.listen('3000');

exports = module.exports = app;
