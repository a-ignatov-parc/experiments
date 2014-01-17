var video = document.getElementById('video'),
	result = document.getElementById('result'),
	canvas = document.getElementById('processing'),
	context = canvas.getContext('2d'),
	title = document.getElementById('title'),
	titleHeight = title.clientHeight,
	decreaseRatio = 15,
	blurRadius = 2;

blurVideo();

function blurVideo() {
	var imageWidth = video.width / decreaseRatio,
		imageHeight = video.height / decreaseRatio,
		canvasHeight = titleHeight / decreaseRatio;

	canvas.width = imageWidth;
	canvas.height = canvasHeight;
	context.drawImage(video, 0, -(imageHeight - canvasHeight), imageWidth, imageHeight);

	stackBlurCanvasRGB(canvas.id, 0, 0, canvas.width, canvas.height, blurRadius);

	result.width = video.width;
	result.height = titleHeight;
	result.src = canvas.toDataURL('image/png');

	requestAnimationFrame(blurVideo);
}