(function (global, cjs) {
    'use strict';

    function handleComplete(e) {
        var $canvas     = $('#canvas'),
            $position   = $('#monitor-pos > span'),
            $fps        = $('#monitor-fps > span'),
            offset      = $canvas.offset(),
            stage       = new cjs.Stage($canvas[0]),
            Ticker      = cjs.Ticker,
            $count      = 0,
            $time       = new Date().getTime(),
            FPS         = 60,
            vManger     = new global.VertexManager(stage, e.target);

        function updateNum() {
            $('#monitor-vertex > span').text(vManger.vertices.length);
            $('#monitor-face > span').text(vManger.faces.length);
        }

        $canvas.on({
            dblclick: function (e) {
                e.preventDefault();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
                vManger.createVertex(x, y);
                updateNum();
            },
            mousemove: function (e) {
                e.preventDefault();
                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;
                $position.text('(' + x + ',' + y + ')');
            }
        });

        $(document).keydown(function (e) {
            var selected = vManger.selected;
            var num = selected.length;

            switch (e.which) {
                case 8:// Delete key:delete vertex and face
                    if (num) {
                        e.preventDefault();
                        vManger.removeVertex(selected);
                        updateNum();
                    }
                    break;
                case 13:// Enter key:create face
                    if (num === 4) {
                        e.preventDefault();
                        vManger.createFace(selected);
                        updateNum();
                    } else if (num) {
                        alert('頂点を' + num + 'コ選択しています。\n面を作成するには4つの頂点を選んでください。');
                    }
                    break;
                case 83:// Cmd + s:save data
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        vManger.save();
                    }
                    break;
                case 79:// Cmd + o:load data
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        alert('読み込み機能はまだ実装されていません。');
                    }
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

        $('.btn-align').on('click', function (e) {
            if (!vManger.selected) {
                return;
            }
            vManger[$(e.currentTarget).data('align')].apply(vManger);
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

        updateNum();
    }

    var loader = new cjs.LoadQueue(false);
    loader.addEventListener('complete', handleComplete);
    loader.loadManifest([
        {src: 'image/eye.png', id: 'eye'},
        {src: 'image/erutaso.jpg', id: 'erutaso'}
    ]);

})(this, createjs);