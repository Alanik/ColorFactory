var Game = function (Settings, Cursor, Effects, AnimationManager, Map, Plr) {
	var game = this;

	game.SETTINGS = Settings;
	game.MAP = Map;
	game.CURSOR = Cursor;
	game.EFFECTS = Effects;
	game.ANIMATION_MANAGER = AnimationManager;

	game.player = Plr;
	game.otherPlayers = [];

	//TODO: temporary
	game.WIN_MESSAGE;

	//FLAGS
	game.flags = {
		isPersonalMenuVisible: false
	}

	////////////////////////////////////////////////////////////////////////
	//methods
	////////////////////////////////////////////////////////////////////////

	game.onGameStart = function () {
		var player1 = new Player("Images/TileSheet/tileSheetRedPlayer.png", "/Images/Tilesheet/tileSheetRedPlayerTarget.png");
		var player2 = new Player("Images/TileSheet/tileSheetRedPlayer.png", "/Images/Tilesheet/tileSheetRedPlayerTarget.png");
		var player3 = new Player("Images/TileSheet/tileSheetRedPlayer.png", "/Images/Tilesheet/tileSheetRedPlayerTarget.png");

		game.player.setBullet(new Bullet("Images/TileSheet/Bullet/bullet.png"));
		player1.setBullet(new Bullet("Images/TileSheet/Bullet/bullet.png"));
		player2.setBullet(new Bullet("Images/TileSheet/Bullet/bullet.png"));
		player3.setBullet(new Bullet("Images/TileSheet/Bullet/bullet.png"));

		var playerObj1 = { "player": player1, "ctx": enemyCtx1, "canvas": enemyCanvas1 };
		var playerObj2 = { "player": player2, "ctx": enemyCtx2, "canvas": enemyCanvas2 };
		var playerObj3 = { "player": player3, "ctx": enemyCtx3, "canvas": enemyCanvas3 };

		game.otherPlayers.push(playerObj1);
		game.otherPlayers.push(playerObj2);
		game.otherPlayers.push(playerObj3);

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////SignalR game session start!!! START GAME
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		gameConnection.client.clientReceiveStartGame = function (x, y) {
			var gameSession = game.gameSession;

			$("#lobbyContainer").hide();

			gameSession.initializePlayer(x, y);
			gameSession.initializeMap();
			gameSession.initializePersonalPlayerMenu();
			gameSession.playing();
		};

		gameConnection.client.clientReceiveOtherPlayerPosition = function (randX, randY, seatNumber) {

			var point = game.CURSOR.getTileCornerPoint(randX, randY);
			var enemyObj = game.otherPlayers[seatNumber];

			var enemy = enemyObj.player;
			var enemyCtx = enemyObj.ctx;
			var canvas = enemyObj.canvas;

			enemy.setCurrentTile(randX, randY);
			enemy.setUpperLeftCornerPoint(point.x, point.y);

			//set playerCanvas position here //////////////////////////////////////////////////////
			canvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

			enemyCtx.globalAlpha = 1;
			game.drawOtherPlayer(enemy, enemyCtx, canvas);
		}
		gameConnection.client.clientReceiveUpdateOtherPlayerPosition = function (x, y, otherPlayerIndex, alpha) {
			var playerObj = game.otherPlayers[otherPlayerIndex];

			game.moveOtherPlayer(x, y, playerObj, alpha);
		}
		gameConnection.client.clientReceiveUpdateOtherPlayerPosition_changeAlphaOtherPlayer = function (oldCol, oldRow, col, row, otherPlayerIndex, opacity) {
			var playerObj = game.otherPlayers[otherPlayerIndex];
			var otherPlayer = playerObj.player;

			otherPlayer.setCurrentTile(oldCol, oldRow);

			var point = game.CURSOR.getTileCornerPoint(oldCol, oldRow);
			otherPlayer.setUpperLeftCornerPoint(point.x, point.y);

			game.moveOtherPlayer(col, row, playerObj, opacity);
		}
		gameConnection.client.clientReceiveUncoverTile = function (tileNum, mineNum, playerCurrentPosition, minePosition) {
			//console.log("server returns: tileNum - " + tileNum + ", mineNum - " + mineNum + ", position - " + position.Column + ", " + position.Row);

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
			var tiles = game.MAP.tiles;
			var len = listOfTiles.length;

			for (var i = 0; i < len; i++) {

				tile = listOfTiles[i];
				tiles[tile.Column][tile.Row] = 4;
			}

			//TODO: temporary
			game.drawMapTiles();
			game.player.setUncoveredMines(mines);
			game.displayUncoveredMines(mines);
		}
		gameConnection.client.clientReceivePlayerShootsOtherPlayer = function (rndDamage, seatNumber, winMessage) {
			if (typeof winMessage !== "undefined") {
				game.WIN_MESSAGE = winMessage;
			}

			var mainPlayer = game.player;

			var halfSize = mainPlayer.getSpriteSize() / 2;
			var opponentObj = game.otherPlayers[seatNumber];
			var opponentUpperLeftCornerPoint = opponentObj.player.getUpperLeftCornerPoint();
			var centerPointX = mainPlayer.getUpperLeftCornerPoint().x + halfSize;
			var centerPointY = mainPlayer.getUpperLeftCornerPoint().y + halfSize;
			var calculatedPoints = game.calculateStraightLine(centerPointX, centerPointY, opponentUpperLeftCornerPoint.x + halfSize, opponentUpperLeftCornerPoint.y + halfSize);
			var bullet = mainPlayer.getBullet();

			opponentObj.player.setTileSheet(opponentObj.player.getTargetTileSheet());
			game.drawOtherPlayer(opponentObj.player, opponentObj.ctx, opponentObj.canvas);

			bullet.setDealtDamage(rndDamage);
			bullet.setIsMyBullet(true);
			game.shootBullet(calculatedPoints, bullet, opponentObj.player, game.ANIMATION_MANAGER.BulletAnimationManager);

			//TODO: temporary
			mainPlayer.setAmmunitionPoints(mainPlayer.getAmmunitionPoints() - 1);
			game.displayAmmunitionPoints(mainPlayer.getAmmunitionPoints());
			if (mainPlayer.getAmmunitionPoints() == 0) {
				var opponentObj = game.otherPlayers[0];
				opponentObj.player.setTileSheet(opponentObj.player.getStarterTileSheet());

				game.drawOtherPlayer(opponentObj.player, opponentObj.ctx, opponentObj.canvas);
			}
		}
		gameConnection.client.clientReceivePlayerStopsShooting = function (index) {

			var opponentObj = game.otherPlayers[index];
			opponentObj.player.setTileSheet(opponentObj.player.getStarterTileSheet());

			game.drawOtherPlayer(opponentObj.player, opponentObj.ctx, opponentObj.canvas);
		}
		gameConnection.client.clientReceivePlayerGetsShotByOtherPlayer = function (rndDamage, health, startingTile, winMessage) {
			if (typeof winMessage !== "undefined") {
				game.WIN_MESSAGE = winMessage;
			}
			var mainPlayer = game.player;
			var halfSizePlayer = mainPlayer.getSpriteSize() / 2;
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

			var text = new TextAnimation("-" + rndDamage + "boom");
			var point = game.player.getUpperLeftCornerPoint();
			text.setUpperLeftCornerPoint(point.x, point.y);

			game.ANIMATION_MANAGER.TextAnimationManager.addTextToAnimationCollection(text);
		};
		gameConnection.client.clientReceivePineConeExplodes = function (mineNumber, col, row, tile, rndDamage) {
			var otherPlayerObj = game.otherPlayers[0], text;
			
			game.uncoverTile(mineNumber, col, row, tile);

			if (rndDamage < 0) {
				text = new TextAnimation("boom");
			}
			else {
				text = new TextAnimation("-" + rndDamage);
				game.drawOtherPlayer(otherPlayerObj.player, otherPlayerObj.ctx, otherPlayerObj.canvas);
			}

			var point = game.CURSOR.getTileCornerPoint(col, row);
			text.setUpperLeftCornerPoint(point.x, point.y);

			game.ANIMATION_MANAGER.TextAnimationManager.addTextToAnimationCollection(text);
		};
		gameConnection.client.clientReceiveHealPlayer = function (healPoints, health, mines) {
			game.player.setHealth(health);
			game.displayHealthPoints(health);
			game.player.setUncoveredMines(mines);
			game.displayUncoveredMines(mines);

			var text = new TextAnimation("+" + healPoints);
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
			var tiles = map.tiles, graph = map.graph;
			var settingsMap = game.SETTINGS.map;
			var mapLength = settingsMap.getNumberOfTiles_Column() - 1;

			var x = cursor.getCursorPositionInCanvas_x(e.pageX),
				y = cursor.getCursorPositionInCanvas_y(e.pageY);

			cursor.setClickedTile(cursor.getColumn(x), cursor.getRow(y));

			var startTile = mainPlayer.getCurrentTile();
			var endTile = cursor.getClickedTile();

			var clickedTile = cursor.getClickedTile();

			if (game.flags.isPersonalMenuVisible) {
				game.hidePersonalMenu();
			}

			//clicked outside map boundry
			if (clickedTile.column < 0 || clickedTile.column > mapLength || clickedTile.row < 0 || clickedTile.row > mapLength) {
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

				if (uncoveredMines <= 0) {
					mainPlayer.setCurrentWeapon(mainPlayer.getWeapons().acorn);
					game.hideSmallGranadeIcon();
					gameConnection.server.serverBroadcastWeaponSwitched(mainPlayer.getCurrentWeapon(), mainPlayer.getRoom());
					return;
				}

				uncoveredMines = uncoveredMines - 1;
				mainPlayer.setUncoveredMines(uncoveredMines);
				game.displayUncoveredMines(uncoveredMines);

				///////////////////////////////////////////////////////////////////////////////////////////////
				//broadcast to server				  THROW PINE CONE
				///////////////////////////////////////////////////////////////////////////////////////////////
				gameConnection.server.serverBroadcastPineConeThrown(endTile.column, endTile.row, mainPlayer.getRoom());
				///////////////////////////////////////////////////////////////////////////////////////////////

				mainPlayer.setCurrentWeapon(mainPlayer.getWeapons().acorn);
				game.hideSmallGranadeIcon();
				gameConnection.server.serverBroadcastWeaponSwitched(mainPlayer.getCurrentWeapon(), mainPlayer.getRoom());
				return;
			}

			//shoot
			if (game.clickedOnOpponent(x, y)) {
				var calculatedTiles = game.calculateStraightLine(startTile.column, startTile.row, endTile.column, endTile.row);

				if (game.shootingPathIsClear(calculatedTiles)) {

					///////////////////////////////////////////////////////////////////////////////////////////////
					//broadcast to server              CHECK IF PLAYER IS ALLOWED TO SHOOT AT THE TARGET
					///////////////////////////////////////////////////////////////////////////////////////////////
					gameConnection.server.serverBroadcastPlayerClickedOnOtherPlayer(endTile.column, endTile.row, mainPlayer.getRoom());
					///////////////////////////////////////////////////////////////////////////////////////////////

					return;
				}
				else {
					return;
				}
				
			}

			//move (check if is allowed to move)
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

					tile = tiles[resultX][resultY];

					if (tile === 0 || tile === 2) {
						graph.nodes[resultX][resultY].type = 0;
					}
				}

				game.movePlayer(mainPlayer);

			}
		});
	}
	game.initialize = function () {
		var mapCtx = ctx;

		initializeCanvasesPosition();
		initializeLobbyAndPlayerNameModalPosition();

		game.drawMapTiles();
		game.displayAmmunitionPoints(game.player.getAmmunitionPoints());

		function initializeCanvasesPosition() {
			var x = mapContainer.offsetLeft;

			$effectsCanvas.css({ "left": x, "top": 18 })
			$playerCanvasContainer.css("left", x)
			$enemyCanvasContainer.css("left", x)
			$bulletsCanvasContainer.css("left", x);
		}
		function initializeLobbyAndPlayerNameModalPosition() {
			var $lobby = $("#lobbyContainer");
			var $playerNameBox = $("#setPlayerNameModalBox");

			var effectsLeft = $("#effectsCanvas").css("left");
			var effectsTop = $("#effectsCanvas").css("top");

			var winW = $("#mainContainer").width();

			$lobby.css({ 'left': winW / 2 - $lobby.width() / 2, 'top': 100 });
			$playerNameBox.css({ 'left': winW / 2 - $playerNameBox.width() / 2, 'top': 100 });

			$playerNameBox.show();

		}

	}
	game.drawMapTiles = function () {
		var settingsMap = game.SETTINGS.map;
		var map = game.MAP;
		var tiles = map.tiles;
		var numbers = map.numbers;
		var mapCtx = ctx;

		var x, y, tile, padding = settingsMap.getCanvasPaddingWithoutBorder(), tileSize = settingsMap.getTileSize(), mineNumber, graphNodeType, tileRadius = settingsMap.getTileRadius(), numRow = settingsMap.getNumberOfTiles_Row(), numCol = settingsMap.getNumberOfTiles_Column();

		mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

		for (var i = 0; i < numCol; i++) {
			for (var j = 0; j < numRow; j++) {

				tile = tiles[i][j];
				mineNumber = numbers[i][j];

				x = i * tileSize + i + padding;
				y = j * tileSize + j + padding;

				if (tile == 0 || tile == 2) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(0,0,0,.5)");
				}
				if (tile == 1 || tile == 6) {
					drawNumbers(i, j, mineNumber);
				}
				if (tile == 3) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(238,68,68,.8)");
				}
				if (tile == 4) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(10,211,122,.8)");
				}
				if (tile == 5) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(238,68,68,.8)");
				}
				if (tile == 6) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, false, "rgba(255,255,255,.4)");
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

		function roundRect(ctx, x, y, width, height, radius, fill, stroke, fillStyle) {

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

			if (stroke) {
				ctx.strokeStyle = "#010101";
				ctx.stroke();
			}
			if (fill) {
				//var random = Math.floor((Math.random() * 256));
				ctx.fillStyle = fillStyle;
				ctx.fill();
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
		var graph = map.graph;
		var tiles = map.tiles;

		//resetPathColor();
		var nextTile = game.player.getNextTile();
		var clickedTile = game.CURSOR.getClickedTile();

		var start = graph.nodes[nextTile.column][nextTile.row];
		graph.nodes[clickedTile.column][clickedTile.row].type = 1;
		var end = graph.nodes[clickedTile.column][clickedTile.row];

		// result now searches diagonal neighbors as well
		var result = astar.search(graph.nodes, start, end, true);

		if (typeof result === "undefined" || result.length === 0) {
			//if user clicks too fast make sure not to change the already uncovered tile into a wall type for A* algorithm
			if (tiles[clickedTile.column][clickedTile.row] !== 1)
				graph.nodes[clickedTile.column][clickedTile.row].type = 0;
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
		tileNum = map.tiles[clickedTile.column][clickedTile.row];

		//clicked on a mine
		if (tileNum == 3 || tileNum == 4) {
			return false;
		}

		var calculatedPath = game.aStarAlgorithm();
		mainPlayer.setAStarResult(calculatedPath);

		return true;
	};
	game.drawPlayer = function () {
		var mainPlayer = game.player;
		var canvasPadding = game.SETTINGS.map.getCanvasPadding();
		var spriteSize = mainPlayer.getSpriteSize();
		var tileSheet = mainPlayer.getTileSheet();
		var ctxSize = mainPlayer.getContextSize();

		playerCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
		playerCtx.drawImage(tileSheet, 0, spriteSize * mainPlayer.getAnimationCounter(), spriteSize, spriteSize, canvasPadding, canvasPadding, spriteSize, spriteSize);
	};
	game.movePlayer = function () {
		var mainPlayer = game.player;
		//return, not allowing events to stack up
		if (mainPlayer.getIsPlayerRunningInProgress()) {
			return;
		}

		mainPlayer.setIsPlayerRunningInProgress(true);

		mainPlayer.setTimerInterval(setInterval(game.drawPlayerRunning, 30));
	};
	game.drawPlayerRunning = function () {

		game.drawPlayer();
		game.calculatePlayerPosition();

	};
	game.otherPlayerIsFullyInTile = function (enemy, ctx, canvas) {

		var currTile = enemy.getCurrentTile();
		var nextTile = enemy.getNextTile();

		enemy.setPreviousTile(currTile.column, currTile.row);
		enemy.setCurrentTile(nextTile.column, nextTile.row);

		enemy.setIsPlayerRunningInProgress(false);
		enemy.resetAnimationCounter();
		clearInterval(enemy.getTimerInterval());
		game.drawOtherPlayer(enemy, ctx, canvas);
	};
	game.calculatePlayerPosition = function () {
		var mainPlayer = game.player;

		var aStarResult = mainPlayer.getAStarResult();

		if (typeof aStarResult !== "undefined" && aStarResult.length > 0) {
			calculate(aStarResult);
		}
		else {
			mainPlayer.setIsPlayerRunningInProgress(false);
			mainPlayer.resetNextTilePlayerMovesToCounter();
			clearInterval(mainPlayer.getTimerInterval());
			game.drawPlayer();
		}

		function calculate(aStarResult) {
			var mainPlayer = game.player;

			var velocityX = 0, velocityY = 0;
			var padding = mainPlayer.getPadding();
			var negativePadding = mainPlayer.getNegativePadding();
			var pixDist = mainPlayer.getPixelMovementDistance();
			var playerCornerPoint = mainPlayer.getUpperLeftCornerPoint();

			var nextAStarTile = aStarResult[mainPlayer.getNextTilePlayerMovesToCounter()]

			var tilePoint = game.CURSOR.getTileCornerPoint(nextAStarTile.x, nextAStarTile.y);

			var tileYMinusPlayerY = tilePoint.y - playerCornerPoint.y;
			var tileXMinusPlayerX = tilePoint.x - playerCornerPoint.x;

			if (tileYMinusPlayerY > padding)
				velocityY = 1;
			else if (tileYMinusPlayerY < negativePadding)
				velocityY = -1;
			else velocityY = 0

			if (tileXMinusPlayerX > padding)
				velocityX = 1;
			else if (tileXMinusPlayerX < negativePadding)
				velocityX = -1;
			else velocityX = 0;

			mainPlayer.incrementAnimationCounter();

			//player still moving to tile
			if (Math.abs(tileXMinusPlayerX) >= pixDist || Math.abs(tileYMinusPlayerY) >= pixDist) {

				var newX = pixDist * velocityX + playerCornerPoint.x;
				var newY = pixDist * velocityY + playerCornerPoint.y;

				mainPlayer.setUpperLeftCornerPoint(newX, newY);
				// move playerCanvas
				playerCanvas.setAttribute("style", "left:" + newX + "px; top:" + newY + "px;");
			}
			else {
				game.playerIsFullyInTile();
			}

			if (mainPlayer.getAnimationCounter() >= mainPlayer.getNumOfAnimationFrames()) {
				mainPlayer.resetAnimationCounter();
			}

		}

	};
	game.calculateOtherPlayerPosition = function (enemy, enemyCtx, canvas) {
		var velocityX = 0, velocityY = 0;
		var padding = enemy.getPadding();
		var negativePadding = enemy.getNegativePadding();
		var pixDist = enemy.getPixelMovementDistance();

		var tilePoint = game.CURSOR.getTileCornerPoint(enemy.getNextTile().column, enemy.getNextTile().row);
		var upperCornerPoint = enemy.getUpperLeftCornerPoint();

		var tileYMinusEnemyY = tilePoint.y - upperCornerPoint.y;
		var tileXMinusEnemyX = tilePoint.x - upperCornerPoint.x;

		if (tileYMinusEnemyY > padding)
			velocityY = 1;
		else if (tileYMinusEnemyY < negativePadding)
			velocityY = -1;
		else velocityY = 0

		if (tileXMinusEnemyX > padding)
			velocityX = 1;
		else if (tileXMinusEnemyX < negativePadding)
			velocityX = -1;
		else velocityX = 0;

		enemy.incrementAnimationCounter();

		//player still moving to tile
		if (Math.abs(tileXMinusEnemyX) >= pixDist || Math.abs(tileYMinusEnemyY) >= pixDist) {
			var newX = pixDist * velocityX + upperCornerPoint.x;
			var newY = pixDist * velocityY + upperCornerPoint.y;

			enemy.setUpperLeftCornerPoint(newX, newY);
			// move otherPlayerCanvas
			canvas.setAttribute("style", "left:" + newX + "px; top:" + newY + "px;");

		}
		else {
			//at this point other player is fully in tile
			game.otherPlayerIsFullyInTile(enemy, enemyCtx, canvas);
		}

		if (enemy.getAnimationCounter() >= enemy.getNumOfAnimationFrames()) {
			enemy.resetAnimationCounter();
		}
	};
	game.checkIfMineIsUncoveredAllAround = function (col, row) {

		function checkIfTileIsMine(num) {
			return num == 2 ? true : false;
		}
		function checkIfTilesAroundParameterTileAreUncovered(col, row) {
			var tiles = game.MAP.tiles;

			var rMinusOne = row - 1;
			var rPlusOne = row + 1;
			var kMinusOne = col - 1;
			var kPlusOne = col + 1;

			for (var r = rMinusOne; r <= rPlusOne; r++) {
				for (var k = kMinusOne; k <= kPlusOne; k++) {

					if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
						if (tiles[k][r] == 0) {
							return false;
						}
					}

				}
			}

			return true;
		}


		var numberOfTiles = game.SETTINGS.map.getNumberOfTiles_Column();
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

		var tiles = game.MAP.tiles;

		for (var r = rMinusOne; r <= rPlusOne; r++) {
			for (var k = kMinusOne; k <= kPlusOne; k++) {
				//check if tile is outside of map boundry(ex. row = -1)
				if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {

					var isMine = checkIfTileIsMine(tiles[k][r]);
					if (isMine) {
						if (checkIfTilesAroundParameterTileAreUncovered(k, r)) {
							//The mine is uncovered from all sides here
							tiles[k][r] = 4;
						}
					}

				}
			}

		}

	};
	game.playerStepsOnMine = function (position, minePosition) {
		var map = game.MAP;
		var tiles = map.tiles;
		var graph = map.graph;
		var mainPlayer = game.player;

		tiles[minePosition.Column][minePosition.Row] = 3;
		graph.nodes[minePosition.Column][minePosition.Row].type = 0;

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
		var tiles = map.tiles;
		var numbers = map.numbers;
		var graph = map.graph;
		var mainPlayer = game.player;

		mainPlayer.addAmmunitionPoints(mineNumber);
		game.displayAmmunitionPoints(mainPlayer.getAmmunitionPoints());

		tiles[position.Column][position.Row] = 1;
		numbers[position.Column][position.Row] = mineNumber;
		graph.nodes[position.Column][position.Row].type = 1;

		game.animateUncoveredMineNumbers();
		game.checkIfMineIsUncoveredAllAround();	
		game.drawMapTiles();
	};
	game.uncoverTile = function (mineNumber, col, row, tile) {
		var map = game.MAP;
		var tiles = map.tiles;
		var numbers = map.numbers;
		var graph = map.graph;
		var mainPlayer = game.player;

		tiles[col][row] = tile;
		numbers[col][row] = mineNumber;

		if (tile == 5) {
			graph.nodes[col][row].type = 0;
		}
		else if (tile == 1) {
			graph.nodes[col][row].type = 1;
		}

		game.checkIfMineIsUncoveredAllAround(col, row);
		game.drawMapTiles();
	}
	game.isDestinationTileReached = function () {
		var mainPlayer = game.player;
		var aStarLenght = mainPlayer.getAStarResult().length;

		if (mainPlayer.getNextTilePlayerMovesToCounter() == aStarLenght || aStarLenght == 0) {
			mainPlayer.resetNextTilePlayerMovesToCounter();
			mainPlayer.setIsPlayerRunningInProgress(false);
			clearInterval(mainPlayer.getTimerInterval());

			return true;
		}

		return false;
	};
	game.drawOtherPlayerRunning = function (playerObj, drawFunc, alpha) {
		var otherPlayer = playerObj.player;
		var ctx = playerObj.ctx;
		var canvas = playerObj.canvas;

		drawFunc(otherPlayer, ctx, canvas, alpha);

		game.calculateOtherPlayerPosition(otherPlayer, ctx, canvas);

	};
	game.drawOtherPlayer = function (enemy, enemyCtx, enemyCanvas) {

		var canvasPadding = game.SETTINGS.map.getCanvasPadding();
		var spriteSize = enemy.getSpriteSize();
		var tileSheet = enemy.getTileSheet();
		var ctxSize = enemy.getContextSize();

		enemyCtx.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height);
		enemyCtx.drawImage(tileSheet, 0, spriteSize * enemy.getAnimationCounter(), spriteSize, spriteSize, canvasPadding, canvasPadding, spriteSize, spriteSize);

	};
	game.drawOtherPlayerAlpha = function (enemy, enemyCtx, enemyCanvas, alpha) {

		var canvasPadding = game.SETTINGS.map.getCanvasPadding();
		var spriteSize = enemy.getSpriteSize();
		var tileSheet = enemy.getTileSheet();
		var ctxSize = enemy.getContextSize();

		enemyCtx.globalAlpha = alpha;

		enemyCtx.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height);
		enemyCtx.drawImage(tileSheet, 0, spriteSize * enemy.getAnimationCounter(), spriteSize, spriteSize, canvasPadding, canvasPadding, spriteSize, spriteSize);
	};
	game.moveOtherPlayer = function (col, row, playerObj, opacity) {
		var otherPlayer = playerObj.player
		game.otherPlayerIsFullyInTile(otherPlayer, playerObj.ctx, playerObj.canvas);

		otherPlayer.setNextTile(col, row);

		if (typeof opacity === 'undefined') {
			playerObj.ctx.globalAlpha = 1;
			otherPlayer.setTimerInterval(setInterval(function () { game.drawOtherPlayerRunning(playerObj, game.drawOtherPlayer) }, 30));
		}
		else if (opacity === 1) {
			otherPlayer.setTimerInterval(setInterval(function () { game.drawOtherPlayerRunning(playerObj, game.drawOtherPlayerAlpha, opacity -= .1) }, 30));
		}
		else if (opacity === 0) {
			otherPlayer.setTimerInterval(setInterval(function () { game.drawOtherPlayerRunning(playerObj, game.drawOtherPlayerAlpha, opacity += .1) }, 30));
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
			mainPlayer.resetAnimationCounter();
			game.drawPlayer();
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

		//console.log("client send: nextTile - " + nextTile.column + "," + nextTile.row + " clickedOnCurrentTile - " + game.CURSOR.getClickedOnCurrentTile());
	};
	game.animateUncoveredMineNumbers = function () {

		var animationNumbersTimerInterval, counter = 0;
		var currentTile = game.player.getCurrentTile();

		var point = game.CURSOR.getTileCornerPoint(currentTile.column, currentTile.row);
		var tilePointX = point.x;
		var tilePointY = point.y;
		var number = game.MAP.numbers[currentTile.column][currentTile.row];
		var effects = game.EFFECTS;

		if (number != 0) {
			if (effects.getIsAnimationNumbersInProgress()) {
				clearInterval(effects.getAnimationNumbersTimerInterval());
			}

			effectsCtx.fillStyle = "rgba(10,211,122,1)";
			effectsCtx.font = '50px victors_pixel_fontregular';

			effects.setIsAnimationNumbersInProgress(true)
			effects.setAnimationNumbersTimerInterval(setInterval(showUncoveredMineNumbersAnimation, 100));
		}

		function showUncoveredMineNumbersAnimation() {

			var offsetY = counter * 2, effects = game.EFFECTS;

			if (counter < 10) {
				counter++;
				effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
				effectsCtx.fillText(number, tilePointX + 14, tilePointY + 50 - offsetY);
			}
			else {
				effects.setIsAnimationNumbersInProgress(false);
				clearInterval(effects.getAnimationNumbersTimerInterval());
				effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
				return;
			}

		}
	};
	game.clickedOnOpponent = function (x, y) {
		var c, c_x, c_y, len, playerSize, playerObj, opacity;
		len = game.otherPlayers.length;
		playerSize = game.player.getContextSize();

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
		var tile, tiles = game.MAP.tiles;

		for (var i = 0; i < tilesArray.length; i++) {
			tile = tilesArray[i];

			if (tiles[tile.x][tile.y] !== 1) {
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
		if (game.flags.isPersonalMenuVisible) {
			game.hidePersonalMenu();
		}
		else {

			var mainPlayer = game.player;
			var weapons = mainPlayer.getWeapons();

			if (mainPlayer.getCurrentWeapon() === weapons.pineCone) {
				mainPlayer.setCurrentWeapon(weapons.acorn);
				game.hideSmallGranadeIcon();

				console.log(mainPlayer.getUncoveredMines());
				if (mainPlayer.getUncoveredMines() > 0) {
					gameConnection.server.serverBroadcastHealPlayer(mainPlayer.getRoom());
				}

			}
			else {
				game.showPersonalMenu();
			}
		}
	};
	game.displayHealthPoints = function (health) {
		$("#healthPointsContainer").text(health);
	};
	game.displayUncoveredMines = function (tiles) {
		$("#uncoveredMinesContainer").text(tiles);
	};
	game.showPersonalMenu = function () {
		var $container = $("#personalMenuContainer");

		var playerPositionPoint = game.player.getUpperLeftCornerPoint();

		//TODO: get rid of const numbers, use properties
		$container.css({ "right": (495 - playerPositionPoint.x) + "px", "top": (playerPositionPoint.y + 40) + "px" });

		$container.show();

		game.flags.isPersonalMenuVisible = true;
	};
	game.hidePersonalMenu = function () {
		var $container = $("#personalMenuContainer");
		$container.hide();

		game.flags.isPersonalMenuVisible = false;
	};
	game.initializePersonalMenuContainerPosition = function () {
		var $container = $("#personalMenuContainer");
		$container.css("right", "80px");

		var playerPositionPoint = game.player.getUpperLeftCornerPoint();

		//TODO: get rid of const numbers, use properties
		$container.css({ "right": (495 - playerPositionPoint.x) + "px", "top": (playerPositionPoint.y + 40) + "px" });

		$container.click(function () {
			game.hidePersonalMenu();
		});
	};
	game.showSmallGranadeIcon = function () {
		$("#smallGranadeIcon").show();
	};
	game.hideSmallGranadeIcon = function () {
		$("#smallGranadeIcon").hide();
	};
	game.granadeIconOnClick = function () {
		var mainPlayer = game.player;

		var weapons = mainPlayer.getWeapons();

		if (mainPlayer.getCurrentWeapon() === weapons.pineCone) {
			mainPlayer.setCurrentWeapon(weapons.acorn);
			game.hideSmallGranadeIcon();
		}
		else {
			mainPlayer.setCurrentWeapon(weapons.pineCone);
			game.showSmallGranadeIcon();
		}

		game.hidePersonalMenu();

		gameConnection.server.serverBroadcastWeaponSwitched(mainPlayer.getCurrentWeapon(), mainPlayer.getRoom());

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
		initializePlayer: function (randX, randY) {
			var map = game.MAP;
			var tiles = map.tiles;
			var numbers = map.numbers;
			var graph = map.graph;
			var mainPlayer = game.player;

			if (tiles[randX][randY] !== 2) {

				mainPlayer.setStartingTile(randX, randY);
				mainPlayer.setCurrentTile(randX, randY);
				mainPlayer.setNextTile(randX, randY);

				var point = game.CURSOR.getTileCornerPoint(randX, randY);
				mainPlayer.setUpperLeftCornerPoint(point.x, point.y);

				mainPlayer.setAmmunitionPoints(numbers[randX][randY]);

				tiles[randX][randY] = 1;
				graph.nodes[randX][randY].type = 1;

				//set playerCanvas position here //////////////////////////////////////////////////////
				playerCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

				game.drawPlayer();
				return;
			}

			alert("Player is standing on a mine");
			//initializePlayer();

			//tylko dla przykladu, mozna w przyszlosci usunac
			//tileSheet.addEventListener('load', eventPlayerLoaded, false);
			//function eventPlayerLoaded() {
			//drawPlayer();
			//}
		},
		initializePersonalPlayerMenu: function () {
			game.initializePersonalMenuContainerPosition();
		},
		playing: function () {
			game.calculateCursorPosition();
			game.onMouseClick();
		}
	}
}



