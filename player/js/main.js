var video = document.getElementById('video'),
	play = document.getElementById('play'),
	seeking = document.getElementById('seeking'),
	run = document.getElementById('run'),
	jump = document.getElementById('jump'),
	attack = document.getElementById('attack'),
	loading = document.getElementById('loading'),
	sectionsMap = new Sections(video, {
		fps: 30,
		onPlay: function() {
			loading.style.display = 'none';
			play.disabled = true;
		},
		onPause: function() {
			play.disabled = false;
		},
		onTimeupdate: function(video) {
			seeking.value = video.currentTime;
		}
	}),
	currentSection = null,
	videoIsLoaded = false;

function selectSection(id) {
	var sections = document.getElementsByName('sections');

	for (var i = 0, length = sections.length; i < length; i++) {
		if (sections[i].value == id) {
			sections[i].checked = true;
		}
	}
}

sectionsMap.add({
	time: [15.9, 17],
	keyframe: 'img/keyframe-scene1.jpg',
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		section.setCurrentProgress();
		selectSection(section.id);

		play.disabled = true;
		run.value = 0;
		$(run).fadeIn(section.sectionMovie.duration * 1000, function() {
			run.disabled = false;
		});

		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		run.disabled = true;
		run.style.display = 'none';
		currentSection = null;
	}
}, {
	time: 39.35,
	keyframe: 'img/keyframe-scene2.jpg',
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		attack.disabled = false;
		attack.style.display = 'block';
		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		jump.disabled = true;
		attack.disabled = true;
		attack.style.display = 'none';
		currentSection = null;
	}
}, {
	time: 50.8,
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		attack.disabled = false;
		attack.style.display = 'block';
		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		jump.disabled = true;
		attack.disabled = true;
		attack.style.display = 'none';
		currentSection = null;
	}
}, {
	time: 118.5,
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		attack.disabled = false;
		attack.style.display = 'block';
		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		jump.disabled = true;
		attack.disabled = true;
		attack.style.display = 'none';
		currentSection = null;
	}
});

video.addEventListener('progress', function() {
	if (!videoIsLoaded && video.buffered.length === 1) {
		videoIsLoaded = true;
		play.disabled = false;
		loading.style.display = 'none';
	}
});

play.addEventListener('click', function() {
	if (!play.disabled) {
		video.play();
	}
});

jump.addEventListener('change', function() {
	if (!jump.disabled) {
		currentSection.setCurrentProgress(jump.value);
	}
});

jump.addEventListener('mouseup', function() {
	if (!jump.disabled) {
		if (jump.value == 100) {
			currentSection.complete();
		}
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