var TextAnimation = function (text) {
	var self = this;

	var _text = text;
	var _font = 'victors_pixel_fontregular';
	var _size = '50px';
	var _fillStyle = "#FF7575";
	var _upperLeftCornerPoint = { "x": 0, "y": 0 };
	var _animationCounter = 0;
	var _isAnimationInProgress = false;

	self.getText = function () {
		return _text;
	};

	self.setText = function (value) {
		_text = value;
	};

	self.getFont = function () {
		return _font;
	};

	self.setFont = function (value) {
		_font = value;
	};

	self.getSize = function () {
		return _size;
	};

	self.setSize = function (value) {
		_size = value;
	};

	self.getFullFont = function () {
		return _size + " " + _font;
	};

	self.getFillStyle = function () {
		return _fillStyle;
	};

	self.setFillStyle = function (value) {
		_fillStyle = value;
	};

	self.setUpperLeftCornerPoint = function (xx, yy) {
		_upperLeftCornerPoint.x = xx;
		_upperLeftCornerPoint.y = yy;
	};

	self.getUpperLeftCornerPoint = function () {
		return _upperLeftCornerPoint;
	};

	self.getAnimationCounter = function () {
		return _animationCounter;
	};

	self.incrementAnimationCounter = function () {
		_animationCounter++;
	};

	self.resetAnimationCounter = function () {
		_animationCounter = 0;
	};

	self.getIsAnimationInProgress = function () {
		return _isAnimationInProgress;
	};

	self.setIsAnimationInProgress = function (value) {
		_isAnimationInProgress = value;
	}

}