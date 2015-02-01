
var Player = function (character, isMainPlayer) {
	var self = this;

	var _character = character;
	var _bullet = null;
	var _pixelMovementDist = 3;
	var _upperLeftCornerPoint = { x: 0, y: 0 };
	var _startingTile = { column: 0, row: 0 };
	var _previousTile = { column: 0, row: 0 };
	var _currentTile = { column: 0, row: 0 };
	var _nextTile = { column: 0, row: 0 };
	var _spriteSize = { x: 32, y: 48 };
	var _playerContextSize = 50;
	var _nextTilePlayerMovesToCounter = 0;
	var _room = "";
	var _ammunitionPoints = 0;
	var _aStarResult = [];
	var _animationCounter = 0;
	var _name = "";
	var _health = 200;
	var _points = 0;
	var _uncoveredMines = 0;
	var _dealthDamage = 0;
	var _isAnimationInProgress = false;
	var _spriteOffsetX = 0;
	var _opacity = 1;
	var _opacityChangeValue = 0;
	var _currentShootingTargetSeatNumber = null;
	var _seatNumber = 0;
	var _isMainPlayer = isMainPlayer;
	var _isTargeted = false;

	var _playerMovementStatuses = {
		idle: "idle",
		running: "running"
	}

	var _currentMovementStatus = _playerMovementStatuses.idle;

	var _playerAttackStatuses = {
		idle: "idle",
		shooting: "shooting"
	}

	var _currentAttackStatus = _playerMovementStatuses.idle;

	//make sure to have same weapons as in weapons.cs
	var _weapons = {
		acorn: "acorn",
		pineCone: "pineCone"
	}
	var _currentWeapon = _weapons.acorn;

	var _updateAnimation = function ()
	{
		//TODO: temporary
		if ( _isTargeted )
		{
			_character.changeAnimation( _character.animations.target );
			return;
		}

		switch (_currentMovementStatus) {
			case _playerMovementStatuses.idle:
				if (_currentAttackStatus === _playerAttackStatuses.idle) {
					_character.changeAnimation(_character.animations.idle);
				}
				else if (_currentAttackStatus === _playerAttackStatuses.shooting) {
					_character.changeAnimation(_character.animations.idle);
				}
				return;
			case _playerMovementStatuses.running:
				if (_currentAttackStatus === _playerAttackStatuses.idle) {
					_character.changeAnimation(_character.animations.running);
				}
				else if (_currentAttackStatus === _playerAttackStatuses.shooting) {
					_character.changeAnimation(_character.animations.running);
				}
				return;
			default:
				_character.changeAnimation(_character.animations.idle);
				return;
		}
	};

	//public properties
	self.getIndex = function () {
		return _indexInOtherPlayersArray;
	};

	self.getCurrentShootingTargetSeatNumber = function () {
		return _currentShootingTargetSeatNumber;
	};

	self.setCurrentShootingTargetSeatNumber = function (value) {
		_currentShootingTargetSeatNumber = value;
	};

	self.getOpacityChangeValue = function () {
		return _opacityChangeValue;
	};

	self.setOpacityChangeValue = function (value) {
		_opacityChangeValue = value;
	};

	self.getOpacity = function () {
		return _opacity;
	};

	self.setOpacity = function (value) {
		if (value > 1) {
			_opacity = 1;
			_opacityChangeValue = 0;
		}
		else if (value < 0) {
			_opacity = 0;
			_opacityChangeValue = 0;
			_isAnimationInProgress = false;
		}
		else {
			_opacity = value;
		}		
	};

	self.getSpriteOffsetX = function () {
		return _spriteOffsetX;
	};

	self.setSpriteOffsetX = function (value) {
		_spriteOffsetX = value;
	};

	self.getMovementStatuses = function () {
		return _playerMovementStatuses;
	};

	self.getAttackStatuses = function () {
		return _playerAttackStatuses;
	};

	self.getCurrentMovementStatus = function () {
		return _currentMovementStatus;
	};

	self.setCurrentMovementStatus = function (value) {
		_currentMovementStatus = value;
		_updateAnimation();
	};

	self.getCurrentAttackStatus = function () {
		return _currentAttackStatus;
	};

	self.setCurrentAttackStatus = function (value) {
		_currentAttackStatus = value;
	};

	self.getCharacter = function () {
		return _character;
	};

	self.getName = function () {
		return _name;
	};

	self.setName = function (value) {
		_name = value;
	};

	self.getHealth = function () {
		return _health;
	};

	self.setHealth = function (value) {
		_health = value;
	};

	self.getPoints = function () {
		return _points;
	};

	self.setPoints = function (value) {
		_points = value
	};

	self.getUncoveredMines = function () {
		return _uncoveredMines;
	};

	self.setUncoveredMines = function (value) {
		_uncoveredMines = value;
	};

	self.getDealtDamage = function () {
		return _dealthDamage;
	}

	self.setDealtDamage = function (value) {
		_dealthDamage = value;
	}

	self.getPixelMovementDistance = function () {
		return _pixelMovementDist;
	};

	self.setUpperLeftCornerPoint = function (x, y) {
		_upperLeftCornerPoint.x = x;
		_upperLeftCornerPoint.y = y;
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

	self.getContextSize = function () {
		return _playerContextSize;
	};

	self.getPadding = function () {
		return _pixelMovementDist - 1;
	};

	self.getNegativePadding = function () {
		return self.getPadding() * (-1);
	};

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

	self.getSpriteSize = function () {
		return _spriteSize;
	}

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
	};

	self.incrementAnimationCounter = function () {
		_animationCounter++;
	};

	self.resetAnimationCounter = function () {
		_animationCounter = 0;
	};

	self.getBullet = function () {
		return _bullet;
	};

	self.setBullet = function (value) {
		_bullet = value;
	};

	self.getCurrentWeapon = function () {
		return _currentWeapon;
	};

	self.switchWeapon = function (value) {
		_currentWeapon = value;
	};

	self.getWeapons = function () {
		return _weapons;
	};

	self.getIsAnimationInProgress = function () {
		return _isAnimationInProgress;
	};

	self.setIsAnimationInProgress = function (value) {
		_isAnimationInProgress = value;
	};

	self.getSeatNumber = function () {
		return _seatNumber;
	};

	self.setSeatNumber = function (value) {
		_seatNumber = value;
	};

	self.getIsMainPlayer = function () {
		return _isMainPlayer;
	};

	self.getIsTargeted = function (){
		return _targeted;
	};

	self.setIsTargeted = function ( value ){
		_isTargeted = value;
	};
}


