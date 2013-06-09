using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class PlayerInSessionModel
    {
        public PlayerModel Player{get; set;}

        public int Score { get; set; }
        public int XCornerPoint { get; set; }
        public int YCornerPoint { get; set; }
        public int AmmoPoints { get; set; }
        public int Health { get; set; }
        public int DamageDoneToOthers { get; set; }

        private PlayerInSessionModel()
        {
            Score = 0;
            AmmoPoints = 0;
            Health = 100;
            DamageDoneToOthers = 0;
        }

        public PlayerInSessionModel(int xCornerPoint, int yCornerPoint, string name, string connectionId)
            : this()
        {
            this.Player = new PlayerModel(name, connectionId);
            this.XCornerPoint = xCornerPoint;
            this.YCornerPoint = yCornerPoint;
        }
    }
}