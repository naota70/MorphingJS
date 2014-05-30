(function (global, cjs) {

	// vertexは自身の属するfaceをもつ
	var Vertex = function (x, y) {
		this.initialize(x, y);
	};

	var p = Vertex.prototype = new cjs.Shape();

    p.Shape_initialize = p.initialize;

    p.initialize = function (x, y) {
        this.Shape_initialize();
        this._isLocked = false;
        this._isSelected = false;
        this.origin = {
            x: x,
            y: y
        };
        this._drawVertex('blue');
        this.move(x, y);
    };

    p.move = function (x, y) {
        var self = this;
        self.x = x|0;
        self.y = y|0;
        self.dispatchEvent('move', self);
    };

    p.lock = function () {
        this._isLocked = true;
        this._drawVertex('gray');
        this.dispatchEvent('lock', this);
        return this;
    };

    p.unlock = function () {
        this._isLocked = false;
        this._drawVertex();
        this.dispatchEvent('unlock', this);
        return this;
    };

    p.isLocked = function () {
        return this._isLocked;
    };

    p.select = function () {
        this._isSelected = true;
        this._drawVertex('red');
        this.dispatchEvent('select', this);
    };

    p.cancel = function () {
        this._isSelected = false;
        this._drawVertex();
        this.dispatchEvent('cancel', this);
    };

    p.isSelected = function () {
        return this._isSelected;
    };

    p.remove = function () {
        var self = this;
        self.dispatchEvent('remove', self);
        self.removeAllEventListeners();
        self.parent && self.parent.removeChild(self);
    };

	p.addEdge = function (edge) {
		var edges = this._edges;
		if (edges.indexOf(edge) === -1) {
			edges.push(edge);
			// edge.addEventListener('remove', this.removeEdge);
			this.dispatchEvent('add:edge', edge);
		}
	};

	p.removeEdge = function (edge) {
		var edges = this._edges;
		var index = edges.indexOf(edge);
		if (index !== -1) {
			edges.splice(index, 1);
			this.dispatchEvent('remove:edge', edge);
		}
	};

    p.toString = function () {
        return '[Vertex (name=' + this.name + ')]';
    };

    p._drawVertex = function (color, size) {
        color = color || 'blue';
        size = size || 4;

        var pos = -(size / 2);

        this.graphics
            .clear()
            .beginFill(color)
            .drawCircle(pos, pos, size)
            .endFill();
    };

	cjs.Vertex = Vertex;

})(this, createjs);