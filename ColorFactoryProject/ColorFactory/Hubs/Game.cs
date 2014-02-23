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
using System.Collections;
using System.Timers;

namespace ColorFactory.Hubs
{
	[HubName("game")]
	public class Game : Hub
	{
		private ElapsedEventHandler playerShootingHandler;
		private Random random = new Random();

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
					//TODO: temporary
					if (playerInGame.Player.seatNumber == 0)
					{
						return;
					}

					int prevCol = playerInGame.CurrentPosition.Column;
					int prevRow = playerInGame.CurrentPosition.Row;

					playerInGame.CurrentPosition.Column = playerInGame.NextPosition.Column;
					playerInGame.CurrentPosition.Row = playerInGame.NextPosition.Row;

					playerInGame.NextPosition.Column = col;
					playerInGame.NextPosition.Row = row;

					PlayerInSessionModel otherPlayer = session.PlayersInSession.Find(m => m.Player.ConnnectionId != Context.ConnectionId);

					if (IsOtherPlayerInTile(otherPlayer.NextPosition.Column, otherPlayer.NextPosition.Row, playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row))
					{
						int index = GetOpponentIndex(playerInGame.Player.seatNumber, otherPlayer.Player.seatNumber);

						Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveOtherPlayerPosition(otherPlayer.NextPosition.Column, otherPlayer.NextPosition.Row, index);
					}

					UpdateOtherPlayerPosition(session, playerInGame, otherPlayer, col, row);

					int mapTile = playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile;

					//map
					// 0 = covered tile
					// 1 = uncovered tile
					// 2 = covered Mine tile
					// 3 = uncovered/destroyed Mine tile
					// 4 = uncovered/scored Mine tile

					PositionModel minePosition = new PositionModel(-1, -1);

					if (!clickedOnCurrentTile)
					{
						switch (mapTile)
						{
							case 0:
								{
									playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile = 1;
									List<PositionModel> uncoveredTiles = CheckIfMineIsUncoveredAllAround(playerInGame);

									playerInGame.AmmoPoints += session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Number;

									if (uncoveredTiles.Count > 0)
									{
										playerInGame.UncoveredMines += uncoveredTiles.Count;

										Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveMineHasBeenUncovered(uncoveredTiles);

										if (!playerInGame.WalkedIntoMine && playerInGame.UncoveredMines == session.NumberOfMines)
										{
											Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveWinGame(string.Format("Player {0} has won the game by uncovering all the special tiles! Hail to the king! Congratz {0}.", playerInGame.Player.Name));
											Clients.Client(otherPlayer.Player.ConnnectionId).clientReceiveWinGame(string.Format("Player {0} has won the game by uncovering all the special tiles! Hail to the king! Congratz {0}.", playerInGame.Player.Name));
										}
									}

									break;
								}
							case 1:
								{
									break;
								}
							case 2:
								{
									playerInGame.WalkedIntoMine = true;

									playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile = 3;

									minePosition.Column = playerInGame.CurrentPosition.Column;
									minePosition.Row = playerInGame.CurrentPosition.Row;

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

						Clients.Client(playerInGame.Player.ConnnectionId).clientReceiveUncoverTile(mapTile, mineNumber, playerInGame.CurrentPosition, minePosition);
					}

				}
			}
		}

