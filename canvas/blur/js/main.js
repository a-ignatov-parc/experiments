var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d'),
	image = new Image();

canvas.width = 600;
canvas.height = 400;

image.onload = function() {
	console.log('sizes', image.width, image.height, canvas.width, canvas.height);
	context.drawImage(image, (canvas.width / 2) - (image.width / 2), 0, image.width, image.height);
}
image.src = 'img/bg.jpg';