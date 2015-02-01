var Game = function (Settings, Cursor, Effects, AnimationManager, Map, PlrObj) {
	var game = this;

	/////////////////////////
	//helper objects
	/////////////////////////
	game.SETTINGS = Settings;
	game.MAP = Map;
	game.CURSOR = Cursor;
	game.EFFECTS = Effects;
	game.ANIMATION_MANAGER = AnimationManager;

	///////////////////////////////////
	//player and other players objects
	///////////////////////////////////
	game.playerObj = PlrObj;
	game.player = PlrObj.player;
	game.otherPlayers = null;

	//TODO: temporary
	game.WIN_MESSAGE;

	/////////////////////////////
	//player menu
	/////////////////////////////
	game.playerMenu = {
		"isMenuVisible": false,
		"showMenu": function () {
			var $container = $("#personalMenuContainer");
			var playerPositionPoint = game.player.getUpperLeftCornerPoint();

			//TODO: get rid of const numbers, use properties
			$container.css({ "left": (playerPositionPoint.x - 23) + "px", "top": (playerPositionPoint.y + 40) + "px" });

			$container.show();

			this.isMenuVisible = true;
		},
		"hideMenu": function () {
			$("#personalMenuContainer").hide();

			this.isMenuVisible = false;
		},

		"buildings": {
			turret: {
				isTurretSelected: false,
				showSmallTurretIcon: function () {
					$("#smallTurretIcon").show();
				},
				hideSmallTurretIcon: function () {
					$("#smallTurretIcon").hide();
				},
				selectTurret: function () {
					this.showSmallTurretIcon();
					game.playerMenu.hideMenu();

					this.isTurretSelected = true;
				}
			}
		},
		"weapons": {
			pinecomb: {
				isPinecombSelected: false,
				showSmallPinecombIcon: function () {
					$("#smallGranadeIcon").show();
				},
				hideSmallPinecombIcon: function () {
					$("#smallGranadeIcon").hide();
				},
				selectPinecomb: function () {
					var mainPlayer = game.player;

					var weapons = mainPlayer.getWeapons();

					if (mainPlayer.getCurrentWeapon() === weapons.pineCone) {
						mainPlayer.switchWeapon(weapons.acorn);
						game.playerMenu.weapons.pinecomb.hideSmallPinecombIcon();
					}
					else {
						mainPlayer.switchWeapon(weapons.pineCone);
						game.playerMenu.weapons.pinecomb.showSmallPinecombIcon();
					}

					game.playerMenu.hideMenu();
				}
			}
		}
	};

	////////////////////////////////////////////////////////////////////////
	//methods
	////////////////////////////////////////////////////////////////////////

	game.onGameStart = function () {

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////SignalR game session start!!! START GAME
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		gameConnection.client.clientReceiveStartGame = function (x, y, seatNumber) {
			var gameSession = game.gameSession;
			$("#lobbyContainer").hide();
			$("#effectsCanvas").show();
			$("#mapContainer").css("background", "rgb(53,53,53)").show();//#2E2E2E"rgb(197, 206, 198)
			gameSession.initializePlayer(x, y, seatNumber);
			gameSession.initializeOtherPlayers(seatNumber);
			gameSession.initializeMap();
			gameSession.initializePersonalPlayerMenu();
			gameSession.playing();
		};

		gameConnection.client.clientReceiveOtherPlayerPosition = function (randX, randY, seatNumber) {
			var point = game.CURSOR.getTileCornerPoint(randX, randY);
			var otherPlayerObj = game.getOtherPlayerBasedOnSeatNumber(seatNumber);
			var otherPlayer = otherPlayerObj.player;
			var otherPlayerCtx = otherPlayerObj.ctx;
			var canvas = otherPlayerObj.canvas;

			//set playerCanvas position here //////////////////////////////////////////////////////
			canvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

			otherPlayer.setPreviousTile(randX, randY);
			otherPlayer.setCurrentTile(randX, randY);
			otherPlayer.setNextTile(randX, randY);

			otherPlayer.setUpperLeftCornerPoint(point.x, point.y);
			otherPlayer.setCurrentMovementStatus(otherPlayer.getMovementStatuses().idle);
			otherPlayerCtx.globalAlpha = 1;

			if (!otherPlayer.getIsAnimationInProgress()) {

				game.ANIMATION_MANAGER.PlayerAnimationManager.addPlayerToAnimationCollection(otherPlayerObj);
			}

		}
		gameConnection.client.clientReceiveUpdateOtherPlayerPosition = function (col, row, seatNumber) {
			game.moveOtherPlayer(col, row, game.getOtherPlayerBasedOnSeatNumber(seatNumber));
		}
		gameConnection.client.clientReceiveUpdateOtherPlayerPosition_changeAlphaOtherPlayer = function (oldCol, oldRow, col, row, seatNumber, opacity) {
			var playerObj = game.getOtherPlayerBasedOnSeatNumber(seatNumber);
			var otherPlayer = playerObj.player;

			otherPlayer.setCurrentTile(oldCol, oldRow);

			var point = game.CURSOR.getTileCornerPoint(oldCol, oldRow);
			otherPlayer.setUpperLeftCornerPoint(point.x, point.y);

			game.moveOtherPlayer(col, row, playerObj, opacity);
		}
		gameConnection.client.clientReceiveUncoverTile = function (tileNum, mineNum, playerCurrentPosition, minePosition) {

			switch (tileNum) {
				case 0: {
					game.playerStepsOnEmptyTile(mineNum, playerCurrentPosition);
					break;
				}
				case 1: {
					break;
				}
				case 2: {
					game.playerStepsOnMine(playerCurrentPosition, minePosition);
					break;
				}
				default: {
					break;
				}
			}

		}
		gameConnection.client.clientReceiveMineHasBeenUncovered = function (listOfTiles, mines) {
			var tile;
			var map = game.MAP;
			var len = listOfTiles.length;

			for (var i = 0; i < len; i++) {

				tile = listOfTiles[i];

				map.setTilesValue(tile.Column, tile.Row, 4);
			}

			//TODO: temporary
			game.drawMapTiles();
			game.player.setUncoveredMines(mines);
			game.displayUncoveredMines(mines);
		}
		gameConnection.client.clientReceivePlayerShootsOtherPlayer = function (rndDamage, totalAmmo, seatNumber, winMessage) {
			if (typeof winMessage !== "undefined") {
				game.WIN_MESSAGE = winMessage;
			}

			var mainPlayer = game.player;
			mainPlayer.setCurrentAttackStatus(mainPlayer.getAttackStatuses().shooting);
			mainPlayer.setCurrentShootingTargetSeatNumber(seatNumber);

			var halfSize = mainPlayer.getSpriteSize().x / 2;
			var opponentObj = game.getOtherPlayerBasedOnSeatNumber(seatNumber);
			var opponentUpperLeftCornerPoint = opponentObj.player.getUpperLeftCornerPoint();
			var centerPointX = mainPlayer.getUpperLeftCornerPoint().x + halfSize;
			var centerPointY = mainPlayer.getUpperLeftCornerPoint().y + halfSize;
			var calculatedPoints = game.calculateStraightLine(centerPointX, centerPointY, opponentUpperLeftCornerPoint.x + halfSize, opponentUpperLeftCornerPoint.y + halfSize);
			var bullet = mainPlayer.getBullet();

			var opponentCharacter = opponentObj.player.getCharacter();
			opponentCharacter.changeAnimation(opponentCharacter.animations.target);

			bullet.setDealtDamage(rndDamage);
			bullet.setIsMyBullet(true);
			game.shootBullet(calculatedPoints, bullet, opponentObj.player, game.ANIMATION_MANAGER.BulletAnimationManager);

			//TODO: temporary
			mainPlayer.setAmmunitionPoints(totalAmmo);
			game.displayAmmunitionPoints(mainPlayer.getAmmunitionPoints());
			if (mainPlayer.getAmmunitionPoints() == 0) {
				opponentCharacter.changeAnimation(opponentCharacter.animations.running);
			}
		}
		gameConnection.client.clientReceivePlayerStopsShooting = function (seatNumber) {
			var mainPlayer = game.player;
			mainPlayer.setCurrentShootingTargetSeatNumber(null);
			mainPlayer.setCurrentAttackStatus(mainPlayer.getAttackStatuses().idle);

			var opponentObj = game.getOtherPlayerBasedOnSeatNumber(seatNumber);
			var character = opponentObj.player.getCharacter();

			//TODO: change animations.running
			character.changeAnimation(character.animations.running);
		};
		gameConnection.client.clientReceivePlayerGetsShotByOtherPlayer = function (rndDamage, health, startingTile, winMessage) {
			if (typeof winMessage !== "undefined") {
				game.WIN_MESSAGE = winMessage;
			}
			var mainPlayer = game.player;
			var halfSizePlayer = mainPlayer.getSpriteSize().x / 2;
			var halfSizeTile = game.SETTINGS.map.getTileSize() / 2;

			var centerPointX = mainPlayer.getUpperLeftCornerPoint().x + halfSizePlayer;
			var centerPointY = mainPlayer.getUpperLeftCornerPoint().y + halfSizePlayer;

			var corner = game.CURSOR.getTileCornerPoint(startingTile.Column, startingTile.Row);
			var startX = corner.x + halfSizeTile;
			var startY = corner.y + halfSizeTile;

			var calculatedPoints = game.calculateStraightLine(startX, startY, centerPointX, centerPointY);

			mainPlayer.setHealth(health);
			/////////////////////////////////////
			//TODO: TEMPORARY
			/////////////////////////////////////
			var bullet = game.otherPlayers[0].player.getBullet();
			bullet.setDealtDamage(rndDamage);
			bullet.setIsMyBullet(false);

			game.shootBullet(calculatedPoints, bullet, mainPlayer, game.ANIMATION_MANAGER.BulletAnimationManager);
			game.displayHealthPoints(health);
		}
		gameConnection.client.clientReceivePlayerGetsHitByPineCone = function (mineNumber, col, row, tile, rndDamage, health) {
			game.player.setHealth(health);
			game.displayHealthPoints(health);

			game.uncoverTile(mineNumber, col, row, tile);

			var text = new TextAnimation("-" + rndDamage + "boom", 'victors_pixel_fontregular', '50px', '#FF7575');
			var point = game.player.getUpperLeftCornerPoint();
			text.setUpperLeftCornerPoint(point.x, point.y);

			game.ANIMATION_MANAGER.TextAnimationManager.addTextToAnimationCollection(text);
		};
		gameConnection.client.clientReceivePineConeExplodes = function (mineNumber, col, row, tile, rndDamage, seatNumber) {
			var text;

			if (rndDamage < 0) {
				text = new TextAnimation("boom", 'victors_pixel_fontregular', '50px', '#FF7575');
			}
			else {
				text = new TextAnimation("-" + rndDamage, 'victors_pixel_fontregular', '50px', '#FF7575');
				var otherPlayerObj = game.getOtherPlayerBasedOnSeatNumber(seatNumber);

				if (!otherPlayerObj.player.getIsAnimationInProgress()) {
					game.ANIMATION_MANAGER.PlayerAnimationManager.addPlayerToAnimationCollection(otherPlayerObj);
				}
			}

			game.uncoverTile(mineNumber, col, row, tile);

			var point = game.CURSOR.getTileCornerPoint(col, row);
			text.setUpperLeftCornerPoint(point.x, point.y);

			game.ANIMATION_MANAGER.TextAnimationManager.addTextToAnimationCollection(text);
		};
		gameConnection.client.clientReceiveHealPlayer = function (healPoints, health, mines) {
			game.player.setHealth(health);
			game.displayHealthPoints(health);
			game.player.setUncoveredMines(mines);
			game.displayUncoveredMines(mines);

			var text = new TextAnimation("+" + healPoints, 'victors_pixel_fontregular', '50px', '#48AE48');
			var point = game.player.getUpperLeftCornerPoint();
			text.setUpperLeftCornerPoint(point.x, point.y);

			game.ANIMATION_MANAGER.TextAnimationManager.addTextToAnimationCollection(text);
		};

		gameConnection.client.clientReceiveWinGame = function (message) {
			game.winGame(message);
		}
	}
	game.onMouseClick = function () {
		$effectsCanvas.click(function (e) {
			var cursor = game.CURSOR, uncoveredMines;
			var mainPlayer = game.player;
			var map = game.MAP;
			var settingsMap = game.SETTINGS.map;
			var mapLength = settingsMap.getNumberOfTiles_Column() - 1;
			var mapHeight = settingsMap.getNumberOfTiles_Row() - 1;

			var x = cursor.getCursorPositionInCanvas_x(e.pageX),
				y = cursor.getCursorPositionInCanvas_y(e.pageY);

			cursor.setClickedTile(cursor.getColumn(x), cursor.getRow(y));

			var startTile = mainPlayer.getCurrentTile();
			var clickedTile = cursor.getClickedTile();

			if (game.playerMenu.isMenuVisible) {
				game.playerMenu.hideMenu();
			}

			//clicked outside map boundry
			if (clickedTile.column < 0 || clickedTile.column > mapLength || clickedTile.row < 0 || clickedTile.row > mapHeight) {
				return;
			}

			//check if clicked on self
			if (clickedTile.column == game.player.getCurrentTile().column && clickedTile.row == game.player.getCurrentTile().row) {
				game.clickedOnSelf();
				return;
			}

			//Pine Cone
			if (mainPlayer.getCurrentWeapon() == mainPlayer.getWeapons().pineCone) {
				uncoveredMines = mainPlayer.getUncoveredMines();

				mainPlayer.switchWeapon( mainPlayer.getWeapons().acorn );
				game.playerMenu.weapons.pinecomb.hideSmallPinecombIcon();

				if (uncoveredMines <= 0) {		
					return;
				}

				uncoveredMines = uncoveredMines - 1;
				mainPlayer.setUncoveredMines(uncoveredMines);
				game.displayUncoveredMines(uncoveredMines);

				///////////////////////////////////////////////////////////////////////////////////////////////
				//broadcast to server				  THROW PINE CONE
				///////////////////////////////////////////////////////////////////////////////////////////////
				gameConnection.server.serverBroadcastPineConeThrown(clickedTile.column, clickedTile.row, mainPlayer.getRoom());
				///////////////////////////////////////////////////////////////////////////////////////////////
				return;
			}

			//Turret
			if (game.playerMenu.buildings.turret.isTurretSelected) {

				///////////////////////////////////////////////////////////////////////////////////////////////
				//broadcast to server				  TRY TO PLACE TURRET ON MAP
				///////////////////////////////////////////////////////////////////////////////////////////////
				gameConnection.server.serverBroadcastPlaceTurretOnMap(clickedTile.column, clickedTile.row, mainPlayer.getRoom());
				///////////////////////////////////////////////////////////////////////////////////////////////
			}

			//shoot

			if (mainPlayer.getCurrentAttackStatus() !== mainPlayer.getAttackStatuses().shooting && game.IsClickedOnOpponent(x, y)) {

				var calculatedTiles = game.calculateStraightLine(startTile.column, startTile.row, clickedTile.column, clickedTile.row);
				if (game.shootingPathIsClear(calculatedTiles)) {

					///////////////////////////////////////////////////////////////////////////////////////////////
					//broadcast to server              CHECK IF PLAYER IS ALLOWED TO SHOOT AT THE TARGET
					///////////////////////////////////////////////////////////////////////////////////////////////
					gameConnection.server.serverBroadcastPlayerClickedOnOtherPlayer(clickedTile.column, clickedTile.row, mainPlayer.getRoom());
					///////////////////////////////////////////////////////////////////////////////////////////////
				}
				return;
			}

			// Move ///////////////////////////////////////////////////////////////////////////////////////

			//(check if is allowed to move)
			if (!game.setPlayerPositionForAStarAlgorithm()) {
				return;
			}

			mainPlayer.resetNextTilePlayerMovesToCounter();

			var result = mainPlayer.getAStarResult();

			if (typeof result !== "undefined" && result.length > 0) {
				//check arrayResult for uncovered tile (in case player clicks on map too fast thus allowing him to walk over uncovered tiles)
				var length = result.length;
				var resultX, resultY, tile;

				for (var i = 0; i < length; i++) {
					resultX = result[i].x;
					resultY = result[i].y;

					tile = map.getTilesValue(resultX, resultY);

					if (tile === 0 || tile === 2) {
						map.setGraphType(resultX, resultY, 0);
					}
				}
				if (mainPlayer.getCurrentMovementStatus() !== mainPlayer.getMovementStatuses().running) {
					mainPlayer.setCurrentMovementStatus(mainPlayer.getMovementStatuses().running);
				}

			}
		});
	}
	game.initialize = function () {
		var mapCtx = ctx;

		initializeCanvases();
		//initializeRightSideDisplay();
		initializeLobbyAndPlayerNameModalPosition();

		//game.drawMapTiles();
		game.displayAmmunitionPoints(game.player.getAmmunitionPoints());

		function initializeCanvases() {

			var mapCanvas = document.getElementById("mapCanvas");
			if (mapCanvas.getContext) {
				mapCanvas.width = game.SETTINGS.map.getMapCanvasWidth();
				mapCanvas.height = game.SETTINGS.map.getMapCanvasHeight();
			}
			else {
				alert("mapCanvas has no context");
				return;
			}

			var bulletsCanvas = document.getElementById("bulletsCanvas");
			if (bulletsCanvas.getContext) {
				bulletsCanvas.width = game.SETTINGS.map.getMapCanvasWidth();
				bulletsCanvas.height = game.SETTINGS.map.getMapCanvasHeight();
			}
			else {
				alert("bulletsCanvas has no context");
				return;
			}

			var effectsCanvas = document.getElementById("effectsCanvas");
			if (effectsCanvas.getContext) {
				effectsCanvas.width = game.SETTINGS.map.getMapCanvasWidth() + 80;
				effectsCanvas.height = game.SETTINGS.map.getMapCanvasHeight() + 50;
			}
			else {
				alert("effectsCanvas has no context");
				return;
			}

			var $mapContainer = $("#mapContainer");
			$mapContainer.css("width", game.SETTINGS.map.getMapCanvasWidth() + 1);
			$mapContainer.css("height", game.SETTINGS.map.getMapCanvasHeight() + 1);

			var x = mapContainer.offsetLeft;

			$effectsCanvas.css({ "left": x, "top": 18 })
			$bulletsCanvasContainer.css("width", game.SETTINGS.map.getMapCanvasWidth());
			$bulletsCanvasContainer.css("height", game.SETTINGS.map.getMapCanvasHeight());

			$playerCanvasContainer.css("width", game.SETTINGS.map.getMapCanvasWidth());
			$playerCanvasContainer.css("height", game.SETTINGS.map.getMapCanvasHeight());

			$enemyCanvasContainer.css("width", game.SETTINGS.map.getMapCanvasWidth());
			$enemyCanvasContainer.css("height", game.SETTINGS.map.getMapCanvasHeight());

			$playerCanvasContainer.css("left", x)
			$enemyCanvasContainer.css("left", x)
			$bulletsCanvasContainer.css("left", x);
		}
		function initializeRightSideDisplay() {

			var left = parseInt($mapContainer.css("width"), 10) + 10;

			$("#rightSideDisplay").css("left", left + "px");

		}
		function initializeLobbyAndPlayerNameModalPosition() {
			var $playerNameBox = $("#setPlayerNameModalBox");

			var effectsLeft = $("#effectsCanvas").css("left");
			var effectsTop = $("#effectsCanvas").css("top");

			var winW = $("#mainContainer").width();
			$playerNameBox.css({ 'left': winW / 2 - $playerNameBox.width() / 2, 'top': 100 });

			$playerNameBox.show();

		}

	}
	game.drawMapTiles = function () {
		var settingsMap = game.SETTINGS.map;
		var map = game.MAP;
		var mapCtx = ctx;

		var x, y, tile,
		padding = settingsMap.getCanvasPaddingWithoutBorder(),
		tileSize = settingsMap.getTileSize(),
		mineNumber, graphNodeType,
		tileRadius = settingsMap.getTileRadius(),
		numRow = settingsMap.getNumberOfTiles_Row(),
		numCol = settingsMap.getNumberOfTiles_Column();

		mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

		for (var i = 0; i < numCol; i++) {
			for (var j = 0; j < numRow; j++) {

				tile = map.getTilesValue(i, j);

				x = i * tileSize + i + padding;
				y = j * tileSize + j + padding;

				if (tile == 0 || tile == 2) {
					drawTileWithRadius(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, settingsMap.getDrawUncoveredTileBorder(), settingsMap.getUncoveredTileBackground());
				}
				else if (tile == 1) {
					mineNumber = map.getNumbersValue(i, j);
					drawNumbers(i, j, mineNumber);
				}
				else if (tile == 3) {
					drawTileWithRadius(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, "rgba(238,68,68,.8)");
				}
				else if (tile == 4) {
					drawTileWithRadius(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, "rgba(10,211,122,.8)");
				}
				else if (tile == 5) {
					drawTileWithRadius(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, "rgba(238,68,68,.8)");
				}
				else if (tile == 6) {
					mineNumber = map.getNumbersValue(i, j);
					drawNumbers(i, j, mineNumber);

					drawTileWithRadius(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, false, "rgba(255,255,255,.4)");
				}
				else if (tile == 7) {
					drawTileWithRadius(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, false, "orange");
				}
			}
		}

		function drawNumbers(col, row, numOfMines) {
			var point = game.CURSOR.getTileCornerPoint(col, row);
			var posX = tileSize / 2;
			var posY = posX + 14;

			if (numOfMines !== 0) {
				mapCtx.fillStyle = "#777";
				mapCtx.font = '25px victors_pixel_fontregular';
				mapCtx.fillText(numOfMines, point.x + posX, point.y + posY);
			}
		}

		function drawTileWithRadius(ctx, x, y, width, height, radius, stroke, fillStyle) {

			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();

			//var random = Math.floor((Math.random() * 256));
			ctx.fillStyle = fillStyle;
			ctx.fill();

			if (stroke) {
				ctx.strokeStyle = settingsMap.getUncoveredTileBorderColor();
				ctx.stroke();
			}

		}

		function drawTile(ctx, x, y, width, height, stroke, fillStyle) {

			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.lineTo(x + width, y);
			ctx.lineTo(x + width, y + height);
			ctx.lineTo(x, y + height);
			ctx.lineTo(x, y);
			ctx.closePath();

			ctx.fillStyle = fillStyle;
			ctx.fill();

			if (stroke) {
				ctx.strokeStyle = fillStyle;
				ctx.stroke();
			}

		}

	}
	game.displayAmmunitionPoints = function (points) {
		$("#ammunitionPointsContainer").text(points);
	}
	game.calculateCursorPosition = function () {
		var x, y, row, col;

		$("#mapCanvas").mouseover(function () {
			$(this).mousemove(function (e) {
				var cursor = game.CURSOR;

				x = cursor.getCursorPositionInCanvas_x(e.pageX),
				y = cursor.getCursorPositionInCanvas_y(e.pageY),

				cursor.setCurrentTileHover(cursor.getColumn(x), cursor.getRow(y));
			});
		});
	}
	game.aStarAlgorithm = function () {
		var map = game.MAP;

		//resetPathColor();
		var nextTile = game.player.getNextTile();
		var clickedTile = game.CURSOR.getClickedTile();

		var startNode = map.getGraphNode(nextTile.column, nextTile.row);
		map.setGraphType(clickedTile.column, clickedTile.row, 1);
		var endNode = map.getGraphNode(clickedTile.column, clickedTile.row);

		// result now searches diagonal neighbors as well
		var result = astar.search(map.getGraphNodes(), startNode, endNode, true);

		if (typeof result === "undefined" || result.length === 0) {
			//if user clicks too fast make sure not to change the already uncovered tile into a wall type for A* algorithm
			if (map.getGraphType(clickedTile.column, clickedTile.row) !== 1)
				map.setGraphType(clickedTile.column, clickedTile.row, 0);
		}

		//for (var i = 0; i < result.length; i++) {
		//    var row = result[i].x;
		//    var col = result[i].y;
		//    map[row][col] = 5;
		//}

		//insert nextTile as first element so player will go fully to the next tile thus he will not run over mines and such
		var node = { "x": nextTile.column, "y": nextTile.row };
		result.splice(0, 0, node);

		return result;

		//function resetPathColor() {
		//	var columns = game.SETTINGS.map.getNumberOfTiles_Column();
		//	var rows = game.SETTINGS.map.getNumberOfTiles_Row();

		//	for (var i = 0; i < columns; i++) {
		//		for (var j = 0; j < rows; j++) {
		//			var num = game.MAP.tiles[i][j];

		//			if (num == 5) {
		//				game.MAP.tiles[i][j] = 1;
		//			}
		//		}
		//	}

		//}
	}
	game.setPlayerPositionForAStarAlgorithm = function () {

		/////////////////////////////////////////////////////////////////////////////////////
		//code responsible for A* algorithm
		/////////////////////////////////////////////////////////////////////////////////////
		var map, cursor = game.CURSOR;
		var mainPlayer = game.player;
		var playerCurrentTile = mainPlayer.getCurrentTile();
		var clickedTile = cursor.getClickedTile();
		var tileNum;

		map = game.MAP;
		tileNum = map.getTilesValue(clickedTile.column, clickedTile.row);

		//clicked on a mine
		if (tileNum == 3 || tileNum == 4 || tileNum == 5) {
			return false;
		}

		var calculatedPath = game.aStarAlgorithm();
		mainPlayer.setAStarResult(calculatedPath);

		return true;
	};
	game.otherPlayerIsFullyInTile = function (enemy, ctx, canvas) {

		var currTile = enemy.getCurrentTile();
		var nextTile = enemy.getNextTile();

		enemy.setPreviousTile(currTile.column, currTile.row);
		enemy.setCurrentTile(nextTile.column, nextTile.row);
		enemy.resetAnimationCounter();
		enemy.setCurrentMovementStatus(enemy.getMovementStatuses().idle);
	};
	game.checkIfMineIsUncoveredAllAround = function (col, row) {

		function checkIfTileIsMine(num) {
			return num == 2 ? true : false;
		}
		function checkIfTilesAroundParameterTileAreUncovered(col, row) {
			var rMinusOne = row - 1;
			var rPlusOne = row + 1;
			var kMinusOne = col - 1;
			var kPlusOne = col + 1;

			for (var r = rMinusOne; r <= rPlusOne; r++) {
				for (var k = kMinusOne; k <= kPlusOne; k++) {

					if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
						if (map.getTilesValue(k, r) == 0) {
							return false;
						}
					}

				}
			}

			return true;
		}


		var numCol = game.SETTINGS.map.getNumberOfTiles_Column();
		var numRow = game.SETTINGS.map.getNumberOfTiles_Row();
		var mainPlayer = game.player;

		//TODO: temporary
		if (typeof col == 'undefined' && typeof row == 'undefined') {
			col = mainPlayer.getCurrentTile().column;
			row = mainPlayer.getCurrentTile().row;
		}

		var rMinusOne = row - 1;
		var rPlusOne = row + 1;
		var kMinusOne = col - 1;
		var kPlusOne = col + 1;

		var map = game.MAP;

		for (var k = kMinusOne; k <= kPlusOne; k++) {
			for (var r = rMinusOne; r <= rPlusOne; r++) {
				//check if tile is outside of map boundry(ex. row = -1)
				if (r >= 0 && r < numRow && k >= 0 && k < numCol) {

					var isMine = checkIfTileIsMine(map.getTilesValue(k, r));
					if (isMine) {
						if (checkIfTilesAroundParameterTileAreUncovered(k, r)) {
							//The mine is uncovered from all sides here


							map.setTilesValue(k, r, 4);
						}
					}

				}
			}

		}

	};
	game.playerStepsOnMine = function (position, minePosition) {
		var map = game.MAP;
		var mainPlayer = game.player;

		map.setTilesValue(minePosition.Column, minePosition.Row, 3);
		map.setGraphType(minePosition.Column, minePosition.Row, 0);

		//var point = game.CURSOR.getTileCornerPoint(game.player.getPreviousTile().column, player.getPreviousTile().row);
		var point = game.CURSOR.getTileCornerPoint(position.Column, position.Row);

		//moves player to the previous tile location
		mainPlayer.setUpperLeftCornerPoint(point.x, point.y);
		playerCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

		mainPlayer.setCurrentTile(position.Column, position.Row);
		mainPlayer.setNextTile(position.Column, position.Row);

		//reset the resultArray so player wont walk over mines if he clicks too fast
		mainPlayer.setAStarResult([]);

		mainPlayer.setAmmunitionPoints(0);
		game.displayAmmunitionPoints(mainPlayer.getAmmunitionPoints());

		game.drawMapTiles();
	};
	game.playerStepsOnEmptyTile = function (mineNumber, position) {
		var map = game.MAP;
		var mainPlayer = game.player;

		mainPlayer.addAmmunitionPoints(mineNumber);
		game.displayAmmunitionPoints(mainPlayer.getAmmunitionPoints());

		map.setTilesValue(position.Column, position.Row, 1);
		map.setNumbersValue(position.Column, position.Row, mineNumber);
		map.setGraphType(position.Column, position.Row, 1);

		game.animateUncoveredMineNumbers();
		game.checkIfMineIsUncoveredAllAround();
		game.drawMapTiles();
	};
	game.uncoverTile = function (mineNumber, col, row, tile) {
		var map = game.MAP;
		var mainPlayer = game.player;

		map.setTilesValue(col, row, tile);
		map.setNumbersValue(col, row, mineNumber);

		if (tile == 5) {
			map.setGraphType(col, row, 0);
		}
		else if (tile == 1) {
			map.setGraphType(col, row, 1);
		}

		game.checkIfMineIsUncoveredAllAround(col, row);
		game.drawMapTiles();
	}
	game.isDestinationTileReached = function () {
		var mainPlayer = game.player;
		var aStarLenght = mainPlayer.getAStarResult().length;

		if (mainPlayer.getNextTilePlayerMovesToCounter() == aStarLenght || aStarLenght == 0) {
			return true;
		}

		return false;
	};
	game.moveOtherPlayer = function (col, row, playerObj, opacityChangeValue) {

		var otherPlayer = playerObj.player;

		if (typeof opacityChangeValue !== "undefined") {
			otherPlayer.setOpacityChangeValue(opacityChangeValue);
		}
		else {
			playerObj.ctx.globalAlpha = 1;
			playerObj.player.setOpacity(1);
		}

		game.otherPlayerIsFullyInTile(otherPlayer, playerObj.ctx, playerObj.canvas);
		otherPlayer.setNextTile(col, row);

		//TODO: move movementStatuses to a static helper class
		if (!game.player.getCurrentShootingTargetSeatNumber() === otherPlayer.getSeatNumber()) {
			otherPlayer.setCurrentMovementStatus(otherPlayer.getMovementStatuses().running);
		}

		if (!otherPlayer.getIsAnimationInProgress()) {
			game.ANIMATION_MANAGER.PlayerAnimationManager.addPlayerToAnimationCollection(playerObj);
		}
	};
	game.playerIsFullyInTile = function () {
		var mainPlayer = game.player;

		var currTile = mainPlayer.getCurrentTile();
		var nextTile = mainPlayer.getNextTile();

		mainPlayer.setPreviousTile(currTile.column, currTile.row);
		mainPlayer.setCurrentTile(nextTile.column, nextTile.row);

		mainPlayer.incrementNextTilePlayerMovesToCounter();

		//check if the the current tile is the destination tile
		if (game.isDestinationTileReached()) {
			mainPlayer.setCurrentMovementStatus(mainPlayer.getMovementStatuses().idle);
			mainPlayer.resetAnimationCounter();
			mainPlayer.resetNextTilePlayerMovesToCounter();
		}
		else {

			var aStarResult = mainPlayer.getAStarResult();
			var nextTileCounter = mainPlayer.getNextTilePlayerMovesToCounter();

			mainPlayer.setNextTile(aStarResult[nextTileCounter].x, aStarResult[nextTileCounter].y);

			nextTile = mainPlayer.getNextTile();
		}

		//////////////////////////////////////////////////////////////////////////////////////////
		//broadcast to server                CHECK UNDERNEATH TILE & UPDATE PLAYER POSITION
		//////////////////////////////////////////////////////////////////////////////////////////
		gameConnection.server.serverBroadcastCheckUnderneathTile(mainPlayer.getRoom(), nextTile.column, nextTile.row);
		//////////////////////////////////////////////////////////////////////////////////////////
	};
	game.animateUncoveredMineNumbers = function () {

		var animationNumbersTimerInterval, counter = 0;
		var currentTile = game.player.getCurrentTile();

		var point = game.CURSOR.getTileCornerPoint(currentTile.column, currentTile.row);
		var number = game.MAP.getNumbersValue(currentTile.column, currentTile.row);
		var mineNumbersText;

		if (number !== 0) {
			var mineNumberText = new TextAnimation(number, 'victors_pixel_fontregular', '50px', '#FFCC00', true);
			mineNumberText.setUpperLeftCornerPoint(point.x + 20, point.y);
			game.ANIMATION_MANAGER.TextAnimationManager.addTextToAnimationCollection(mineNumberText);
		}
	};
	game.IsClickedOnOpponent = function (x, y) {
		var c, c_x, c_y, len = game.otherPlayers.length, playerSize = game.player.getContextSize(), playerObj, opacity;

		for (var i = 0; i < len; i++) {
			playerObj = game.otherPlayers[i];
			c = playerObj.canvas;

			c_x = parseInt(c.style.left);
			c_y = parseInt(c.style.top);

			if (!isNaN(c_x) && !isNaN(c_y)) {

				opacity = playerObj.ctx.globalAlpha;

				if (opacity > .1) {

					if (x > c_x && x < (c_x + playerSize) && y > c_y && y < (c_y + playerSize)) {
						return true;
					}
				}
			}
		}

		return false;

	};
	game.calculateStraightLine = function (startX, startY, endX, endY) {

		var coordinatesArray = new Array();
		// Translate coordinates
		var x1 = startX;
		var y1 = startY;
		var x2 = endX;
		var y2 = endY;
		// Define differences and error check
		var dx = Math.abs(x2 - x1);
		var dy = Math.abs(y2 - y1);
		var sx = (x1 < x2) ? 1 : -1;
		var sy = (y1 < y2) ? 1 : -1;
		var err = dx - dy;
		// Set first coordinates
		coordinatesArray.push({ "x": x1, "y": y1 });
		// Main loop
		while (!((x1 == x2) && (y1 == y2))) {
			var e2 = err << 1;
			if (e2 > -dy) {
				err -= dy;
				x1 += sx;
			}
			if (e2 < dx) {
				err += dx;
				y1 += sy;
			}
			// Set coordinates
			coordinatesArray.push({ "x": x1, "y": y1 });
		}
		// Return the result
		return coordinatesArray;
	};
	game.shootingPathIsClear = function (tilesArray) {
		var tile, num;

		for (var i = 0; i < tilesArray.length; i++) {
			tile = tilesArray[i];
			num = game.MAP.getTilesValue(tile.x, tile.y);
			if (num !== 1 && num !== 6) {
				return false;
			}
		}

		return true;

	};
	game.shootBullet = function (pointsArray, bullet, opponent, bulletAnimationManager) {
		var arrLength, len, adjustBulletFlag;

		//return, not allowing events to stack up
		if (bullet.getIsBulletShootingInProgress()) {
			return;
		}

		bullet.setAdjustTrajectoryFlag(true);
		bullet.setIsBulletShootingInProgress(true);
		bullet.setUpperLeftCornerPoint(pointsArray[0].x, pointsArray[0].y);

		arrLength = pointsArray.length;
		len = Math.floor(arrLength / 2) + Math.floor(arrLength / 4);

		bullet.setTrajectoryPath(pointsArray, len);
		bullet.setTargetOpponent(opponent);

		bulletAnimationManager.addBulletToAnimationCollection(bullet);

	};
	game.animateDamageNumber = function (dmg, opponent) {

	};
	game.winGame = function (message) {
		effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
		ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
		playerCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
		enemyCtx1.clearRect(0, 0, enemyCanvas1.width, enemyCanvas1.height);
		bulletsCtx.clearRect(0, 0, bulletsCanvas.width, bulletsCanvas.height);
		alert(message);

		window.location.reload();
	};
	game.clickedOnSelf = function () {
		var mainPlayer = game.player;
		var weapons = mainPlayer.getWeapons();

		if (mainPlayer.getCurrentWeapon() === weapons.pineCone) {
			mainPlayer.switchWeapon(weapons.acorn);
			game.playerMenu.weapons.pinecomb.hideSmallPinecombIcon();

			if (mainPlayer.getUncoveredMines() > 0) {
				gameConnection.server.serverBroadcastHealPlayer(mainPlayer.getRoom());
			}
		}
		else {
			game.playerMenu.showMenu();
		}
	};
	game.displayHealthPoints = function (health) {
		$("#healthPointsContainer").text(health);
	};
	game.displayUncoveredMines = function (tiles) {
		$("#uncoveredMinesContainer").text(tiles);
	};

	game.getOtherPlayerBasedOnSeatNumber = function (seatNumber) {
		var playerObj;
		var others = game.otherPlayers;

		for (var i = 0; i < others.length; i++) {
			playerObj = others[i];

			if (playerObj.player.getSeatNumber() === seatNumber) {
				return playerObj;
			}
		}

		alert("player with seat number: " + seatNumber + " does not exist");
		return null;
	};
	game.getPlayerPositionInRegardToOpponentPosition = function (startCol, startRow, endCol, endRow) {

		function getRow(startCol, startRow, endCol, endRow) {
			if (startRow < endRow) {

				return 1;
			}
			else if (startRow > endRow) {

				return 2;
			}
			else if (startRow == endRow) {

				return 0;
			}
		}

		if (startCol < endCol) {

			var rowResult = getRow(startCol, startRow, endCol, endRow);
			switch (rowResult) {
				case 0:
					return 0;
				case 1:
					return 1;
				case 2:
					return 7;
				default: return null;
			}
		}
		else if (startCol > endCol) {

			var rowResult = getRow(startCol, startRow, endCol, endRow);
			switch (rowResult) {
				case 0:
					return 4;
				case 1:
					return 3;
				case 2:
					return 5;
				default: return null;
			}
		}
		else if (startCol == endCol) {

			var rowResult = getRow(startCol, startRow, endCol, endRow);
			switch (rowResult) {
				case 0:
					return 8;
				case 1:
					return 2;
				case 2:
					return 6;
				default: return null;
			}

		}
	}

	game.gameSession = {
		initializeMap: function () {
			game.drawMapTiles();
		},
		initializePlayer: function (randX, randY, seatNumber) {
			var map = game.MAP;
			var mainPlayer = game.player;
			var attackStatuses = mainPlayer.getAttackStatuses();
			var movementStatuses = mainPlayer.getMovementStatuses();

			mainPlayer.setSeatNumber(seatNumber);

			if (map.getTilesValue(randX, randY) !== 2) {

				mainPlayer.setCurrentAttackStatus(attackStatuses.idle);
				mainPlayer.setCurrentMovementStatus(movementStatuses.idle);

				mainPlayer.setStartingTile(randX, randY);
				mainPlayer.setCurrentTile(randX, randY);
				mainPlayer.setNextTile(randX, randY);

				var point = game.CURSOR.getTileCornerPoint(randX, randY);
				mainPlayer.setUpperLeftCornerPoint(point.x, point.y);

				mainPlayer.setAmmunitionPoints(map.getNumbersValue(randX, randY));

				map.setTilesValue(randX, randY, 1);
				map.setGraphType(randX, randY, 1);

				playerCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

				game.ANIMATION_MANAGER.PlayerAnimationManager.addPlayerToAnimationCollection(game.playerObj);

				return;
			}

			alert("Player is standing on a mine");

			//tylko dla przykladu, mozna w przyszlosci usunac
			//tileSheet.addEventListener('load', eventPlayerLoaded, false);
			//function eventPlayerLoaded() {
			//drawPlayer();
			//}
		},
		initializePersonalPlayerMenu: function () {
			var $container = $("#personalMenuContainer");
			var playerPositionPoint = game.player.getUpperLeftCornerPoint();

			//TODO: get rid of const numbers, use properties
			$container.css({ "left": (playerPositionPoint.x - 23) + "px", "top": (playerPositionPoint.y + 40) + "px" });

			$container.click(function () {
				game.playerMenu.hideMenu();
			});
		},
		initializeOtherPlayers: function (seatNumber) {
			var animations = new CharacterAnimations();

			var boar1 = new Character("boar", "Dzik Antoni", animations.boar);
			var squirrel2 = new Character("squirrel", "Wiewiórka Mimi", animations.squirrel);
			var squirrel3 = new Character("squirrel", "Wiewiórka Mimi", animations.squirrel);

			var player1 = new Player(boar1, false);
			var player2 = new Player(squirrel2, false);
			var player3 = new Player(squirrel3, false);

			player1.setBullet(new Bullet("Images/tileSheet/Bullet/bullet.png"));
			player2.setBullet(new Bullet("Images/tileSheet/Bullet/bullet.png"));
			player3.setBullet(new Bullet("Images/tileSheet/Bullet/bullet.png"));

			var playerObj1 = { "player": player1, "ctx": enemyCtx1, "canvas": enemyCanvas1 };
			enemyCtx1.globalAlpha = 0;
			var playerObj2 = { "player": player2, "ctx": enemyCtx2, "canvas": enemyCanvas2 };
			enemyCtx2.globalAlpha = 0;
			var playerObj3 = { "player": player3, "ctx": enemyCtx3, "canvas": enemyCanvas3 };
			enemyCtx3.globalAlpha = 0;

			var otherPlayers = [playerObj1, playerObj2, playerObj3];
			game.otherPlayers = otherPlayers;

			setSeatNumberToOtherPlayers(seatNumber, game.otherPlayers);

			function setSeatNumberToOtherPlayers(seatNumberOfMainPlayer, otherPlayers) {
				var index;

				for (var i = 1; i < 5; i++) {
					if (i !== seatNumberOfMainPlayer) {
						index = seatNumberOfMainPlayer < i ? i - 2 : i - 1;
						otherPlayers[index].player.setSeatNumber(i);
					}
				}
			}
		},
		playing: function () {
			game.calculateCursorPosition();
			game.onMouseClick();
		}
	}
}



