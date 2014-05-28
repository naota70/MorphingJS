(function (global, cjs) {

    function cloneShallow(source) {
        var obj = {}
        for (var prop in source) obj[prop] = source[prop];
        return obj;
    }

//    function sortByVertex(vertices) {
//        return _.sortBy(vertices, function (v) {
//            return v.y + (v.x / 1000);
//        });
//    }
//    var Face = function () {
//        this.name = 'f:';
//        this.vertices = [];
//    };
//
//    var Vertex = function () {
//        this.name = 'v:';
//        this.x = 0;
//        this.y = 0;
//    };

    var Morphing = function (width, height, origin) {
        this.initialize(width, height, origin);
    };

    Morphing.NONE = function () {};
    
    Morphing.ORIGIN = 'origin';

    var p = Morphing.prototype = new cjs.Bitmap();

    p._isPlaying = false;

    p._imageData = null;

    p._tweenTarget = null;

    p._mapping = null;

    p._morphParam = null;

    p._originMapping = null;

    p._prevLabel = '';

    p._currentLabel = '';

    /**
     * @override
     * @param image
     * @param originFaces
     * @param options
     */
    p.initialize =  function (width, height, origin) {

        this.DisplayObject_initialize();

        this._morphParam = {};

        this._mapping = {};

        // origin
        this.setOrigin(origin);

        // cache
        var originCanvas = this.originCanvas = document.createElement('canvas');
        originCanvas.width = width;
        originCanvas.height = height;

        this.cacheCanvas = originCanvas.cloneNode(true);

    };

    p.setOrigin = function (origin) {
        var morph = this.addMorph(Morphing.ORIGIN, origin);
        this._prevLabel = this._currentLabel = Morphing.ORIGIN;
        this._tweenTarget = cloneShallow(morph);
        this._originMapping = this._createMappingData(this._tweenTarget);
    };

    /**
     * @override
     * @param ctx
     * @param ignoreCache
     * @returns {boolean}
     */
    p.draw = function (ctx, ignoreCache) {

        if (this._isPlaying) {
            this._mapping = this._createMappingData(this._tweenTarget);
            this._drawMapping();
        }

        ctx.drawImage(this.cacheCanvas, this.parent.x, this.parent.y);

        return true;
    };

    /**
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
     * @param ctx
     * @private
     */
    p._drawMapping = function (adjustX, adjustY) {

        var originCanvas = this.originCanvas;
        var cacheCanvas = this.cacheCanvas;
        var ctx = cacheCanvas.getContext('2d');
        var originMapping = this._originMapping;
        var o, w, h;
        var t1, t2, t3, t4, t5, t6;
        var v0, v1, v2, v3;

        adjustX = adjustX || 0;
        adjustY = adjustY || 0;

        ctx.clearRect(0, 0, cacheCanvas.width + 1, cacheCanvas.height + 1);

        _.each(this._mapping, function (face, i) {
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
            ctx.drawImage(originCanvas, 0 - t5 - adjustX, 0 - t6 - adjustY/*, w, h*/);
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
            ctx.drawImage(originCanvas, 0 - t5 - adjustX, 0 - t6 - adjustY/*, w, h*/);
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
     * @param faces
     * @returns Object
     */
    p.convertFaceToMorphParam = function (faces) {
        var param = {};

        for (var i = 0, len = faces.length, f; i < len; i++) {
            f = faces[i];
            _.each(f.vertices, function (v, i) {
                param[f.name + '_' + i + '_x'] = v.x;
                param[f.name + '_' + i + '_y'] = v.y;
            });
        }

        return param;
    };

    /**
     *
     * @param label
     * @param faces
     */
    p.addMorph = function (label, faces) {
        if (!label) {
            console.error('this label["' + label + '"] is invalid.');
            return null;
        }

        return (this._morphParam[label] = this.convertFaceToMorphParam(faces));
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
     *
     * @param label
     * @returns {*}
     */
    p.getMorph = function (label) {
        return this._morphParam[label];
    };

    /**
     *
     */
    p.setTexture = function () {
        var args = Array.prototype.slice.call(arguments);
        var canvas = this.originCanvas,
            ctx = canvas.getContext('2d');

        if (args[0].toString().indexOf('HTMLImageElement') === -1) {
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
                    this.dispatchEvent('reverse');
                    this.gotoAndPlay(toLabel, options);
                } else {
                    this._isPlaying = false;
                    delete this._currentLabel;
                    this.dispatchEvent('complete');
                }

            }, [toLabel, options], this);

        return this;
    };

    /**
     *
     * @returns {string}
     */
    p.toString = function () {
        return '[Morphing (name=' + this.name + ')]';
    };

    cjs.Morphing = Morphing;

})(this, createjs);