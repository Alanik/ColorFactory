
var Player = function (tileSheetSrc) {
	var self = this;

	var _tileSheet = new Image();
	_tileSheet.src = tileSheetSrc;

	var _pixelMovementDist = 3;
	var _upperLeftCornerPoint = { x: 0, y: 0 };
	var _currentTile = { column: 0, row: 0 };
	var _previousTile = { column: 0, row: 0 };
	var _nextTile = { column: 0, row: 0 };
	var _timerInterval = null;
	var _isPlayerRunningInProgress = false;
	var _spriteSize = 40;
	var _playerContextSize = 50;
	var _numOfAnimationFrames = 4;
	var _tileSheetSrc = tileSheetSrc;
	var _startingTile = { column: 0, row: 0 };
	var _nextTilePlayerMovesToCounter = 0;
	var _room = null;
	var _ammunitionPoints = 0;
	var _aStarResult = [];
	var _animationCounter = 0;

	//public properties
	self.getSpriteSize = function () {
		return _spriteSize;
	}

	self.getTileSheet = function () {
		return _tileSheet;
	}

	self.getPixelMovementDistance = function () {
		return _pixelMovementDist;
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

	self.setTimerInterval = function (timerInterval) {
		_timerInterval = timerInterval;
	};
	self.getTimerInterval = function () {
		return _timerInterval;
	};

	self.setIsPlayerRunningInProgress = function (value) {
		_isPlayerRunningInProgress = value;
	};

	self.getIsPlayerRunningInProgress = function () {
		return _isPlayerRunningInProgress;
	};

	self.getContextSize = function () {
		return _playerContextSize;
	};
	self.getPadding = function () {
		return _pixelMovementDist - 1;
	},
	self.getNegativePadding = function () {
		return self.getPadding() * (-1);
	}

	self.getNumOfAnimationFrames = function () {
		return _numOfAnimationFrames;
	}

	self.setStartingTile = function (col, row) {
		_startingTile.column = col;
		_startingTile.row = row;
	};

	self.getStartingTile = function () {
		return _startingTile;
	};

	self.incrementNextTilePlayerMovesToCounter = function () {
		_nextTilePlayerMovesToCounter++;
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

	self.addAmmunitionPoints = function (points) {
		_ammunitionPoints += points;
	};

	self.getAmmunitionPoints = function () {
		return _ammunitionPoints;
	};

	self.setAStarResult = function (result) {
		_aStarResult = result;
	};

	self.getAStarResult = function () {
		return _aStarResult;
	};

	self.resetNextTilePlayerMovesToCounter = function () {
		_nextTilePlayerMovesToCounter = 0;
	};

	self.getAnimationCounter = function () {
		return _animationCounter;
	}

	self.incrementAnimationCounter = function () {
		_animationCounter++;
	}
	self.resetAnimationCounter = function () {
		_animationCounter = 0;
	}

}


