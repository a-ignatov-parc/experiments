var Tick = function(fps) {
	var _this = this;

	this._fps = fps || 30;
	this._handlers = [];
	this._contexts = [];
	this._timerHandler = function(ms) {
		if (_this._resetTimer) {
			_this._resetTimer = false;
		} else {
			_this.stepms = ms - _this._prevStep;
		}
		_this._prevStep = ms;
		_this.step = _this.stepms / 1000;
		_this.execute();
	};
	this._prevStep = 0;
	this._resetTimer = false;
	this._timer;

	if (document.hidden != null) { // Opera 12.10 and Firefox 18 and later support 
		this._visibilityKey = 'hidden';
		this._visibilityChange = 'visibilitychange';
	} else if (document.mozHidden != null) {
		this._visibilityKey = 'mozHidden';
		this._visibilityChange = 'mozvisibilitychange';
	} else if (document.msHidden != null) {
		this._visibilityKey = 'msHidden';
		this._visibilityChange = 'msvisibilitychange';
	} else if (document.webkitHidden != null) {
		this._visibilityKey = 'webkitHidden';
		this._visibilityChange = 'webkitvisibilitychange';
	}

	this.step;
	this.stepms;

	this.bindVisibilityHandler(function() {
		_this._visibilityChangeHandler();
	});

	this.start();
};

Tick.prototype = {
	constructor: Tick,

	_visibilityChangeHandler: function() {
		if (document[this._visibilityKey]) {
			this._resetTimer = true;
		}
	},

	execute: function() {
		for (var i = 0, length = this._handlers.length; i < length; i++) {
			if (typeof this._handlers[i] === 'function') {
				this._handlers[i].call(this._contexts[i], this.stepms);
			}
		}
		this._timer = requestAnimationFrame(this._timerHandler);
	},

	bindVisibilityHandler: function(handler) {
		document.addEventListener(this._visibilityChange, handler, false);
	},

	unbindVisibilityHandler: function(handler) {
		document.removeEventListener(this._visibilityChange, handler, false);
	},

	bind: function(handler, context) {
		if (typeof handler === 'function') {
			this._handlers.push(handler);
			this._contexts.push(context);
		}
	},

	unbind: function(handler, context) {
		for (var i = 0, length = this._handlers.length; i < length; i++) {
			if (this._handlers[i] === handler && this._contexts[i] === context) {
				this._handlers[i] = this._contexts[i] = null;
				break;
			}
		}
	},

	start: function() {
		this.stop();
		this.execute();
	},

	stop: function() {
		this._timer && cancelAnimationFrame(this._timer);
		this._timer = null;
	}
};