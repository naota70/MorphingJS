(function (global, cjs) {

    var Edge = function(toVertex, fromVertex) {
        this.initialize(toVertex, fromVertex);
    };
    var p = Edge.prototype = new cjs.Shape();

    p._toVertex = null;

    p._fromVertex = null;

    p.Shape_initialize = p.initialize;

    p.initialize = function (toVertex, fromVertex) {
        var __return__ = this.Shape_initialize();

        this._toVertex = toVertex;
        this._fromVertex = fromVertex;

        toVertex.addEdge(this);
        fromVertex.addEdge(this);

        return __return__;
    };

    p.Shape_updateContext = p.updateContext;

    p.updateContext = function () {

        return this.Shape_updateContext.apply(this, arguments);
    };

    cjs.Edge = Edge;
})(this, createjs);
(function (global, cjs) {

	var Face = function() {
		this.initialize();
	};

	var p = Face.prototype = new cjs.DisplayObject();

	cjs.Face = Face;
	
})(this, createjs);
(function (global, cjs) {

	var Morphing = function() {
		this.initialize();
	};

	var p = Morphing.prototype = new cjs.DisplayObject();

	cjs.Morphing = Morphing;
	
})(this, createjs);
(function (global, cjs) {
// プリレンダリングを用いる
// var m_canvas = document.createElement('canvas');
// m_canvas.width = 64;
// m_canvas.height = 64;
// var m_context = m_canvas.getContext(‘2d’);
// drawMario(m_context);

// function render() {
// context.drawImage(m_canvas, 0, 0);
// requestAnimationFrame(render);
// }

	// vertexは自身の属するfaceをもつ
	var Vertex = function() {
		this.initialize();
	};

	var p = Vertex.prototype = new cjs.Shape();

	p._edges = [];

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

	cjs.Vertex = Vertex;

})(this, createjs);