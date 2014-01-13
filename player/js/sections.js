var Sections = function(source, options) {
	this._source = source;
	this._sections = [];
	this._options = options;
	this._stepms = 1000 / this._options.fps;
	this._step = this._stepms / 1000;
	this.init();

	console.log('sections stepms', this._step);
};

Sections.prototype = {
	constructor: Sections,

	init: function() {
		var _this = this,
			video = this._source,
			stepms = this._stepms,
			options = this._options,
			seekingTimer;

		video.addEventListener('playing', function() {
			if (typeof options.onPlay === 'function' && !_this.findActive()) {
				options.onPlay(video);
			}
			seekingTimer = setTimeout(function timer() {
				if (typeof options.onTimeupdate === 'function') {
					options.onTimeupdate(video);
				}
				_this.check();
				seekingTimer = setTimeout(timer, stepms);
			}, stepms);
		}, false);

		video.addEventListener('pause', function() {
			if (typeof options.onPause === 'function' && !_this.findActive()) {
				options.onPause(video);
			}
			seekingTimer && clearTimeout(seekingTimer);
		}, false);
	},

	add: function(options) {
		for (var i = 0, length = arguments.length; i < length; i++) {
			this._sections.push(new Section(this._sections.length, this._source, arguments[i], this));
		}
	},

	check: function() {
		for (var i = 0, length = this._sections.length; i < length; i++) {
			this._sections[i].check(this._source.currentTime);
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