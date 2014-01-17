if ( !window.requestAnimationFrame ) {
	window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(frameFunction) { return null; };
}

var fps = {

    counter: 0,
    
    current: 0,
    secondInt: 0,
    minuteInt: 0,
    events: {},
    eventCounters: {},
    logStr: '',
    logStrDuration: 0,
    
    el: null,

    init: function() {
        fps.frame();
        
        // second interval
        secondInt = setInterval(fps.everySecond, 1000)
        
        // create panel after page load
        if (document.readyState == 'complete') {
            fps.createPanel();
        } else {
            window.addEventListener('load', fps.createPanel, false);
        }
    },
    frame: function() {
        requestAnimationFrame(fps.frame);
        fps.counter++;
        for (var i in fps.eventCounters) {
            fps.eventCounters[i]++;
        }
    },


    createPanel: function() {
        // create div element that contains fps panel
        // to do: make it draggable
        fps.el = document.createElement('div');
        fps.el.setAttribute('style', 'position: fixed; z-index: 10000; top: 5px; left: 5px; padding: 3px; border: 1px solid #fff; border-radius: 3px; background: #0b1f42; font: 10px/10px Arial, sans-serif; color: #fff;');
        fps.everySecond();
        document.getElementsByTagName('body')[0].appendChild(fps.el);
    },
    updatePanel: function() {
        if (fps.el) {
            var logStr = '';
            if (fps.logStr && fps.logStrDuration) {
                fps.logStrDuration--;
                logStr = ' | ' + fps.logStr;
            }
            fps.el.innerHTML = fps.current + ' fps' + logStr;
        }
    },
    everySecond: function() {
        fps.updatePanel();
        fps.current = fps.counter;
        fps.counter = 0;
    },

    showPanel: function() {
        if (fps.el) fps.el.style.display = 'block';
    },
    hidePanel: function() {
        if (fps.el) fps.el.style.display = 'none';
    },
    showLog: function(name, lines) {
        
    },
    hideLog: function() {
        
    },
    log: function(name, lines) {
        
    },

    // custom events
    start: function(name, type) {
        if (!fps.events[name]) {
            fps.events[name] = [];
        }
        if (fps.eventCounters[name]) {
            fps.end(name);
        }
        fps.events[name].push({
            name: name,
            type: type,
            start: new Date(),
            end: null,
            counts: 0
        })
        fps.eventCounters[name] = 0;
    },
    end: function(name, comment) {
        if (fps.events[name]) {
            var lastCounter = fps.events[name][fps.events[name].length - 1];
            lastCounter.end = new Date();
            lastCounter.counts = fps.eventCounters[name];
            
            var msSpent = lastCounter.end - lastCounter.start;
            fps.logStr = name + ': ' + (Math.round(msSpent / 10) / 100) + 's (' + Math.round(lastCounter.counts / msSpent * 1000) + ' fps)';
            fps.logStrDuration = 5;
            fps.updatePanel();

            console.debug(fps.logStr);
        }
        if (fps.eventCounters[name]) {
            delete fps.eventCounters[name];
        }
    }
}
fps.init();