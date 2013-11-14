var Cursor = function () {
	var self = this;

	var _clickedTile = function () {
		column = 0,
		row = 0
	}

	var _currentHoveredTile = function () {
		column = 0,
		row = 0
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
		var col = Math.floor(x / SETTINGS.map.tileSize);
		col = Math.floor((y - col) / SETTINGS.map.tileSize);
		alert(col);
		return col;
	}
	self.getRow = function (y) {

		var row = Math.floor(y / SETTINGS.map.tileSize);
		row = Math.floor((y - row) / SETTINGS.map.tileSize);
		alert(row);
		return row;
	}
	self.getCursorPositionInCanvas_x = function (pageX) {
		var mouseX = pageX - mainContainer.offsetLeft - mapCanvas.offsetLeft - SETTINGS.map.getCanvasPadding;
		return mouseX;
	}
	self.getCursorPositionInCanvas_y = function (pageY) {
		var mouseY = pageY - mainContainer.offsetTop - mapCanvas.offsetTop - SETTINGS.map.getCanvasPadding;
		return mouseY;
	}
	self.getTileCornerPoint = function (col, row) {
		var tileSize = SETTINGS.map.getTileSize();

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