var Game = function (Settings, Cursor, Effects, AnimationManager, Map, Plr) {
	var game = this;

	SETTINGS = Settings;
	MAP = Map;
	CURSOR = Cursor;
	EFFECTS = Effects;
	ANIMATION_MANAGER = AnimationManager;
	player = Plr;

	game.otherPlayers = [];

	game.onGameStart = function () {
		var player1 = new Player("Images/TileSheet/tileSheetRedPlayer.png", "/Images/Tilesheet/tileSheetRedPlayerTarget.png");
		var player2 = new Player("Images/TileSheet/tileSheetRedPlayer.png", "/Images/Tilesheet/tileSheetRedPlayerTarget.png");
		var player3 = new Player("Images/TileSheet/tileSheetRedPlayer.png", "/Images/Tilesheet/tileSheetRedPlayerTarget.png");

		player.setBullet(new Bullet("Images/TileSheet/Bullet/bullet.png"));
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

			gameSession.initializePlayer(x, y);
			gameSession.initializeMap();
			gameSession.playing();

			//startCounter();
			//function startCounter() {
			//	var $counterContainer = $(".startGameCounter");
			//	var winW = $(window).width();
			//	var numbers = [5, 4, 3, 2, 1];
			//	var i = 0;

			//	$counterContainer.css({ 'left': winW / 2, 'top': 100 }).show();
			//	$("#lobbyContainer").hide();

			//	var animationInterval = setInterval(startGameCountdown, 1000);

			//	function startGameCountdown() {
			//		if (i !== 5) {
			//			$counterContainer.text(numbers[i]);
			//			i++;
			//		}
			//		else {
			//			clearInterval(animationInterval);
			//			$counterContainer.hide();
			//			initializeGame(x, y);
			//			playing();
			//		}
			//	}
			//}
		};
		gameConnection.client.clientReceiveOtherPlayerPosition = function (randX, randY, seatNumber) {

			var point = CURSOR.getTileCornerPoint(randX, randY);
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

			var point = CURSOR.getTileCornerPoint(oldCol, oldRow);
			otherPlayer.setUpperLeftCornerPoint(point.x, point.y);

			game.moveOtherPlayer(col, row, playerObj, opacity);
		}
		gameConnection.client.clientReceiveUncoverTile = function (tileNum, mineNum, playerCurrentPosition, minePosition) {
			//console.log("server returns: tileNum - " + tileNum + ", mineNum - " + mineNum + ", position - " + position.Column + ", " + position.Row);

			switch (tileNum) {
				case 0: {
					game.playerUncoversTile(mineNum, playerCurrentPosition);
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
		gameConnection.client.clientReceiveMineHasBeenUncovered = function (listOfTiles) {
			var tile;

			for (var i = 0; i < listOfTiles.length; i++) {
				tile = listOfTiles[i];

				MAP.tiles[tile.Column][tile.Row] = 4;

			}

			game.drawMapTiles();
		}
		gameConnection.client.clientReceivePlayerShootsOtherPlayer = function (rndDamage, seatNumber) {

			var halfSize = player.getSpriteSize() / 2;
			var opponentObj = game.otherPlayers[seatNumber];
			var opponentUpperLeftCornerPoint = opponentObj.player.getUpperLeftCornerPoint();
			var centerPointX = player.getUpperLeftCornerPoint().x + halfSize;
			var centerPointY = player.getUpperLeftCornerPoint().y + halfSize;
			var calculatedPoints = game.calculateStraightLine(centerPointX, centerPointY, opponentUpperLeftCornerPoint.x + halfSize, opponentUpperLeftCornerPoint.y + halfSize);

			opponentObj.player.setTileSheet(opponentObj.player.getTargetTileSheet());
			game.drawOtherPlayer(opponentObj.player, opponentObj.ctx, opponentObj.canvas);

			game.shootBullet(calculatedPoints, player.getBullet(), opponentObj.player);
		}

		gameConnection.client.clientReceivePlayerStopsShooting = function (index) {

			var opponentObj = game.otherPlayers[index];
			opponentObj.player.setTileSheet(opponentObj.player.getStarterTileSheet());

			game.drawOtherPlayer(opponentObj.player, opponentObj.ctx, opponentObj.canvas);
		}
	}
	game.onMouseClick = function () {
		$effectsCanvas.click(function (e) {
			var x = CURSOR.getCursorPositionInCanvas_x(e.pageX),
				y = CURSOR.getCursorPositionInCanvas_y(e.pageY);

			CURSOR.setClickedTile(CURSOR.getColumn(x), CURSOR.getRow(y));
			CURSOR.setClickedOnCurrentTile(false);

			var startTile = player.getCurrentTile();
			var endTile = CURSOR.getClickedTile();

			//shoot
			if (game.clickedOnOpponent(x, y)) {
				var calculatedTiles = game.calculateStraightLine(startTile.column, startTile.row, endTile.column, endTile.row);

				if (game.shootingPathIsClear(calculatedTiles)) {

					///////////////////////////////////////////////////////////////////////////////////////////////
					//broadcast to server              CHECK IF PLAYER IS ALLOWED TO SHOOT AT THE TARGET
					///////////////////////////////////////////////////////////////////////////////////////////////
					gameConnection.server.serverBroadcastPlayerClickedOnOtherPlayer(endTile.column, endTile.row, player.room);
					///////////////////////////////////////////////////////////////////////////////////////////////

					return;
				}
			}

			//move (check if is allowed to move)
			if (!game.setPlayerPositionForAStarAlgorithm()) {
				return;
			}

			player.resetNextTilePlayerMovesToCounter();

			var result = player.getAStarResult();

			if (typeof result !== "undefined" && result.length > 0) {
				//check arrayResult for uncovered tile (in case player clicks on map too fast thus allowing him to walk over uncovered tiles)
				var length = result.length;
				var resultX, resultY, tile;

				for (var i = 0; i < length; i++) {
					resultX = result[i].x;
					resultY = result[i].y;

					tile = MAP.tiles[resultX][resultY];

					if (tile === 0 || tile === 2) {
						MAP.graph.nodes[resultX][resultY].type = 0;
					}
				}

				game.movePlayer(player);

			}
		});
	}
	game.initialize = function () {

		initializeCanvasesPosition();
		initializeLobbyAndPlayerNameModalPosition();

		game.drawMapTiles();
		game.displayAmmunitionPoints(player.getAmmunitionPoints());

		function initializeCanvasesPosition() {
			var x = mapContainer.offsetLeft;

			$effectsCanvas.css({ "left": x, "top": 18 })
			$playerCanvasContainer.css("left", x)
			$enemyCanvasContainer.css("left", x)
		}
		function initializeLobbyAndPlayerNameModalPosition() {
			var $lobby = $("#lobbyContainer");
			var $playerNameBox = $("#setPlayerNameModalBox");
			var winW = $("#mainContainer").width();

			$lobby.css({ 'left': winW / 2 - $lobby.width() / 2, 'top': 100 });
			$playerNameBox.css({ 'left': winW / 2 - $playerNameBox.width() / 2, 'top': 100 });
			$playerNameBox.show();

		}

	}
	game.drawMapTiles = function () {

		var x, y, tile, padding = SETTINGS.map.getCanvasPaddingWithoutBorder(), tileSize = SETTINGS.map.getTileSize(), mineNumber, graphNodeType, tileRadius = SETTINGS.map.getTileRadius(), numRow = SETTINGS.map.getNumberOfTiles_Row(), numCol = SETTINGS.map.getNumberOfTiles_Column();

		ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

		for (var i = 0; i < numCol; i++) {
			for (var j = 0; j < numRow; j++) {

				tile = MAP.tiles[i][j];
				mineNumber = MAP.numbers[i][j];

				x = i * tileSize + i + padding;
				y = j * tileSize + j + padding;

				if (tile == 0 || tile == 2) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(0,0,0,.5)");
				}
				if (tile == 1) {
					drawNumbers(i, j, mineNumber);
				}
				if (tile == 3) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(238,68,68,.8)");
				}
				if (tile == 4) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(10,211,122,.8)");
				}
			}
		}

		function drawNumbers(col, row, numOfMines) {
			var point = CURSOR.getTileCornerPoint(col, row);
			var posX = tileSize / 2;
			var posY = posX + 14;
			ctx.fillStyle = "#444";
			ctx.font = '25px "Victor\'s Pixel Font"';
			if (numOfMines !== 0)
				ctx.fillText(numOfMines, point.x + posX, point.y + posY);
		}

		function roundRect(ctx, x, y, width, height, radius, fill, stroke, fillStyle, strokeStyle) {

			if (typeof stroke === "undefined") {
				stroke = true;
			}
			if (typeof radius === "undefined") {
				radius = 5;
			}
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
				//ctx.strokeStyle = strokeStyle;
				//ctx.stroke();
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

				x = CURSOR.getCursorPositionInCanvas_x(e.pageX),
				y = CURSOR.getCursorPositionInCanvas_y(e.pageY),

				CURSOR.setCurrentTileHover(CURSOR.getColumn(x), CURSOR.getRow(y));
			});
		});
	}
	game.aStarAlgorithm = function () {

		//resetPathColor();
		var nextTile = player.getNextTile();
		var clickedTile = CURSOR.getClickedTile();

		var start = MAP.graph.nodes[nextTile.column][nextTile.row];
		MAP.graph.nodes[clickedTile.column][clickedTile.row].type = 1;
		var end = MAP.graph.nodes[clickedTile.column][clickedTile.row];

		// result now searches diagonal neighbors as well
		var result = astar.search(MAP.graph.nodes, start, end, true);

		if (typeof result === "undefined" || result.length === 0) {
			//if user clicks too fast make sure not to change the already uncovered tile into a wall type for A* algorithm
			if (MAP.tiles[clickedTile.column][clickedTile.row] !== 1)
				MAP.graph.nodes[clickedTile.column][clickedTile.row].type = 0;
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
		//	var columns = SETTINGS.map.getNumberOfTiles_Column();
		//	var rows = SETTINGS.map.getNumberOfTiles_Row();

		//	for (var i = 0; i < columns; i++) {
		//		for (var j = 0; j < rows; j++) {
		//			var num = MAP.tiles[i][j];

		//			if (num == 5) {
		//				MAP.tiles[i][j] = 1;
		//			}
		//		}
		//	}

		//}
	}
	game.setPlayerPositionForAStarAlgorithm = function () {

		/////////////////////////////////////////////////////////////////////////////////////
		//code responsible for A* algorithm
		/////////////////////////////////////////////////////////////////////////////////////
		var mapLength = SETTINGS.map.getNumberOfTiles_Column() - 1;
		var playerCurrentTile = player.getCurrentTile();
		var clickedTile = CURSOR.getClickedTile();
		var tileNum;

		//clicked outside map boundry
		if (clickedTile.column < 0 || clickedTile.column > mapLength || clickedTile.row < 0 || clickedTile.row > mapLength) {
			return false;
		}

		tileNum = MAP.tiles[clickedTile.column][clickedTile.row];

		//clicked on a mine
		if (tileNum == 3 || tileNum == 4) {
			return false;
		}

		if (clickedTile.column != playerCurrentTile.column || clickedTile.row != playerCurrentTile.row) {
			var calculatedPath = game.aStarAlgorithm();

			player.setAStarResult(calculatedPath);
			return true;
		}
		else {
			// clicked on current tile, this is where player is able to go back to his previous tile not uncovering the tile he was heading to
			player.resetNextTilePlayerMovesToCounter();

			var newArray = [];
			newArray.push({ "x": clickedTile.column, "y": clickedTile.row });

			player.setAStarResult(newArray);

			player.setNextTile(player.getCurrentTile().column, player.getCurrentTile().row);

			CURSOR.setClickedOnCurrentTile(true);

			return false;
		}



	}
	game.drawPlayer = function () {
		var canvasPadding = SETTINGS.map.getCanvasPadding();
		var spriteSize = player.getSpriteSize();
		var tileSheet = player.getTileSheet();
		var ctxSize = player.getContextSize();

		playerCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
		playerCtx.drawImage(tileSheet, 0, spriteSize * player.getAnimationCounter(), spriteSize, spriteSize, canvasPadding, canvasPadding, spriteSize, spriteSize);
	}
	game.movePlayer = function () {

		//return, not allowing events to stack up
		if (player.getIsPlayerRunningInProgress()) {
			return;
		}

		player.setIsPlayerRunningInProgress(true);

		player.setTimerInterval(setInterval(game.drawPlayerRunning, 30));
	}
	game.drawPlayerRunning = function () {

		game.drawPlayer();
		game.calculatePlayerPosition();

	}
	game.otherPlayerIsFullyInTile = function (enemy, ctx, canvas) {

		var currTile = enemy.getCurrentTile();
		var nextTile = enemy.getNextTile();

		enemy.setPreviousTile(currTile.column, currTile.row);
		enemy.setCurrentTile(nextTile.column, nextTile.row);
		
		enemy.setIsPlayerRunningInProgress(false);
		enemy.resetAnimationCounter();
		clearInterval(enemy.getTimerInterval());
		game.drawOtherPlayer(enemy, ctx, canvas);
	}
	game.calculatePlayerPosition = function () {

		var aStarResult = player.getAStarResult();

		if (typeof aStarResult !== "undefined" && aStarResult.length > 0) {
			calculate(aStarResult);
		}
		else {
			player.setIsPlayerRunningInProgress(false);
			player.resetNextTilePlayerMovesToCounter();
			clearInterval(player.getTimerInterval());
			game.drawPlayer();
		}

		function calculate(aStarResult) {
			var velocityX = 0, velocityY = 0;
			var padding = player.getPadding();
			var negativePadding = player.getNegativePadding();
			var pixDist = player.getPixelMovementDistance();
			var playerCornerPoint = player.getUpperLeftCornerPoint();

			var nextAStarTile = aStarResult[player.getNextTilePlayerMovesToCounter()]

			var tilePoint = CURSOR.getTileCornerPoint(nextAStarTile.x, nextAStarTile.y);

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

			player.incrementAnimationCounter();

			//player still moving to tile
			if (Math.abs(tileXMinusPlayerX) >= pixDist || Math.abs(tileYMinusPlayerY) >= pixDist) {

				var newX = pixDist * velocityX + playerCornerPoint.x;
				var newY = pixDist * velocityY + playerCornerPoint.y;

				player.setUpperLeftCornerPoint(newX, newY);
				// move playerCanvas
				playerCanvas.setAttribute("style", "left:" + newX + "px; top:" + newY + "px;");
			}
			else {
				game.playerIsFullyInTile();
			}

			if (player.getAnimationCounter() >= player.getNumOfAnimationFrames()) {
				player.resetAnimationCounter();
			}

		}

	}
	game.calculateOtherPlayerPosition = function (enemy, enemyCtx, canvas) {
		var velocityX = 0, velocityY = 0;
		var padding = enemy.getPadding();
		var negativePadding = enemy.getNegativePadding();
		var pixDist = enemy.getPixelMovementDistance();

		var tilePoint = CURSOR.getTileCornerPoint(enemy.getNextTile().column, enemy.getNextTile().row);
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
	}
	game.checkIfMineIsUncoveredAllAround = function () {

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
						if (MAP.tiles[k][r] == 0) {
							return false;
						}
					}

				}
			}

			return true;
		}

		var numberOfTiles = SETTINGS.map.getNumberOfTiles_Column();
		var col = player.getCurrentTile().column;
		var row = player.getCurrentTile().row;

		var rMinusOne = row - 1;
		var rPlusOne = row + 1;
		var kMinusOne = col - 1;
		var kPlusOne = col + 1;


		for (var r = rMinusOne; r <= rPlusOne; r++) {
			for (var k = kMinusOne; k <= kPlusOne; k++) {
				//check if tile is outside of map boundry(ex. row = -1)
				if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {

					var isMine = checkIfTileIsMine(MAP.tiles[k][r]);
					if (isMine) {
						if (checkIfTilesAroundParameterTileAreUncovered(k, r)) {
							//The mine is uncovered from all sides here
							MAP.tiles[k][r] = 4;
						}
					}

				}
			}

		}

	}
	game.playerStepsOnMine = function (position, minePosition) {

		MAP.tiles[minePosition.Column][minePosition.Row] = 3;
		MAP.graph.nodes[minePosition.Column][minePosition.Row].type = 0;

		//var point = CURSOR.getTileCornerPoint(player.getPreviousTile().column, player.getPreviousTile().row);
		var point = CURSOR.getTileCornerPoint(position.Column, position.Row);

		//moves player to the previous tile location
		player.setUpperLeftCornerPoint(point.x, point.y);
		playerCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

		player.setCurrentTile(position.Column, position.Row);
		player.setNextTile(position.Column, position.Row);

		//reset the resultArray so player wont walk over mines if he clicks too fast
		player.setAStarResult([]);

		player.setAmmunitionPoints(0);
		game.displayAmmunitionPoints(player.getAmmunitionPoints());

		game.drawMapTiles();
	}
	game.playerUncoversTile = function (mineNumber, position) {

		player.addAmmunitionPoints(mineNumber);
		game.displayAmmunitionPoints(player.getAmmunitionPoints());

		MAP.tiles[position.Column][position.Row] = 1;
		MAP.numbers[position.Column][position.Row] = mineNumber;

		MAP.graph.nodes[position.Column][position.Row].type = 1;

		game.animateUncoveredMineNumbers();
		game.checkIfMineIsUncoveredAllAround();

		game.drawMapTiles();
	}
	game.isDestinationTileReached = function () {

		var aStarLenght = player.getAStarResult().length;

		if (player.getNextTilePlayerMovesToCounter() == aStarLenght || aStarLenght == 0) {
			player.resetNextTilePlayerMovesToCounter();
			player.setIsPlayerRunningInProgress(false);
			clearInterval(player.getTimerInterval());

			return true;
		}

		return false;
	}
	game.drawOtherPlayerRunning = function (playerObj, drawFunc, alpha) {
		var otherPlayer = playerObj.player;
		var ctx = playerObj.ctx;
		var canvas = playerObj.canvas;

		drawFunc(otherPlayer, ctx, canvas, alpha);

		game.calculateOtherPlayerPosition(otherPlayer, ctx, canvas);

	}
	game.drawOtherPlayer = function (enemy, enemyCtx, enemyCanvas) {

		var canvasPadding = SETTINGS.map.getCanvasPadding();
		var spriteSize = enemy.getSpriteSize();
		var tileSheet = enemy.getTileSheet();
		var ctxSize = enemy.getContextSize();

		enemyCtx.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height);
		enemyCtx.drawImage(tileSheet, 0, spriteSize * enemy.getAnimationCounter(), spriteSize, spriteSize, canvasPadding, canvasPadding, spriteSize, spriteSize);

	}
	game.drawOtherPlayerAlpha = function (enemy, enemyCtx, enemyCanvas, alpha) {

		var canvasPadding = SETTINGS.map.getCanvasPadding();
		var spriteSize = enemy.getSpriteSize();
		var tileSheet = enemy.getTileSheet();
		var ctxSize = enemy.getContextSize();

		enemyCtx.globalAlpha = alpha;

		enemyCtx.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height);
		enemyCtx.drawImage(tileSheet, 0, spriteSize * enemy.getAnimationCounter(), spriteSize, spriteSize, canvasPadding, canvasPadding, spriteSize, spriteSize);
	}
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
	}
	game.playerIsFullyInTile = function () {
		var currTile = player.getCurrentTile();
		var nextTile = player.getNextTile();

		player.setPreviousTile(currTile.column, currTile.row);
		player.setCurrentTile(nextTile.column, nextTile.row);

		player.incrementNextTilePlayerMovesToCounter();

		//check if the the current tile is the destination tile
		if (game.isDestinationTileReached()) {
			player.resetAnimationCounter();
			game.drawPlayer();
		}
		else {

			var aStarResult = player.getAStarResult();
			var nextTileCounter = player.getNextTilePlayerMovesToCounter();

			player.setNextTile(aStarResult[nextTileCounter].x, aStarResult[nextTileCounter].y);

			nextTile = player.getNextTile();
		}

		//////////////////////////////////////////////////////////////////////////////////////////
		//broadcast to server                CHECK UNDERNEATH TILE & UPDATE PLAYER POSITION
		//////////////////////////////////////////////////////////////////////////////////////////
		gameConnection.server.serverBroadcastCheckUnderneathTile(player.room, nextTile.column, nextTile.row, CURSOR.getClickedOnCurrentTile());
		//////////////////////////////////////////////////////////////////////////////////////////

		//console.log("client send: nextTile - " + nextTile.column + "," + nextTile.row + " clickedOnCurrentTile - " + CURSOR.getClickedOnCurrentTile());
	}
	game.animateUncoveredMineNumbers = function () {

		var animationNumbersTimerInterval, counter = 0;
		var currentTile = player.getCurrentTile();

		var point = CURSOR.getTileCornerPoint(currentTile.column, currentTile.row);
		var tilePointX = point.x;
		var tilePointY = point.y;
		var number = MAP.numbers[currentTile.column][currentTile.row];

		if (number != 0) {
			if (EFFECTS.getIsAnimationNumbersInProgress()) {
				clearInterval(EFFECTS.getAnimationNumbersTimerInterval());
			}

			effectsCtx.fillStyle = "rgba(10,211,122,1)";
			effectsCtx.font = '50px "Victor\'s Pixel Font"';

			EFFECTS.setIsAnimationNumbersInProgress(true)
			EFFECTS.setAnimationNumbersTimerInterval(setInterval(showUncoveredMineNumbersAnimation, 100));
		}

		function showUncoveredMineNumbersAnimation() {

			var offsetY = counter * 2;

			if (counter < 10) {
				counter++;
				effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
				effectsCtx.fillText(number, tilePointX + 14, tilePointY + 50 - offsetY);
			}
			else {
				EFFECTS.setIsAnimationNumbersInProgress(false);
				clearInterval(EFFECTS.getAnimationNumbersTimerInterval());
				effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
				return;
			}

		}
	}
	game.clickedOnOpponent = function (x, y) {
		var c, c_x, c_y, len, playerSize, playerObj, opacity;
		len = game.otherPlayers.length;
		playerSize = player.getContextSize();

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

	}
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
	}
	game.shootingPathIsClear = function (tilesArray) {
		var tile;

		for (var i = 0; i < tilesArray.length; i++) {
			tile = tilesArray[i];

			if (MAP.tiles[tile.x][tile.y] !== 1) {
				return false;
			}
		}

		return true;

	}
	game.shootBullet = function (pointsArray, bullet, opponent) {
		var arrLength, len, adjustBullet;

		//return, not allowing events to stack up
		if (bullet.getIsBulletShootingInProgress()) {
			return;
		}

		arrLength = pointsArray.length;
		len = Math.floor(arrLength / 2) + Math.floor(arrLength / 4);
		adjustBullet = true;

		bullet.setIsBulletShootingInProgress(true);
		bullet.setUpperLeftCornerPoint(pointsArray[0].x, pointsArray[0].y);
		bullet.setTimerInterval(setInterval(function () { game.drawFlyingBullet(pointsArray, len, bullet, opponent, adjustBullet) }, 20));

	}
	game.drawFlyingBullet = function (pointsArray, len, bullet, opponent, adjustBullet) {
		var counter;
		var startingPoint = bullet.getUpperLeftCornerPoint();
		var spriteSize = bullet.getSpriteSize();
		var tileSheet = bullet.getTileSheet();

		effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
		effectsCtx.drawImage(tileSheet, startingPoint.x, startingPoint.y + 50);

		bullet.incrementAnimationPathCounterBy(10);
		counter = bullet.getAnimationPathCounter();

		if (counter < len) {

			var point = pointsArray[counter];
			bullet.setUpperLeftCornerPoint(point.x, point.y);

		}
		else {
			effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

			clearInterval(bullet.getTimerInterval());
			bullet.resetAnimationPathCounter();
			bullet.setIsBulletShootingInProgress(false);

			if (adjustBullet) {
				game.adjustBullet(opponent, bullet);
			}
			
		}
	}
	game.adjustBullet = function (opponent, bullet) {
		var adjustBullet = false;	
		var startingPoint = bullet.getUpperLeftCornerPoint();
		var halfSprite = opponent.getSpriteSize() / 2;
		var endPoint = opponent.getUpperLeftCornerPoint();

		var pointsArray = game.calculateStraightLine(startingPoint.x, startingPoint.y, endPoint.x + halfSprite, + endPoint.y + halfSprite);
		var len = pointsArray.length;

		bullet.setTimerInterval(setInterval(function () { game.drawFlyingBullet(pointsArray, len, bullet, opponent, adjustBullet) }, 20));
	}
	game.animateDamageNumber = function (dmg, opponent) {




	}


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

			if (MAP.tiles[randX][randY] !== 2) {

				player.setStartingTile(randX, randY);
				player.setCurrentTile(randX, randY);
				player.setNextTile(randX, randY);

				var point = CURSOR.getTileCornerPoint(randX, randY);
				player.setUpperLeftCornerPoint(point.x, point.y);

				player.setAmmunitionPoints(MAP.numbers[randX][randY]);

				MAP.tiles[randX][randY] = 1;
				MAP.graph.nodes[randX][randY].type = 1;

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
		playing: function () {

			game.calculateCursorPosition();
			game.onMouseClick();
		}
	}
}



