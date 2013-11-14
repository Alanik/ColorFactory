
//var SETTINGS = new Settings();
//var CURSOR = new Cursor();


//var player1 = new Player();


////var player = {
////	"pixelDistanceWhileMoving": 3,
////	"cornerPoint": { "x": 0, "y": 0 },
////	"setCornerPoint": function (x, y) {
////		player.cornerPoint.x = x;
////		player.cornerPoint.y = y;
////	},
////	"currentTile": { "row": 0, "column": 0 },
////	"nextTile": { "row": 0, "column": 0 },
////	"startingPositionTile": { "row": 0, "column": 0 },
////	"previousTile": { "row": 0, "column": 0 },
////	"ammunitionPoints": 0,
////	"room": null
////};

////var playerTimerInterval;
////var isPlayerRunningInProgress = false;

////var enemyTimerInterval;
////var isEnemyRunningInProgress = false;

////var animationNumbersTimerInterval;
////var isAnimationNumbersInProgress = false;

////var canvasPadding = 5;
////var tileRadius = 2;
////var tileSize = 40;
////var numberOfTiles = 12;
////var minimumNumOfMines = 10;
////var maximumNumOfMines = 25;

////var tileSheet = new Image();
////tileSheet.src = "Images/tilesheet/tileSheetPlayer40Black2.png";

////var playerAnimationCounter = 0;
////var enemyAnimationCounter = 0;

////var nextTilePlayerMovesToCounter = 0;
////var nextTileEnemyMovesToCounter = 0;

////var mineNumberAnimationOpacity = .1;
////var arrayResult;

////////////////////////////////////////////////////////////////
////Objects
////////////////////////////////////////////////////////////////

////graph for A* algorithm
//// 1 = open
//// 0 = obsticle

////var graph = new Graph([
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);

//////map
////// 0 = covered tile
////// 1 = uncovered tile
////// 2 = covered Mine tile
////// 3 = uncovered/destroyed Mine tile
////// 4 = uncovered/scored Mine tile
////// 5 = currentHoveredTile

////var map = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];

////var mapNumbers = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
////		   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];



////var enemy = {
////	"pixelDistanceWhileMoving": 3,
////	"cornerPoint": { "x": 0, "y": 0 },
////	"setCornerPoint": function (x, y) {
////		enemy.cornerPoint.x = x;
////		enemy.cornerPoint.y = y;
////	},
////	"currentTile": { "row": 0, "column": 0 },
////	"nextTile": { "row": 0, "column": 0 },
////	"previousTile": { "row": 0, "column": 0 }
////}

////var cursor = {
////	"getRow": function (y) {
////		var row = Math.floor(y / tileSize);
////		row = Math.floor((y - row) / tileSize);
////		return row;
////	},
////	"getColumn": function (x) {
////		var col = Math.floor(x / tileSize);
////		col = Math.floor((x - col) / tileSize);
////		return col;
////	},
////	"getCursorPositionInCanvasX": function (pageX) {
////		var mouseX = pageX - mainContainer.offsetLeft - mapCanvas.offsetLeft - canvasPadding;
////		return mouseX;
////	},
////	"getCursorPositionInCanvasY": function (pageY) {
////		var mouseY = pageY - mainContainer.offsetTop - mapCanvas.offsetTop - canvasPadding;
////		return mouseY;
////	},
////	"clickedTile": { "row": 0, "column": 0, "cornerPointX": 0, "cornerPointY": 0 },
////	"currentTileHover": { "cornerPointX": 0, "cornerPointY": 0 },
////	//getTileCornerPoint returns reversed variables: y is actually x and x is y, bad naming from my part.
////	"getTileCornerPoint": function (row, col) {
////		var xx = row * tileSize + row;
////		var yy = col * tileSize + col;
////		var tileCornerPoint =
////			{
////				"x": xx,
////				"y": yy
////			};
////		return tileCornerPoint;
////	}

////};

////var padding = player.pixelDistanceWhileMoving - 1;
////var negativePadding = (player.pixelDistanceWhileMoving - 1) * (-1);

//////////////////////////////////////////////////////////////////////////////////
////FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////

////function initialize() {
////	initializeCanvasesPosition();
////	initializeMines();
////	initializeTileNumbers();
////	drawMapTiles(ctx, SETTINGS.map.getNumberOfTiles_Column(), SETTINGS.map.getNumberOfTiles_Row(), SETTINGS.map.getTileSize());
////	displayAmmunitionPoints(player1.getAmmunitionPoints());
////	initializeLobbyAndPlayerNameModalPosition();

