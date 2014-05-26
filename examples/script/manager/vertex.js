(function (global, cjs) {
    'use strict';

    var VertexManager = function (stage) {
        this.initialize(stage);
    };

    var p = VertexManager.prototype;

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
        self.vertices = [];
        self.faces = [];
        self.selected = [];
    };

    /**
     * 頂点の追加
     * @param x Number
     * @param y Number
     */
    p.createVertex = function (x, y) {
        var self = this;
        var vertices = self.vertices;
        var vertex = new cjs.Vertex();

        vertex.name = 'v:' + cjs.UID.get();
        vertex.move(x, y);
        self.vContainer.addChild(vertex);
        vertices.push(vertex);

        // mouse event
        vertex.addEventListener('mousedown', function () {
            return self._handleDown.apply(self, arguments);
        });
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
     * 2点を結ぶ辺を保持する面の数を返す
     * @param v1 createjs.Vertex
     * @param v2 createjs.Vertex
     */
    p.countFaceWithEdge = function (v1, v2) {
        return _.select(this.faces, function (f) {
            return f.vertices.indexOf(v1) !== -1 &&
                   f.vertices.indexOf(v2) !== -1;
        }).length;
    };

    p.createFace = function (__vertices__) {
        var self = this,
            faces = self.faces,
            face,
            v0 = __vertices__[0],
            v1 = __vertices__[1],
            v2 = __vertices__[2],
            e0 = self.countFaceWithEdge(v0, v1),
            e1 = self.countFaceWithEdge(v1, v2),
            e2 = self.countFaceWithEdge(v2, v0);

        if (e0 === 2 || e1 === 2 || e2 === 2) {
            alert('面は、1つの辺につき2つまでしか作成できません。');
            return;
        }

        face = new cjs.Face(v0, v1, v2);
        face.name = 'f:' + cjs.UID.get();
        self.fContainer.addChild(face);
        faces.push(face);

        face.addEventListener('remove', function (e) {
            var index = faces.indexOf(e.target);
            index !== -1 && faces.splice(index, 1);
        });

        face.addEventListener('mousedown', function (e) {
            var f = e.target,
                isShift = e.nativeEvent.shiftKey,
                vertices = f.vertices,
                selected = self.selected;

            if (f.isSelected()) {//選択済み
                if (isShift) {//選択解除
                    _.each(vertices, function (v) {
                        var i = selected.indexOf(v);
                        i !== -1 && selected.splice(i, 1);
                        v.cancel();
                    });
                }
                return;
            }

            if (_.any(vertices, function (v) {
                return v.isLocked();
            })) {// １つ以上ロック中
                return;
            }

            if (!isShift) {// 選択中の頂点をキャンセル
                _.each(selected, function (v) {
                    v.cancel();
                });
                self.selected = selected = [];
            }

            _.each(vertices, function (v) {
                if (selected.indexOf(v) === -1) {
                    selected.push(v);
                }

                v.select();
            });
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

//    p.lockSelected = function () {
//        var self = this;
//        var selected = self.selected;
//        for (var i = 0, len = selected.length, v; i < len; i++) {
//            v = selected[i];
//            v.lock();
//        }
//
//        self.selected = [];
//    };
//
//    p.unlockAll = function () {
//        var self = this;
//        var vertices = self.vertices;
//        for (var i = 0, len = vertices.length, v; i < len; i++) {
//            v = vertices[i];
//            if (v.isLocked()) {
//                v.unlock();
//            }
//        }
//    };

//    p.alignLeft = function () {
//
//    };
//
//    p.alignRight = function () {
//
//    };
//
//    p.alignCenter = function () {
//
//    };
//
//    p.alignTop = function () {
//
//    };
//
//    p.alignBottom = function () {
//
//    };
//
//    p.alignMiddle = function () {
//
//    };
//
//    p.stackVertical = function () {
//
//    };
//
//    p.stackHorizon = function () {
//
//    };

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
            return VertexManager;
        });
    } else {
        global.VertexManager = VertexManager;
    }

})(this, createjs);