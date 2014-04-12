using ColorFactory.Models.Room;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Player
{
    public class PlayerModel
    {
        public string Name { get; set; }
        public DateTime WhenCreated { get; set; }
        public string ConnectionId { get; set; }
        public bool Ready = false;
        public int seatNumber = 0;
        public RoomModel roomPlayerIsIn;

		private  PlayerModel()
        {
            WhenCreated = DateTime.Now;
        }

       public PlayerModel(string name, string connectionId)
            : this()
        {
            ConnectionId = connectionId;
            Name = name;
        }
    }
}