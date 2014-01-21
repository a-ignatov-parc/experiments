var Section = function(id, source, options, callback, parent) {
	var _this = this,
		callbackCount = 2;

	this._parent = parent;
	this._timer = this._parent._timer;
	this._source = source;
	this._options = options;
	this._timeline = [];
	this._cached = false;
	this._currentTimeline = null;
	this._skipCachedCanvasFreeze = false;
	this._streamed = false;
	this._canvas;
	this._eventHandlerLink;
	this._playbackTimer;
	this._completeCallback = function() {
		if (!--callbackCount && typeof callback === 'function') {
			callback(_this);
		}
	};

	if (this._options.keyframe) {
		callbackCount++;
	}

	if (this._options.sequenceFrames) {
		callbackCount++;
	}

	this.id = id || 0;
	this.active = false;
	this.finished = false;
	this.start = 0;
	this.playing = false;
	this.sectionMovie = {
		progress: 0,
		duration: 0,
		currentTime: 0,
		sequenceTime: 0,
		sequenceProgress: 0,
		sequenceDuration: 0
	};
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
			} else if (this._currentTimeline) {
				currentTime = this._currentTimeline.shift();
			} else {
				currentTime = 0;
			}
			frame = this._timeline[currentTime];
			this._streamVideo(null, (this.sectionMovie.sequenceDuration / this._timeline.length) * currentTime);
		}

		if (frame) {
			this._canvas.src = frame;
		}

		if (typeof this._options.onTimeupdate === 'function') {
			this._options.onTimeupdate(this.sectionMovie, this);
		}

		if (this._currentTimeline && !this._currentTimeline.length) {
			this.playing = false;
			this._currentTimeline = null;
		}

		if (this.playing) {
			this._playbackTimer = setTimeout(function() {
				_this._draw();
			}, 1000 / this._parent.video.fps);
		}
	},

	_streamVideo: function(stepms, time) {
		var currentTime = time || this._source.currentTime,
			sequenceTime = currentTime > this.sectionMovie.sequenceDuration ? (this.sectionMovie.sequenceDuration || 1) : currentTime;

		this.sectionMovie.currentTime = currentTime;
		this.sectionMovie.progress = Math.round((this.sectionMovie.currentTime / this.sectionMovie.duration) * 100);

		this.sectionMovie.sequenceTime = sequenceTime;
		this.sectionMovie.sequenceProgress = Math.round((sequenceTime / (this.sectionMovie.sequenceDuration || 1)) * 100);
	},

	init: function() {
		var _this = this;

		this._source.addEventListener('playing', function() {
			_this._timer.bind(_this._streamVideo, _this);
		}, false);

		this._source.addEventListener('pause', function() {
			_this._timer.unbind(_this._streamVideo, _this);
		}, false);

		this._source.addEventListener('ended', function() {
			_this._timer.unbind(_this._streamVideo, _this);
		}, false);

		this._source.addEventListener('loadedmetadata', function() {
			_this.sectionMovie.duration = _this._source.duration;
			_this._streamVideo();
			_this._completeCallback();
		}, false);

		this._canvas = document.createElement('img');
		this._canvas.className = 'bSection';
		this._canvas.width = this._source.width;
		this._canvas.height = this._source.height;
		this._canvas.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

		this._source.parentNode.insertBefore(this._canvas, this._source.nextSibling);
		this.hide();
		this.hide(this._source);

		if (this._options.keyframe) {
			var _this = this,
				handler = function() {
					_this.cacheFrame(_this.keyframe = this, 0);
					_this._completeCallback();
				},
				image;

			if (this._options.keyframe instanceof Image) {
				image = this._options.keyframe;

				if (image.complete) {
					handler.call(image);
				} else {
					image.onload = handler;
				}
			} else if (typeof this._options.keyframe === 'string') {
				image = new Image();
				image.onload = handler;
				image.src = this._options.keyframe;
			}
		}

		if (this._options.sequenceFrames) {
			$.ajax({
				url: [this._parent.video.baseUrl ,this._options.sequenceFrames].join('/'),
				dataType: 'json',
				success: function(data) {
					if (data && data.frames) {
						for (var i = 0, length = data.frames.length; i < length; i++) {
							_this.cacheFrame(data.frames[i]);
						}
						_this.sectionMovie.sequenceDuration = length / _this._parent.video.fps;
						_this._streamVideo();
					}
					_this._completeCallback();
				}
			});
		}
		this._completeCallback();
	},

	show: function(target) {
		target || (target = this._canvas);
		target.style.visibility = 'visible';
	},

	hide: function(target) {
		target || (target = this._canvas);
		target.style.visibility = 'hidden';
	},

	activate: function() {
		if (!this.active) {
			this.active = true;
			this.finished = false;

			this.show(this._source);
			this.stop();
			this.setCurrentProgress();

			if (typeof this._options.onActivate === 'function') {
				this._options.onActivate(this);
			}
		}
	},

	deactivate: function() {
		if (this.active) {
			if (!this.finished) {
				this.complete();
			}
			this.active = false;
			this._streamed = false;

			this.hide(this._source);
			this.stop();

			if (typeof this._options.onDeactivate === 'function') {
				this._options.onDeactivate(this);
			}
		}
	},

	completed: function() {
		if (this.active && !this.finished) {
			this.finished = true;
			this.hide();

			if (typeof this._options.onComplete === 'function') {
				this._options.onComplete(this);
			}
		}
	},

	play: function() {
		this._source.play();
	},

	pause: function() {
		this._source.pause();
	},

	stop: function() {
		this.play();
		this.pause();
		this._source.currentTime = 0;
	},

	complete: function() {
		if (this.active) {
			this.play();
			this.completed();
		}
	},

	playSequence: function(processor) {
		if (this.playing) {
			return;
		}

		var timeline = [];

		for (var i = 0, length = this._timeline.length; i < length; i++) {
			timeline[i] = i;
		}

		if (typeof processor !== 'function') {
			processor = function(timeline) {
				return timeline;
			}
		}
		this.show();
		this.playing = true;
		this._currentTimeline = processor(timeline);
		this._draw();
	},

	setCurrentProgress: function(percentage) {
		this._draw(null, Math.floor(this._timeline.length * (percentage || 0) / 100));
		this.show();
	},

	cacheFrame: function(source, index) {
		if (source instanceof Image) {
			var canvas = document.createElement('canvas'),
				context = canvas.getContext('2d');

			canvas.width = source.width;
			canvas.height = source.height;
			context.drawImage(source, 0, 0, source.width, source.height);

			if (index != null) {
				this._timeline.splice(index, 0, canvas.toDataURL('image/jpg'));
			} else {
				this._timeline.push(canvas.toDataURL('image/jpg'));
			}
		} else if (typeof source === 'string' && source.substr(0, 10) === 'data:image') {
			if (index != null) {
				this._timeline.splice(index, 0, source);
			} else {
				this._timeline.push(source);
			}
		} else {
			console.warn('Unsupported format', source);
		}
	}
};