using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory
{
	public static class GameSettings
	{
		public static class Map
		{
			public const int NumberOfTiles_Column = 16;
			public const int NumberOfTiles_Row = 9;
			public const int MinimumNumberOfMines = 15;
			public const int MaximumNumberOfMines = 25;
		}
	}
}