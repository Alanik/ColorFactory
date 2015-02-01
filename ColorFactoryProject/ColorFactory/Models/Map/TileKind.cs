using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Map
{
	public enum TileKind
	{
		CoveredEmptyTile = 0,
		UncoveredEmptyTile = 1,
		CoveredMineTile = 2,
		UncoveredDestroyedMineTile = 3,
		UncoveredScoredMineTile = 4,
		UncoveredMineByPineConeExplosionNotScored = 5,
		UncoveredTileByPineConeExplosion = 6,
		CoveredTurret = 7,
		UncoveredTurret = 8
	}
}