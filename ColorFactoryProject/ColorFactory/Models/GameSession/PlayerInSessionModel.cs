using ColorFactory.Models.Map;
using ColorFactory.Models.Player;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.GameSession
{
	public class PlayerInSessionModel
	{
		public PlayerModel Player { get; set; }

		public int Score { get; set; }
		public PositionModel NextPosition { get; set; }
		public PositionModel CurrentPosition { get; set; }
		public int AmmoPoints { get; set; }
		public int UncoveredMines { get; set; }
		public int Health { get; set; }
		public int DamageDoneToOthers { get; set; }
		public bool IsShooting { get; set; }
		public MapTileModel[,] PrivateMap { get; set; }

		private PlayerInSessionModel()
		{
			Score = 0;
			AmmoPoints = 0;
			Health = 100;
			DamageDoneToOthers = 0;
			UncoveredMines = 0;
			IsShooting = false;
		}

		public PlayerInSessionModel(PositionModel pos, PlayerModel player, MapTileModel[,] map)
			: this()
		{
			this.NextPosition = new PositionModel(pos.Column, pos.Row);
			this.CurrentPosition = new PositionModel(pos.Column, pos.Row);
			this.Player = player;
			this.PrivateMap = CloneMap(map);
		}

		private MapTileModel[,] CloneMap(MapTileModel[,] map)
		{

			MapTileModel[,] privateMap = new MapTileModel[Consts.Map.NumberOfTiles, Consts.Map.NumberOfTiles];

			for (int i = 0; i < Consts.Map.NumberOfTiles; i++)
			{
				for (int j = 0; j < Consts.Map.NumberOfTiles; j++)
				{
					MapTileModel sessionTile = map[i, j];

					privateMap[i, j] = new MapTileModel(sessionTile.Tile, sessionTile.Number, sessionTile.Graph);

				}
			}

			return privateMap;
		}

	}
}