function Settings() {

	this.map = function () {

		var canvasPadding = 5;
		var canvasPaddingWithoutBorder = 4;
		var tileRadius = 0;
		var tileSize = 40;
		var numberOfTiles_column = 12;
		var numberOfTiles_row = 12;
		var minimumNumOfMines = 10;
		var maximumNumOfMines = 25;
		var mapCanvasOffsetTop = 50;
		var uncoveredTileBackground = "rgb(255,255,255)";
		var mapCanvasWidth = 500;
		var mapCanvasHeight = 500;


		return {
			getCanvasPadding: function () {
				return canvasPadding;
			},
			getTileRadius: function () {
				return tileRadius;
			},
			getTileSize: function () {
				return tileSize;
			},
			getNumberOfTiles_Column: function () {
				return numberOfTiles_column;
			},
			getNumberOfTiles_Row: function () {
				return numberOfTiles_row;
			},
			getMinimumNumOfMines: function () {
				return minimumNumOfMines;
			},
			getMaximumNumOfMines: function () {
				return maximumNumOfMines;
			},
			getMapCanvasOffsetTop: function () {
				return mapCanvasOffsetTop;
			},
			getUncoveredTileBackground: function () {
				return uncoveredTileBackground;
			},
			getCanvasPaddingWithoutBorder: function () {
				return canvasPaddingWithoutBorder;
			},
			getMapCanvasWidth: function () {
				return mapCanvasWidth;
			},
			getMapCanvasHeight: function () {
				return mapCanvasHeight;
			}
		}
	}();
	
}