////	function initializeCanvasesPosition() {
////		var x = mapContainer.offsetLeft;
////		var y = mapContainer.offsetTop - SETTINGS.map.getTileSize();

////		$effectsCanvas.css({ "left": x, "top": y })
////		$playerCanvasContainer.css({ "left": x, "top": y + SETTINGS.map.getMapCanvasOffsetTop() })
////		$enemyCanvasContainer.css({ "left": x, "top": y + SETTINGS.map.getMapCanvasOffsetTop() })
////	}
////	function initializeMines() {
////		var randNumOfMines = Math.floor(Math.random() * SETTINGS.map.getMaximumNumOfMines()) + SETTINGS.map.getMinimumNumOfMines();

////		for (var i = 0; i < randNumOfMines; i++) {
////			randX = Math.floor(Math.random() * SETTINGS.map.getNumberOfTiles_Column());
////			randY = Math.floor(Math.random() * SETTINGS.map.getNumberOfTiles_Row());
////			if (MAP.tiles[randX][randY] == 2) {
////				i--;
////			}
////			else {
////				MAP.tiles[randX][randY] = 2;
////			}
////		}
////	}
////	function initializeTileNumbers() {
////		var counter, num, rMinusOne, rPlusOne, kMinusOne, kPlusOne;

////		for (var r = 0; r < SETTINGS.map.getNumberOfTiles_Row() ; r++) {
////			for (var k = 0; k < SETTINGS.map.getNumberOfTiles_Column() ; k++) {

////				counter = 0;
////				num = MAP.tiles[r][k];
////				rMinusOne = r - 1;
////				rPlusOne = r + 1;
////				kMinusOne = k - 1;
////				kPlusOne = k + 1;

////				if (num != 2) {
////					if (rMinusOne >= 0 && kMinusOne >= 0)
////						countMinesAroundTile(MAP.tiles[rMinusOne][kMinusOne]);
////					if (rMinusOne >= 0)
////						countMinesAroundTile(MAP.tiles[rMinusOne][k]);
////					if (rMinusOne >= 0 && kPlusOne < numberOfTiles)
////						countMinesAroundTile(MAP.tiles[rMinusOne][kPlusOne]);
////					if (kMinusOne >= 0)
////						countMinesAroundTile(MAP.tiles[r][kMinusOne]);
////					if (kPlusOne < numberOfTiles)
////						countMinesAroundTile(MAP.tiles[r][kPlusOne]);
////					if (rPlusOne < numberOfTiles && kMinusOne >= 0)
////						countMinesAroundTile(MAP.tiles[rPlusOne][kMinusOne]);
////					if (rPlusOne < numberOfTiles)
////						countMinesAroundTile(MAP.tiles[rPlusOne][k]);
////					if (rPlusOne < numberOfTiles && kPlusOne < numberOfTiles)
////						countMinesAroundTile(MAP.tiles[rPlusOne][kPlusOne]);

////					MAP.numbers[r][k] = counter;
////				}

////			}
////		}

////		function countMinesAroundTile(num) {
////			if (num == 2)
////				counter++;
////		}
////	}
////	function initializeLobbyAndPlayerNameModalPosition() {
////		var $lobby = $("#lobbyContainer");
////		var $playerNameBox = $("#setPlayerNameModalBox");
////		var winW = $("#mainContainer").width();

////		$lobby.css({ 'left': winW / 2 - $lobby.width() / 2, 'top': 100 });
////		$playerNameBox.css({ 'left': winW / 2 - $playerNameBox.width() / 2, 'top': 100 });

////	}
////	function eventPlayerLoaded() {
////		drawPlayer();
////	}
////	function initializePlayer(column, row) {

////		var point = CURSOR.getTileCornerPoint(column, row);

////		player1.setStartingPositionTile(column, row);

////		var currentTile = window.clone(player1.getStartingPositionTile());
////		player1.setCurrentTile(currentTile.x, currentTile.y);
////		player1.setCornerPoint(currentTile.x, currentTile.y);
////		player1.setAmmunitionPoints(MAP.numbers[column][row]);

////		//set playerCanvas position here //////////////////////////////////////////////////////
////		playerCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");
////		MAP.tiles[column][row] = 1;
////		MAP.graph.nodes[column][row].type = 1;
////		displayAmmunitionPoints(MAP.numbers[column][row]);
////	}
////}

//function playing() {

//	calculateCursorPosition();
//	onMouseClick();

