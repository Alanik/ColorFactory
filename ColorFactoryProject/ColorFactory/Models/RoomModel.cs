using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class RoomModel
    {
        public string Name { get; set; }
        public List<PlayerModel> Players { get; set; }
        public DateTime WhenCreated { get; set; }
        public PlayerModel Admin { get; set; }
        public Boolean IsFull { get; set; }



        public void AddPlayer(PlayerModel player)
        {
            if(!this.IsFull)
            Players.Add(player);

            IfRoomIsFull();
        }

        public void RemovePlayer(PlayerModel player)
        {
            Players.Remove(player);
            IfRoomIsFull();
        }
        private void IfRoomIsFull()
        {
            if (Players.Count == 4)
                IsFull = true;
            else
                IsFull = false;
        }

        public RoomModel(PlayerModel player, string roomName)
        {
            WhenCreated = DateTime.Now;
            Players = new List<PlayerModel>();
            IsFull = false;
            Name = roomName;
            Admin = player;
            player.seatNumber = 1;
            Players.Add(player);
        }

    }


}