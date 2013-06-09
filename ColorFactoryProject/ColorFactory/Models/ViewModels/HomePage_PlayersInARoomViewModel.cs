using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.ViewModels
{
    public class HomePage_PlayersInARoomViewModel
    {
        public int SeatNumber { get; set; }
        public bool IsReady { get; set; }
        public string Name { get; set; }

        public HomePage_PlayersInARoomViewModel(string name, int seatNumber, bool ready)
        {
            Name = name;
            SeatNumber = seatNumber;
            IsReady = ready;
        }
    }
}