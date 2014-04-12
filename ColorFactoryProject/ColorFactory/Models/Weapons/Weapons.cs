using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Weapons
{
	//make sure to have same weapons as in here in player.js weapons

	public static class Weapons
	{
		public static Weapon Acorn { get; set; }
		public static Weapon PineCone { get; set; }

		static Weapons()
		{
			Acorn = new Acorn();
			PineCone = new PineCone();
		}
	}

	public abstract class Weapon
	{
		public int Attack { get; set; }
		public int Damage { get; set; }
	}

	 class Acorn : Weapon
	{
		public Acorn()
		{
			this.Attack = 1;
			this.Damage = 1;
		}
	}

	class PineCone : Weapon
	{
		public PineCone()
		{
			this.Attack = 2;
			this.Damage = 10;
		}
	}

	
}