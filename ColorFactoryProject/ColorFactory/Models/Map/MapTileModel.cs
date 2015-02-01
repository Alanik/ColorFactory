using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Map
{
	public class MapTileModel
	{
		public int Tile { get; set; }
		public int Number { get; set; }
		public int Graph { get; set; }

		public MapTileModel(int tile, int number, int Graph)
		{
			this.Tile = tile;
			this.Number = number;
			this.Graph = Graph;
		}
	}
}