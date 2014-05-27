(function (global, cjs) {
    'use strict';

    function handleComplete(e) {
        var $canvas     = $('#canvas'),
            $position   = $('#monitor-pos > span'),
            $fps        = $('#monitor-fps > span'),
            $vertex     = $('#monitor-vertex > span'),
            $face       = $('#monitor-face > span'),
            offset      = $canvas.offset(),
            stage       = new cjs.Stage($canvas[0]),
            Ticker      = cjs.Ticker,
            $count      = 0,
            $time       = new Date().getTime(),
            FPS         = 30,
            mouseObj    = {},
            MODE_MOVE   = 'moveVertex',
            MODE_ADD    = 'addVertex',
            mode        = MODE_MOVE,
            mManager     = new global.MorphingManager(),
            cManager     = new global.CreateManager(stage, e.target);

        function updateNum() {
            $vertex.text(cManager.vertices.length);
            $face.text(cManager.faces.length);
        }

        // キャンバス
        $canvas.on({
            mousedown: function (e) {
                mouseObj.isDown = true;
                mouseObj.startX = e.pageX - offset.left;
                mouseObj.startY = e.pageY - offset.top;
            },
            mousemove: function (e) {
                e.preventDefault();

                var x = e.pageX - offset.left;
                var y = e.pageY - offset.top;

                $position.text('(' + x + ',' + y + ')');

                if (mouseObj.isDown && !mouseObj.isDrag) {
                    mouseObj.isDrag = true;
                }
            },
            mouseup: function (e) {
                e.preventDefault();

                var startX = mouseObj.startX;
                var startY = mouseObj.startY;
                var endX = e.pageX - offset.left;
                var endY = e.pageY - offset.top;
                var minX = _.sortBy([startX, endX]);
                var minY = _.sortBy([startY, endY]);

                switch (mode) {
                    case MODE_ADD:
                        if (mouseObj.isDrag) {
                            // ToDo:サイズをテキストフィールド指定に
                            cManager.createGrid(minX[0], minY[0], minX[1], minY[1],
                                $('.grid-width').val() - 0, $('.grid-height').val() - 0
                            );
                        } else {
                            cManager.createVertex(endX, endY);
                        }

                        updateNum();
                        break;
                    case MODE_MOVE:
                        if (mouseObj.isDrag && Math.abs(startX - endX) > 10 && Math.abs(startY - endY) > 10) {
                            cManager.selectAtRect(minX[0], minY[0], minX[1], minY[1]);
                        }
                        break;
                }

                mouseObj.isDown = false;
                mouseObj.isDrag = false;
            }
        });

        // ショートカット
        $(document).keydown(function (e) {
            var selected = cManager.selected;
            var num = selected.length;
            var MOVE_VOLUME = e.shiftKey ? 10 : 1;

            switch (e.which) {
                case 8:// Delete key:delete vertex and face
                    if (num) {
                        e.preventDefault();
                        cManager.removeVertex(selected);
                        updateNum();
                    }
                    break;
                case 13:// Enter key:create face
                    if (num === 4) {
                        e.preventDefault();
                        cManager.createFace(selected);
                        updateNum();
                    } else if (num) {
                        alert('頂点を' + num + 'コ選択しています。\n面を作成するには4つの頂点を選んでください。');
                    }
                    break;
                case 83:// Cmd + s:save data
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        cManager.save();
                    }
                    break;
                case 79:// Cmd + o:load data
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        alert('読み込み機能はまだ実装されていません。');
                    }
                    break;
                case 37://left
                    e.preventDefault();
                    _.each(selected, function (v) {
                        v.move(v.x - MOVE_VOLUME, v.y);
                    });
                    break;
                case 38://top
                    e.preventDefault();
                    _.each(selected, function (v) {
                        v.move(v.x, v.y - MOVE_VOLUME);
                    });
                    break;
                case 39://right
                    e.preventDefault();
                    _.each(selected, function (v) {
                        v.move(v.x + MOVE_VOLUME, v.y);
                    });
                    break;
                case 40://bottom
                    e.preventDefault();
                    _.each(selected, function (v) {
                        v.move(v.x, v.y + MOVE_VOLUME);
                    });
                    break;
            }
        });

//        $('#toggle-select').on('click', function () {
//            cManager.cancelAll();
//        });

        $('#btn-save').on('click', function () {
            cManager.save();
        });

        $('.btn-align').on('click', function (e) {
            if (!cManager.selected) {
                return;
            }
            cManager[$(e.currentTarget).data('align')].apply(cManager);
        });

        // mode change
        $('select[name="mode"]').on({
            change: function (e) {
                mode = $(e.currentTarget).val();

                switch (mode) {
                    case MODE_ADD:
                        _.each(cManager.vertices, function (v) {
                            v.lock();
                        });
                        $('.grid-width, .grid-height').removeAttr('disabled');
                        break;
                    case MODE_MOVE:
                        _.each(cManager.vertices, function (v) {
                            v.unlock();
                        });
                        $('.grid-width, .grid-height').attr('disabled', 'disabled');
                        break;
                }
            }
        });

        $('input[name="toggle-vertex"]').on({
            change: function (e) {
                var $this = $(e.currentTarget);
                var visible = _.isEmpty($this.attr('checked'));

                if (!visible) {
                    $this.removeAttr('checked');
                } else {
                    $this.attr('checked', 'checked');
                }

                cManager.vContainer.visible = visible;
            }
        });

        $('[data-morphing]').on({
            click: function (e) {
                var cmd = $(e.currentTarget).data('morphing');
                mManager[cmd].apply(mManager, [cManager.faces]);
            }
        });

        // 始動!!!
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