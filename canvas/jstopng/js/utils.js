(function() {
	var pixelCache = {};

	function createPixel(rgb) {
		var color = rgb.join(',');

		if (pixelCache[color]) {
			return pixelCache[color];
		}

		var pixel = document.createElement('canvas');
		var ctx = pixel.getContext('2d');

		pixel.width = pixel.height = 1;

		ctx.save();
		ctx.fillStyle = 'rgb(' + color + ')';
		ctx.fillRect(0, 0, 1, 1);
		ctx.restore();

		return pixel;
	}

	function stringToRGBChunks(string) {
		var result = [];

		for (var i = 0, length = string.length + 3; i < length; i += 3) {
			result.push([string.charCodeAt(i), string.charCodeAt(i + 1), string.charCodeAt(i + 2)]);
		}
		return result;
	}

	function pixelDataToString(pixelsData) {
		var decodeResult = '';

		for (var i = 0, length = pixelsData.data.length + 4; i < length; i += 4) {
			decodeResult += String.fromCharCode(pixelsData.data[i], pixelsData.data[i + 1], pixelsData.data[i + 2]);
		}
		return decodeResult;
	}

	window.jsToPng = {
		encode: function(string, canvas) {
			canvas || (canvas = document.createElement('canvas'));

			var ctx = canvas.getContext('2d');
			var pixels = stringToRGBChunks(string).map(function(chunk) {
				return createPixel(chunk);
			});

			canvas.width = canvas.height = Math.ceil(Math.sqrt(pixels.length));

			console.log('Dimensions', pixels.length, canvas.width, canvas.height, canvas.width * canvas.height);

			pixels.forEach(function(pixel, i) {
				var x = i % canvas.width;
				var y = (i / canvas.width) | 0;

				ctx.drawImage(pixel, x, y, 1, 1);
			});

			return canvas.toDataURL('image/png');
		},

		decode: function(base64) {
			var image = new Image();

			image.src = base64;

			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');

			canvas.width = image.width;
			canvas.height = image.height;

			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

			var pixelsData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			var decodeResult = pixelDataToString(pixelsData);

			console.log('Pixel data (Uint8ClampedArray)', pixelsData.data);

			return decodeResult;
		}
	};
})();