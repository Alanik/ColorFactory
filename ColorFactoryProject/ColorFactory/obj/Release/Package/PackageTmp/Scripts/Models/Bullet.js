var Bullet = function (tileSheetSrc) {
	var self = this;

	var _tileSheet = new Image();
	_tileSheet.src = tileSheetSrc;

	var _spriteSize = 10;
	var _isBulletShootingInProgress = false;
	var _upperLeftCornerPoint = { "x": 0, "y": 0 }
	var _animationPathCounter = 0;
	var _trajectoryPath = [];
	var _trajectoryPathLength = 0;
	var _targetOpponent = null;
	var _adjustTrajectoryFlag = true;
	var _isMyBullet = false;
	var _dealtDamage = 0;

	self.getIsMyBullet = function () {
		return _isMyBullet;
	}

	self.setIsMyBullet = function (value) {
		_isMyBullet = value;
	}

	self.getDealtDamage = function () {
		return _dealtDamage;
	};

	self.setDealtDamage = function (value) {
		_dealtDamage = value;
	};

	self.getAdjustTrajectoryFlag = function () {
		return _adjustTrajectoryFlag;
	};

	self.setAdjustTrajectoryFlag = function (value) {
		_adjustTrajectoryFlag = value;
	};

	self.getAnimationPathCounter = function () {
		return _animationPathCounter;
	};

	self.incrementAnimationPathCounterBy = function (value) {
		_animationPathCounter = _animationPathCounter + value;
	};

	self.getTrajectoryPath = function () {
		return _trajectoryPath;
	};

	self.setTrajectoryPath = function (value, length) {
		_trajectoryPath = value;
		_trajectoryPathLength = length;
	};

	self.getTrajectoryPathLength = function () {
		return _trajectoryPathLength;
	};

	self.getTargetOpponent = function () {
		return _targetOpponent;
	};

	self.setTargetOpponent = function (value) {
		_targetOpponent = value;
	};

	self.resetAnimationPathCounter = function () {
		_animationPathCounter = 0;
	};

	self.getTileSheet = function () {
		return _tileSheet;
	};

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

	self.setIsBulletShootingInProgress = function (value) {
		_isBulletShootingInProgress = value;
	};

	self.getIsBulletShootingInProgress = function () {
		return _isBulletShootingInProgress;
	};

}