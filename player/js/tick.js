var Tick = function(fps) {
	this._fps = fps || 30;
	this._stepms = 1000 / this._fps;
	this._step = this._stepms / 1000;
	this._handlers = [];
	this._contexts = [];
	this._timer;

	this.start();
};

Tick.prototype = {
	constructor: Tick,

	_tick: function() {
		var _this = this;

		for (var i = 0, length = this._handlers.length; i < length; i++) {
			this._handlers[i].call(this._contexts[i]);
		}

		this._timer = setTimeout(function() {
			_this._tick();
		}, this._stepms);
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
				this._handlers.splice(i, 1);
				this._contexts.splice(i, 1);
				break;
			}
		}
	},

	start: function() {
		this.stop();
		this._tick();
	},

	stop: function() {
		this._timer && clearTimeout(this._timer);
		this._timer = null;
	}
};