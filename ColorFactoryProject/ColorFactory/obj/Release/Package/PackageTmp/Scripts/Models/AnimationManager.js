﻿var AnimationManager = function () {
	var self = this;

	var _initialize = function () {

		self.BulletAnimationManager = new self.BulletAnimationManager();
		self.TextAnimationManager = new self.TextAnimationManager();

		self.BulletAnimationManager.parent = self;
		self.TextAnimationManager.parent = self;

	}

	self.game;

	self.BulletAnimationManager = function () {
		var self = this;

		var _currentlyAnimatedBullets = [];
		var _animationTimerInterval = null;

		self.parent = null;

		self.getCurrentlyAnimatedBullets = function () {
			return _currentlyAnimatedBullets;
		}

		self.addBulletToAnimationCollection = function (bullet) {
			_currentlyAnimatedBullets.push(bullet);

			if (self.shouldStartAnimationInterval()) {
				self.setAnimationTimerInterval(setInterval(function () { self.drawBullets(_currentlyAnimatedBullets) }, 15));
			}
		}

		self.removeBulletFromAnimationCollection = function (index) {
			_currentlyAnimatedBullets.splice(index, 1);
		}

		self.shouldStartAnimationInterval = function () {
			return _currentlyAnimatedBullets.length == 1 ? true : false;
		}

		self.shouldStopAnimationInterval = function () {
			return _currentlyAnimatedBullets.length == 0 ? true : false;
		}

		self.getAnimationTimerInterval = function () {
			return _animationTimerInterval;
		}

		self.setAnimationTimerInterval = function (value) {
			_animationTimerInterval = value;
		}

		self.drawBullets = function (bullets) {
			var ctx = effectsCtx;

			//TODO: refactor, dependency injection
			var playerHealth = self.parent.game.player.getHealth();
			var eCtx = effectsCtx;

			var currentBullet, len;

			bulletsCtx.clearRect(0, 0, bulletsCanvas.width, bulletsCanvas.height);

			if (self.shouldStopAnimationInterval()) {
				clearInterval(self.getAnimationTimerInterval());
				return;
			}

			len = bullets.length;
			for (var i = 0; i < len; i++) {

				currentBullet = bullets[i];
				self.drawFlyingBullet(currentBullet);

				if (!currentBullet.getIsBulletShootingInProgress()) {
					self.removeBulletFromAnimationCollection(i);
					len--;

					//TODO: temporary
					if (typeof self.parent.game.WIN_MESSAGE !== "undefined") {
						self.parent.game.winGame(self.parent.game.WIN_MESSAGE);
						return;
					}
					
					var text = new TextAnimation("-" + currentBullet.getDealtDamage());
					var point = currentBullet.getUpperLeftCornerPoint();
					text.setUpperLeftCornerPoint(point.x, point.y);

					self.parent.TextAnimationManager.addTextToAnimationCollection(text);

					if (!currentBullet.getIsMyBullet()) {

						var healthText = new TextAnimation(playerHealth);

						eCtx.font = text.getFullFont();

						var metrics = eCtx.measureText(text.getText());
						healthText.setUpperLeftCornerPoint(point.x + metrics.width, point.y);
						healthText.setFillStyle("#FFFFFF");
						healthText.setSize("25px");

						self.parent.TextAnimationManager.addTextToAnimationCollection(healthText);
					}				
				}
			}

		}

		self.drawFlyingBullet = function (bullet) {

			var counter;
			var startingPoint = bullet.getUpperLeftCornerPoint();
			var spriteSize = bullet.getSpriteSize();
			var tileSheet = bullet.getTileSheet();
			var pointsArray = bullet.getTrajectoryPath();
			var len = bullet.getTrajectoryPathLength();
			var opponent = bullet.getTargetOpponent();

			bulletsCtx.drawImage(tileSheet, startingPoint.x, startingPoint.y);

			bullet.incrementAnimationPathCounterBy(10);
			counter = bullet.getAnimationPathCounter();

			if (counter < len) {
				var point = pointsArray[counter];
				bullet.setUpperLeftCornerPoint(point.x, point.y);
			}
			else if (bullet.getAdjustTrajectoryFlag()) {
				self.adjustTrajectory(bullet);
			}
			else {
				bullet.setIsBulletShootingInProgress(false);
				bullet.resetAnimationPathCounter();
			}

		}

		self.adjustTrajectory = function (bullet) {
			var opponent = bullet.getTargetOpponent();
			var startingPoint = bullet.getUpperLeftCornerPoint();
			var halfSprite = opponent.getSpriteSize() / 2;
			var endPoint = opponent.getUpperLeftCornerPoint();

			//TODO: refactor this, would be better with dependency injection
			var pointsArray = self.parent.game.calculateStraightLine(startingPoint.x, startingPoint.y, endPoint.x + halfSprite, +endPoint.y + halfSprite);
			var len = pointsArray.length;

			bullet.resetAnimationPathCounter();
			bullet.setTrajectoryPath(pointsArray, len);
			bullet.setAdjustTrajectoryFlag(false);
		}
	}

	self.TextAnimationManager = function () {
		var self = this;

		var _currentlyAnimatedTexts = [];
		var _animationTimerInterval = null;

		self.parent = null;

		self.getCurrentlyAnimatedTexts = function () {
			return _currentlyAnimatedTexts;
		}

		self.addTextToAnimationCollection = function (text) {
			text.setIsAnimationInProgress(true);
			_currentlyAnimatedTexts.push(text);

			if (self.shouldStartAnimationInterval()) {
				self.setAnimationTimerInterval(setInterval(function () { self.drawTexts(_currentlyAnimatedTexts) }, 100));
			}
		}

		self.removeTextFromAnimationCollection = function (index) {
			_currentlyAnimatedTexts.splice(index, 1);
		}

		self.shouldStartAnimationInterval = function () {
			return _currentlyAnimatedTexts.length == 1 ? true : false;
		}

		self.shouldStopAnimationInterval = function () {
			return _currentlyAnimatedTexts.length == 0 ? true : false;
		}

		self.getAnimationTimerInterval = function () {
			return _animationTimerInterval;
		}

		self.setAnimationTimerInterval = function (value) {
			_animationTimerInterval = value;
		}

		self.drawTexts = function (texts) {
			var currentText, len;

			effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

			if (self.shouldStopAnimationInterval()) {
				clearInterval(self.getAnimationTimerInterval());
				return;
			}

			len = texts.length;

			for (var i = 0; i < len; i++) {

				currentText = texts[i];

				self.drawTextAnimation(currentText);

				if (!currentText.getIsAnimationInProgress()) {
					self.removeTextFromAnimationCollection(i);
					len--;
				}
			}
		}

		self.drawTextAnimation = function (text) {
			var ctx = effectsCtx;
			var player = self.parent;

			var counter = text.getAnimationCounter();

			//TODO: pass canvas offset from SETTINGS before drawing loop;
			var canvasOffsetY = 50;			
			var startingPoint;
			
			var offsetY = counter * 2;

			if (counter < 10) {
				startingPoint = text.getUpperLeftCornerPoint();
				text.incrementAnimationCounter();		

				ctx.fillStyle = text.getFillStyle();
				ctx.font = text.getFullFont();
				ctx.fillText(text.getText(), startingPoint.x - 20, startingPoint.y + canvasOffsetY - offsetY);
			}
			else {
				text.setIsAnimationInProgress(false);
				text.resetAnimationCounter();
			}
		}
	}

	_initialize.apply(this);
}