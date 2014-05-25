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