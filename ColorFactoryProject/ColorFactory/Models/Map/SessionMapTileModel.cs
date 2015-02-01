using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Map
{
	public class SessionMapTileModel : MapTileModel
	{
		public bool[] IsTileUncoveredByPlayer { get; set; }

		public SessionMapTileModel(int tile, int number, int Graph, int numOfPlayers)
			: base(tile, number, Graph)
		{
			this.IsTileUncoveredByPlayer = new bool[numOfPlayers];
		}


	}
}