//	function calculateCursorPosition() {
//		var x, y, row, col;

//		$("#mapCanvas").mouseover(function () {
//			$(this).mousemove(function (e) {

//				x = CURSOR.getCursorPositionInCanvasX(e.pageX),
//				y = CURSOR.getCursorPositionInCanvasY(e.pageY),

//				CURSOR.setCurrentTileHover(CURSOR.getColumn(x), CURSOR.getRow(y));
//			});
//		});

//	}
//}

//function onMouseClick() {

//	$effectsCanvas.click(function (e) {

//		var x = CURSOR.getCursorPositionInCanvasX(e.pageX),
//			y = CURSOR.getCursorPositionInCanvasY(e.pageY);

//		var clickedColumn = CURSOR.getColumn(x);
//		var clickedRow = CURSOR.getRow(y);

//		player1.resetNextTilePlayerMovesToCounter();

//		/////////////////////////////////////////////////////////////////////////////////////
//		//code responsible for A* algorithm
//		/////////////////////////////////////////////////////////////////////////////////////
//		var playerCurrentTile = player1.getCurrentTile();

//		if (clickedColumn !== playerCurrentTile.column || clickedRow !== playerCurrentTile.row) {

//			var tile = MAP.tiles[clickedColumn][clickedRow];
//			if (tile === 3 || tile === 4) {
//				return;
//			}

//			//insert nextTile as first element so player will go fully to the next tile thus he will not run over mines and such
//			var nextTile = player1.getNextTile();
//			var node = { "x": nextTile.column, "y": nextTile.row };

//			aStarAlogirthm().splice(0, 0, node);

//			player1.setAStarResult(result);

//		}
//		else {
//			//if player clicks on the currentTile we pop last tile in array so player just goes back to the currentTile
//			playe1.getAStarResult().pop();
//			return;
//		}
//		////////////////////////////////////////////////////////////////////////////////////////
//		var result = player1.getAStarResult();

//		if (typeof result !== "undefined" && result.length > 0) {
//			//check arrayResult for uncovered tile (in case player clicks on map too fast thus allowing him to walk over uncovered tiles)
//			var length = result.length;	
//			for (var i = 0; i < length; i++) {
//				var tile = MAP.tiles[result[i].x][result[i].y];

//				if (tile === 0 || tile === 2) {
//					MAP.graph.nodes[result[i].x][result[i].y].type = 0;
//				}
//			}

//			movePlayerTo(player1);

//		}

//		displayAmmunitionPoints(player1.getAmmunitionPoints());

//		function aStarAlogirthm() {

//			//resetPathColor();
//			var nextTile = player1.getNextTile();
//			var clickedTile = CURSOR.getClickedTile();

//			var start = graph.nodes[nextTile.column][nextTile.row];
//			MAP.graph.nodes[clickedTile.column][clickedTile.row].type = 1;
//			var end = MAP.graph.nodes[clickedTile.column][clickedTile.row];

//			// result now searches diagonal neighbors as well
//			var result = astar.search(MAP.graph.nodes, start, end, true);

//			if (typeof result === "undefined" || result.length === 0) {
//				//if user clicks too fast make sure not to change the already uncovered tile into a wall type for A* algorithm
//				if (MAP.tiles[clickedTile.column][clickedTile.row] !== 1)
//					MAP.graph.nodes[clickedTile.column][clickedTile.row].type = 0;
//			}

//			//for (var i = 0; i < result.length; i++) {
//			//    var row = result[i].x;
//			//    var col = result[i].y;
//			//    map[row][col] = 5;
//			//}

//			return result;

//			function resetPathColor() {
//				var columns = SETTINGS.map.getNumberOfTiles_Column();
//				var rows = SETTINGS.map.getNumberOfTiles_Row();

//				for (var i = 0; i < columns; i++) {
//					for (var j = 0; j < rows; j++) {
//						var num = MAP.tiles[i][j];

//						if (num == 5) {
//							MAP.tiles[i][j] = 1;
//						}
//					}
//				}

//			}
//		}

//	});
//}

//function movePlayerTo(thePlayer) {
//	var player = thePlayer;
//	var velocityX = 0;
//	var velocityY = 0;

//	//return, not allowing events to stack up
//	if (player.getIsPlayerRunningInProgress()) {
//		return;
//	}

//	player.setIsPlayerRunningInProgress();

//	playerTimerInterval = setInterval(drawPlayerRunning, 30);

//	function drawPlayerRunning() {
//		var playerSpriteSize = player.getSpriteSize();

