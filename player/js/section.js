var Section = function(id, source, options, parent) {
	this._parent = parent;
	this._timer = this._parent._timer;
	this._source = source;
	this._options = options;
	this._timeline = [];
	this._framesCache = {};
	this._cached = false;
	this._currentTimeline = null;
	this._skipCachedCanvasFreeze = false;
	this._streamed = false;
	this._canvas;
	this._context;
	this._eventHandlerLink;
	this._playbackTimer;

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

		this._playbackTimer && clearTimeout(this._playbackTimer);

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
			this._playbackTimer = setTimeout(function() {
				_this._draw();
			}, 1000 / this._parent.fps);
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
		if (time + this._timer._step > this.start && time < this.end) {
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
				this._timer.bind(this.streamToCache, this);
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
			this._streamed = false;

			if (typeof this._options.onDeactivate === 'function') {
				this._options.onDeactivate(this);
			}
		}
	},

	complete: function() {
		if (this.active) {
			this.deactivate();
			this._source.play();
		}
	},

	play: function(processor) {
		if (this.playing) {
			return;
		}

		if (typeof processor !== 'function') {
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
		this.show();
	},

	streamToCache: function() {
		if (this._streamed) {
			switch(typeof this._options.onStreamed) {
				case 'function':
					this._options.onStreamed(this);
					break;
				case 'boolean':
					if (!this._options.onStreamed) {
						break;
					}
				default:
					this.play(function(timeline) {
						return timeline.reverse();
					});
			}
		} else {
			if (!this._cached) {
				this.cacheFrame();
			}

			if (this._source.currentTime + this._timer._step > this.end) {
				this._source.pause();
				this._cached = true;
				this._streamed = true;
				this._timer.unbind(this.streamToCache, this);
				this.streamToCache();
				console.log('video is cached!');
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
			return this._framesCache[currentTime];
		}
		cachedCanvas = document.createElement('canvas');
		cachedContext = cachedCanvas.getContext('2d');
		cachedCanvas.width = width;
		cachedCanvas.height = height;
		cachedContext.drawImage(this._parent._canvas, 0, 0, width, height);

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