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
		public List<PlayerInSessionModel> PlayersInSession { get; set; }
		public string Name { get; set; }

		public GameSessionModel(List<PlayerInSessionModel> players, string name)
		{

			this.PlayersInSession = players;
			this.Name = name;
		}

		public static void InitializeGame(List<PlayerModel> players, string name)
		{

			List<PlayerInSessionModel> playersInGame = GameSessionManagerModel.Instance.InitializePlayersInGame(players);
			GameSessionModel currentSession = new GameSessionModel(playersInGame, name);
			GameSessionManagerModel.Instance.GameSessionCollection.Add(currentSession);

			//var context = GlobalHost.ConnectionManager.GetHubContext<Lobby>();
			
		}


	}
}