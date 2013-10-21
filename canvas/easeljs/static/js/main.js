$(function() {
	//Create a stage by getting a reference to the canvas
	var normalFPS = 120,
		slowmoFPS = 30,
		stepSize = 2,
		queue = new createjs.LoadQueue(true),
		stage = new createjs.Stage('canvas_id'),
		loadingText = 'Загрузка ресурсов',
		text = new createjs.Text(loadingText + '...', '14px PT Sans', '#000'),
		blurFilter = new createjs.BlurFilter(5, 5, 10),
		bounds = blurFilter.getBounds(),
		flag = false;

	text.x = text.y = 10;
	stage.addChild(text);
	stage.update();

	queue.installPlugin(createjs.Sound);

	queue.addEventListener('fileload', function(event) {
		text.text = loadingText + ': ' + Math.round(event.currentTarget._numItemsLoaded * 100 / event.currentTarget._numItems) + '%';
		stage.update();
	});

	queue.addEventListener('complete', function(event) {
		var currentFps = normalFPS,
			tween = createjs.Tween,
			sound = createjs.Sound.createInstance('slowmo'),
			bg = new createjs.Bitmap(event.currentTarget.getItem('bg').tag),
			bitmap = new createjs.Bitmap(event.currentTarget.getItem('logo').tag),
			bitmap2 = bitmap.clone(),
			bitmapBounds,
			bitmap2Bounds;

		stage.removeChild(text);

		// bitmap.filters = [blurFilter];
		bitmapBounds = bitmap.getBounds();
		bitmap.cache(bitmapBounds.x + bounds.x, bitmapBounds.y + bounds.y, bitmapBounds.width + bounds.width, bitmapBounds.height + bounds.height);

		bitmap.x = bitmapBounds.width / 2;
		bitmap.y = bitmapBounds.height / 2;

		bitmap2.filters = [blurFilter];
		bitmap2Bounds = bitmap2.getBounds();
		bitmap2.cache(bitmap2Bounds.x + bounds.x, bitmap2Bounds.y + bounds.y, bitmap2Bounds.width + bounds.width, bitmap2Bounds.height + bounds.height);
		bitmap2.setTransform(null, null, 1.2, 1.2);
		bitmap2.y += 10;

		bg.filters = [new createjs.BlurFilter(5, 5, 1)];
		bg.cache(0, 0, stage.canvas.width, stage.canvas.height);

		tween
			.get(bitmap, {
				loop: true,
				useTicks: true
			})
			.to({
				alpha: 0
			}, 50)
			.to({
				alpha: 1
			}, 50);

		stage.addChild(bg, bitmap, bitmap2);

		createjs.Ticker.setFPS(currentFps);
		createjs.Ticker.addEventListener('tick', function() {
			bitmapBounds = bitmap.getBounds();
			bitmap2Bounds = bitmap2.getBounds();

			if (bitmap.x + bitmapBounds.width < stage.canvas.width && !flag) {
				// bitmap.setTransform(bitmap.x + 1, bitmap.y, null, null, bitmap.x + 1, null, null, bitmapBounds.width / 2, bitmapBounds.height / 2);
				bitmap.x += stepSize;
			}

			if (bitmap2.x + (bitmap2Bounds.width / 2) > stage.canvas.width * 4 / 7) {
				if (currentFps != normalFPS) {
					currentFps = normalFPS;
					sound.resume();

					setTimeout(function() {
						createjs.Ticker.setFPS(normalFPS);
					}, 1500);
				}

			} else if (bitmap2.x + (bitmap2Bounds.width / 2) > stage.canvas.width / 3) {
				if (currentFps != slowmoFPS) {
					createjs.Ticker.setFPS(currentFps = slowmoFPS);
					sound.play();

					setTimeout(function() {
						sound.pause();
					}, 3000);
				}
			}

			if (bitmap2.x + bitmap2Bounds.width < stage.canvas.width && bitmap.x > 50) {
				bitmap2.x += stepSize * 1.15;
			} else {
				tween.removeAllTweens();
				tween
					.get(bitmap, {
						loop: false,
						useTicks: true
					})
					.to({
						alpha: 1
					}, 50);
				flag = true;
			}
			stage.update();
		});
	});

	queue.loadManifest([{
		id: 'bg',
		src: 'static/img/bg.png'
	}, {
		id: 'logo',
		src: 'static/img/html5.png'
	}, {
		id: 'slowmo',
		src: 'static/sound/slowmo.mp3'
	}]);
});