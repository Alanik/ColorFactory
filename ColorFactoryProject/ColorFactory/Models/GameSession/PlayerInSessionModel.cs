using ColorFactory.Models.Map;
using ColorFactory.Models.Player;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using System.Web;

namespace ColorFactory.Models.GameSession
{
	public class PlayerInSessionModel
	{
		public PlayerModel Player { get; set; }

		public int Score { get; set; }
		public PositionModel NextPosition { get; set; }
		public PositionModel CurrentPosition { get; set; }
		public PositionModel UncoveredBulletTile { get; set; }
		public int AmmoPoints { get; set; }
		public int UncoveredMines { get; set; }
		public int Health { get; set; }
		public int DamageDoneToOthers { get; set; }
		public bool IsShooting { get; set; }
		public MapTileModel[,] PrivateMap { get; set; }
		public bool WalkedIntoMine { get; set; }
		public Weapons.Weapon CurrentWeapon { get; set; }
		public int ShootingQuarterSecondCounter { get; set; }

		public ElapsedEventHandler playerShootingHandler;

		private PlayerInSessionModel()
		{
			Score = 0;
			AmmoPoints = 100;
			Health = 200;
			DamageDoneToOthers = 0;
			UncoveredMines = 0;
			IsShooting = false;
			this.UncoveredBulletTile = new PositionModel(0,0);
			WalkedIntoMine = false;
			CurrentWeapon = Weapons.Weapons.Acorn;
			ShootingQuarterSecondCounter = 0;
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

			MapTileModel[,] privateMap = new MapTileModel[GameSettings.Map.NumberOfTiles_Column, GameSettings.Map.NumberOfTiles_Row];

			for (int col = 0; col < GameSettings.Map.NumberOfTiles_Column; col++)
			{
				for (int row = 0; row < GameSettings.Map.NumberOfTiles_Row; row++)
				{
					MapTileModel sessionTile = map[col, row];

					privateMap[col, row] = new MapTileModel(sessionTile.Tile, sessionTile.Number, sessionTile.Graph);
				}
			}

			return privateMap;
		}

	}
}