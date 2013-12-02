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

			if (session != null)
			{
				PlayerInSessionModel playerInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId == Context.ConnectionId);

				if (playerInGame != null)
				{
					session.Map[playerInGame.NextPosition.Column, playerInGame.NextPosition.Row].IsTileUncoveredByPlayer[playerInGame.Player.seatNumber - 1] = true;

					Clients.Caller.clientReceiveStartGame(playerInGame.NextPosition.Column, playerInGame.NextPosition.Row);

					PlayerInSessionModel enemyInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId != Context.ConnectionId);
					Clients.Client(enemyInGame.Player.ConnnectionId).clientReceiveOtherPlayerPosition(playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, 0);
				}
			}

		}

		public void ServerBroadcastCheckUnderneathTile(string roomName, int col, int row, bool clickedOnCurrentTile)
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find(m => m.Name == roomName);
			if (session != null)
			{
				PlayerInSessionModel playerInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId == Context.ConnectionId);
				if (playerInGame != null)
				{
					int prevCol = playerInGame.CurrentPosition.Column;
					int prevRow = playerInGame.CurrentPosition.Row;

					playerInGame.CurrentPosition.Column = playerInGame.NextPosition.Column;
					playerInGame.CurrentPosition.Row = playerInGame.NextPosition.Row;

					playerInGame.NextPosition.Column = col;
					playerInGame.NextPosition.Row = row;

					PlayerInSessionModel otherPlayer = session.PlayersInSession.Find(m => m.Player.ConnnectionId != Context.ConnectionId);

					if (IsOtherPlayerInTile(otherPlayer, playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row))
					{
						Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveOtherPlayerPosition(otherPlayer.NextPosition.Column, otherPlayer.NextPosition.Row, 0);
					}

					UpdateOtherPlayerPosition(session, playerInGame, otherPlayer, col, row);

					int mapTile;

					if (session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].IsTileUncoveredByPlayer[playerInGame.Player.seatNumber - 1])
					{
						mapTile = playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile;
					}
					else
					{
						mapTile = session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile;
					}

					//map
					// 0 = covered tile
					// 1 = uncovered tile
					// 2 = covered Mine tile
					// 3 = uncovered/destroyed Mine tile
					// 4 = uncovered/scored Mine tile
					// 5 = currentHoveredTile

					switch (mapTile)
					{
						case 0:
							{
								playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile = 1;
								break;
							}
						case 1:
							{
								break;
							}
						case 2:
							{
								playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile = 3;
								playerInGame.CurrentPosition.Column = prevCol;
								playerInGame.CurrentPosition.Row = prevRow;
								playerInGame.NextPosition.Column = prevCol;
								playerInGame.NextPosition.Row = prevRow;
								UpdateOtherPlayerPosition(session, playerInGame, otherPlayer, prevCol, prevRow);
								break;
							}
						case 3:
							{
								playerInGame.CurrentPosition.Column = prevCol;
								playerInGame.CurrentPosition.Row = prevRow;
								playerInGame.NextPosition.Column = prevCol;
								playerInGame.NextPosition.Row = prevRow;
								UpdateOtherPlayerPosition(session, playerInGame, otherPlayer, prevCol, prevRow);
								break;
							}
						case 4:
							{
								playerInGame.CurrentPosition.Column = prevCol;
								playerInGame.CurrentPosition.Row = prevRow;
								playerInGame.NextPosition.Column = prevCol;
								playerInGame.NextPosition.Row = prevRow;
								UpdateOtherPlayerPosition(session, playerInGame, otherPlayer, prevCol, prevRow);
								break;
							}
						default:
							{
								break;
							}
					}

					if (!clickedOnCurrentTile)
					{
						session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].IsTileUncoveredByPlayer[playerInGame.Player.seatNumber - 1] = true;

						int mineNumber = session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Number;

						Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveUncoverTile(mapTile, mineNumber, playerInGame.CurrentPosition);
					}

				}
			}
		}

		private bool IsOtherPlayerInTile(PlayerInSessionModel otherPlayer, int col, int row)
		{

			return col == otherPlayer.NextPosition.Column && row == otherPlayer.NextPosition.Row;

		}

		private void UpdateOtherPlayerPosition(GameSessionModel session, PlayerInSessionModel playerInGame, PlayerInSessionModel otherPlayer, int col, int row)
		{

			bool nextTileOtherPlayerUncovered = session.Map[col, row].IsTileUncoveredByPlayer[otherPlayer.Player.seatNumber - 1];
			bool prevTileOtherPlayerUncovered = session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].IsTileUncoveredByPlayer[otherPlayer.Player.seatNumber - 1];

			if (nextTileOtherPlayerUncovered)
			{
				if (!prevTileOtherPlayerUncovered)
				{
					Clients.Client(otherPlayer.Player.ConnnectionId).clientReceiveUpdateOtherPlayerPosition_changeAlphaOtherPlayer(playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row, playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, 0, 0);
				}
				else
				{
					Clients.Client(otherPlayer.Player.ConnnectionId).clientReceiveUpdateOtherPlayerPosition(playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, 0);
				}
			}
			else if (!nextTileOtherPlayerUncovered && prevTileOtherPlayerUncovered)
			{
				Clients.Client(otherPlayer.Player.ConnnectionId).clientReceiveUpdateOtherPlayerPosition_changeAlphaOtherPlayer(playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row, playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, 0, 1);

			}
		}
	}
}