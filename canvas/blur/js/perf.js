var Perf = function() {
	var methods = ['now', 'webkitNow', 'msNow', 'mozNow'];

	this._startTime;
	this._method;

	if (window.performance != null) {
		for (var i = 0, length = methods.length; i < length; i++) {
			if (methods[i] && methods[i] in window.performance) {
				this._method = methods[i];
				break;
			}
		}
	}
};

Perf.prototype = {
	constructor: Perf,

	_perfNow: function() {
		if (this._method) {
			return window.performance[this._method]();
		} else {
			return Date.now();
		}
	},

	start: function() {
		this._startTime = this._perfNow();
	},

	end: function() {
		if (!this._startTime) {
			return 0;
		}
		return this._perfNow() - this._startTime;
	}
}