(function (global, cjs) {

	var MorphingManager = function () {
		this.initialize();
	};

	var p = MorphingManager.prototype;

    p.initialize = function () {

    };

    /**
     * 現在のfacesの座標を内包
     * @param faces
     */
    p.add = function (faces) {

    };

    p.remove = function (index) {

    };

    p.update = function (faces, index) {

    };

    p.play = function () {

    };

    p.stop = function () {

    };

    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return MorphingManager;
        });
    } else {
        global.MorphingManager = MorphingManager;
    }
	
})(this, createjs);