var fs = require('fs'),
	gruntConfig = {
		video_slicer: {
			options: {
				sections: [{
					name: 'section0',
					time: [0, 15.85]
				}, {
					name: 'section1',
					time: [15.85, 39.35],
					sequence: [15.85, 17]
				}, {
					name: 'section2',
					time: [39.35, 50.8]
				}, {
					name: 'section3',
					time: [50.8, 118.5]
				}, {
					name: 'section4',
					time: 118.5
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