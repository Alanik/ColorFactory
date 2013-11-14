var Game = function (Settings, Cursor, Map, Player) {
	var game = this;

	SETTINGS = Settings;
	MAP = Map;
	CURSOR = Cursor;
	player = Player;

	game.initialize = function () {

		initializeCanvasesPosition();
		initializeMines();
		initializeTileNumbers();
		initializeLobbyAndPlayerNameModalPosition();

		game.drawMapTiles(ctx, SETTINGS.map.getNumberOfTiles_Column(), SETTINGS.map.getNumberOfTiles_Row(), SETTINGS.map.getTileSize());
		game.displayAmmunitionPoints(player.getAmmunitionPoints());

		function initializeCanvasesPosition() {
			var x = mapContainer.offsetLeft;
			var y = mapContainer.offsetTop - SETTINGS.map.getTileSize();

			$effectsCanvas.css({ "left": x, "top": y })
			$playerCanvasContainer.css({ "left": x, "top": y })
			$enemyCanvasContainer.css({ "left": x, "top": y })
		}
		function initializeMines() {
			var randNumOfMines = Math.floor(Math.random() * SETTINGS.map.getMaximumNumOfMines()) + SETTINGS.map.getMinimumNumOfMines();

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

		}

	}

	game.onGameStart = function () {

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		////SignalR game session start!!! START GAME
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		gameConnection.client.clientReceiveStartGameCounter = function (x, y) {

			game.gameSession.initializeMap();
			game.gameSession.initializePlayer(x,y);

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

	}

	game.drawMapTiles = function () {
		var x, y, tile, padding = SETTINGS.map.getCanvasPaddingWithoutBorder(), tileSize = SETTINGS.map.getTileSize(), mineNumber, graphNodeType, tileRadius = SETTINGS.map.getTileRadius(), numRow = SETTINGS.map.getNumberOfTiles_Row(), numCol = SETTINGS.map.getNumberOfTiles_Column();

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

	game.gameSession =  {

			initializeMap : function () {
				var numberOfTiles = SETTINGS.map.getNumberOfTiles_Column();
				var tileSize = SETTINGS.map.getTileSize();

				ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
				game.drawMapTiles();
			},

			initializePlayer : function (x, y) {
				//var randX = Math.floor(Math.random() * numberOfTiles);
				//var randY = Math.floor(Math.random() * numberOfTiles);

				var randX = x;
				var randY = y;

				if (MAP.tiles[randX][randY] !== 2) {

					player.setStartingTile(randX, randY);

					var startingPositionTile = player.getStartingTile();
					player.setCurrentTile(startingPositionTile.column, startingPositionTile.row);

					var point = CURSOR.getTileCornerPoint(randX, randY);
					player.setUpperLeftCornerPoint(point.x, point.y);

					player.setAmmunitionPoints(MAP.numbers[randX][randY]);

					MAP.tiles[randX][randY] = 1;
					MAP.graph.nodes[randX][randY].type = 1;

					//set playerCanvas position here //////////////////////////////////////////////////////
					playerCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

					game.gameSession.drawPlayer();
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
		
			drawPlayer : function () {
			var canvasPadding = SETTINGS.map.getCanvasPadding();
			var spriteSize = player.getSpriteSize();
			var tileSheet = player.getTileSheet();

			playerCtx.drawImage(tileSheet, 0, 0, spriteSize, spriteSize, canvasPadding, canvasPadding, spriteSize, spriteSize);
		}

	}
}