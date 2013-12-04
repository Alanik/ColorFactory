var Game = function (Settings, Cursor, Effects, Map, Plr) {
	var game = this;

	SETTINGS = Settings;
	MAP = Map;
	CURSOR = Cursor;
	EFFECTS = Effects;
	player = Plr;

	game.onGameStart = function () {
		var player1 = new Player("Images/TileSheet/tileSheetRedPlayer.png");
		var player2 = new Player("Images/TileSheet/tileSheetRedPlayer.png");
		var player3 = new Player("Images/TileSheet/tileSheetRedPlayer.png");

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
		gameConnection.client.clientReceiveOtherPlayerPosition = function (randX, randY, playerIndex) {

			var point = CURSOR.getTileCornerPoint(randX, randY);
			var enemyObj = game.otherPlayers[playerIndex];

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
		gameConnection.client.clientReceiveUncoverTile = function (tileNum, mineNum, position, minePosition) {
			console.log("server returns: tileNum - " + tileNum + ", mineNum - " + mineNum + ", position - " + position.Column + ", " + position.Row);

			switch (tileNum) {
				case 0: {
					game.playerUncoversTile(mineNum, position);
					break;
				}
				case 1: {
					break;
				}
				case 2: {
					game.playerStepsOnMine(position, minePosition);
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

				Map.tiles[tile.Column][tile.Row] = 4;
				
			}

			game.drawMapTiles();
		}
	}

	game.initialize = function () {

		initializeCanvasesPosition();
		//initializeMines();
		//initializeTileNumbers();
		initializeLobbyAndPlayerNameModalPosition();

		game.drawMapTiles();
		game.displayAmmunitionPoints(player.getAmmunitionPoints());

		function initializeCanvasesPosition() {
			var x = mapContainer.offsetLeft;

			$effectsCanvas.css({ "left": x, "top": 18 })
			$playerCanvasContainer.css("left", x)
			$enemyCanvasContainer.css("left", x)
		}
		function initializeMines() {
			var randNumOfMines = Math.floor(Math.random() * SETTINGS.map.getMaximumNumOfMines()) + SETTINGS.map.getMinimumNumOfMines();
			var randX, randY;

			for (var i = 0; i < randNumOfMines; i++) {
				randX = Math.floor(Math.random() * SETTINGS.map.getNumberOfTiles_Column());
				randY = Math.floor(Math.random() * SETTINGS.map.getNumberOfTiles_Row());
				if (MAP.tiles[randX][randY] == 2) {
					i--;
				}
				else {
					MAP.tiles[randX][randY] = 2;
				}
			}
		}
		function initializeTileNumbers() {
			var counter, num, rMinusOne, rPlusOne, kMinusOne, kPlusOne, numOfTiles = SETTINGS.map.getNumberOfTiles_Column();

			for (var r = 0; r < SETTINGS.map.getNumberOfTiles_Row() ; r++) {
				for (var k = 0; k < SETTINGS.map.getNumberOfTiles_Column() ; k++) {

					counter = 0;
					num = MAP.tiles[r][k];
					rMinusOne = r - 1;
					rPlusOne = r + 1;
					kMinusOne = k - 1;
					kPlusOne = k + 1;

					if (num != 2) {
						if (rMinusOne >= 0 && kMinusOne >= 0)
							countMinesAroundTile(MAP.tiles[rMinusOne][kMinusOne]);
						if (rMinusOne >= 0)
							countMinesAroundTile(MAP.tiles[rMinusOne][k]);
						if (rMinusOne >= 0 && kPlusOne < numOfTiles)
							countMinesAroundTile(MAP.tiles[rMinusOne][kPlusOne]);
						if (kMinusOne >= 0)
							countMinesAroundTile(MAP.tiles[r][kMinusOne]);
						if (kPlusOne < numOfTiles)
							countMinesAroundTile(MAP.tiles[r][kPlusOne]);
						if (rPlusOne < numOfTiles && kMinusOne >= 0)
							countMinesAroundTile(MAP.tiles[rPlusOne][kMinusOne]);
						if (rPlusOne < numOfTiles)
							countMinesAroundTile(MAP.tiles[rPlusOne][k]);
						if (rPlusOne < numOfTiles && kPlusOne < numOfTiles)
							countMinesAroundTile(MAP.tiles[rPlusOne][kPlusOne]);

						MAP.numbers[r][k] = counter;
					}

				}
			}

			function countMinesAroundTile(num) {
				if (num == 2)
					counter++;
			}
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
	game.otherPlayers = [];
	game.drawMapTiles = function () {

		var x, y, tile, padding = SETTINGS.map.getCanvasPaddingWithoutBorder(), tileSize = SETTINGS.map.getTileSize(), mineNumber, graphNodeType, tileRadius = SETTINGS.map.getTileRadius(), numRow = SETTINGS.map.getNumberOfTiles_Row(), numCol = SETTINGS.map.getNumberOfTiles_Column();

		ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

		for (var i = 0; i < numCol; i++) {
			for (var j = 0; j < numRow; j++) {

				//graphNodeType = graph.nodes[j][i].type;

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
				if (tile == 5) {
					roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(255,0,0,.1)");
				}
				//if (graphNodeType == 1) {
				//    roundRect(ctx, x + 1, y + 1, tileSize, tileSize, tileRadius, true, true, "rgba(0,240,0,.2)");
				//}

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

		if (clickedTile.column < 0 || clickedTile.column > mapLength || clickedTile.row < 0 || clickedTile.row > mapLength) {
			return false;
		}

		if (MAP.tiles[clickedTile.column][clickedTile.row] == 3 || MAP.tiles[clickedTile.column][clickedTile.row] == 4) {
			return false;
		}

		if (clickedTile.column != playerCurrentTile.column || clickedTile.row != playerCurrentTile.row) {
			var tile = MAP.tiles[clickedTile.column][clickedTile.row];

			// 3 = uncovered/destroyed Mine tile
			// 4 = uncovered/scored Mine tile
			if (tile === 3 || tile === 4) {
				return false;
			}

			var calculatedPath = game.aStarAlgorithm();
			player.setAStarResult(calculatedPath);
			return true;
		}
		else {
			// clicked on current tile
			var newArray = [];
			newArray.push({ "x": clickedTile.column, "y": clickedTile.row });

			player.setAStarResult(newArray);

			player.setNextTile(player.getCurrentTile().column, player.getCurrentTile().row);

			CURSOR.setClickedOnCurrentTile(true);

			return false;
		}


	}
	game.onMouseClick = function () {
		$effectsCanvas.click(function (e) {

			var x = CURSOR.getCursorPositionInCanvas_x(e.pageX),
				y = CURSOR.getCursorPositionInCanvas_y(e.pageY);

			CURSOR.setClickedTile(CURSOR.getColumn(x), CURSOR.getRow(y));

			var isAllowedToMove = game.setPlayerPositionForAStarAlgorithm();
			if (isAllowedToMove == false) {
				return;
			}

			player.resetNextTilePlayerMovesToCounter();

			var result = player.getAStarResult();

			if (typeof result !== "undefined" && result.length > 0) {
				//check arrayResult for uncovered tile (in case player clicks on map too fast thus allowing him to walk over uncovered tiles)
				var length = result.length;
				for (var i = 0; i < length; i++) {
					var tile = MAP.tiles[result[i].x][result[i].y];

					if (tile === 0 || tile === 2) {
						MAP.graph.nodes[result[i].x][result[i].y].type = 0;
					}
				}

				game.movePlayer(player);

			}
		});
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
		var player = playerObj.player;
		var ctx = playerObj.ctx;
		var canvas = playerObj.canvas;

		drawFunc(player, ctx, canvas, alpha);

		game.calculateOtherPlayerPosition(player, ctx, canvas);

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

		CURSOR.setClickedOnCurrentTile(false);
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
			EFFECTS.setIsAnimationNumbersInProgress(true)
			EFFECTS.setAnimationNumbersTimerInterval(setInterval(showUncoveredMineNumbersAnimation, 100));
		}

		function showUncoveredMineNumbersAnimation() {

			var color = "rgba(10,211,122,1)";
			var offsetY = counter * 2;

			if (counter < 10) {
				counter++;
				effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
				effectsCtx.fillStyle = color;
				effectsCtx.font = '50px "Victor\'s Pixel Font"';
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



