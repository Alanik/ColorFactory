var Sprite = function () {
	var self = this;

	var _tileSheet = new Image();
	_tileSheet.src = "";

	var _numOfAnimationFrames = 0;

	self.getTileSheet = function () {
		return _tileSheet;
	}

	self.getTileSheetSrc = function () {
		return _tileSheet.src;
	}

	self.setTileSheetSrc = function (value) {
		_tileSheet.src = value;
	};

	self.getNumOfAnimationFrames = function () {
		return _numOfAnimationFrames;
	};

	self.setNumOfAnimationFrames = function (value) {
		_numOfAnimationFrames = value;
	};
}