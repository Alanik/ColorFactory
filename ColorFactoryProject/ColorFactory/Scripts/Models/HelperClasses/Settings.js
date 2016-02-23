
function Settings() {

	this.map = function () {

		var _canvasPadding = 5;
		var _canvasPaddingWithoutBorder = 4;
		var _tileRadius = 0;
		var _tileSize = 50;
		var _numberOfTiles_column = 16;
		var _numberOfTiles_row = 9;
		var _mapCanvasOffsetTop = 50;
		var _uncoveredTileBackground = "rgb(10,10,10)";
		var _drawUncoveredTileBorder = true;
		var _uncoveredTileBorderColor = "rgb(10,10,10)";

		return {
			getCanvasPadding: function () {
				return _canvasPadding;
			},
			getTileRadius: function () {
				return _tileRadius;
			},
			getTileSize: function () {
				return _tileSize;
			},
			getNumberOfTiles_Column: function () {
				return _numberOfTiles_column;
			},
			getNumberOfTiles_Row: function () {
				return _numberOfTiles_row;
			},
			getMapCanvasOffsetTop: function () {
				return _mapCanvasOffsetTop;
			},
			getUncoveredTileBackground: function () {
				return _uncoveredTileBackground;
			},
			getCanvasPaddingWithoutBorder: function () {
				return _canvasPaddingWithoutBorder;
			},
			getDrawUncoveredTileBorder: function () {
				return _drawUncoveredTileBorder;
			},
			getUncoveredTileBorderColor: function () {
				return _uncoveredTileBorderColor;
			},
			getMapCanvasWidth: function () {
				var width = (_numberOfTiles_column * (_tileSize + 1)) + (_canvasPadding * 2) - 2;

				return width;
			},
			getMapCanvasHeight: function () {
				var height = (_numberOfTiles_row * (_tileSize + 1)) + (_canvasPadding * 2) - 2;

				return height;
			}
		}
	}();
	
}