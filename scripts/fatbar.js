function fatBar_Init() {
    $('#fatbar-toggle .show').click(FatBar.show);
    $('#fatbar-toggle .hide').click(FatBar.hide);
    if (JSON.parse(localStorage['fatbar-toggle'] || "false")) {
        FatBar.show();
    } else {
        FatBar.hide();
    }
}

var FatBar = {
	loadFromVideo: function(video) {
		FatBar._loadVideoInfo(video);
		FatBar._loadRelatedInfo(video);
		FatBar._loadLinkosBox(video);
	},
    show: function() {
        if (Player.getCurrentVideoId()) {
            var videoId = Player.getCurrentVideoId();
            var title = $('#info .title').text();
            FatBar.loadFromVideo(new Video(videoId, title));
        }
        $("#fatbar-toggle .show").hide();
        $("#fatbar-toggle .hide").show();
        $("#fatbar").show();
        localStorage['fatbar-toggle'] = JSON.stringify(true);
        $(window).resize();
    },
    hide: function() {
        $("#fatbar-toggle .show").show();
        $("#fatbar-toggle .hide").hide();
        $("#fatbar").hide();
        localStorage['fatbar-toggle'] = JSON.stringify(false);
        $(window).resize();
    },
    isVisible: function() {
        return $('#fatbar').is(':visible');
    },
	_loadRelatedInfo: function(video) {
		$('#related-box').addClass('loading');
		$('#related').html('').show();
		var url = "http://gdata.youtube.com/feeds/api/videos/" + video.videoId + "/related?callback=?";
		var params = {
			'alt': 'json-in-script',
			'max-results': 9,
			'prettyprint': true,
			'v': 2
		};
		$.getJSON(url, params, function(data) {
            $('#related-box').removeClass('loading');
			$.each(data.feed.entry, function(i, item) {
				var url = item['id']['$t'];
				var videoId = url.match('video:(.*)$')[1];
				var title = item['title']['$t'];
				if (item['gd$rating']) {
					var rating = item['gd$rating']['average'];
                }
				var resultItem = createResultsItem(title, videoId, rating);
				resultItem.appendTo($('#related'));
			}); 
		});
	},
	_loadVideoInfo: function(video) {
		$('#video-info-box .uploader').text('');
		$('#video-info-box').addClass('loading');
		var url = "http://gdata.youtube.com/feeds/api/videos/" + video.videoId + "?callback=?";
		var params = {
			'alt': 'json-in-script',
			'prettyprint': true,
			'v': 2
		};
		$.getJSON(url, params, function(data) {
            $('#video-info-box').removeClass('loading');
			var author = data.entry.author[0].name.$t;
			var uri = data.entry.author[0].uri.$t;
			$('#video-info-box .uploader')
				.click(function() {
					Uploader.loadVideosFromURI(uri);
				})
				.text(author);
		});
	},
    _loadLinkosBox: function(video) {
        $('#linko-box .name').text('');
        $('#linko-box .links').html('');
        var artist = extractArtist(video.title);
        if (artist) {
            $('#linko-box').addClass('loading');
            var url = 'http://linko.fruktsallad.net/artist/' + artist.replace(' ', '_') + '.json?callback=?';
            $.getJSON(url, {}, function(data) {
                $('#linko-box').removeClass('loading');

                if (!data || !data.links || !data.hasOwnProperty('artist_name')) {
                    return;
                }

                $('#linko-box .name').text(data.artist_name)

                for (key in data.links) {
                    if (data.links.hasOwnProperty(key)) {
                        var url = data.links[key],
                            li = $('<li></li>'),
                            a = $('<a target="_blank"></a>').attr('href', url).text(key);

                        a.appendTo(li);
                        li.appendTo($('#linko-box .links'));
                    }
                }
            });
        }
    }
};
