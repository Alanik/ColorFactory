using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.ViewModels
{
    public class PlayerInSession
    {
        public string Name { get; set; }
        public int Score { get; set; }
        public int XCornerPoint { get; set; }
        public int YCornerPoint { get; set; }
        public int AmmoPoints { get; set; }
        public int Health { get; set; }
        public int DamageDoneToOthers { get; set; }

        public PlayerInSession()
        {
            Score = 0;
            AmmoPoints = 0;
            Health = 100;
            DamageDoneToOthers = 0;
        }

        public PlayerInSession(string name, int xCornerPoint, int yCornerPoint)
            : this()
        {
            Name = name;
            XCornerPoint = xCornerPoint;
            YCornerPoint = yCornerPoint;
        }

    }
}