// Tag constructor based on strings.
// Example can be seen here: http://jsfiddle.net/ant_Ti/B35ub/
var Tag = function(tag, params, serialize) {
	params || (params = {});
	this._tag = tag || 'div';
	this._attributes = params.attributes || {};
	this._children = [];

	if (params.html) {
		this._children.push(params.html);
	}

	if (serialize) {
		return this._serialize();
	}
}

Tag.prototype = {
	_serialize: function() {
		var str = '<' + this._tag + ' ';

		for (var attr in this._attributes) {
			if (this._attributes.hasOwnProperty(attr) && this._attributes[attr] != null) {
				str += attr + '="' + this._attributes[attr] + '"';
			}
		}
		str += '>' + this._children.join('') + '</' + this._tag + '>';
		return str;
	},
	prepend: function(tag) {
		this._children.unshift(tag);
	},
	append: function(tag) {
		this._children.push(tag);
	},
	toString: function() {
		return this._serialize();
	}
}