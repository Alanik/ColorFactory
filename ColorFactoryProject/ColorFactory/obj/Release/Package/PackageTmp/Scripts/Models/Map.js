var Map = function (settingsMap) {
	var self = this;
	var numCol = settingsMap.getNumberOfTiles_Column();
	var numRow = settingsMap.getNumberOfTiles_Row();

	var _initializeArray = function () {
		var array = [];

		for (var col = 0; col < numCol; col++) {
			array[col] = [];

			for (var row = 0; row < numRow; row++) {
				array[col][row] = 0;
			}
		}

		return array;
	}

	var _graph = new Graph(_initializeArray());
	var _tiles = _initializeArray();
	var _numbers = _initializeArray();

	//graph for A* algorithm
	// 1 = open
	// 0 = obsticle

	self.getGraphNodes = function () {
		return _graph.nodes;
	};

	self.getGraphType = function (col, row) {
		return _graph.nodes[col][row].type;
	};

	self.setGraphType = function (col, row, value) {
		_graph.nodes[col][row].type = value;
	};

	self.getGraphNode = function (col, row) {
		return _graph.nodes[col][row];
	};

	self.setGraphNode = function (col, row, value) {
		return _graph.nodes[col][row] = value;
	};

	//map
	// 0 = covered tile
	// 1 = uncovered tile
	// 2 = covered Mine tile
	// 3 = uncovered/destroyed Mine tile
	// 4 = uncovered/scored Mine tile
	// 5 = uncovered mine (not scored) uncovered by pineCone explosion
	// 6 = uncovered tile by pineCone explosion


	self.getTilesValue = function (col, row) {
		return _tiles[col][row];
	};

	self.setTilesValue = function (col, row, value) {
		_tiles[col][row] = value;
	};

	self.getNumbersValue = function (col, row) {
		return _numbers[col][row];
	};

	self.setNumbersValue = function (col, row, value) {
		_numbers[col][row] = value;
	};
};


	