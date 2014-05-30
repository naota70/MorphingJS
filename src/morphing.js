(function (global, cjs) {
    'use strict';

    //========================================
    // Utility
    //========================================
    var slice = Array.prototype.slice;

    var toString = Object.prototype.toString;

    var isArray = Array.isArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };

    var cloneShallow = function (source) {
        var obj = {};
        for (var prop in source) {
            if (source.hasOwnProperty(prop)) {
                obj[prop] = source[prop];
            }
        }
        return obj;
    };

    //========================================
    // Vertex
    //========================================
    var Vertex = (function () {
        var Vertex = function (name, x, y) {
            this.name = name;
            this.x = x;
            this.y = y;
        };

        var p = Vertex.prototype;

        p.name = '';

        p.x = 0;

        p.y = 0;

        p.toString = function () {
            return '[object Vertex (name=' + this.name + ')]';
        };

        return Vertex;
    })();

    //========================================
    // Face
    //========================================
    var Face = (function () {
        var Face = function (name, vertices) {
            this.name = name;
            this.vertices = this.sortByCoordinates(vertices);
        };

        var p = Face.prototype;

        p.name = '';

        p.vertices = [];

        /**
         * ToDo: underscore.jsとの依存解消
         * 配列を座標順（左上→右上→左下→右下）に並び替え
         * @param vertices {Array}
         * @returns {Array}
         */
        p.sortByCoordinates = function (vertices) {
            return _.sortBy(vertices, function (v) {
                if (v.toString().indexOf('object Vertex') === -1) {
                    throw new Error('arguments isn`t ["Vertex"] instance array.');
                }

                return v.y + (v.x / 1000);
            });
        };

        p.toString = function () {
            return '[object Face (name=' + this.name + ')]';
        };

        return Face;
    })();

    //========================================
    // Morphing
    //========================================

    /**
     *
     * @param width {number}
     * @param height {number}
     * @param origin {array|object}
     * @constructor
     */
    var Morphing = function (width, height, origin) {
        this.initialize(width, height, origin);
    };

    Morphing.NONE = function () {};
    
    Morphing.ORIGIN = 'origin';

    Morphing.generateVertex = function (name, x, y) {
        return new Vertex(name, x, y);
    };

    Morphing.generateFace = function (name, vertices) {
        return new Face(name, vertices);
    };

    Morphing.import = function (data_array, spriteCanvas) {
        var _import = {};

        data_array = isArray(data_array) ? data_array : [data_array];

        _.each(data_array, function (data) {
            var morphing = new cjs.Morphing(data.w, data.h, data.m);

            data.t.push(spriteCanvas);

            morphing.name = data.n;
            morphing.setTexture.apply(morphing, data.t);

            _import[data.n] = morphing;
        });

        return _import;
    };

    var p = Morphing.prototype = new cjs.Bitmap();

    p._isPlaying = false;

    p._prevLabel = '';

    p._currentLabel = '';

    p._tweenTarget = null;

    p._morphParam = null;

    p._originMapping = null;

    p._textureArgs = null;

    p.originCanvas = null;

    p.cacheCanvas = null;

    /**
     *
     * @param width
     * @param height
     * @param origin {array|object}
     */
    p.initialize =  function (width, height, origin) {
        // super init
        this.DisplayObject_initialize();

        // origin
        this._initOrigin(origin);

        // cache
        var originCanvas = this.originCanvas = document.createElement('canvas');
        originCanvas.width = width;
        originCanvas.height = height;
        this.cacheCanvas = originCanvas.cloneNode(true);
    };

    p._initOrigin = function (morphData) {
        var origin;

        if (isArray(morphData)) {
            origin = this.addMorph(Morphing.ORIGIN, morphData);
        } else {
            this._morphParam = morphData;
            origin = morphData.origin;
        }

        this._tweenTarget   = cloneShallow(origin);
        this._originMapping = this._createMappingData(this._tweenTarget);
        this._prevLabel     = Morphing.ORIGIN;
    };

    p.export = function () {
        return JSON.stringify({
            // name
            n: this.name || 'untitled',
            // width
            w: this.cacheCanvas.width,
            // height
            h: this.cacheCanvas.height,
            // morph
            m: this.getMorph(),
            // texture arguments
            t: this._textureArgs.splice(1, this._textureArgs.length)
        });
    };

    /**
     *
     * @param ctx
     * @returns {boolean}
     */
    p.draw = function (ctx) {

        if (this._isPlaying) {
            this._drawMapping(this._tweenTarget);
        }

        ctx.drawImage(this.cacheCanvas, this.parent.x, this.parent.y);

        return true;
    };

    /**
     * ToDo: underscore.jsとの依存解消
     * @private
     */
    p._createMappingData = function (target) {
        var mapping = {};
        var key_array, face, vertex, prop;

        _.each(target, function (value, key) {

            key_array = key.split('_');

            if (key_array.length !== 3) {
                return;
            }

            face = key_array[0];
            vertex = key_array[1];
            prop = key_array[2];

            mapping[face] || (mapping[face] = {});
            mapping[face][vertex] || (mapping[face][vertex] = {});
            mapping[face][vertex][prop] = value;
        });

        return mapping;
    };

    /**
     * ToDo: underscore.jsとの依存解消
     * @param mappingMorph マッピングさせるMorphデータオブジェクト
     * @param [adjustX]
     * @param [adjustY]
     * @private
     */
    p._drawMapping = function (mappingMorph, adjustX, adjustY) {

        var originCanvas = this.originCanvas;
        var cacheCanvas = this.cacheCanvas;
        var ctx = cacheCanvas.getContext('2d');
        var originMapping = this._originMapping;
        var o, w, h;
        var t1, t2, t3, t4, t5, t6;
        var v0, v1, v2, v3;
        var mapping = this._createMappingData(mappingMorph);

        adjustX = adjustX || 0;
        adjustY = adjustY || 0;

        ctx.clearRect(0, 0, cacheCanvas.width + 1, cacheCanvas.height + 1);

        _.each(mapping, function (face, i) {
            v0 = face['0'];
            v1 = face['1'];
            v2 = face['2'];
            v3 = face['3'];
            o = originMapping[i];
            w = o['1'].x - o['0'].x;
            h = o['2'].y - o['0'].y;

            //=================================
            // segment1
            //=================================
            t1 = (v1.x - v0.x) / w;
            t2 = (v1.y - v0.y) / w;
            t3 = (v2.x - v0.x) / h;
            t4 = (v2.y - v0.y) / h;
            t5 = v0.x - adjustX;
            t6 = v0.y - adjustY;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(v0.x - adjustX, v0.y - adjustY);
            ctx.lineTo(v1.x - adjustX, v1.y - adjustY);
            ctx.lineTo(v2.x - adjustX, v2.y - adjustY);
            ctx.closePath();
            ctx.clip();
            ctx.setTransform(t1, t2, t3, t4, t5, t6);
            ctx.drawImage(originCanvas, 0 - o['0'].x - adjustX, 0 - o['0'].y - adjustY/*, w, h*/);
            ctx.restore();

            //=================================
            // segment2
            //=================================
            t1 = (v3.x - v2.x) / w;
            t2 = (v3.y - v2.y) / w;
            t3 = (v3.x - v1.x) / h;
            t4 = (v3.y - v1.y) / h;
            t5 = v2.x - adjustX;
            t6 = v2.y - adjustY;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(v1.x - adjustX, v1.y - adjustY);
            ctx.lineTo(v2.x - adjustX, v2.y - adjustY);
            ctx.lineTo(v3.x - adjustX, v3.y - adjustY);
            ctx.closePath();
            ctx.clip();
            ctx.setTransform(t1, t2, t3, t4, t5, t6);
            ctx.drawImage(originCanvas, 0 - o['2'].x - adjustX, 0 - o['2'].y - adjustY/*, w, h*/);
            ctx.restore();
        });
    };

    /**
     *
     * @returns {boolean}
     */
    p.isPlaying = function () {
        return this._isPlaying;
    };

    /**
     * Face配列をMorphDataに変換
     * @param faces {array}
     * @returns Object
     */
    p.convertFaceToMorphParam = function (faces) {
        var param = {};

        for (var i = 0, len = faces.length, vs, f; i < len; i++) {
            f = faces[i];
            vs = f.vertices;

            for (var n = 0, nLen = vs.length, v; n < nLen; n++) {
                v = vs[n];
                param[f.name + '_' + n + '_x'] = v.x;
                param[f.name + '_' + n + '_y'] = v.y;
            }
        }

        return param;
    };

    /**
     *
     * @param label {string}
     * @param faces {array}
     * @returns {object}
     */
    p.addMorph = function (label, faces) {
        if (!label) {
            console.error('this label["' + label + '"] is invalid.');
            return null;
        }

        this._morphParam || (this._morphParam = {});
        this._morphParam[label] = this.convertFaceToMorphParam(faces);

        return this._morphParam[label];
    };

    /**
     *
     * @param label
     */
    p.removeMorph = function (label) {
        if (this._prevLabel === label) {
            this._prevLabel = Morphing.ORIGIN;
        }

        if (this._currentLabel === label) {
            this._currentLabel = Morphing.ORIGIN;
        }
        
        delete this._morphParam[label];
        return this;
    };

    /**
     * 引数のMorphデータを返す
     * 引数がない場合は全体を返す
     * @param [label]
     * @returns {object}
     */
    p.getMorph = function (label) {
        return label ? this._morphParam[label] : this._morphParam;
    };

    /**
     *
     */
    p.setTexture = function () {
        var args = this._textureArgs = slice.call(arguments);
        var canvas = this.originCanvas,
            eleType = args[0].toString(),
            ctx = canvas.getContext('2d');

        if (eleType.indexOf('HTMLImageElement') === -1 && eleType.indexOf('HTMLCanvasElement') === -1) {
            args.unshift(this.image);
        } else {
            this.image = args[0];
        }

        if (args.length !== 3 && args.length !== 5 && args.length !== 9) {
            console.error('arguments is invalid.');
            return this;
        }

        ctx.clearRect(0, 0, canvas.width + 1, canvas.height + 1);
        ctx.drawImage.apply(ctx, args);

        return this;
    };

    p.standby = function (label) {
        var clone = cloneShallow(this.getMorph(label));

        this._prevLabel = label;
        this._drawMapping(clone);

        return this;
    };

    /**
     * @param toLabel
     * @param options
     */
    p.gotoAndPlay = function (toLabel, options) {

        options = options || {};

        var loop = !!options.loop;
        var duration = options.duration || 250;
        var easing = options.easing || cjs.Ease.none;
        var param = this.getMorph(toLabel);
        var onComplete = options.onComplete || Morphing.NONE;

        if (this._isPlaying) {
            this._prevLabel = this._currentLabel;
        }

        this._isPlaying = true;
        this._currentLabel = toLabel;
        this._tweenTarget = cloneShallow(this.getMorph(this._prevLabel));

        cjs.Tween.get(this._tweenTarget, {
                loop: loop,
                override: true
            })
            .to(param, duration, easing)
            .call(function (fromLabel, options) {
                var reverse = !!options.reverse;
                var reset = !!options.reset;
                var toLabel = reset ? Morphing.ORIGIN : this._prevLabel;

                this._prevLabel = fromLabel;

                if (reset || reverse) {
                    onComplete();
                    this.gotoAndPlay(toLabel, options);
                } else {
                    this._isPlaying = false;
                    delete this._currentLabel;
                    onComplete();
                }

            }, [toLabel, options], this);

        return this;
    };

    /**
     * 自身を削除します
     * @param [removeSelf]
     */
    p.dispose = function (removeSelf) {
        this.removeAllEventListeners();

        this._tweenTarget = null;

        this._morphParam = null;

        this._originMapping = null;

        this.originCanvas = null;

        this.cacheCanvas = null;

        this._textureArgs = null;

        if (removeSelf && this.parent) {
            this.parent.removeChild(this);
        }
    };

    /**
     *
     * @returns {string}
     */
    p.toString = function () {
        return '[object Morphing]';
    };

    cjs.Morphing = Morphing;

})(this, createjs);