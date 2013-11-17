using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ColorFactory.Models;

namespace ColorFactory.Hubs
{
	[HubName("game")]
	public class Game : Hub
	{
		public void ServerBroadcastStartGameFromGameHub(string roomName)
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find(m => m.Name == roomName);
			PlayerInSessionModel playerInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId == Context.ConnectionId);

			if (playerInGame != null)
			{
				Clients.Caller.clientReceiveStartGameCounter(playerInGame.XCornerPoint, playerInGame.YCornerPoint);

				PlayerInSessionModel enemyInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId != Context.ConnectionId);
				Clients.Client(enemyInGame.Player.ConnnectionId).clientReceiveEnemyPosition(playerInGame.XCornerPoint, playerInGame.YCornerPoint);

			}
		}

		public void ServerBroadcastUpdatePlayerPosition(string roomName, int x, int y)
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find(m => m.Name == roomName);

			if (session != null)
			{
				PlayerInSessionModel playerInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId == Context.ConnectionId);

				if (playerInGame != null)
				{
					playerInGame.XCornerPoint = x;
					playerInGame.YCornerPoint = y;

					PlayerInSessionModel enemyInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId != Context.ConnectionId);
					Clients.Client(enemyInGame.Player.ConnnectionId).clientReceiveUpdateEnemyPosition(playerInGame.XCornerPoint, playerInGame.YCornerPoint);
				}
			}
		}
	}
}