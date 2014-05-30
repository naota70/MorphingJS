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
            eyeImage    = e.target.getItem('eye').tag,
            eyeX        = (320 - eyeImage.width) / 2 | 0,
            eyeY        = (320 - eyeImage.height) / 2 | 0,
            cManager    = new global.CreateManager(stage),
            morphing;

        function updateNum() {
            $vertex.text(cManager.vertices.length);
            $face.text(cManager.faces.length);
        }


        cManager.setTexture(eyeImage, eyeX, eyeY);

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

                        if (morphing) {
                            localStorage.setItem(lsID, JSON.stringify(morphing._morphParam));
                        }

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

        var lsID = 'morphing:' + eyeImage.src + eyeImage.width + eyeImage.height;
        var morphingData = JSON.parse(localStorage.getItem(lsID));

        if (!_.isEmpty(morphingData) && morphingData.origin) {
            morphing = new cjs.Morphing(320, 320, morphingData);
            morphing.setTexture(eyeImage, eyeX, eyeY);
            morphing.visible = false;

            stage.addChild(morphing);

            _.each(morphing._morphParam, function (faces, label) {
                $('.morphing-select').append('<option value="' + label + '">' + label + '</option>');
            });
        }


        // morphing
        $(document).on('click', '[data-morphing]', function (e) {
            var cmd = $(e.currentTarget).data('morphing');
            var label;

            if (!morphing && cmd !== 'add') {
                alert('最低２つ以上のモーフィングを追加してください');
                return;
            }

            switch (cmd) {
                case 'play':
                    var from = $('[name="morphing-play-from"]').val();
                    var to = $('[name="morphing-play-to"]').val();

                    cManager.vContainer.visible = false;
                    cManager.fContainer.visible = false;
                    morphing.visible = true;
                    morphing
                        .standby(from)
                        .gotoAndPlay(to, {
                            duration: 1000,
                            onComplete: function () {
                                cManager.vContainer.visible = true;
                                cManager.fContainer.visible = true;
                                morphing.visible = false;
                            }
                        });
                    break;
                case 'add':
                    label = $('[name="morphing-add"]').val();

                    // faces情報を生成
                    var faces = _.map(cManager.faces, function (f) {
                        var vs = _.map(f.vertices, function (v) {
                            return cjs.Morphing.generateVertex(v.name, v.x, v.y);
                        });
                        return cjs.Morphing.generateFace(f.name, vs);
                    });

                    if (morphing) {
                        if (!label.length) {
                            alert('ラベル名をつけてください。');
                            break;
                        }
                        morphing.addMorph(label, faces);
                    } else {
                        label = 'origin';
                        morphing = new cjs.Morphing(320, 320, faces);
                        morphing.setTexture(eyeImage, eyeX, eyeY);
                        morphing.visible = false;
                        stage.addChild(morphing);
                    }

                    $('.morphing-select').append('<option value="' + label + '">' + label + '</option>');

                    break;
                case 'edit':
                    // ToDo:実装
                    break;
                case 'duplicate':
                    // ToDo:実装
                    break;
                case 'setOrigin':
                    // ToDo:実装
                    break;
                case 'delete':
                    label = $('[name="morphing-delete"]').val();

                    if (label === 'origin') {
                        alert('originは削除できません');
                        return;
                    }

                    if (confirm('本当に["' + label + '"]を削除してよろしいですか？')) {
                        morphing.removeMorph(label);
                        $('option[value="' + label + '"]').remove();
                    }
                    break;
                case 'deleteAll':
                    if (confirm('本当にすべて削除してよろしいですか？')) {
                        _.each(morphing._morphParam, function (data, label) {
                            if (label !== 'origin') {
                                morphing.removeMorph(label);
                            }
                        });
                    }
                    break;
            }
        });
    }

    var loader = new cjs.LoadQueue(false);
    loader.addEventListener('complete', handleComplete);
    loader.loadManifest([
        {src: 'image/eye.png', id: 'eye'},
        {src: 'image/erutaso.jpg', id: 'erutaso'}
    ]);

})(this, createjs);