//		playerCtx.clearRect(0, 0, SETTINGS.map.getMapCanvasWidth(), SETTINGS.map.getMapCanvasHeight());
//		playerCtx.drawImage(player.getTileSheet(), 0, player.spriteSize * player.getAnimationCounter(), playerSpriteSize, playerSpriteSize, SETTINGS.map.getCanvasPadding(), SETTINGS.map.getCanvasPadding, playerSpriteSize, playerSpriteSize);
//		calculatePlayerPosition();

//		function calculatePlayerPosition() {

//			if (typeof player.getArrayResult() !== "undefined" && player.getArrayResult().length > 0) {

//				player.nextTile.row = arrayResult[nextTilePlayerMovesToCounter].x;
//				player.nextTile.column = arrayResult[nextTilePlayerMovesToCounter].y;

//				var tilePoint = cursor.getTileCornerPoint(player.nextTile.column, player.nextTile.row);

//				var tileYMinusPlayerY = tilePoint.x - player.cornerPoint.y;
//				var tileXMinusPlayerX = tilePoint.y - player.cornerPoint.x;

//				if (tileYMinusPlayerY > padding)
//					velocityY = 1;
//				else if (tileYMinusPlayerY < negativePadding)
//					velocityY = -1;
//				else velocityY = 0

//				if (tileXMinusPlayerX > padding)
//					velocityX = 1;
//				else if (tileXMinusPlayerX < negativePadding)
//					velocityX = -1;
//				else velocityX = 0;

//				playerAnimationCounter++;

//				//player still moving to tile
//				if (Math.abs(tileXMinusPlayerX) >= player.pixelDistanceWhileMoving || Math.abs(tileYMinusPlayerY) >= player.pixelDistanceWhileMoving) {
//					//velocity X
//					player.cornerPoint.x += player.pixelDistanceWhileMoving * velocityX;
//					//velocity Y
//					player.cornerPoint.y += player.pixelDistanceWhileMoving * velocityY;

//					// move playerCanvas
//					playerCanvas.setAttribute("style", "left:" + player.cornerPoint.x + "px; top:" + player.cornerPoint.y + "px;");
//				}
//				else {
//					///////////////////////////////////////////////////////////////////////////////////////////////////
//					//at this point player is fully in tile
//					///////////////////////////////////////////////////////////////////////////////////////////////////
//					player.previousTile = clone(player.currentTile);
//					player.currentTile = clone(player.nextTile);

//					var currentTile = map[player.currentTile.row][player.currentTile.column];

//					//if current tile is covered check what's underneath
//					if (currentTile !== 1) {
//						if (currentTile === 0) {
//							player.ammunitionPoints += mapNumbers[player.currentTile.row][player.currentTile.column];
//							displayAmmunitionPoints();
//							map[player.currentTile.row][player.currentTile.column] = 1;
//							graph.nodes[player.currentTile.row][player.currentTile.column].type = 1;

//							animateUncoveredMineNumbers();
//							checkIfMineIsUncoveredAllAround(player.currentTile.row, player.currentTile.column);

//							ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//							drawMapTiles(ctx, 12, 12, tileSize);
//						}
//						else if (currentTile === 2) {
//							map[player.currentTile.row][player.currentTile.column] = 3;
//							graph.nodes[player.currentTile.row][player.currentTile.column].type = 0;

//							//moves player to the previous tile location
//							player.cornerPoint = cursor.getTileCornerPoint(player.previousTile.column, player.previousTile.row);
//							playerCanvas.setAttribute("style", "left:" + player.cornerPoint.x + "px; top:" + player.cornerPoint.y + "px;");
//							//reset the resultArray so player wont walk over mines if he clicks too fast
//							arrayResult = [];

//							player.currentTile = clone(player.previousTile);
//							player.nextTile = clone(player.currentTile);

//							checkIfMineIsUncoveredAllAround(player.previousTile.row, player.previousTile.column);
//							player.ammunitionPoints = 0;
//							displayAmmunitionPoints();

//							ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//							drawMapTiles(ctx, 12, 12, tileSize);
//						}
//					}

//					incrementNextTilePlayerMovesToCounter();

//					////////////////////////////////////////////////////////////////////////////////////////////////
//					//check if the the current tile is the destination tile
//					////////////////////////////////////////////////////////////////////////////////////////////////
//					if (nextTilePlayerMovesToCounter == arrayResult.length) {
//						resetNextTilePlayerMovesToCounter();
//						ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//						playerCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

