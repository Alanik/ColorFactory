var PlayerBase = function (tileSheetSrc) {

	//var tileSheet = new Image();
	//tileSheet.src = tileSheetSrc;

	var pixelMovementDist = 3;

	_upperLeftCornerPoint = { x: 0, y: 0 },
	_currentTile = { column: 0, row: 0 },
	_previousTile = { column: 0, row: 0 },
	_nextTile = { column: 0, row: 0 },
	_timerInterval = 0;
	_isPlayerRunningInProgress = false;
	_animationCounter = 0,


	//public properties
	this.getPixelMovementDistance = function () {
		return pixelMovementDist;
	}

	this.setUpperLeftCornerPoint = function (xx, yy) {
		this._upperLeftCornerPoint.x = xx;
		this._upperLeftCornerPoint.y = yy;
	}
	this.getUpperLeftCornerPoint = function () {
		return _upperLeftCornerPoint;
	}

	this.setCurrentTile = function (col, row) {
		this._currentTile.column = col;
		this._currentTile.row = row;
	}
	this.getCurrentTile = function () {
		return _currentTile;
	}

	this.setPreviousTile = function (col, row) {
		this._previousTile.column = col;
		this._previousTile.row = row;
	}
	this.getPreviousTile = function () {
		return _previousTile;
	}

	this.setNextTile = function (col, row) {
		this._nextTile.column = col;
		this._nextTile.row = row;
	}
	this.getNextTile = function () {
		return _nextTile;
	}

	this.setTimerInterval = function (num) {
		this._timerInterval = num;
	}
	this.getTimerInterval = function () {
		return this._timerInterval;
	}

	this.setIsPlayerRunningInProgress = function (isRunning) {
		this._isPlayerRunningInProgress = isRunning;
	}
	this.getIsPlayerRunningInProgress = function () {
		return this._isPlayerRunningInProgress;
	}

}
var Player = function (tileSheetSrc) {
	PlayerBase.apply(this, arguments);

	_startingTile = { column: 0, row: 0 },
	_nextTilePlayerMovesToCounter = 0,
	_room = null,
	_ammunitionPoints = 0

	this.setStartingTile = function (col, row) {
		this._startingTile.column = col;
		this._startingTile.row = row;
	}
	this.getStartingTile = function () {
		return _startingTile;
	}

	this.setNextTilePlayerMovesToCounter = function (counter) {
		this._nextTilePlayerMovesToCounter = counter;
	}
	this.getNextTilePlayerMovesToCounter = function () {
		return this._nextTilePlayerMovesToCounter;
	}

	this.setRoom = function (room) {
		this._room = room;
	}
	this.getRoom = function () {
		return this._room;
	}

	this.setAmmunitionPoints = function (points) {
		this._ammunitionPoints = points;

	}
	this.getAmmunitionPoints = function () {
		return this._ammunitionPoints;
	}
}

Player.prototype = new PlayerBase();
Player.prototype.constructor = Player;