(function (global, cjs) {

	var Face = function (vertices, image) {
		this.initialize(vertices, image);
	};

	var p = Face.prototype = new cjs.Bitmap();

    p._isLocked = false;

    p._isVisibleFace = true;

    p._isVisibleEdge = false;

    p.Bitmap_initialize = p.initialize;

    p.initialize = function (vertices, image) {
        var self = this;
        var cacheCanvas, cacheCtx, w, h;

        self.Bitmap_initialize(image);

        // 左上、右上、左下、右下の順に並び替える
        self.vertices = vertices = _.sortBy(vertices, function (v) {
            return v.y + (v.x / 1000);
        });

        // マスク用意
        self.mask = new cjs.Shape();

        // 描画サイズ
        self.sourceRect = {
            x: 0,
            y: 0,
            width: (w = vertices[1].x - vertices[0].x),
            height: (h = vertices[2].y - vertices[0].y)
        };

        // キャッシュを用いてプリレンダリング
        cacheCanvas = self.cacheCanvas = cjs.createCanvas ?
            cjs.createCanvas() :
            document.createElement('canvas');
        cacheCanvas.width = w;
        cacheCanvas.height = h;
        cacheCtx = cacheCanvas.getContext('2d');
        cacheCtx.save();
        cacheCtx.drawImage(this.image,
            vertices[0].origin.x, vertices[0].origin.y, w, h,
            0, 0, w, h
        );
        cacheCtx.restore();

        // contextを自身に設定
        self._updateMask = _.bind(self._updateMask, self);
        self.remove = _.bind(self.remove, self);
        self.checkSelected = _.bind(self.checkSelected, self);

        // イベント設定
        for (var i = 0, len = vertices.length, v; i < len; i++) {
            v = vertices[i];
            v.addEventListener('move', self._updateMask);
            v.addEventListener('remove', self.remove);
            v.addEventListener('select', self.checkSelected);
            v.addEventListener('cancel', self.checkSelected);
        }

        // 初回
        self._updateMask();
    };

    p.checkSelected = function () {
        var isSelected = _.all(this.vertices, function (v) {
            return v.isSelected();
        });
        if ((isSelected && !this._isSelected) || (!isSelected && this._isSelected)) {
            this._isSelected = isSelected;
            this._updateMask();
        }
    };

    p.lock = function () {
        this._isLocked = true;
//        this._updateMaskVertex('gray');
//        this.dispatchEvent('lock', this);
        return this;
    };

    p.unlock = function () {
        this._isLocked = false;
//        this._updateMaskVertex();
//        this.dispatchEvent('unlock', this);
        return this;
    };

    p.isLocked = function () {
        return this._isLocked;
    };

    p.isSelected = function () {
        return this._isSelected;
    };

    p.visibleFace = function () {
        this._isVisibleFace = true;
        this._updateMask();
    };

    p.visibleEdge = function () {
        this._isVisibleEdge = true;
        this._updateMask();
    };

    p.hiddenFace = function () {
        this._isVisibleFace = false;
        this._updateMask();
    };

    p.hiddenEdge = function () {
        this._isVisibleEdge = false;
        this._updateMask();
    };

    p._updateMask = function () {
        var self = this;
        var vertices = self.vertices;

        self.mask.graphics
            .clear()
            .moveTo(vertices[0].x, vertices[0].y)
            .lineTo(vertices[1].x, vertices[1].y)
            .lineTo(vertices[2].x, vertices[2].y);
    };

    p.draw = function (ctx) {
        var vertices = this.vertices;
        var rect = this.sourceRect;
        var w = rect.width;
        var h = rect.height;
        var cacheCanvas = this.cacheCanvas;
        var t1 = (vertices[1].x - vertices[0].x) / w;
        var t2 = (vertices[1].y - vertices[0].y) / w;
        var t3 = (vertices[2].x - vertices[0].x) / h;
        var t4 = (vertices[2].y - vertices[0].y) / h;
        var t5 = vertices[0].x;
        var t6 = vertices[0].y;

        // segment1
        ctx.setTransform(t1, t2, t3, t4, t5, t6);
        ctx.drawImage(cacheCanvas,
//            vertices[0].origin.x, vertices[0].origin.y, w, h,
            0, 0, w, h
        );

        ctx.restore();

        // segment2s
        t1 = (vertices[3].x - vertices[2].x) / w;
        t2 = (vertices[3].y - vertices[2].y) / w;
        t3 = (vertices[3].x - vertices[1].x) / h;
        t4 = (vertices[3].y - vertices[1].y) / h;
        t5 = vertices[2].x;
        t6 = vertices[2].y;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(vertices[1].x, vertices[1].y);
        ctx.lineTo(vertices[2].x, vertices[2].y);
        ctx.lineTo(vertices[3].x, vertices[3].y);
        ctx.closePath();
        ctx.clip();
        ctx.setTransform(t1, t2, t3, t4, t5, t6);
        ctx.drawImage(cacheCanvas,
//            vertices[0].origin.x, vertices[0].origin.y, w, h,
            0, 0 - h, w, h
        );

        return true;
    };

    p.remove = function () {
        var self = this;
        var vertices = self.vertices;

        for (var i = 0, len = vertices.length, v; i < len; i++) {
            v = vertices[i];
            v.removeEventListener('move', self._updateMask);
            v.removeEventListener('remove', self.remove);
            v.removeEventListener('select', self.checkSelected);
            v.removeEventListener('cancel', self.checkSelected);
        }

        delete self.vertices;
        delete self.image;

        self.dispatchEvent('remove', self);
        self.removeAllEventListeners();
        self.parent && self.parent.removeChild(self);
    };

    p._getDistance = function (ax, ay, bx, by) {
        return Math.sqrt(Math.pow(ax - bx, 2) + Math.pow(ay - by, 2))|0;
    };

    p.toString = function () {
        return '[Face (name=' + this.name + ')]';
    };

	cjs.Face = Face;
	
})(this, createjs);