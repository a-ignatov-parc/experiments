var Sections = function(container, options) {
	this._container = container;
	this._sections = [];
	this._sectionsSources = [];
	this._options = options;
	this._timer = new Tick();
	this._playing = false;
	this._readyCount = 0;

	this.video = this._options.video;
	this.movie = {
		progress: 0,
		duration: 0,
		currentTime: 0,
		sequenceTime: 0,
		sequenceProgress: 0
	};

	this.init();
};

Sections.prototype = {
	constructor: Sections,

	_streamVideo: function() {
		var activeSection = this.findActive();

		this.movie.currentTime = activeSection.start + activeSection.sectionMovie.currentTime;
		this.movie.progress = Math.round((this.movie.currentTime / this.movie.duration) * 100);
		this.movie.sequenceTime = activeSection.sectionMovie.sequenceTime;
		this.movie.sequenceProgress = activeSection.sectionMovie.sequenceProgress;

		if (typeof this._options.onTimeupdate === 'function') {
			this._options.onTimeupdate(this.movie);
		}
	},

	_visibilityChangeHandler: function() {
		if (this._playing) {
			if (this._isVisible()) {
				this.play();
			} else {
				this.pause();
			}
		}
	},

	_isVisible: function() {
		return !document[this._timer._visibilityKey];
	},

	_createSectionSource: function(fileName) {
		var _this = this,
			movie = this.movie,
			sectionVideo = document.createElement('video'),
			sectionVideoSource;

		sectionVideo.className = 'bSection';

		if (!this._sectionsSources.length) {
			sectionVideo.className += ' bSection__mFirst';
		}
		sectionVideo.width = this.video.width;
		sectionVideo.height = this.video.height;
		// sectionVideo.preload = 'metadata';
		sectionVideo.preload = 'auto';

		for (var i = 0, length = this.video.sources.length; i < length; i++) {
			sectionVideoSource = document.createElement('source');
			sectionVideoSource.type = this.video.sources[i].type;
			sectionVideoSource.src = [this.video.baseUrl, fileName].join('/') + '.' + this.video.sources[i].extension;
			sectionVideo.appendChild(sectionVideoSource);
		}
		// this._container.appendChild(sectionVideo);
		this._container.insertBefore(sectionVideo, this._container.children[0]);

		sectionVideo.addEventListener('ended', function() {
			_this.next();
		}, false);

		sectionVideo.addEventListener('playing', function() {
			_this._onPlayingHandler.apply(_this, arguments);
		}, false);

		sectionVideo.addEventListener('pause', function() {
			_this._onPauseHandler.apply(_this, arguments);
		}, false);

		return sectionVideo;
	},

	_onPlayingHandler: function() {
		if (!this._isVisible()) {
			return;
		}
		this._playing = true;

		if (typeof this._options.onPlay === 'function') {
			this._options.onPlay(this.movie);
		}
		this._timer.bind(this._streamVideo, this);
	},

	_onPauseHandler: function() {
		if (!this._isVisible()) {
			return;
		}
		this._playing = false;

		if (typeof this._options.onPause === 'function' && !this.findActive()) {
			this._options.onPause(this.movie);
		}
		this._timer.unbind(this._streamVideo, this);
	},

	_onReadyHandler: function() {
		for (var i = 0, length = this._sectionsSources.length; i < length; i++) {
			this._sections[i].start = this.movie.duration;
			this.movie.duration += this._sectionsSources[i].duration;
		}

		if (typeof this._options.onReady === 'function') {
			this._options.onReady(this.movie);
		}
	},

	init: function() {
		var _this = this;

		this._timer.bindVisibilityHandler(function() {
			_this._visibilityChangeHandler();
		});
	},

	add: function(options) {
		var _this = this;

		for (var i = 0, length = arguments.length; i < length; i++) {
			var id = this._sections.length,
				options = arguments[i],
				sectionSource = this._createSectionSource('section' + id);

			if (!this._sectionsSources.length) {
				sectionSource.load();
			}
			this._readyCount++;
			this._sectionsSources.push(sectionSource);
			this._sections.push(new Section(id, sectionSource, options, function(section) {
				if (!section.id) {
					section.activate();
				}

				if (!--_this._readyCount) {
					_this._onReadyHandler();
				}
			}, this));
		}
	},

	findActive: function() {
		for (var i = 0, length = this._sections.length; i < length; i++) {
			if (this._sections[i].active) {
				return this._sections[i];
			}
		}
	},

	start: function() {
		var activeSection = this.findActive() || this._sections[0];

		if (!activeSection.finished) {
			if (!activeSection.active) {
				activeSection.activate();
			} else {
				activeSection.complete();
			}
		}
	},

	play: function() {
		var activeSection = this.findActive();

		if (activeSection) {
			activeSection.play();
		}
	},

	pause: function() {
		var activeSection = this.findActive();

		if (activeSection) {
			activeSection.pause();
		}
	},

	next: function() {
		var activeSection = this.findActive();

		if (activeSection) {
			this.goto(activeSection.id + 1);
		}
	},

	goto: function(id) {
		var activeSection = this.findActive();

		if (this._sections[id]) {
			if (activeSection && activeSection.id != id) {
				activeSection.deactivate();
			}
			this._sections[id].activate();
		}
	}
};