var Cursor = function (map) {
	var self = this;
	var settingsMap = map;

	var _clickedTile =  {
		column : 0,
		row : 0
	}

	var _currentHoveredTile = {
		column : 0,
		row : 0
	}

	self.getClickedTile = function () {
		return _clickedTile;
	}
	self.setClickedTile = function (column, row) {
		_clickedTile.column = column;
		_clickedTile.row = row;
	}

	self.getCurrentHoveredTile = function () {
		return _currentHoveredTile;
	}
	self.setCurrentHoveredTile = function (column, row) {
		_currentHoveredTile.column = column;
		_currentHoveredTile.row = row;
	}

	self.getColumn = function (x) {
		var col = Math.floor(x / settingsMap.getTileSize());
		col = Math.floor((x - col) / settingsMap.getTileSize());
		return col;
	}
	self.getRow = function (y) {

		var row = Math.floor(y / settingsMap.getTileSize());
		row = Math.floor((y - row) / settingsMap.getTileSize());
		return row;
	}
	self.getCursorPositionInCanvas_x = function (pageX) {
		var mouseX = pageX - mainContainer.offsetLeft - mapCanvas.offsetLeft - settingsMap.getCanvasPadding();
		return mouseX;
	}
	self.getCursorPositionInCanvas_y = function (pageY) {
		var mouseY = pageY - mainContainer.offsetTop - mapCanvas.offsetTop - settingsMap.getCanvasPadding();
		return mouseY;
	}
	self.getTileCornerPoint = function (col, row) {
		var tileSize = settingsMap.getTileSize();

		var xx = col * tileSize + col;
		var yy = row * tileSize + row;

		var tileCornerPoint =
			{
				"x": xx,
				"y": yy
			};
		return tileCornerPoint;
	}
}