//						drawMapTiles(ctx, 12, 12, tileSize);
//						drawPlayer();
//						isPlayerRunningInProgress = false;
//						clearInterval(playerTimerInterval);
//						return;
//					}

//					if (arrayResult.length > 0) {
//						player.nextTile.row = arrayResult[nextTilePlayerMovesToCounter].x;
//						player.nextTile.column = arrayResult[nextTilePlayerMovesToCounter].y;

//						//////////////////////////////////////////////////////////////////////////////////////////
//						//broadcast to server
//						//////////////////////////////////////////////////////////////////////////////////////////
//						gameConnection.server.serverBroadcastUpdatePlayerPosition(player.room, player.nextTile.row, player.nextTile.column);
//						//////////////////////////////////////////////////////////////////////////////////////////
//					}
//				}

//				if (playerAnimationCounter > player.pixelDistanceWhileMoving) {
//					playerAnimationCounter = 0;
//				}

//			}
//			else {
//				isPlayerRunningInProgress = false;
//				resetNextTilePlayerMovesToCounter();
//				clearInterval(playerTimerInterval);
//				playerCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//				//drawMapTiles(ctx, 12, 12, tileSize);
//				drawPlayer();
//			}
//		}
//	}
//}

//function checkIfMineIsUncoveredAllAround(row, col) {
//	var rMinusOne = row - 1;
//	var rPlusOne = row + 1;
//	var kMinusOne = col - 1;
//	var kPlusOne = col + 1;

//	for (var r = rMinusOne; r <= rPlusOne; r++) {
//		for (var k = kMinusOne; k <= kPlusOne; k++) {
//			//check if tile is outside of map boundry(ex. row = -1)
//			if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
//				var isMine = checkIfTileIsMine(map[r][k]);
//				if (isMine) {

//					if (checkIfTilesAroundParameterTileAreUncovered(r, k)) {
//						//The mine is uncovered from all sides here
//						map[r][k] = 4;

//					}
//				}
//			}
//		}
//	}

//	function checkIfTileIsMine(num) {
//		if (num == 2)
//			return true;
//		else
//			return false;
//	}

//	function checkIfTilesAroundParameterTileAreUncovered(row, col) {
//		var rMinusOne = row - 1;
//		var rPlusOne = row + 1;
//		var kMinusOne = col - 1;
//		var kPlusOne = col + 1;
//		var num;

//		for (var r = rMinusOne; r <= rPlusOne; r++) {
//			for (var k = kMinusOne; k <= kPlusOne; k++) {

//				if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles) {
//					num = map[r][k];
//					if (num === 0) {
//						return false;
//					}
//				}
//			}
//		}
//		return true;
//	}
//}

//function drawPlayer() {
//	//ctx.drawImage(tileSheet, 0, 0, 40, 40, player.cornerPoint.x + canvasPadding, player.cornerPoint.y + canvasPadding, 40, 40);
//	playerCtx.drawImage(tileSheet, 0, 0, 40, 40, canvasPadding, canvasPadding, 40, 40);
//}

//function drawEnemy() {
//	enemyCtx.drawImage(tileSheet, 0, 0, 40, 40, canvasPadding, canvasPadding, 40, 40);
//}

//function resetNextTilePlayerMovesToCounter() {
//	nextTilePlayerMovesToCounter = 0;
//}

//function incrementNextTilePlayerMovesToCounter() {
//	nextTilePlayerMovesToCounter++;
//}






//}







//function initializeEnemy(x, y) {
//	var point = cursor.getTileCornerPoint(x, y);

//	enemy.startingPositionTile = { "row": y, "column": x };
//	enemy.currentTile = clone(enemy.startingPositionTile);
//	enemy.nextTile = clone(enemy.currentTile);

//	enemy.setCornerPoint(point.x, point.y);

//	//set playerCanvas position here //////////////////////////////////////////////////////
//	enemyCanvas.setAttribute("style", "left:" + point.x + "px; top:" + point.y + "px;");

//	drawEnemy();
//}





//function animateUncoveredMineNumbers() {
//	var counter = 0;
//	var currentTile = cursor.getTileCornerPoint(player.currentTile.row, player.currentTile.column);
//	var tilePointX = currentTile.x;
//	var tilePointY = currentTile.y;
//	var number = mapNumbers[player.currentTile.row][player.currentTile.column];

//	//if the the number of mines is different than zero
//	if (number != 0) {
//		if (isAnimationNumbersInProgress) {
//			clearInterval(animationNumbersTimerInterval);
//		}
//		isAnimationNumbersInProgress = true;
//		animationNumbersTimerInterval = setInterval(showUncoveredMineNumbersAnimation, 100);
//	}

