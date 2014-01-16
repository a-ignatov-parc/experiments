var canvas = document.getElementById('canvas'),
	resultImage = document.getElementById('result'),
	topimg = document.getElementById('topimg'),
	bottomimg = document.getElementById('bottomimg'),
	info = document.getElementById('info'),
	context = canvas.getContext('2d'),
	image = new Image(),
	perf = new Perf(),
	decreaseRatio = 5,
	blurRadius = 5;

image.onload = function() {
	var result,
		imageWidth = image.width / decreaseRatio,
		imageHeight = image.height / decreaseRatio;

	canvas.width = imageWidth;
	canvas.height = imageHeight;

	context.drawImage(image, (canvas.width / 2) - (imageWidth / 2), 0, imageWidth, imageHeight);

	perf.start();

	// boxBlurCanvasRGB('canvas', 0, 0, imageWidth, imageHeight, blurRadius);

	stackBlurCanvasRGB('canvas', 0, 0, canvas.width, canvas.height, blurRadius);

	resultImage.width = topimg.width = bottomimg.width = image.width;
	resultImage.height = topimg.height = bottomimg.height = image.height;
	resultImage.src = topimg.src = bottomimg.src = canvas.toDataURL('image/png');

	result = perf.end();
	info.innerHTML = 'Render time: ' + result + ' ms';
}
image.src = window.bg;