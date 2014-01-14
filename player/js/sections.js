var Sections = function(source, options) {
	this._source = source;
	this._sections = [];
	this._options = options;
	this._timer = new Tick();

	this.fps = this._options.fps;

	this.init();
};

Sections.prototype = {
	constructor: Sections,

	_streamVideo: function() {
		if (typeof this._options.onTimeupdate === 'function') {
			this._options.onTimeupdate(this._source);
		}
		this.check();
	},

	init: function() {
		var _this = this,
			video = this._source,
			options = this._options,
			warmed = false;

		video.addEventListener('playing', function() {
			if (typeof options.onPlay === 'function' && !_this.findActive()) {
				options.onPlay(video);
			}

			if (!warmed) {
				var canvas = document.createElement('canvas'),
					context = canvas.getContext('2d');

				context.drawImage(video, 0, 0, video.width, video.height);
				warmed = true;
			}
			_this._timer.bind(_this._streamVideo, _this);
		}, false);

		video.addEventListener('pause', function() {
			if (typeof options.onPause === 'function' && !_this.findActive()) {
				options.onPause(video);
			}
			_this._timer.unbind(_this._streamVideo, _this);
		}, false);
	},

	add: function(options) {
		for (var i = 0, length = arguments.length; i < length; i++) {
			this._sections.push(new Section(this._sections.length, this._source, arguments[i], this));
		}
	},

	check: function() {
		if (!this.findActive()) {
			for (var i = 0, length = this._sections.length; i < length; i++) {
				this._sections[i].check(this._source.currentTime);
			}
		}
	},

	findActive: function() {
		for (var i = 0, length = this._sections.length; i < length; i++) {
			if (this._sections[i].active) {
				return this._sections[i];
			}
		}
	}
};