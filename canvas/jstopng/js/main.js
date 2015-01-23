(function() {
	var string = document.getElementById('input').innerHTML;

	// Encode string
	var image = jsToPng.encode(string);

	// Showing result
	document.getElementById('encode-result').src = image;

	// Decoding string
	var decodeResult = jsToPng.decode(image);

	document.getElementById('decode-result').innerHTML = decodeResult;
})();