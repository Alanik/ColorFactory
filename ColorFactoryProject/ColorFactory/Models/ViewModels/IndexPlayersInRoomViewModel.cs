using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.ViewModels
{
    public class IndexPlayersInRoomViewModel
    {
        public int SeatNumber { get; set; }

        public bool Ready { get; set; }

        public string Name { get; set; }

        public IndexPlayersInRoomViewModel(string name, int seatNumber, bool ready)
        {
            Name = name;
            SeatNumber = seatNumber;
            Ready = ready;
        }
    }
}