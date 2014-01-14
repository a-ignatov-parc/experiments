var video = document.getElementById('video'),
	play = document.getElementById('play'),
	pause = document.getElementById('pause'),
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
			pause.disabled = false;
		},
		onPause: function() {
			play.disabled = false;
			pause.disabled = true;
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
	time: [2.25, 3.6],
	// onStreamed: false,
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		// section.setCurrentProgress(0);
		selectSection(section.id);

		play.disabled = true;
		pause.disabled = true;
		run.value = 0;
		$(run).fadeIn(section.sectionMovie.duration * 1000, function() {
			run.disabled = false;
		});

		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		pause.disabled = false;
		run.disabled = true;
		run.style.display = 'none';
		currentSection = null;
	}
}, {
	time: 4.4,
	onStreamed: false,
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		pause.disabled = true;
		attack.disabled = false;
		attack.style.display = 'block';
		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		jump.disabled = true;
		pause.disabled = false;
		attack.disabled = true;
		attack.style.display = 'none';
		currentSection = null;
	}
}, {
	time: [9.5, 14.5],
	onTimeupdate: function(sectionMovie) {
		var percentage = Math.floor((sectionMovie.currentTime / sectionMovie.duration) * 100);

		if (!percentage) {
			jump.disabled = false;
		}
	},
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		selectSection(section.id);

		play.disabled = true;
		pause.disabled = true;
		jump.value = 0;
		jump.style.display = 'block';
		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		pause.disabled = false;
		jump.disabled = true;
		jump.style.display = 'none';
		currentSection = null;
	}
});

video.addEventListener('progress', function() {
	if (!videoIsLoaded && video.buffered.length === 1) {
		videoIsLoaded = true;
		video.play();
	}
});

play.addEventListener('click', function() {
	if (!play.disabled) {
		video.play();
	}
});

pause.addEventListener('click', function() {
	if (!pause.disabled) {
		video.pause();
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