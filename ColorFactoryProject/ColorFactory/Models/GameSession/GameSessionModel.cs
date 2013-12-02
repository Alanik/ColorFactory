using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ColorFactory.Hubs;
using ColorFactory.Models.Player;


namespace ColorFactory.Models
{
	public class GameSessionModel
	{
		public List<PlayerInSessionModel> PlayersInSession { get; set; }
		public string Name { get; set; }
		public MapTileModel[,] Map { get; set; }

		public GameSessionModel(List<PlayerModel> players, string name)
		{
			this.Name = name;
			this.Map = InitializeMap();
			this.PlayersInSession = InitializePlayers(players, this.Map);
		}

		private List<PlayerInSessionModel> InitializePlayers(List<PlayerModel> players, MapTileModel[,] map)
		{
			List<PlayerInSessionModel> playersInSession = new List<PlayerInSessionModel>();

			Random rnd = new Random();

			foreach (var player in players)
			{
				PositionModel pos = GetRandomPlayerPosition(map, rnd);
				playersInSession.Add(new PlayerInSessionModel(pos, player));
			}

			return playersInSession;
		}

		private MapTileModel[,] InitializeMap()
		{
			int mapSize = Consts.Map.NumberOfTiles;

			MapTileModel[,] map = new MapTileModel[mapSize, mapSize];

			Random rnd = new Random();

			for (int i = 0; i < mapSize; i++)
			{
				for (int j = 0; j < mapSize; j++)
				{
					map[i, j] = new MapTileModel(0, 0, 0, 2);
				}
			}

			map = InitializeMines(map);
			map = InitializeNumbers(map);

			return map;
		}

		private MapTileModel[,] InitializeMines(MapTileModel[,] map)
		{
			// 0 = covered tile
			// 1 = uncovered tile
			// 2 = covered Mine tile
			// 3 = uncovered/destroyed Mine tile
			// 4 = uncovered/scored Mine tile
			// 5 = currentHoveredTile

			Random rnd = new Random();

			int numOfMines = rnd.Next(Consts.Map.minimumNumberOfMines, Consts.Map.maximumNumberOfMines + 1);

			for (int i = 0; i < numOfMines; i++)
			{
				int x = rnd.Next(0, Consts.Map.NumberOfTiles);
				int y = rnd.Next(0, Consts.Map.NumberOfTiles);

				if (map[x, y].Tile == 2)
				{
					i--;
				}
				else
				{
					map[x, y].Tile = 2;
				}
			}

			return map;
		}

		private MapTileModel[,] InitializeNumbers(MapTileModel[,] map)
		{
			int counter, num, rMinusOne, rPlusOne, kMinusOne, kPlusOne, numOfTiles = Consts.Map.NumberOfTiles;

			for (var r = 0; r < numOfTiles; r++)
			{
				for (var k = 0; k < numOfTiles; k++)
				{

					counter = 0;
					num = map[r, k].Tile;
					rMinusOne = r - 1;
					rPlusOne = r + 1;
					kMinusOne = k - 1;
					kPlusOne = k + 1;

					if (num != 2)
					{
						if (rMinusOne >= 0 && kMinusOne >= 0)
							CountMinesAroundTile(map[rMinusOne, kMinusOne].Tile, ref counter);
						if (rMinusOne >= 0)
							CountMinesAroundTile(map[rMinusOne, k].Tile, ref counter);
						if (rMinusOne >= 0 && kPlusOne < numOfTiles)
							CountMinesAroundTile(map[rMinusOne, kPlusOne].Tile, ref counter);
						if (kMinusOne >= 0)
							CountMinesAroundTile(map[r, kMinusOne].Tile, ref counter);
						if (kPlusOne < numOfTiles)
							CountMinesAroundTile(map[r, kPlusOne].Tile, ref counter);
						if (rPlusOne < numOfTiles && kMinusOne >= 0)
							CountMinesAroundTile(map[rPlusOne, kMinusOne].Tile, ref counter);
						if (rPlusOne < numOfTiles)
							CountMinesAroundTile(map[rPlusOne, k].Tile, ref counter);
						if (rPlusOne < numOfTiles && kPlusOne < numOfTiles)
							CountMinesAroundTile(map[rPlusOne, kPlusOne].Tile, ref counter);

						map[r, k].Number = counter;
					}

				}
			}

			return map;
		}

		private PositionModel GetRandomPlayerPosition(MapTileModel[,] map, Random rnd)
		{			
			int x = rnd.Next(Consts.Map.NumberOfTiles);
			int y = rnd.Next(Consts.Map.NumberOfTiles);

			if (map[x, y].Tile != 2)
			{
				return new PositionModel(x, y);
			}
			else
			{
				return GetRandomPlayerPosition(map, rnd);
			}
		}

		private void CountMinesAroundTile(int num, ref int counter)
		{
			if (num == 2)
				counter++;
		}
	}
}