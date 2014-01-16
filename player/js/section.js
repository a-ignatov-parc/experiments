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
	this._originalVolumeLvl = 1;
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
	this.cooldown = 0;
	this.keyframe;

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
		}

		if (this.playing) {
			this._playbackTimer = setTimeout(function() {
				_this._draw();
			}, 1000 / this._parent.fps);
		}
	},

	_cooldown: function(stepms) {
		this.cooldown -= stepms;

		if (this.cooldown <= 0) {
			this.cooldown = 0;
			this._timer.unbind(this._cooldown, this);
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

		if (this._options.keyframe) {
			var _this = this,
				image,
				handler = function() {
					_this.keyframe = image;
					_this.keyframe.currentTime = _this.start;
					_this.cacheFrame(_this.keyframe);
				};

			if (this._options.keyframe instanceof Image) {
				image = this._options.keyframe;
				handler();
			} else if (typeof this._options.keyframe === 'string') {
				image = new Image();
				image.onload = handler;
				image.src = this._options.keyframe;
			}
		}
	},

	show: function() {
		this._canvas.style.visibility = 'visible';
	},

	hide: function() {
		this._canvas.style.visibility = 'hidden';
	},

	check: function(time) {
		if (time + this._timer.step >= this.start && time - this._timer.step <= this.end) {
			if (!this.active && !this.cooldown) {
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

				if (this.keyframe) {
					this.setCurrentProgress();
				}
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

			this.cooldown = 200;
			this._timer.bind(this._cooldown, this);

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
			if (typeof this._options.onStreamEnd === 'function') {
				this._options.onStreamEnd(this);
			}
		} else {
			if (this._timeline.length === 1) {
				this._originalVolumeLvl = this._source.volume;
				this._source.volume = 0;
				// this._source.playbackRate = .5;
			}

			if (!this._cached) {
				this.cacheFrame();
			}

			if (this._timeline.length === 1 && typeof this._options.onStreamStart === 'function') {
				this._options.onStreamStart(this);
			}

			if (this._source.currentTime + this._timer.step > this.end) {
				this._source.playbackRate = 1;
				this._source.pause();
				this._source.volume = this._originalVolumeLvl;
				this._cached = true;
				this._streamed = true;
				this._timer.unbind(this.streamToCache, this);
				this.streamToCache();
			}
		}
	},

	cacheFrame: function(source) {
		source || (source = this._source);

		var width = source.width,
			height = source.height,
			currentTime = source.currentTime,
			cachedCanvas,
			cachedContext;

		if (this._framesCache[currentTime] != null) {
			return this._framesCache[currentTime];
		}
		cachedCanvas = document.createElement('canvas');
		cachedContext = cachedCanvas.getContext('2d');
		cachedCanvas.width = width;
		cachedCanvas.height = height;
		cachedContext.drawImage(source, 0, 0, width, height);

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