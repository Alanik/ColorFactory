var AnimationManager = function ()
{
	var self = this;

	var _initialize = function ()
	{
		self.BulletAnimationManager = new self.BulletAnimationManager();
		self.TextAnimationManager = new self.TextAnimationManager();
		self.PlayerAnimationManager = new self.PlayerAnimationManager();

		self.FPSMeter = new FPSMeter( document.getElementById( 'FPSMeterContainer' ), { graph: 1, position: "static" } );

		self.BulletAnimationManager.parent = self;
		self.TextAnimationManager.parent = self;
		self.PlayerAnimationManager.parent = self;
	}

	self.game;

	self.BulletAnimationManager = function ()
	{
		var self = this;
		var _currentlyAnimatedBullets = [];
		var _animationTimerIntervals = [];
		var _interval;
		var FPS = 15;

		self.parent = null;

		self.getCurrentlyAnimatedBullets = function ()
		{
			return _currentlyAnimatedBullets;
		}

		self.addBulletToAnimationCollection = function ( bullet )
		{
			_currentlyAnimatedBullets.push( bullet );

			if ( self.shouldStartAnimationInterval() )
			{
				self.clearAnimationTimerIntervals();
				_interval = setInterval( function () { self.drawBullets( _currentlyAnimatedBullets ) }, FPS );
				self.setAnimationTimerInterval( _interval );
			}
		}

		self.removeBulletFromAnimationCollection = function ( index )
		{
			_currentlyAnimatedBullets.splice( index, 1 );
		}

		self.shouldStartAnimationInterval = function ()
		{
			return _currentlyAnimatedBullets.length == 1 ? true : false;
		}

		self.shouldStopAnimationInterval = function ()
		{
			return _currentlyAnimatedBullets.length == 0 ? true : false;
		}

		self.getAnimationTimerIntervalLength = function ()
		{
			return _animationTimerIntervals.length;
		}

		self.setAnimationTimerInterval = function ( value )
		{
			_animationTimerIntervals.push( value );
		}

		self.clearAnimationTimerIntervals = function ()
		{
			var len = _animationTimerIntervals.length;

			for ( var i = 0; i < len; i++ )
			{
				clearInterval( _animationTimerIntervals[i] );
			}
			_animationTimerIntervals = [];
		}

		self.drawBullets = function ( bullets )
		{
			var ctx = effectsCtx;

			//TODO: refactor, dependency injection
			var playerHealth = self.parent.game.player.getHealth();
			var eCtx = effectsCtx;
			var currentBullet, len, alpha = 1;

			bulletsCtx.clearRect( 0, 0, bulletsCanvas.width, bulletsCanvas.height );

			if ( self.shouldStopAnimationInterval() )
			{
				self.clearAnimationTimerIntervals();
				return;
			}

			len = bullets.length;
			for ( var i = 0; i < len; i++ )
			{

				currentBullet = bullets[i];
				self.drawFlyingBullet( currentBullet );

				if ( !currentBullet.getIsBulletShootingInProgress() )
				{
					self.removeBulletFromAnimationCollection( i );
					len--;

					//TODO: temporary
					if ( typeof self.parent.game.WIN_MESSAGE !== "undefined" )
					{
						self.parent.game.winGame( self.parent.game.WIN_MESSAGE );
						return;
					}

					var text = new TextAnimation( "-" + currentBullet.getDealtDamage(), 'victors_pixel_fontregular', '50px', '#FF7575' );
					var point = currentBullet.getUpperLeftCornerPoint();
					text.setUpperLeftCornerPoint( point.x, point.y );

					self.parent.TextAnimationManager.addTextToAnimationCollection( text );

					if ( !currentBullet.getIsMyBullet() )
					{

						var healthText = new TextAnimation( playerHealth, 'victors_pixel_fontregular', '50px', '#FF7575' );

						eCtx.font = text.getFullFont();

						var metrics = eCtx.measureText( text.getText() );
						healthText.setUpperLeftCornerPoint( point.x + metrics.width, point.y );
						healthText.setFillStyle( "#FFFFFF" );
						healthText.setSize( "25px" );

						self.parent.TextAnimationManager.addTextToAnimationCollection( healthText );
					}
				}
			}

		}

		self.drawFlyingBullet = function ( bullet )
		{

			var counter;
			var startingPoint = bullet.getUpperLeftCornerPoint();
			var spriteSize = bullet.getSpriteSize();
			var tileSheet = bullet.getTileSheet();
			var pointsArray = bullet.getTrajectoryPath();
			var len = bullet.getTrajectoryPathLength();
			var opponent = bullet.getTargetOpponent();

			bulletsCtx.drawImage( tileSheet, startingPoint.x, startingPoint.y );

			bullet.incrementAnimationPathCounterBy( 10 );
			counter = bullet.getAnimationPathCounter();

			if ( counter < len )
			{
				var point = pointsArray[counter];
				bullet.setUpperLeftCornerPoint( point.x, point.y );
			}
			else if ( bullet.getAdjustTrajectoryFlag() )
			{
				self.adjustTrajectory( bullet );
			}
			else
			{
				bullet.setIsBulletShootingInProgress( false );
				bullet.resetAnimationPathCounter();
			}
		}

		self.adjustTrajectory = function ( bullet )
		{
			var opponent = bullet.getTargetOpponent();
			var startingPoint = bullet.getUpperLeftCornerPoint();
			var halfSprite = opponent.getSpriteSize().x / 2;
			var endPoint = opponent.getUpperLeftCornerPoint();

			//TODO: refactor this, would be better with dependency injection
			var pointsArray = self.parent.game.calculateStraightLine( startingPoint.x, startingPoint.y, endPoint.x + halfSprite, +endPoint.y + halfSprite );
			var len = pointsArray.length;

			bullet.resetAnimationPathCounter();
			bullet.setTrajectoryPath( pointsArray, len );
			bullet.setAdjustTrajectoryFlag( false );
		}
	}

	self.TextAnimationManager = function ()
	{
		var self = this;
		var _currentlyAnimatedTexts = [];
		var _animationTimerIntervals = [];
		var _interval;
		var FPS = 130;

		self.parent = null;

		self.getCurrentlyAnimatedTexts = function ()
		{
			return _currentlyAnimatedTexts;
		}

		self.addTextToAnimationCollection = function ( text )
		{
			text.setIsAnimationInProgress( true );
			_currentlyAnimatedTexts.push( text );

			if ( self.shouldStartAnimationInterval() )
			{
				self.clearAnimationTimerIntervals();
				_interval = setInterval( function () { self.drawTexts( _currentlyAnimatedTexts ) }, FPS );
				self.setAnimationTimerInterval( _interval );
			}
		}

		self.removeTextFromAnimationCollection = function ( index )
		{
			_currentlyAnimatedTexts.splice( index, 1 );
		}

		self.shouldStartAnimationInterval = function ()
		{
			return _currentlyAnimatedTexts.length === 1 ? true : false;
		}

		self.shouldStopAnimationInterval = function ()
		{
			return _currentlyAnimatedTexts.length === 0 ? true : false;
		}

		self.getAnimationTimerInterval = function ()
		{
			return _animationTimerIntervals[0];
		}

		self.getAnimationTimerIntervalLength = function ()
		{
			return _animationTimerIntervals.length;
		}

		self.setAnimationTimerInterval = function ( value )
		{
			_animationTimerIntervals.push( value );
		}

		self.clearAnimationTimerIntervals = function ()
		{
			var len = _animationTimerIntervals.length;

			for ( var i = 0; i < len; i++ )
			{
				clearInterval( _animationTimerIntervals[i] );
			}
			_animationTimerIntervals = [];
		}

		self.drawTexts = function ( texts )
		{
			var currentText, len;

			if ( self.shouldStopAnimationInterval() )
			{
				self.clearAnimationTimerIntervals();
				return;
			}

			effectsCtx.clearRect( 0, 0, effectsCanvas.width, effectsCanvas.height );
			len = texts.length;

			for ( var i = 0; i < len; i++ )
			{
				currentText = texts[i];

				if ( !currentText.getIsAnimationInProgress() )
				{
					self.removeTextFromAnimationCollection( i );
					len--;
					i--;
				}
				else
				{
					self.drawTextAnimation( currentText );
				}
			}
		}

		self.drawTextAnimation = function ( text )
		{
			var ctx = effectsCtx;
			var player = self.parent;
			var counter = text.getAnimationCounter();

			//TODO: pass canvas offset from SETTINGS before drawing loop;
			var canvasOffsetY = 50;
			var startingPoint;
			var alpha, fillstyle;

			var offsetY = counter * 2;

			if ( counter < 10 )
			{
				if ( text.getUseAlpha() )
				{
					alpha = text.getAlpha() - .1;
					text.setAlpha( alpha );
					ctx.globalAlpha = alpha;
				}
				else
				{
					ctx.globalAlpha = 1;
				}

				startingPoint = text.getUpperLeftCornerPoint();
				text.incrementAnimationCounter();

				ctx.fillStyle = text.getFillStyle();
				ctx.font = text.getFullFont();
				ctx.fillText( text.getText(), startingPoint.x, startingPoint.y + canvasOffsetY - offsetY );
			}
			else
			{
				text.setIsAnimationInProgress( false );
				text.resetAnimationCounter();
			}
		}
	}

	self.PlayerAnimationManager = function ()
	{
		var self = this;
		var _currentlyAnimatedPlayers = [];
		var _animationTimerIntervals = [];
		var _interval;
		var FPS = 30;

		self.addPlayerToAnimationCollection = function ( playerObj )
		{
			var player = playerObj.player;

			player.setIsAnimationInProgress( true );
			_currentlyAnimatedPlayers.push( playerObj );

			if ( self.shouldStartAnimationInterval() )
			{
				self.clearAnimationTimerIntervals();
				_interval = setInterval( self.drawPlayers, FPS );
				self.setAnimationTimerInterval( _interval );
			}
		};

		self.drawPlayers = function ()
		{
			var currentPlayerObj, len;

			if ( self.shouldStopAnimationInterval() )
			{
				self.clearAnimationTimerIntervals();
				return;
			}

			len = _currentlyAnimatedPlayers.length;
			for ( var i = 0; i < len; i++ )
			{
				currentPlayerObj = _currentlyAnimatedPlayers[i];

				if ( !currentPlayerObj.player.getIsAnimationInProgress() )
				{
					self.removePlayerFromAnimationCollection( i );
					len--;
					i--;
				}
				else
				{
					self.animatePlayer( currentPlayerObj );
				}
			}

			self.parent.FPSMeter.tick();
		};

		self.animatePlayer = function ( playerObj )
		{
			var player = playerObj.player;
			var aStarResult = player.getAStarResult();
			var playerCanvas = playerObj.canvas;
			var playerCanvas_TopHalfPart = playerObj.canvas_TopHalfPart;
			var playerCtx = playerObj.ctx;

			// main player //////////////////////////////////
			if ( player.getIsMainPlayer() )
			{
				if ( typeof aStarResult !== "undefined" && aStarResult.length > 0 )
				{

					if ( player.getCurrentMovementStatus() === player.getMovementStatuses().running )
					{
						self.calculateMainPlayerPosition( player );
					}
				}
			}
				// other player //////////////////////////////////
			else
			{
				self.calculateOtherPlayerPosition( player, playerCtx, playerCanvas );
			}

			self.drawPlayer( playerObj );
		};

		self.drawPlayer = function ( playerObj )
		{
			var player = playerObj.player;
			var canvasPadding = self.parent.game.SETTINGS.map.getCanvasPadding();
			var spriteSize = player.getSpriteSize();
			var tileSheet = player.getCharacter().getSprite().getTileSheet();
			var ctxSize = player.getContextSize();
			var playerCtx = playerObj.ctx;
			var animationCounter = player.getAnimationCounter();
			var playerCanvas = playerObj.canvas;
			var offsetX = player.getSpriteOffsetX();
			var opacityChangeValue = player.getOpacityChangeValue();
			var newOpacity;

			if ( opacityChangeValue !== 0 )
			{
				newOpacity = player.getOpacity() + opacityChangeValue;
				player.setOpacity( newOpacity );
				playerCtx.globalAlpha = player.getOpacity();
			}

			playerCtx.clearRect( 0, 0, playerCanvas.width, playerCanvas.height );
			playerCtx.drawImage( tileSheet, offsetX * spriteSize.x, spriteSize.y * animationCounter, spriteSize.x, spriteSize.y, 10, -4, spriteSize.x * 1.3, spriteSize.y * 1.3 );

			// Top Half Part 
			if ( player.getIsMainPlayer() )
			{
				playerObj.playerCanvas_TopHalfPartCtx.clearRect( 0, 0, playerObj.playerCanvas_TopHalfPart.width, playerObj.playerCanvas_TopHalfPart.height );
				playerObj.playerCanvas_TopHalfPartCtx.drawImage( tileSheet, offsetX * spriteSize.x, spriteSize.y * animationCounter, spriteSize.x, spriteSize.y, 10, -4, spriteSize.x * 1.3, spriteSize.y * 1.3 );
			}
		};

		self.calculateMainPlayerPosition = function ( mainPlayer )
		{
			var game = self.parent.game;
			var velocityX = 0, velocityY = 0;
			var padding = mainPlayer.getPadding();
			var negativePadding = mainPlayer.getNegativePadding();
			var pixDist = mainPlayer.getPixelMovementDistance();
			var playerCornerPoint = mainPlayer.getUpperLeftCornerPoint();
			var nextAStarTile = mainPlayer.getAStarResult()[mainPlayer.getNextTilePlayerMovesToCounter()];
			var tilePoint = game.CURSOR.getTileCornerPoint( nextAStarTile.x, nextAStarTile.y );

			var tileYMinusPlayerY = tilePoint.y - playerCornerPoint.y;
			var tileXMinusPlayerX = tilePoint.x - playerCornerPoint.x;

			if ( tileYMinusPlayerY > padding )
				velocityY = 1;
			else if ( tileYMinusPlayerY < negativePadding )
				velocityY = -1;
			else velocityY = 0

			if ( tileXMinusPlayerX > padding )
				velocityX = 1;
			else if ( tileXMinusPlayerX < negativePadding )
				velocityX = -1;
			else velocityX = 0;

			self.calculateAndSetSpriteOffsetX( velocityX, velocityY, mainPlayer );
			mainPlayer.incrementAnimationCounter();

			//player still moving to tile
			if ( Math.abs( tileXMinusPlayerX ) >= pixDist || Math.abs( tileYMinusPlayerY ) >= pixDist )
			{
				var newX = pixDist * velocityX + playerCornerPoint.x;
				var newY = pixDist * velocityY + playerCornerPoint.y;

				mainPlayer.setUpperLeftCornerPoint( newX, newY );

				// move playerCanvas
				playerCanvas.setAttribute( "style", "left:" + newX + "px; top:" + newY + "px;" );
				playerCanvas_TopHalfPart.setAttribute( "style", "left:" + newX + "px; top:" + newY + "px;" );
			}
			else
			{
				game.playerIsFullyInTile();
			}

			if ( mainPlayer.getAnimationCounter() >= mainPlayer.getCharacter().getSprite().getNumOfAnimationFrames() )
			{
				mainPlayer.resetAnimationCounter();
			}
		};

		self.calculateOtherPlayerPosition = function ( enemy, enemyCtx, canvas )
		{
			var velocityX = 0, velocityY = 0;
			var padding = enemy.getPadding();
			var negativePadding = enemy.getNegativePadding();
			var pixDist = enemy.getPixelMovementDistance();
			var game = self.parent.game;

			var tilePoint = game.CURSOR.getTileCornerPoint( enemy.getNextTile().column, enemy.getNextTile().row );
			var upperCornerPoint = enemy.getUpperLeftCornerPoint();

			var tileYMinusEnemyY = tilePoint.y - upperCornerPoint.y;
			var tileXMinusEnemyX = tilePoint.x - upperCornerPoint.x;

			if ( tileYMinusEnemyY > padding )
				velocityY = 1;
			else if ( tileYMinusEnemyY < negativePadding )
				velocityY = -1;
			else velocityY = 0

			if ( tileXMinusEnemyX > padding )
				velocityX = 1;
			else if ( tileXMinusEnemyX < negativePadding )
				velocityX = -1;
			else velocityX = 0;

			self.calculateAndSetSpriteOffsetX( velocityX, velocityY, enemy );
			enemy.incrementAnimationCounter();

			//player still moving to tile
			if ( Math.abs( tileXMinusEnemyX ) >= pixDist || Math.abs( tileYMinusEnemyY ) >= pixDist )
			{
				var newX = pixDist * velocityX + upperCornerPoint.x;
				var newY = pixDist * velocityY + upperCornerPoint.y;

				enemy.setUpperLeftCornerPoint( newX, newY );
				// move otherPlayerCanvas
				canvas.setAttribute( "style", "left:" + newX + "px; top:" + newY + "px;" );

			}
			else
			{
				//at this point other player is fully in tile
				game.otherPlayerIsFullyInTile( enemy );
			}

			if ( enemy.getAnimationCounter() >= enemy.getCharacter().getSprite().getNumOfAnimationFrames() )
			{
				enemy.resetAnimationCounter();
			}
		};

		self.calculateAndSetSpriteOffsetX = function ( velocityX, velocityY, mainPlayer )
		{

			if ( velocityX < 0 )
			{
				switch ( velocityY )
				{
					case -1:
						mainPlayer.setSpriteOffsetX( 0 );
						return;
					case 0:
						mainPlayer.setSpriteOffsetX( 1 );
						return;
					case 1:
						mainPlayer.setSpriteOffsetX( 2 );
						return;
				}
			}
			else if ( velocityX == 0 )
			{
				switch ( velocityY )
				{
					case -1:
						mainPlayer.setSpriteOffsetX( 7 );
						return;
					case 0:
						return;
					case 1:
						mainPlayer.setSpriteOffsetX( 3 );
						return;
				}
			}
			else if ( velocityX > 0 )
			{
				switch ( velocityY )
				{
					case -1:
						mainPlayer.setSpriteOffsetX( 6 );
						return;
					case 0:
						mainPlayer.setSpriteOffsetX( 5 );
						return;
					case 1:
						mainPlayer.setSpriteOffsetX( 4 );
						return;
				}
			}
		};

		self.setAnimationTimerInterval = function ( value )
		{
			_animationTimerIntervals.push( value );
		};

		self.clearAnimationTimerIntervals = function ()
		{
			var len = _animationTimerIntervals.length;

			for ( var i = 0; i < len; i++ )
			{
				clearInterval( _animationTimerIntervals[i] );
			}
			_animationTimerIntervals = [];
		};

		self.removePlayerFromAnimationCollection = function ( index )
		{
			_currentlyAnimatedPlayers.splice( index, 1 );
		};

		self.shouldStartAnimationInterval = function ()
		{
			return _currentlyAnimatedPlayers.length === 1 ? true : false;
		};

		self.shouldStopAnimationInterval = function ()
		{
			return _currentlyAnimatedPlayers.length === 0 ? true : false;
		};

	}

	_initialize.apply( this );
}