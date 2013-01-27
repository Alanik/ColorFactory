using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class PlayerModel
    {
        public string Name { get; set; }
        public DateTime WhenCreated { get; set; }
        public Guid Id { get; set; }
        public bool Ready = false;
        public int seatNumber = 0;
        public RoomModel roomPlayerIsIn;


        PlayerModel()
        {
            WhenCreated = DateTime.Now;
        }

        PlayerModel(string name, Guid id)
            : this()
        {
            Id = id;
            Name = name;
        }
    }
}