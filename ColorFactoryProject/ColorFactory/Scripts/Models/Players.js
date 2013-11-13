var PlayerBase = function (tileSheetSrc) {
	var self = this;

	var tileSheet = new Image();
	tileSheet.src = tileSheetSrc;

	var pixelMovementDist = 3;

	_tileSheetSrc = tileSheetSrc;
	_upperLeftCornerPoint = { x: 0, y: 0 };
	_currentTile = { column: 0, row: 0 };
	_previousTile = { column: 0, row: 0 };
	_nextTile = { column: 0, row: 0 };
	_timerInterval = 0;
	_isPlayerRunningInProgress = false;
	_animationCounter = 0;
	_spriteSize = 40;


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
		this._upperLeftCornerPoint.x = xx;
		this._upperLeftCornerPoint.y = yy;
	};
	self.getUpperLeftCornerPoint = function () {
		return _upperLeftCornerPoint;
	};

	self.setCurrentTile = function (col, row) {
		this._currentTile.column = col;
		this._currentTile.row = row;
	};
	self.getCurrentTile = function () {
		return _currentTile;
	};

	self.setPreviousTile = function (col, row) {
		this._previousTile.column = col;
		this._previousTile.row = row;
	};
	self.getPreviousTile = function () {
		return _previousTile;
	};

	self.setNextTile = function (col, row) {
		this._nextTile.column = col;
		this._nextTile.row = row;
	};
	self.getNextTile = function () {
		return _nextTile;
	};

	self.setTimerInterval = function (num) {
		this._timerInterval = num;
	};
	self.getTimerInterval = function () {
		return this._timerInterval;
	};

	self.setIsPlayerRunningInProgress = function () {
		this._isPlayerRunningInProgress = true;
	};

	self.getIsPlayerRunningInProgress = function () {
		return this._isPlayerRunningInProgress;
	};
}

var Player = function (tileSheetSrc) {
	PlayerBase.call(this, tileSheetSrc);

	_startingTile = { column: 0, row: 0 };
	_nextTilePlayerMovesToCounter = 0;
	_room = null;
	_ammunitionPoints = 0;
	_aStartResult = [];

	this.setStartingTile = function (col, row) {
		this._startingTile.column = col;
		this._startingTile.row = row;
	};
	this.getStartingTile = function () {
		return _startingTile;
	};

	this.setNextTilePlayerMovesToCounter = function (counter) {
		this._nextTilePlayerMovesToCounter = counter;
	};
	this.getNextTilePlayerMovesToCounter = function () {
		return this._nextTilePlayerMovesToCounter;
	};

	this.setRoom = function (room) {
		this._room = room;
	};
	this.getRoom = function () {
		return this._room;
	};

	this.setAmmunitionPoints = function (points) {
		this._ammunitionPoints = points;

	};
	this.getAmmunitionPoints = function () {
		return this._ammunitionPoints;
	};

	this.setAStarResult = function (result) {
		this._aStartResult = result;

	};
	this.getAStarResult = function () {
		return this._aStarResult;
	};

	this.resetNextTilePlayerMovesToCounter = function () {
		this._nextTilePlayerMovesToCounter = 0;
	};

}

Player.prototype = new PlayerBase("Images/TileSheet/tileSheetPlayer40Black2.png");
Player.prototype.constructor = Player;