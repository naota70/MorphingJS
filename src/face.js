(function (global, cjs) {

	var Face = function (v1, v2, v3) {
		this.initialize(v1, v2, v3);
	};

	var p = Face.prototype = new cjs.Shape();

    p._isLocked = false;

    p._isVisibleFace = true;

    p._isVisibleEdge = false;

    p.Shape_initialize = p.initialize;

    p.initialize = function (v1, v2, v3) {
        var self = this;
        var vertices = self.vertices = [v1, v2, v3];

        self.Shape_initialize();
        self.alpha = 0.5;
        self._draw();

        self._draw = _.bind(self._draw, self);
        self.remove = _.bind(self.remove, self);
        self.checkSelected = _.bind(self.checkSelected, self);

        for (var i = 0, len = vertices.length, v; i < len; i++) {
            v = vertices[i];
            v.addEventListener('move', self._draw);
            v.addEventListener('remove', self.remove);
            v.addEventListener('select', self.checkSelected);
            v.addEventListener('cancel', self.checkSelected);
        }
    };

    p.checkSelected = function () {
        var isSelected = _.all(this.vertices, function (v) {
            return v.isSelected();
        });
        if ((isSelected && !this._isSelected) || (!isSelected && this._isSelected)) {
            this._isSelected = isSelected;
            this._draw();
        }
    };

    p.lock = function () {
        this._isLocked = true;
//        this._drawVertex('gray');
//        this.dispatchEvent('lock', this);
        return this;
    };

    p.unlock = function () {
        this._isLocked = false;
//        this._drawVertex();
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
        this._draw();
    };

    p.visibleEdge = function () {
        this._isVisibleEdge = true;
        this._draw();
    };

    p.hiddenFace = function () {
        this._isVisibleFace = false;
        this._draw();
    };

    p.hiddenEdge = function () {
        this._isVisibleEdge = false;
        this._draw();
    };

    p._draw = function () {
        var self = this,
            g = self.graphics,
            vertices = self.vertices,
            isVisibleEdge = self._isVisibleEdge,
            isVisibleFace = self._isVisibleFace;

        g.clear();

        if (isVisibleEdge) {
            g.setStrokeStyle(2);
            g.beginStroke('black');
        }

        if (isVisibleFace) {
            g.beginFill(self._isSelected ? 'red' :'green');
        }

        g
            .moveTo(vertices[0].x, vertices[0].y)
            .lineTo(vertices[1].x, vertices[1].y)
            .lineTo(vertices[2].x, vertices[2].y)
            .lineTo(vertices[0].x, vertices[0].y);

        if (isVisibleFace) {
            g.endFill();
        }

        if (isVisibleEdge) {
            g.endStroke();
        }
    };

    p.remove = function () {
        var self = this;
        var vertices = self.vertices;

        for (var i = 0, len = vertices.length, v; i < len; i++) {
            v = vertices[i];
            v.removeEventListener('move', self._draw);
            v.removeEventListener('remove', self.remove);
            v.removeEventListener('select', self.checkSelected);
            v.removeEventListener('cancel', self.checkSelected);
        }

        delete self.vertices;
        self.dispatchEvent('remove', self);
        self.removeAllEventListeners();
        self.parent && self.parent.removeChild(self);
    };

    p.toString = function () {
        return '[Face (name=' + this.name + ')]';
    };

	cjs.Face = Face;
	
})(this, createjs);