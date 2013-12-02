using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
	public class MapTileModel
	{
		public int Tile { get; set; }
		public int Number { get; set; }
		public int Graph { get; set; }

		public bool[] IsTileUncoveredByPlayer { get; set; }


		public MapTileModel(int tile, int number, int Graph, int numOfPlayers)
		{
			this.Tile = tile;
			this.Number = number;
			this.Graph = Graph;
			this.IsTileUncoveredByPlayer = new bool[numOfPlayers];
		}
	}
}