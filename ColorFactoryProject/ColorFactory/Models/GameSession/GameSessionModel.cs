using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ColorFactory.Hubs;
using ColorFactory.Models.Player;
using ColorFactory.Models.Map;


namespace ColorFactory.Models.GameSession
{
	public class GameSessionModel
	{
		public List<PlayerInSessionModel> PlayersInSession { get; set; }
		public string Name { get; set; }
		public SessionMapTileModel[,] Map { get; set; }
		public int NumberOfMines { get; set; }
		public bool EndGame { get; set; }

		public GameSessionModel(List<PlayerModel> players, string name)
		{
			this.EndGame = false;
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
				playersInSession.Add(new PlayerInSessionModel(pos, player, map));
			}

			return playersInSession;
		}

		private SessionMapTileModel[,] InitializeMap()
		{
			int mapSizeCol = GameSettings.Map.NumberOfTiles_Column;
			int mapSizeRow = GameSettings.Map.NumberOfTiles_Row;

			SessionMapTileModel[,] map = new SessionMapTileModel[mapSizeCol, mapSizeRow];
			Random rnd = new Random();

			for (int col = 0; col < mapSizeCol; col++)
			{
				for (int row = 0; row < mapSizeRow; row++)
				{
					map[col, row] = new SessionMapTileModel(0, 0, 0, 2);
				}
			}

			map = InitializeMines(map);
			map = InitializeNumbers(map);

			return map;
		}

		private SessionMapTileModel[,] InitializeMines(SessionMapTileModel[,] map)
		{
			// 0 = covered tile
			// 1 = uncovered tile
			// 2 = covered Mine tile
			// 3 = uncovered/destroyed Mine tile
			// 4 = uncovered/scored Mine tile
			// 5 = currentHoveredTile

			Random rnd = new Random();

			int numOfMines = rnd.Next(GameSettings.Map.MinimumNumberOfMines, GameSettings.Map.MaximumNumberOfMines + 1);
			this.NumberOfMines = numOfMines;

			for (int i = 0; i < numOfMines; i++)
			{
				int rndCol = rnd.Next(0, GameSettings.Map.NumberOfTiles_Column);
				int rndRow = rnd.Next(0, GameSettings.Map.NumberOfTiles_Row);

				if (map[rndCol, rndRow].Tile == 2)
				{
					i--;
				}
				else
				{
					map[rndCol, rndRow].Tile = 2;
				}
			}

			return map;
		}

		private SessionMapTileModel[,] InitializeNumbers(SessionMapTileModel[,] map)
		{
			int counter, num, rMinusOne, rPlusOne, kMinusOne, kPlusOne, numCol = GameSettings.Map.NumberOfTiles_Column, numRow = GameSettings.Map.NumberOfTiles_Row;

			for (int col = 0; col < numCol; col++)
			{
				for (int row = 0; row < numRow; row++)
				{

					counter = 0;
					num = map[col, row].Tile;
					rMinusOne = row - 1;
					rPlusOne = row + 1;
					kMinusOne = col - 1;
					kPlusOne = col + 1;

					if (num != 2)
					{
						if (rMinusOne >= 0 && kMinusOne >= 0)
							CountMinesAroundTile(map[kMinusOne, rMinusOne].Tile, ref counter);
						if (rMinusOne >= 0)
							CountMinesAroundTile(map[col, rMinusOne].Tile, ref counter);
						if (rMinusOne >= 0 && kPlusOne < numCol)
							CountMinesAroundTile(map[kPlusOne, rMinusOne].Tile, ref counter);
						if (kMinusOne >= 0)
							CountMinesAroundTile(map[kMinusOne, row].Tile, ref counter);
						if (kPlusOne < numCol)
							CountMinesAroundTile(map[kPlusOne, row].Tile, ref counter);
						if (rPlusOne < numRow && kMinusOne >= 0)
							CountMinesAroundTile(map[kMinusOne, rPlusOne].Tile, ref counter);
						if (rPlusOne < numRow)
							CountMinesAroundTile(map[col, rPlusOne].Tile, ref counter);
						if (rPlusOne < numRow && kPlusOne < numCol)
							CountMinesAroundTile(map[kPlusOne, rPlusOne].Tile, ref counter);

						map[col, row].Number = counter;
					}

				}
			}

			return map;
		}

		private PositionModel GetRandomPlayerPosition(MapTileModel[,] map, Random rnd)
		{
			int rndCol = rnd.Next(GameSettings.Map.NumberOfTiles_Column);
			int rndRow = rnd.Next(GameSettings.Map.NumberOfTiles_Row);

			if (map[rndCol, rndRow].Tile != 2)
			{
				return new PositionModel(rndCol, rndRow);
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