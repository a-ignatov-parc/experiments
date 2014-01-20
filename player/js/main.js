var video = document.getElementById('video'),
	play = document.getElementById('play'),
	seeking = document.getElementById('seeking'),
	sprogress = document.getElementById('sprogress'),
	progress = document.getElementById('progress'),
	run = document.getElementById('run'),
	attack = document.getElementById('attack'),
	loading = document.getElementById('loading'),
	sectionsMap = new Sections(video, {
		video: {
			width: 960,
			height: 540,
			fps: 30,
			baseUrl: 'videos',
			sources: [{
				type: 'video/mp4',
				extension: 'mp4'
			}, {
				type: 'video/webm',
				extension: 'webm'
			}]
		},
		onReady: function() {
			loading.style.display = 'none';
			play.disabled = false;
		},
		onPlay: function() {
			play.disabled = true;
		},
		onPause: function() {
			play.disabled = false;
		},
		onTimeupdate: function(video) {
			seeking.value = video.currentTime;
			progress.value = video.progress + ' %';
			sprogress.value = video.sequenceProgress + ' %';
		}
	}),
	currentSection = null,
	videoIsLoaded = false;

function selectSection(id) {
	$('#section' + id)
		.addClass('bList__eItem__mActive')
		.siblings('.bList__eItem__mActive')
		.removeClass('bList__eItem__mActive');

	showControls(id);
}

function showControls(id) {
	hideControls();
	$('.bVideo__eScenesControls__eScene__mScene' + id).addClass('bVideo__eScenesControls__eScene__mActive');
}

function hideControls() {
	$('.bVideo__eScenesControls__eScene').removeClass('bVideo__eScenesControls__eScene__mActive');
}

sectionsMap.add({
	keyframe: 'img/keyframe-scene0.jpg',
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);
		play.disabled = true;

		currentSection = section;
	},
	onComplete: function(section) {
		console.log('section with id: "' + section.id + '" is completed');
		hideControls();
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');
		currentSection = null;
	}
}, {
	keyframe: 'img/keyframe-scene1.jpg',
	sequenceFrames: 'videos/section1-sequence.json',
	onTimeupdate: function(sectionMovie, section) {
		if (sectionMovie.sequenceProgress) {
			hideControls();
		} else {
			showControls(section.id);
		}
	},
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		section.setCurrentProgress();
		selectSection(section.id);

		play.disabled = true;
		run.value = 0;
		run.disabled = false;
		run.style.display = 'block';

		currentSection = section;
	},
	onComplete: function(section) {
		console.log('section with id: "' + section.id + '" is completed');

		hideControls();

		run.disabled = true;
		run.style.display = 'none';
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');
		currentSection = null;
	}
}, {
	keyframe: 'img/keyframe-scene2.jpg',
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		attack.disabled = false;
		attack.style.display = 'block';
		currentSection = section;
	},
	onComplete: function(section) {
		console.log('section with id: "' + section.id + '" is completed');

		hideControls();

		attack.disabled = true;
		attack.style.display = 'none';
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');
		currentSection = null;
	}
}, {
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		attack.disabled = false;
		attack.style.display = 'block';
		currentSection = section;
	},
	onComplete: function(section) {
		console.log('section with id: "' + section.id + '" is completed');

		hideControls();

		attack.disabled = true;
		attack.style.display = 'none';
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');
		currentSection = null;
	}
}, {
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		attack.disabled = false;
		attack.style.display = 'block';
		currentSection = section;
	},
	onComplete: function(section) {
		console.log('section with id: "' + section.id + '" is completed');

		hideControls();

		attack.disabled = true;
		attack.style.display = 'none';
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');
		currentSection = null;
	}
});

play.addEventListener('click', function() {
	if (!play.disabled) {
		sectionsMap.start();
	}
});

run.addEventListener('change', function() {
	if (!run.disabled) {
		currentSection.setCurrentProgress(run.value);
	}
});

run.addEventListener('mouseup', function() {
	if (!run.disabled) {
		if (run.value == 100) {
			currentSection.complete();
		}
	}
});

attack.addEventListener('click', function() {
	if (!attack.disabled) {
		currentSection.complete();
	}
});

var sectionsClickHandler = function(event) {
	var item = $(event.currentTarget);

	if (!item.hasClass('bList__eItem__mActive')) {
		sectionsMap.goto(item.attr('rel'));
	}
	return false;
}

$('.bList__eItem').on('click', sectionsClickHandler);