var Section = function(id, source, options, parent) {
	this._parent = parent;
	this._source = source;
	this._options = options;
	this._timeline = [];
	this._framesCache = {};
	this._cached = false;
	this._currentTimeline = null;
	this._skipCachedCanvasFreeze = false;
	this._canvas;
	this._context;
	this._timer;
	this._eventHandlerLink;

	this.id = id || 0;
	this.active = false;
	this.isFramesRange = typeof(this._options.time) !== 'number';
	this.start = this.isFramesRange ? this._options.time[0] : this._options.time;
	this.end = this.isFramesRange ? this._options.time[1] : this._options.time;
	this.playing = false;
	this.sectionMovie = {
		currentTime: 0,
		duration: this.end - this.start
	};

	this.init();
};

Section.prototype = {
	constructor: Section,

	_draw: function(frame, time) {
		var _this = this,
			currentTime;

		this._timer && clearTimeout(this._timer);

		if (frame) {
			this.playing = false;
		} else {
			if (time) {
				currentTime = time;
				this.playing = false;
			} else if (this._currentTimeline) {
				currentTime = this._currentTimeline.shift();
			}

			if (currentTime != null) {
				this.sectionMovie.currentTime = currentTime - this.start;
				frame = this._framesCache[currentTime];
			}
		}

		if (frame) {
			this._context.drawImage(frame, 0, 0, this._canvas.width, this._canvas.height);
		}

		if (typeof this._options.onTimeupdate === 'function') {
			this._options.onTimeupdate(this.sectionMovie);
		}

		if (this._currentTimeline && !this._currentTimeline.length) {
			this.playing = false;
			this._currentTimeline = null;
			console.log('video has been played');
		}

		if (this.playing) {
			this._timer = setTimeout(function() {
				_this._draw();
			}, this._parent._stepms);
		}
	},

	init: function() {
		this._canvas = document.createElement('canvas');
		this._canvas.className = 'bSection';
		this._canvas.width = this._source.width;
		this._canvas.height = this._source.height;

		this._source.parentNode.insertBefore(this._canvas, this._source.nextSibling);
		this._context = this._canvas.getContext('2d');
		this.hide();
	},

	show: function() {
		this._canvas.style.visibility = 'visible';
	},

	hide: function() {
		this._canvas.style.visibility = 'hidden';
	},

	check: function(time) {
		if (time + this._parent._step > this.start && time < this.end) {
			if (!this.active) {
				this.activate();
			}
		} else if (this.active) {
			this.deactivate();
		}
	},

	activate: function() {
		if (!this.active) {
			this.active = true;

			if (this.isFramesRange) {
				this.streamToCache();
			} else {
				this._source.pause();
			}

			if (typeof this._options.onActivate === 'function') {
				this._options.onActivate(this);
			}
		}
	},

	deactivate: function() {
		if (this.active) {
			this.active = false;
			this.hide();

			if (typeof this._options.onDeactivate === 'function') {
				this._options.onDeactivate(this);
			}
		}
	},

	complete: function() {
		if (this.active) {
			this._source.currentTime = this.end;
			this.deactivate();
			this._source.play();
		}
	},

	play: function(processor) {
		if (this.playing) {
			return;
		}

		if (typeof(processor) !== 'function') {
			processor = function(timeline) {
				return timeline;
			}
		}
		this.show();
		this.playing = true;
		this._currentTimeline = processor(this._timeline.slice(0));
		this._draw();
	},

	setCurrentProgress: function(percentage) {
		this._draw(null, this._timeline[Math.floor(this._timeline.length * (percentage || 0) / 100)]);
	},

	streamToCache: function() {
		var _this = this;

		if (!this._cached) {
			this.cacheFrame();

			if (this._source.currentTime + this._parent._step > this.end) {
				this._source.pause();
				this._cached = true;
				console.log('video is cached!');

				this.play(function(timeline) {
					return timeline.reverse();
				});
			} else {
				setTimeout(function() {
					_this.streamToCache();
				}, this._parent._stepms);
			}
		}
	},

	cacheFrame: function() {
		var width = this._source.width,
			height = this._source.height,
			currentTime = this._source.currentTime,
			cachedCanvas,
			cachedContext;

		if (this._framesCache[currentTime] != null) {
			return;
		}
		cachedCanvas = document.createElement('canvas');
		cachedContext = cachedCanvas.getContext('2d');
		cachedCanvas.width = width;
		cachedCanvas.height = height;
		cachedContext.drawImage(this._source, 0, 0, width, height);

		// Пытаемся сделать заморозку канваса получая информацию о цвете пикселя, чтоб браузер не 
		// вычистил его из памяти.
		if (!this._skipCachedCanvasFreeze) {
			try {
				cachedContext.getImageData(0, 0, 1, 1);
			} catch(e) {
				// Если упали с ошибкой, то браузеру не нужно делать заморозку канваса и следовательно 
				// больше не пытаемся это сделать.
				this._skipCachedCanvasFreeze = true;
			}
		}
		this._timeline.push(currentTime);
		return this._framesCache[currentTime] = cachedCanvas;
	}
};