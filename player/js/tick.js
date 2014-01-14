var Tick = function(fps) {
	var _this = this;

	this._fps = fps || 30;
	this._stepms = 1000 / this._fps;
	this._step = this._stepms / 1000;
	this._handlers = [];
	this._contexts = [];
	this._timerHandler = function() {
		_this._tick();
	};
	this._timer;

	this.start();
};

Tick.prototype = {
	constructor: Tick,

	_tick: function() {
		for (var i = 0, length = this._handlers.length; i < length; i++) {
			if (typeof this._handlers[i] === 'function') {
				this._handlers[i].call(this._contexts[i]);
			}
		}

		this._timer = setTimeout(this._timerHandler, this._stepms);
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
		this._tick();
		console.log('sections stepms', this._step);
	},

	stop: function() {
		this._timer && clearTimeout(this._timer);
		this._timer = null;
	}
};