using ColorFactory.Models.Player;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Room
{
	public class RoomModel
	{
		public const int MaxNumOfPlayersInRoom_2 = 2;

		public string Name { get; set; }
		public List<PlayerModel> Players { get; set; }
		public DateTime WhenCreated { get; set; }
		public PlayerModel Admin { get; set; }
		public Boolean IsFull
		{
			get
			{
				if (this.Players.Count == MaxNumOfPlayersInRoom_2)
				{
					return true;
				}
				else
				{ 
					return false; 
				}
			}
		}

		public RoomModel(PlayerModel admin, string roomName)
		{
			WhenCreated = DateTime.Now;
			Players = new List<PlayerModel>();
			Name = roomName;
			Admin = admin;
			Admin.seatNumber = 1;
			Players.Add(admin);
		}

		public bool AddPlayer(PlayerModel player)
		{
			if (!this.IsFull)
			{
				this.Players.Add(player);
				return true;
			}

			return false;
		}

		public void RemovePlayer(PlayerModel player)
		{
			this.Players.Remove(player);

		}
	}
}