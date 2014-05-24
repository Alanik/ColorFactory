var Effects = function () {
	var self = this;

	var _animationNumbersTimerInterval = null;
	var _isAnimationNumbersInProgress = false;

	self.getAnimationNumbersTimerInterval = function () {
		return _animationNumbersTimerInterval;
	}

	self.setAnimationNumbersTimerInterval = function (value) {
		 _animationNumbersTimerInterval = value;
	}

	self.getIsAnimationNumbersInProgress = function () {
		return _isAnimationNumbersInProgress;
	}

	self.setIsAnimationNumbersInProgress = function (value) {
		_isAnimationNumbersInProgress = value;
	}

}