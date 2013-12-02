using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Player
{
	public class PositionModel
	{
		public int Row { get; set; }
		public int Column { get; set; }

		public PositionModel(int column, int row)
		{
			this.Row = row;
			this.Column = column;
		}
	}
}