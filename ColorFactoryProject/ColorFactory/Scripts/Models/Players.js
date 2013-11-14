var PlayerBase = function (tileSheetSrc) {
	var self = this;

	var tileSheet = new Image();
	tileSheet.src = tileSheetSrc;

	var pixelMovementDist = 3;

	var _tileSheetSrc = tileSheetSrc;
	var _upperLeftCornerPoint = { x: 0, y: 0 };
	var _currentTile = { column: 0, row: 0 };
	var _previousTile = { column: 0, row: 0 };
	var _nextTile = { column: 0, row: 0 };
	var _timerInterval = 0;
	var _isPlayerRunningInProgress = false;
	var _animationCounter = 0;
	var _spriteSize = 40;


	//public properties
	self.getSpriteSize = function () {
		return _spriteSize;
	}

	self.getTileSheet = function () {
	return tileSheet;
	}

	self.getPixelMovementDistance = function () {
		return pixelMovementDist;
	};

	self.setUpperLeftCornerPoint = function (xx, yy) {
		_upperLeftCornerPoint.x = xx;
		_upperLeftCornerPoint.y = yy;
	};
	self.getUpperLeftCornerPoint = function () {
		return _upperLeftCornerPoint;
	};

	self.setCurrentTile = function (col, row) {
		_currentTile.column = col;
		_currentTile.row = row;
	};
	self.getCurrentTile = function () {
		return _currentTile;
	};

	self.setPreviousTile = function (col, row) {
		_previousTile.column = col;
		_previousTile.row = row;
	};
	self.getPreviousTile = function () {
		return _previousTile;
	};

	self.setNextTile = function (col, row) {
		_nextTile.column = col;
		_nextTile.row = row;
	};
	self.getNextTile = function () {
		return _nextTile;
	};

	self.setTimerInterval = function (num) {
		_timerInterval = num;
	};
	self.getTimerInterval = function () {
		return _timerInterval;
	};

	self.setIsPlayerRunningInProgress = function () {
		_isPlayerRunningInProgress = true;
	};

	self.getIsPlayerRunningInProgress = function () {
		return _isPlayerRunningInProgress;
	};
}

var Player = function (tileSheetSrc) {
	var self = this;

	PlayerBase.call(this, tileSheetSrc);

	var _startingTile = { column: 0, row: 0 };
	var _nextTilePlayerMovesToCounter = 0;
	var _room = null;
	var _ammunitionPoints = 0;
	var _aStartResult = [];

	self.setStartingTile = function (col, row) {
		_startingTile.column = col;
		_startingTile.row = row;
	};
	self.getStartingTile = function () {
		return _startingTile;
	};

	self.setNextTilePlayerMovesToCounter = function (counter) {
		_nextTilePlayerMovesToCounter = counter;
	};
	self.getNextTilePlayerMovesToCounter = function () {
		return _nextTilePlayerMovesToCounter;
	};

	self.setRoom = function (room) {
		_room = room;
	};
	self.getRoom = function () {
		return _room;
	};

	self.setAmmunitionPoints = function (points) {
		_ammunitionPoints = points;

	};
	self.getAmmunitionPoints = function () {
		return _ammunitionPoints;
	};

	self.setAStarResult = function (result) {
		_aStartResult = result;

	};
	self.getAStarResult = function () {
		return _aStarResult;
	};

	self.resetNextTilePlayerMovesToCounter = function () {
		_nextTilePlayerMovesToCounter = 0;
	};

}

Player.prototype = new PlayerBase("Images/TileSheet/tileSheetPlayer40Black2.png");
