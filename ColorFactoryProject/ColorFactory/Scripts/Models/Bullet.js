var Bullet = function (tileSheetSrc) {
	var self = this;

	var _spriteSize = 10;
	var _tileSheet = new Image();
	_tileSheet.src = tileSheetSrc;
	var _timerInterval = null;
	var _isBulletShootingInProgress = false;
	var _upperLeftCornerPoint = { "x": 0, "y": 0 }
	var _animationPathCounter = 0;
	var _flag = true;

	self.getFlag = function () {
		return _flag;
	}

	self.setFlag = function (value) {
	_flag = value;
	}

	self.getAnimationPathCounter = function () {
		return _animationPathCounter;
	}

	self.incrementAnimationPathCounterBy = function (value) {
		_animationPathCounter = _animationPathCounter + value;
	}

	self.resetAnimationPathCounter = function () {
		_animationPathCounter = 0;
	}

	self.getTileSheet = function () {
		return _tileSheet;
	}

	self.getSpriteSize = function () {
		return _spriteSize;
	};

	self.setSpriteSize = function (value) {
		_spriteSize = value;
	};

	self.setUpperLeftCornerPoint = function (xx, yy) {
		_upperLeftCornerPoint.x = xx;
		_upperLeftCornerPoint.y = yy;
	};
	self.getUpperLeftCornerPoint = function () {
		return _upperLeftCornerPoint;
	};

	self.setTimerInterval = function (value) {
		_timerInterval = value;
	};

	self.getTimerInterval = function () {
		return _timerInterval;
	};

	self.setIsBulletShootingInProgress = function (value) {
		_isBulletShootingInProgress = value;
	};

	self.getIsBulletShootingInProgress = function () {
		return _isBulletShootingInProgress;
	};

}