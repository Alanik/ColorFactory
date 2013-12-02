using ColorFactory.Models.Player;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class PlayerInSessionModel
    {
        public PlayerModel Player{get; set;}

        public int Score { get; set; }
        public PositionModel NextPosition { get; set;}
		public PositionModel CurrentPosition { get;  set; }
        public int AmmoPoints { get; set; }
        public int Health { get; set; }
        public int DamageDoneToOthers { get; set; }
		public MapTileModel[,] PrivateMap { get; set; }

        private PlayerInSessionModel()
        {
            Score = 0;
            AmmoPoints = 0;
            Health = 100;
            DamageDoneToOthers = 0;
        }

        public PlayerInSessionModel(PositionModel pos, PlayerModel player)
            : this()
        {
			this.NextPosition = new PositionModel(pos.Column, pos.Row);
			this.CurrentPosition = new PositionModel(pos.Column, pos.Row);
			this.Player = player;
			this.PrivateMap = InitializePrivateMap();
        }

		private MapTileModel[,] InitializePrivateMap()
		{
		
		int mapSize = Consts.Map.NumberOfTiles;

		MapTileModel[,] map = new MapTileModel[mapSize, mapSize];

		for (int i = 0; i < mapSize; i++)
		{
			for (int j = 0; j < mapSize; j++)
			{
				map[i, j] = new MapTileModel(0, 0, 0, 2);
			}
		}

		return map;
		
		}
    }
}