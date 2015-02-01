var Character = function (kind, name, animations) {
	var self = this;

	var _kind = kind;
	var _name = name;
	var _sprite = new Sprite();

	self.animations = animations;

	var _currentAnimation = self.animations.idle;

	self.getName = function () {
		return _name;
	}

	self.getKind = function () {
		return _kind;
	}

	self.getSprite = function () {
		return _sprite;
	}

	self.changeAnimation = function (animation) {
		_currentAnimation = animation;
		_sprite.setTileSheetSrc(animation.tilesheetSrc);
		_sprite.setNumOfAnimationFrames(animation.numOfAnimationFrames);
	}

	self.getCurrentAnimation = function () {
		return _currentAnimation;
	}
};

