var video = document.getElementById('video'),
	play = document.getElementById('play'),
	pause = document.getElementById('pause'),
	seeking = document.getElementById('seeking'),
	range = document.getElementById('range'),
	attack = document.getElementById('attack'),
	sectionsMap = new Sections(video, {
		fps: 30,
		onPlay: function() {
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
	currentSection = null;

sectionsMap.add({
	time: 4,
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		var sections = document.getElementsByName('sections');

		for (var i = 0, length = sections.length; i < length; i++) {
			if (sections[i].value == section.id) {
				sections[i].checked = true;
			}
		}
		play.disabled = true;
		pause.disabled = true;
		attack.disabled = false;
		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		range.disabled = true;
		pause.disabled = false;
		attack.disabled = true;
		currentSection = null;
	}
}, {
	time: [9.5, 14.5],
	onTimeupdate: function(sectionMovie) {
		var percentage = Math.floor((sectionMovie.currentTime / sectionMovie.duration) * 100);

		if (!percentage) {
			range.disabled = false;
		}
	},
	onActivate: function(section) {
		console.log('section with id: "' + section.id + '" is activated');

		var sections = document.getElementsByName('sections');

		for (var i = 0, length = sections.length; i < length; i++) {
			if (sections[i].value == section.id) {
				sections[i].checked = true;
			}
		}
		play.disabled = true;
		pause.disabled = true;
		range.value = 0;
		currentSection = section;
	},
	onDeactivate: function(section) {
		console.log('section with id: "' + section.id + '" is deactivated');

		range.disabled = true;
		pause.disabled = false;
		currentSection = null;
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

range.addEventListener('change', function() {
	if (!range.disabled) {
		currentSection.setCurrentProgress(range.value);
	}
});

range.addEventListener('mouseup', function() {
	if (!range.disabled) {
		if (range.value == 100) {
			currentSection.complete();
		}
	}
});

attack.addEventListener('click', function() {
	if (!attack.disabled) {
		currentSection.complete();
	}
});

video.play();