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