		public void ServerBroadcastPlayerClickedOnOtherPlayer(int column, int row, string roomName)
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find(m => m.Name == roomName);
			if (session != null)
			{
				PlayerInSessionModel playerInGame = session.PlayersInSession.Find(m => m.Player.ConnnectionId == Context.ConnectionId);
				if (playerInGame != null)
				{
					//TODO: temporary
					if (playerInGame.Player.seatNumber == 0)
					{
						return;
					}

					PlayerInSessionModel otherPlayer = session.PlayersInSession.Find(m => m.Player.ConnnectionId != Context.ConnectionId);

					if (otherPlayer.CurrentPosition.Column == column && otherPlayer.CurrentPosition.Row == row)
					{
						if (!playerInGame.IsShooting)
						{
							playerInGame.IsShooting = true;

							playerShootingHandler = (sender, e) => Shoot(playerInGame, otherPlayer, this.random, session);
							MvcApplication.GlobalTimer.Elapsed += playerShootingHandler;

						}
					}
				}

			}
		}

		#region Private Methods

		private void Shoot(PlayerInSessionModel playerInGame, PlayerInSessionModel opponent, Random rnd, GameSessionModel game)
		{
			ArrayList tiles;
			int startCol = playerInGame.CurrentPosition.Column;
			int startRow = playerInGame.CurrentPosition.Row;
			int endCol = opponent.CurrentPosition.Column;
			int endRow = opponent.CurrentPosition.Row;
			int index = GetOpponentIndex(playerInGame.Player.seatNumber, opponent.Player.seatNumber);

			if (playerInGame.AmmoPoints == 0)
			{
				MvcApplication.GlobalTimer.Elapsed -= playerShootingHandler;
				playerInGame.IsShooting = false;
				Clients.Client(playerInGame.Player.ConnnectionId).clientReceivePlayerStopsShooting
(index);
				return;
			}

			if (ShootingPathIsClear(startCol, startRow, endCol, endRow, playerInGame.PrivateMap, out tiles))
			{
				int rndDamage = rnd.Next(0, 11);
				rndDamage += (2 * playerInGame.UncoveredMines);

				opponent.Health -= rndDamage;
				playerInGame.AmmoPoints -= 1;

				//TODO: temporary
				if (opponent.Health <= 0 && !game.EndGame)
				{
					game.EndGame = true;

					PositionModel uncoveredBulletTile = GetUncoveredBulletTile(tiles, game.Map, playerInGame.UncoveredBulletTile, opponent.Player.seatNumber - 1);

					Clients.Client(playerInGame.Player.ConnnectionId).clientReceivePlayerShootsOtherPlayer(rndDamage, index, string.Format("Player {0} has won the game by destroying player {1}. Hail to the king! Congratz {0}.", playerInGame.Player.Name, opponent.Player.Name));
					Clients.Client(opponent.Player.ConnnectionId).clientReceivePlayerGetsShotByOtherPlayer(rndDamage, opponent.Health, uncoveredBulletTile, string.Format("Player {0} has won the game by destroying player {1}. Hail to the king! Congratz {0}.", playerInGame.Player.Name, opponent.Player.Name));

					playerInGame.IsShooting = false;

					//unsubscribe to event
					MvcApplication.GlobalTimer.Elapsed -= playerShootingHandler;


					//Clients.Caller.clientReceiveWinGame(string.Format("Player {0} has won the game by destroying player {1}. Hail to the king! Congratz {0}.", playerInGame.Player.Name, opponent.Player.Name));
					//Clients.Others.clientReceiveWinGame(string.Format("Player {0} has won the game by destroying player {1}. Hail to the king! Congratz {0}.", playerInGame.Player.Name, opponent.Player.Name));

				}
				else
				{
					PositionModel uncoveredBulletTile = GetUncoveredBulletTile(tiles, game.Map, playerInGame.UncoveredBulletTile, opponent.Player.seatNumber - 1);

					Clients.Client(playerInGame.Player.ConnnectionId).clientReceivePlayerShootsOtherPlayer(rndDamage, index);
					Clients.Client(opponent.Player.ConnnectionId).clientReceivePlayerGetsShotByOtherPlayer(rndDamage, opponent.Health, uncoveredBulletTile);
				}
			}
			else
			{
				playerInGame.IsShooting = false;

				//unsubscribe to event
				MvcApplication.GlobalTimer.Elapsed -= playerShootingHandler;

				Clients.Client(playerInGame.Player.ConnnectionId).clientReceivePlayerStopsShooting
(index);
			}
		}

		private PositionModel GetUncoveredBulletTile(ArrayList tiles, SessionMapTileModel[,] map, PositionModel uncoveredBulletTile, int index)
		{
			bool previousUncovered = false;
			PositionModel firstTile = (PositionModel)tiles[0];

			if (map[firstTile.Column, firstTile.Row].IsTileUncoveredByPlayer[index])
			{
				uncoveredBulletTile.Column = firstTile.Column;
				uncoveredBulletTile.Row = firstTile.Row;

				return uncoveredBulletTile;
			}

			foreach (PositionModel tile in tiles)
			{
				if (map[tile.Column, tile.Row].IsTileUncoveredByPlayer[index])
				{
					if (previousUncovered)
					{
						return uncoveredBulletTile;
					}
				}
				else
				{
					previousUncovered = true;

					uncoveredBulletTile.Column = tile.Column;
					uncoveredBulletTile.Row = tile.Row;
				}
			}

			return uncoveredBulletTile;

		}

		private bool IsOtherPlayerInTile(int otherCol, int otherRow, int col, int row)
		{
			return col == otherCol && row == otherRow;
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

		private ArrayList CalculateStraightLine(int startX, int startY, int endX, int endY)
		{
			ArrayList coordinatesArray = new ArrayList();
			// Translate coordinates
			int x1 = startX;
			int y1 = startY;
			int x2 = endX;
			int y2 = endY;
			// Define differences and error check
			int dx = Math.Abs(x2 - x1);
			int dy = Math.Abs(y2 - y1);
			int sx = (x1 < x2) ? 1 : -1;
			int sy = (y1 < y2) ? 1 : -1;
			int err = dx - dy;
			// Set first coordinates
			coordinatesArray.Add(new PositionModel(x1, y1));
			// Main loop
			while (!((x1 == x2) && (y1 == y2)))
			{
				int e2 = err << 1;
				if (e2 > -dy)
				{
					err -= dy;
					x1 += sx;
				}
				if (e2 < dx)
				{
					err += dx;
					y1 += sy;
				}
				// Set coordinates
				coordinatesArray.Add(new PositionModel(x1, y1));
			}
			// Return the result
			return coordinatesArray;

		}

		private bool ShootingPathIsClear(int startColumn, int startRow, int endColumn, int endRow, MapTileModel[,] playerMap, out ArrayList tiles)
		{
			tiles = CalculateStraightLine(startColumn, startRow, endColumn, endRow);

			foreach (PositionModel tile in tiles)
			{
				if (playerMap[tile.Column, tile.Row].Tile != 1)
				{
					return false;
				}
			}

			return true;
		}

		private int GetOpponentIndex(int playerSeat, int opponentSeat)
		{
			return playerSeat < opponentSeat ? opponentSeat - 2 : opponentSeat - 1;
		}

		#endregion
	}
}