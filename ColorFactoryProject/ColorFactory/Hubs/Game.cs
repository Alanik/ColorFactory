using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using ColorFactory.Models.GameSession;
using ColorFactory.Models;
using ColorFactory.Models.Map;
using ColorFactory.Models.Player;

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

					int mapTile = playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile;

					//map
					// 0 = covered tile
					// 1 = uncovered tile
					// 2 = covered Mine tile
					// 3 = uncovered/destroyed Mine tile
					// 4 = uncovered/scored Mine tile
					// 5 = currentHoveredTile

					if (!clickedOnCurrentTile)
					{
						switch (mapTile)
						{
							case 0:
								{
									playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile = 1;
									List<PositionModel> uncoveredTiles = CheckIfMineIsUncoveredAllAround(playerInGame);

									if (uncoveredTiles.Count > 0)
									{
										playerInGame.UncoveredMines += uncoveredTiles.Count;

										Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveMineHasBeenUncovered(uncoveredTiles);
									}

									playerInGame.AmmoPoints += session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Number;

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

									List<PositionModel> uncoveredTiles = CheckIfMineIsUncoveredAllAround(playerInGame);

									if (uncoveredTiles.Count > 0)
									{
										playerInGame.UncoveredMines += uncoveredTiles.Count;

										Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveMineHasBeenUncovered(uncoveredTiles);
									}

									playerInGame.AmmoPoints = 0;

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

		private bool CheckIfTileIsMine(int num)
		{
			return num == 2 ? true : false;
		}

		private bool CheckIfTilesAroundParameterTileAreUncovered(int col, int row, MapTileModel[,] map)
		{
			int rMinusOne = row - 1;
			int rPlusOne = row + 1;
			int kMinusOne = col - 1;
			int kPlusOne = col + 1;

			for (var r = rMinusOne; r <= rPlusOne; r++)
			{
				for (var k = kMinusOne; k <= kPlusOne; k++)
				{

					if (r >= 0 && r < Consts.Map.NumberOfTiles && k >= 0 && k < Consts.Map.NumberOfTiles)
					{
						if (map[k, r].Tile == 0)
						{
							return false;
						}
					}

				}
			}

			return true;
		}

		private List<PositionModel> CheckIfMineIsUncoveredAllAround(PlayerInSessionModel player)
		{
			List<PositionModel> tiles = new List<PositionModel>();

			int numberOfTiles = Consts.Map.NumberOfTiles;
			int col = player.CurrentPosition.Column;
			int row = player.CurrentPosition.Row;

			int rMinusOne = row - 1;
			int rPlusOne = row + 1;
			int kMinusOne = col - 1;
			int kPlusOne = col + 1;

			for (var r = rMinusOne; r <= rPlusOne; r++)
			{
				for (var k = kMinusOne; k <= kPlusOne; k++)
				{
					//check if tile is outside of map boundry(ex. row = -1)
					if (r >= 0 && r < numberOfTiles && k >= 0 && k < numberOfTiles)
					{

						var isMine = CheckIfTileIsMine(player.PrivateMap[k, r].Tile);
						if (isMine)
						{
							if (CheckIfTilesAroundParameterTileAreUncovered(k, r, player.PrivateMap))
							{
								//The mine is uncovered from all sides here
								player.PrivateMap[k, r].Tile = 4;
								tiles.Add(new PositionModel(k, r));
							}
						}

					}
				}

			}

			return tiles;

		}
	}
}