var cursor = function () {
	_clickedTile = function () {
		row = 0,
		column = 0,
		cornerPointX = 0,
		cornerPointY = 0
	},
	_currentHoveredTile = function () {
		cornerPointX = 0,
		cornerPointY = 0
	},

	getClickedTile = function () {
		return this._clickedTile;
	}
	setClickedTile = function (column, row, x, y) {
		this._clickedTile.column = column;
		this._clickedTile.row = row;
		this._clickedTile.cornerPointX = x;
		this._clickedTile.cornerPointY = y;
	}

	getCurrentHoveredTile = function () {
		return this._currentHoveredTile;
	}
	setCurrentHoveredTile = function (pointX, pointY) {
		this._currentHoveredTile.cornerPointX = pointX;
		this._currentHoveredTile.cornerPointY = pointY;
	}

	getColumn = function (x) {
		var col = Math.floor(x / SETTINGS.map.tileSize);
		col = Math.floor((y - col) / SETTINGS.map.tileSize);
		alert(col);
		return col;
	},
	getRow = function (y) {

		var row = Math.floor(y / SETTINGS.map.tileSize);
		row = Math.floor((y - row) / SETTINGS.map.tileSize);
		alert(row);
		return row;
	},
	getCursorPositionInCanvas_x = function (pageX) {
		var mouseX = pageX - mainContainer.offsetLeft - mapCanvas.offsetLeft - SETTINGS.map.getCanvasPadding;
		return mouseX;
	},
	getCursorPositionInCanvas_y = function (pageY) {
		var mouseY = pageY - mainContainer.offsetTop - mapCanvas.offsetTop - SETTINGS.map.getCanvasPadding;
		return mouseY;
	},
	getTileCornerPoint = function (column, row) {

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