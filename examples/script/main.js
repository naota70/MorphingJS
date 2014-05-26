(function (global, cjs) {
    'use strict';

    var $canvas = $('#canvas');
    var offset = $canvas.offset();
    var $position = $('#monitor-pos > span');
    var stage = window.stage = new cjs.Stage($canvas[0]);
    var Ticker = cjs.Ticker;
    var $count = 0;
    var $time = new Date().getTime();
    var $fps = $('#monitor-fps > span');
    var FPS = 60;
    var vManger = new global.VertexManager(stage);

    $canvas.on({
        dblclick: function (e) {
            e.preventDefault();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            vManger.createVertex(x, y);
        },
        mousemove: function (e) {
            e.preventDefault();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            $position.text('(' + x + ',' + y + ')');
        }
    });

    $(document).keypress(function (e) {
        var selected = vManger.selected;
        switch (e.which) {
            case 8:
                if (selected.length) {
                    e.preventDefault();
                    vManger.removeVertex(selected);
                }
                break;
            case 13:
                if (selected.length === 3) {
                    e.preventDefault();
                    vManger.createFace(selected);
                }
                break;
        }
    });

    $('#toggle-edge').on('click', function () {
        var $this = $(this);
        var isVisible = !!$this.data('isVisible');

        _.each(vManger.faces, function (f) {
            isVisible ?
                f.hiddenEdge() :
                f.visibleEdge();
        });

        $this.data('isVisible', !isVisible);
    });
    $('#toggle-face').on('click', function () {
        var $this = $(this);
        var isVisible = !!$this.data('isVisible');

        _.each(vManger.faces, function (f) {
            isVisible ?
                f.hiddenFace() :
                f.visibleFace();
        });

        $this.data('isVisible', !isVisible);
    });
    $('#toggle-select').on('click', function () {
        vManger.cancelAll();
    });
    $('#btn-save').on('click', function () {
        vManger.save();
    });

    Ticker.setFPS(FPS);

    Ticker.addEventListener('tick', function () {

        //---------FPSのカウント
        $count++;
        var now = new Date().getTime();
        if (now - $time > 1000) {
            $fps.text((($count * 1000) / (now - $time) * 10 |0) / 10 + '/' + FPS);
            $time = now;
            $count = 0;
        }

        stage.update();
    });

})(this, createjs);