//	function showUncoveredMineNumbersAnimation() {

//		var color = "rgba(10,211,122,1)";
//		var offsetY = counter * 2;

//		if (counter < 10) {
//			counter++;
//			effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
//			effectsCtx.fillStyle = color;
//			effectsCtx.font = '50px "Victor\'s Pixel Font"';
//			effectsCtx.fillText(number, tilePointY + 14, tilePointX + 50 - offsetY);
//		}
//		else {
//			isAnimationNumbersInProgress = false;
//			clearInterval(animationNumbersTimerInterval);
//			effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
//			return;
//		}

//	}
//}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////while in a game session, listen to server
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//gameConnection.client.clientReceiveEnemyPosition = function (x, y) {

//	initializeEnemy(x, y);
//}

//gameConnection.client.clientReceiveUpdateEnemyPosition = function (x, y) {

//	moveEnemyTo(x, y);

//	function moveEnemyTo(x, y) {

//		enemy.nextTile.row = x;
//		enemy.nextTile.column = y;

//		//return, not allowing events to stack up
//		if (isEnemyRunningInProgress) {
//			return;
//		}

//		var velocityX = 0;
//		var velocityY = 0;



//		isEnemyRunningInProgress = true;

//		enemyTimerInterval = setInterval(drawEnemyRunning, 30);

//		function drawEnemyRunning() {

//			enemyCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//			enemyCtx.drawImage(tileSheet, 0, 40 * enemyAnimationCounter, 40, 40, canvasPadding, canvasPadding, 40, 40);
//			calculateEnemyPosition();

//			function calculateEnemyPosition() {

//				var tilePoint = CURSOR.getTileCornerPoint(enemy.nextTile.row, enemy.nextTile.column);

//				var tileYMinusEnemyY = tilePoint.x - enemy.cornerPoint.y;
//				var tileXMinusEnemyX = tilePoint.y - enemy.cornerPoint.x;

//				if (tileYMinusEnemyY > padding)
//					velocityY = 1;
//				else if (tileYMinusEnemyY < negativePadding)
//					velocityY = -1;
//				else velocityY = 0

//				if (tileXMinusEnemyX > padding)
//					velocityX = 1;
//				else if (tileXMinusEnemyX < negativePadding)
//					velocityX = -1;
//				else velocityX = 0;

//				enemyAnimationCounter++;

//				//player still moving to tile
//				if (Math.abs(tileXMinusEnemyX) >= enemy.pixelDistanceWhileMoving || Math.abs(tileYMinusEnemyY) >= enemy.pixelDistanceWhileMoving) {
//					//velocity X
//					enemy.cornerPoint.x += enemy.pixelDistanceWhileMoving * velocityX;
//					//velocity Y
//					enemy.cornerPoint.y += enemy.pixelDistanceWhileMoving * velocityY;

//					// move playerCanvas
//					enemyCanvas.setAttribute("style", "left:" + enemy.cornerPoint.x + "px; top:" + enemy.cornerPoint.y + "px;");

//				}
//				else {
//					///////////////////////////////////////////////////////////////////////////////////////////////////
//					//at this point player is fully in tile
//					///////////////////////////////////////////////////////////////////////////////////////////////////
//					enemy.previousTile = clone(enemy.currentTile);
//					enemy.currentTile = clone(enemy.nextTile);

//					enemyCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
//					drawEnemy();
//					isEnemyRunningInProgress = false;
//					clearInterval(enemyTimerInterval);
//					return;
//				}
//				if (enemyAnimationCounter > enemy.pixelDistanceWhileMoving) {
//					enemyAnimationCounter = 0;
//				}
//			}
//		}
//	}
//}

/////////////////////////////////////////////////////////////////////////////////

//window.clone = function (obj) {
//	var target = {};
//	for (var i in obj) {
//		if (obj.hasOwnProperty(i)) {
//			target[i] = obj[i];
//		}
//	}
//	return target;
//}

////////////////////////////////////////////////////////////////////////////////
//// http://stackoverflow.com/questions/958433/how-can-i-clearinterval-for-all-setinterval
////////////////////////////////////////////////////////////////////////////////

////window.oldSetInterval = window.setInterval;
////window.setInterval = function (func, interval) {
////    var interval = oldSetInterval(func, interval);
////    // store it in a array for stopping? stop it now? the power is yours.
////}






