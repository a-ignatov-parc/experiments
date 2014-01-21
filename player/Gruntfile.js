var fs = require('fs'),
	gruntConfig = {
		video_slicer: {
			options: {
				sections: [{
					name: 'section0',
					time: [0, 16]
				}, {
					name: 'section1',
					time: [16, 38],
					sequence: [16, 17]
				}, {
					name: 'section2',
					time: [38, 50]
				}, {
					name: 'section3',
					time: [50, 117]
				}, {
					name: 'section4',
					time: 117
				}],
				emptyDestBeforeStart: true
			},
			video: {
				src: 'videos/video.mp4',
				dest: 'sections/'
			}
		}
	};

module.exports = function(grunt) {
	// Инициализируем конфиг
	grunt.initConfig(gruntConfig);

	// Загружаем кастомные таски
	grunt.loadTasks('tasks');

	// Регистрируем таски
	grunt.registerTask('default', 'video_slicer');
};