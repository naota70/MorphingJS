(function (global, cjs) {
    'use strict';

    var localStorage = global.localStorage;
    var LOCAL_STORAGE_ID = 'laughMaker:autoSaveData';

    var CreateManager = function (stage) {
        this.initialize(stage);
    };

    var p = CreateManager.prototype;

    /**
     * 初期化
     * @param stage createjs.Stage
     */
    p.initialize = function (stage) {
        var self = this;
        var vContainer = self.vContainer = new cjs.Container();
        var fContainer = self.fContainer = new cjs.Container();

        stage.addChild(fContainer, vContainer);

        self.stage = stage;
        self.cacheCanvas = stage.canvas.cloneNode(true);
        self.vertices = [];
        self.faces = [];
        self.selected = [];

        self.load();
    };

    p.setTexture = function () {
        var ctx = this.cacheCanvas.getContext('2d');
        return ctx.drawImage.apply(ctx, arguments);
    };

    p.load = function () {
        var self = this;
        var data = localStorage.getItem(LOCAL_STORAGE_ID);
        if (!_.isEmpty(data)) {
            if (_.isString(data)) {
                data = JSON.parse(data);
            }

            _.each(data.vertices, function (v_data) {
                self.createVertex(v_data.x, v_data.y, v_data.name);
            });

            _.each(data.faces, function (f_data) {
                var vertices = f_data.vertices;
                self.createFace([
                    self.getVertexAtName(vertices[0]),
                    self.getVertexAtName(vertices[1]),
                    self.getVertexAtName(vertices[2]),
                    self.getVertexAtName(vertices[3])
                ], f_data.name);
            });
        }
    };

    p.save = function () {
        var data = JSON.stringify({
            vertices: _.map(this.vertices, function (v) {
                return {x: v.x, y: v.y, name: v.name};
            }),
            faces: _.map(this.faces, function (f) {
                return {
                    name: f.name,
                    vertices: _.pluck(f.vertices, 'name')
                };
            })
        });
        localStorage.setItem(LOCAL_STORAGE_ID, data);

        alert('保存しました。');
    };

    /**
     * 頂点の追加
     * @param x Number
     * @param y Number
     */
    p.createVertex = function (x, y, name) {
        var self = this;
        var vertices = self.vertices;
        var vertex = new cjs.Vertex(x, y);

        vertex.name = name || 'v:' + Date.now() + cjs.UID.get();
        self.vContainer.addChild(vertex);
        vertices.push(vertex);

        // mouse event
        vertex.addEventListener('mousedown', function () {
            return self._handleDown.apply(self, arguments);
        });
        vertex.dispatchEvent(new cjs.MouseEvent('mousedown', false, false, x, y, {}), vertex);

        return vertex;
    };

    /**
     * 選択中の頂点を削除
     * @param target_vertices [createjs.Vertex]
     */
    p.removeVertex = function (target_vertices) {
        var self = this;
        var vertices = self.vertices;
        var faces = self.selectedFaces();

        if (faces.length) {
            if (window.confirm('面のみを削除しますか？')) {
                self.removeFaces(faces);
                return;
            }
        }

        target_vertices = Array.isArray(target_vertices) ?
            target_vertices :
            [target_vertices];

        if (target_vertices.length) {
            for (var i = 0, len = target_vertices.length, v; i < len; i++) {
                v = target_vertices[i];
                vertices.splice(vertices.indexOf(v), 1);
                v.remove();
            }
            self.selected = [];
        }
    };

    /**
     * ToDo: 同じ頂点を用いた際の予防線
     * @param __vertices__
     * @param name
     */
    p.createFace = function (__vertices__, name) {
        var self = this,
            faces = self.faces,
            face = new cjs.Face(__vertices__, self.cacheCanvas);

        face.name = name ? name : 'f:' + Date.now() + cjs.UID.get();
        self.fContainer.addChild(face);
        faces.push(face);

        face.addEventListener('remove', function (e) {
            var index = faces.indexOf(e.target);
            index !== -1 && faces.splice(index, 1);
        });
    };

    p.selectedFaces = function () {
        return _.select(this.faces, function (f) {
            return f.isSelected();
        });
    };

    p.removeFaces = function (selected) {
        var faces = this.faces;
        _.each(selected, function (f) {
            var i = faces.indexOf(f);
            i !== -1 && faces.splice(i, 1);
            f.remove();
        });
    };

    p.cancelAll = function () {
        var selected = this.selected;

        for (var i = 0, len = selected.length, v; i < len; i++) {
            v = selected[i];
            v.cancel();
        }

        this.selected = [];
    };

    p.getVertexAtName = function (name) {
        return _.detect(this.vertices, function (v) {
            return v.name === name;
        });
    };

    p.alignLeft = function () {
        this._setAlign(_.min(this.selected, function (v) {
            return v.x;
        }).x);
    };

    p.alignRight = function () {
        this._setAlign(_.max(this.selected, function (v) {
            return v.x;
        }).x);
    };

    p.alignCenter = function () {
        var vs = this.selected;
        this._setAlign(_.reduce(vs, function (memo, v) {
            return memo + v.x;
        }, 0) / vs.length|0);
    };

    p._setAlign = function (x, y) {
        _.each(this.selected, function (v) {
            v.move(x || v.x, y || v.y);
        });
    };

    p.alignTop = function () {
        this._setAlign(0, _.min(this.selected, function (v) {
            return v.y;
        }).y);
    };

    p.alignBottom = function () {
        this._setAlign(0, _.max(this.selected, function (v) {
            return v.y;
        }).y);
    };

    p.alignMiddle = function () {
        var vs = this.selected;
        this._setAlign(0, _.reduce(vs, function (memo, v) {
            return memo + v.y;
        }, 0) / vs.length|0);
    };

    p.stackVertical = function () {
        var vs = this.selected;
        var min = _.sortBy(vs, function (v) {
            return v.y;
        });
        var minY = min[0].y;
        var maxY = _.max(vs, function (v) {
            return v.y;
        }).y;
        var range = _.range(minY, maxY + 1, (maxY - minY) / (vs.length - 1));
        _.each(min, function (v, i) {
            v.move(v.x, range[i]|0);
        });
    };

    p.stackHorizon = function () {
        var vs = this.selected;
        var min = _.sortBy(vs, function (v) {
            return v.x;
        });
        var minX = min[0].x;
        var maxX = _.max(vs, function (v) {
            return v.x;
        }).x;
        var range = _.range(minX, maxX + 1, (maxX - minX) / (vs.length - 1));
        _.each(min, function (v, i) {
            v.move(range[i]|0, v.y);
        });
    };

    p.selectAtRect = function (leftTopX, leftTopY, rightBottomX, rightBottomY) {
        this.selected = _.select(this.vertices, function (v) {
            if (v.x >= leftTopX && v.x <= rightBottomX && v.y >= leftTopY && v.y <= rightBottomY) {
                v.select();
                return true;
            }

            v.cancel();
            return false;
        });
    };

    p.createGrid = function (leftTopX, leftTopY, rightBottomX, rightBottomY, width, height) {
        var self = this;
        var xRange = _.range(leftTopX, rightBottomX + 1, width);
        var yRange = _.range(leftTopY, rightBottomY + 1, height);
        var xLen = xRange.length;
        var yLen = yRange.length;
        var vertices = [];

        // createVertex
        for (var n = 0; n < yLen; n++) {
            for (var i = 0; i < xLen; i++) {
                vertices.push(self.createVertex(xRange[i], yRange[n]));
            }
        }

        if (xLen > 1 && yLen > 1) {
            // createFace
            _.each(vertices, function (v, i) {
                if ((i + 1) % xLen && vertices.length > i + xLen) {
                    self.createFace([v, vertices[i + 1], vertices[i + xLen], vertices[i + xLen + 1]]);
                }
            });
        }
    };



    p._handleDown = function (e) {
        e.preventDefault();

        var self = this,
            target = e.target,
            isMove, isShift, selected, selected_index,
            handleMove, handleUp;

        if (target.isLocked()) {// ロック中
            return;
        }

        isMove = false;
        isShift = e.nativeEvent.shiftKey;
        selected = self.selected;
        selected_index = selected.indexOf(target);
        handleMove = function (e) {
            e.preventDefault();

            isMove = true;

            for (var i = 0, len = selected.length, v, o; i < len; i++) {
                v = selected[i];
                o = v.offset;
                v.move(e.stageX + o.x, e.stageY + o.y);
            }
        };
        handleUp = function (e) {
            e.preventDefault();

            target.removeEventListener('pressmove', handleMove);
            target.removeEventListener('pressup', handleUp);

            if (isMove) {
                for (var i = 0, len = selected.length, v; i < len; i++) {
                    v = selected[i];
                    delete v.offset;
                }
            }
        };

        if (isShift) {// 複数選択解除
            if (selected_index !== -1) {// 選択済み
                selected.splice(selected_index, 1);
                target.cancel();
                return;
            }
        } else if (selected_index === -1) {// 新規選択
            self.cancelAll();
            selected = self.selected;
        }

        selected.push(target);

        for (var i = 0, len = selected.length, v; i < len; i++) {
            v = selected[i];
            v.offset = new cjs.Point(v.x - e.stageX, v.y - e.stageY);
        }

        !target.isSelected() && target.select();
        target.addEventListener('pressmove', handleMove);
        target.addEventListener('pressup', handleUp);
    };

    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return CreateManager;
        });
    } else {
        global.CreateManager = CreateManager;
    }

})(this, createjs);