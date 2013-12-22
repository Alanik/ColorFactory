var AnimationManager = function () {
	var self = this;

	var _initialize = function () {
		self.BulletAnimationManager = new self.BulletAnimationManager();
	}

	self.BulletAnimationManager = function () {
		var self = this;

		var _currentlyAnimatedBullets = [];
		var _animationTimerInterval = null;

		self.getCurrentlyAnimatedBullets = function () {
			return _currentlyAnimatedBullets;
		}

		self.addBulletToAnimationCollection = function (bullet) {
			_currentlyAnimatedBullets.push(bullet);
		}

		self.checkIfShouldStartAnimationInterval = function () {


		}

		self.checkIfShouldFinishAnimationInterval = function () {


		}

		self.getAnimationTimerInterval = function () {
			return _animationTimerInterval;
		}

		self.setAnimationTimerInterval = function (value) {
			_animationTimerInterval = value;
		}
	}

	_initialize.apply(this);
}


