using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ColorFactory.Hubs;


namespace ColorFactory.Models
{
    public class GameSessionModel
    {
        public List<PlayerModel> Players { get; set; }
        public string Name { get; set; }

        public GameSessionModel(List<PlayerModel> players, string name)
        {
            this.Players = players;
            this.Name = name;
        }

        public static void InitializeGame(List<PlayerModel> players,string name)
        {
            GameSessionModel CurrentSession = new GameSessionModel(players, name);
            GameSessionManagerModel.Instance.GameSessionCollection.Add(CurrentSession);

            var context = GlobalHost.ConnectionManager.GetHubContext<Lobby>();
            context.Clients.Group(name).initializePlayers(name);
        }

    }
}