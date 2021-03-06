// Tag constructor based on strings.
var Tag = function(tag, params, serialize) {
	params || (params = {});
	this._tag = tag || 'div';
	this._attributes = params.attributes || {};
	this._children = [];
	this._parent = null;

	if (params.html) {
		this._children.push(params.html);
	}

	if (serialize) {
		return this._serialize();
	}
};

Tag.prototype = {
	constructor: Tag,
	_serialize: function() {
		var str = '<',
			tagStart = [this._tag];

		for (var attr in this._attributes) {
			if (this._attributes.hasOwnProperty(attr) && this._attributes[attr] != null) {
				tagStart.push(attr + '="' + (typeof(this._attributes[attr].join) === 'function' ? this._attributes[attr].join(' ') : this._attributes[attr]) + '"');
			}
		}
		switch(this._tag) {
			case 'area':
			case 'base':
			case 'br':
			case 'col':
			case 'embed':
			case 'hr':
			case 'img':
			case 'input':
			case 'keygen':
			case 'link':
			case 'menuitem':
			case 'meta':
			case 'param':
			case 'source':
			case 'track':
			case 'wbr':
				str += tagStart.join(' ') + ' />';
				break;
			default:
				str += tagStart.join(' ') + '>' + this._children.join('') + '</' + this._tag + '>';
		}
		return str;
	},
	_find: function(tag) {
		if (tag instanceof this.constructor) {
			for (var i = 0, length = this._children.length; i < length; i++) {
				if (tag === this._children[i]) {
					return i;
				}
			}
		}
		return null;
	},
	prepend: function(tag) {
		if (arguments.length > 1) {
			for (var i = arguments.length; i >= 0; i--) {
				this.prepend(arguments[i]);
			}
		} else {
			if (this._find(tag) == null) {
				this._children.unshift(tag);

				if (tag instanceof this.constructor) {
					tag._parent = this;
				}
			}
		}
		return this;
	},
	append: function(tag) {
		if (arguments.length > 1) {
			for (var i = 0, length = arguments.length; i < length; i++) {
				this.append(arguments[i]);
			}
		} else {
			if (this._find(tag) == null) {
				this._children.push(tag);

				if (tag instanceof this.constructor) {
					tag._parent = this;
				}
			}
		}
		return this;
	},
	html: function(str) {
		this
			.empty()
			.append('' + str);
	},
	empty: function() {
		this._children.length = 0;
		return this;
	},
	remove: function(tag) {
		if (tag != null) {
			var index = this._find(tag);

			if (index != null) {
				this._children.splice(index, 1);
				tag._parent = null;
			}
		} else if (this._parent) {
			this._parent.remove(this);
		}
		return this;
	},
	toString: function() {
		return this._serialize();
	},
	valueOf: function() {
		return this.toString();
	}
};