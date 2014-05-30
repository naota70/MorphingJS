/**
 * create.jsのMovieClipクラスを拡張し、タイムラインからモーフィングを使用するためのライブラリ
 *
 * 【事前準備】
 * モーフィングツールでモーフィングを作成。exportでjsonファイルに出力する。
 *
 * 【初期化時】
 * sprite用のキャンパスを作っておき
 * window.loadMorph(<json_url_path>, <sprite_canvas>, <complete_callback>);
 * で、事前にmorphインスタンスを生成しておく。
 *
 * 【タイムラインから使用方法】
 * // init
 * var lash = this.lash = getMorph("lash");
 * this.addChild(lash);
 *
 * // play
 * lash.standby("close").gotoAndPlay("open", {
 *      onComplete: functions () {
 *          // animation end
 *      }
 * });
 */
(function (global, cjs) {
    var model = new global.Backbone.Model();
    var morphing = {};

    global.loadMorph = function (url, spriteCanvas, complete) {

        function success(data_array) {
            _.extend(morphing, cjs.Morphing.import(data_array, spriteCanvas));
            complete && complete();
        }

        if (!_.isArray(url)) {
            model.fetch({
                url: url,
                success: function () { success(model.toJSON()); }
            });
        } else {
            success(url);
        }
    };

    cjs.MovieClip.prototype.getMorph = function (name) {
        return morphing[name];
    };
})(this, createjs);