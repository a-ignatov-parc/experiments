var video = document.getElementById('video'),
	canvas = document.getElementById('canvas'),
	forwardBtn = document.getElementById('forward'),
	backwardBtn = document.getElementById('backward'),
	checkbox = document.getElementById('bezier'),
	context = canvas.getContext('2d'),
	playing = false,
	forward = true,
	framesCache = {},
	timeline = [],
	currentTimeline,
	fps = 30,
	stepms = 1000 / fps,
	step = stepms / 1000,
	slowmoFactor = 1,
	timer,
	precacheVideo = (function() {
		var handler = function currentHandler() {
				createCachedItem(video, video.width, video.height);

				if (video.currentTime + step >= video.duration) {
					alert('video is cached!');
					video.removeEventListener('seeked', currentHandler, false);
				} else {
					precacheVideo();
					// requestAnimationFrame(precacheVideo);
					// setTimeout(precacheVideo, stepms);
				}
			};

		return function() {
			if (!video.currentTime) {
				video.addEventListener('seeked', handler, false);
			}
			video.currentTime += step;
		};
	})(),
	playWithBezier = false,
	skipCachedCanvasFreeze = false;

canvas.width = video.width;
canvas.height = video.height;

function createCachedItem(source, width, height) {
	var cachedCanvas = document.createElement('canvas'),
		cachedContext = cachedCanvas.getContext('2d'),
		currentTime = video.currentTime;

	cachedCanvas.width = width;
	cachedCanvas.height = height;
	cachedContext.drawImage(source, 0, 0, width, height);

	// Пытаемся сделать заморозку канваса получая информацию о цвете пикселя, чтоб браузер не 
	// вычистил его из памяти.
	if (!skipCachedCanvasFreeze) {
		try {
			cachedContext.getImageData(0, 0, 1, 1);
		} catch(e) {
			// Если упали с ошибкой, то браузеру не нужно делать заморозку канваса и следовательно 
			// больше не пытаемся это сделать.
			skipCachedCanvasFreeze = true;
		}
	}
	timeline.push(currentTime);
	return framesCache[currentTime] = cachedCanvas;
}

video.addEventListener('loadeddata', function() {
	console.log('loadeddata');
	precacheVideo();
}, false);

forwardBtn.addEventListener('click', function() {
	console.log('forwardBtn');
	forward = true;
	playing = true;
	draw();
	// video.play();
	// draw2();
}, false);

backwardBtn.addEventListener('click', function() {
	console.log('backwardBtn');
	forward = false;
	playing = true;
	draw();
	// draw2();
}, false);

checkbox.addEventListener('change', function() {
	playWithBezier = checkbox.checked;
}, false);

console.log(step);

function draw() {
	timer && clearTimeout(timer);

	if (!currentTimeline) {
		currentTimeline = timeline.slice(0);

		if (!forward) {
			currentTimeline.reverse();
		}
	}

	var currentTime = currentTimeline.shift(),
		playbackProgress = currentTime / video.duration,
		playbackAnimation = playbackProgress - getSplineValue(playbackProgress, 0.25, 0.1, 0.25, 1);
		cachedCanvas = framesCache[currentTime];

	if (!playWithBezier) {
		playbackAnimation = 0;
	}

	if (cachedCanvas) {
		context.drawImage(cachedCanvas, 0, 0, video.width, video.height);
	}

	if (!currentTimeline.length) {
		playing = false;
		currentTimeline = null;
		alert('video has been played')
	}

	if (playing) {
		timer = setTimeout(draw, stepms * (slowmoFactor + playbackAnimation * 3));
	}
}

function getSplineValue(aX, mX1, mY1, mX2, mY2) {
	if (mX1 == mY1 && mX2 == mY2) return aX;

	function A(aA1, aA2) {
		return 1.0 - 3.0 * aA2 + 3.0 * aA1;
	}

	function B(aA1, aA2) {
		return 3.0 * aA2 - 6.0 * aA1;
	}

	function C(aA1) {
		return 3.0 * aA1;
	}

	function CalcBezier(aT, aA1, aA2) {
		// use Horner's scheme to evaluate the Bezier polynomial
		return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
	}

	function GetSlope(aT, aA1, aA2) {
		return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
	}

	function GetTForX(aX) {
		var initialSlope = GetSlope(aX, mX1, mX2);
		if (initialSlope < .02) console.log('fail');
		return NewtonRaphsonIterate(aX);
	}

	function NewtonRaphsonIterate(aX) {
		var aGuessT = aX;
		// Refine guess with Newton-Raphson iteration
		for (i = 0; i < 3; ++i) {
			// We're trying to find where f(t) = aX,
			// so we're actually looking for a root for: CalcBezier(t) - aX
			var currentX = CalcBezier(aGuessT, mX1, mX2) - aX;
			var currentSlope = GetSlope(aGuessT, mX1, mX2);

			if (currentSlope == 0.0) return aGuessT;
			aGuessT -= currentX / currentSlope;
		}

		return aGuessT;
	}
	return CalcBezier(GetTForX(aX), mY1, mY2);
}

/*video.addEventListener('play', function() {
	forward = true;
	playing = true;
	draw();
}, false);

video.addEventListener('ended', function() {
	playing = false;
}, false);*/

/*function draw2() {
	var playbackProgress = video.currentTime / video.duration,
		playbackAnimation = playbackProgress - getSplineValue(playbackProgress, 0.25, 0.1, 0.25, 1);

	playbackAnimation = 0;

	timer && clearTimeout(timer);

	if (forward) {
		video.currentTime += step;
	} else {
		video.currentTime -= step;
	}

	if (!video.currentTime || video.currentTime == video.duration) {
		playing = false;
	}

	if (playing) {
		timer = setTimeout(draw2, stepms * (slowmoFactor + playbackAnimation * 3));
	}
}

function draw3() {
	if (forward) {
		video.playbackRate = 1;
	} else {
		video.playbackRate = -1;
	}
	video.play();
}*/