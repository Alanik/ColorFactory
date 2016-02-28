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
using ColorFactory.Models.Weapons;
using ColorFactory.CustomEventHandlers;
using System.Diagnostics;

namespace ColorFactory.Hubs
{
	[HubName( "game" )]
	public class Game : Hub
	{
		private readonly Random random = new Random();

		public void ServerBroadcastStartGameFromGameHub( string roomName )
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find( m => m.Name == roomName );
			if (session == null)
			{
				return;
			}

			PlayerInSessionModel playerInGame = session.PlayersInSession.Find( m => m.Player.ConnectionId == Context.ConnectionId );
			if (playerInGame == null)
			{
				return;
			}

			session.Map[playerInGame.NextPosition.Column, playerInGame.NextPosition.Row].IsTileUncoveredByPlayer[playerInGame.Player.seatNumber - 1] = true;

			Clients.Caller.clientReceiveStartGame( playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, playerInGame.Player.seatNumber );
		}

		public void ServerBroadcastCheckUnderneathTile( string roomName, int col, int row )
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find( m => m.Name == roomName );
			if (session == null)
			{
				return;
			}
			PlayerInSessionModel playerInGame = session.PlayersInSession.Find( m => m.Player.ConnectionId == Context.ConnectionId );
			if (playerInGame == null)
			{
				return;
			}
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

			PlayerInSessionModel otherPlayer = session.PlayersInSession.Find( m => m.Player.ConnectionId != Context.ConnectionId );

			if (IsOtherPlayerInTile( otherPlayer.NextPosition.Column, otherPlayer.NextPosition.Row, playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row ))
			{
				Clients.Client( playerInGame.Player.ConnectionId ).clientReceiveOtherPlayerPosition( otherPlayer.NextPosition.Column, otherPlayer.NextPosition.Row, otherPlayer.Player.seatNumber );
			}

			UpdateOtherPlayerPosition( session, playerInGame, otherPlayer, col, row );

			int mapTile = playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile;

			//map
			// 0 = covered empty tile
			// 1 = uncovered empty tile
			// 2 = covered Mine tile
			// 3 = uncovered/destroyed Mine tile
			// 4 = uncovered/scored Mine tile
			// 5 = uncovered mine (not scored) uncovered by pineCone explosion
			// 6 = uncovered tile by pineCone explosion
			// 7 = covered turret
			// 8 = uncovered turret

			PositionModel minePosition = new PositionModel( -1, -1 );

			switch ((TileKind)mapTile)
			{
				case TileKind.CoveredEmptyTile:
					{
						playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile = 1;
						List<PositionModel> uncoveredTiles = CheckIfMineIsUncoveredAllAround( playerInGame );

						playerInGame.AmmoPoints += session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Number;

						if (uncoveredTiles.Count > 0)
						{
							playerInGame.UncoveredMines += uncoveredTiles.Count;

							Clients.Client( playerInGame.Player.ConnectionId ).clientReceiveMineHasBeenUncovered( uncoveredTiles, playerInGame.UncoveredMines );

							if (!playerInGame.WalkedIntoMine && playerInGame.UncoveredMines == session.NumberOfMines)
							{
								Clients.Client( playerInGame.Player.ConnectionId ).clientReceiveWinGame( string.Format( "Player {0} has won the game by uncovering all the special tiles! Hail to the king! Congratz {0}.", playerInGame.Player.Name ) );
								Clients.Client( otherPlayer.Player.ConnectionId ).clientReceiveWinGame( string.Format( "Player {0} has won the game by uncovering all the special tiles! Hail to the king! Congratz {0}.", playerInGame.Player.Name ) );
							}
						}

						break;
					}
				case TileKind.UncoveredEmptyTile:
					{
						break;
					}
				case TileKind.CoveredMineTile:
					{
						playerInGame.WalkedIntoMine = true;

						playerInGame.PrivateMap[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Tile = 3;

						minePosition.Column = playerInGame.CurrentPosition.Column;
						minePosition.Row = playerInGame.CurrentPosition.Row;

						playerInGame.CurrentPosition.Column = prevCol;
						playerInGame.CurrentPosition.Row = prevRow;
						playerInGame.NextPosition.Column = prevCol;
						playerInGame.NextPosition.Row = prevRow;
						UpdateOtherPlayerPosition( session, playerInGame, otherPlayer, prevCol, prevRow );

						List<PositionModel> uncoveredTiles = CheckIfMineIsUncoveredAllAround( playerInGame );

						if (uncoveredTiles.Count > 0)
						{
							playerInGame.UncoveredMines += uncoveredTiles.Count;

							Clients.Client( playerInGame.Player.ConnectionId ).clientReceiveMineHasBeenUncovered( uncoveredTiles );
						}

						playerInGame.AmmoPoints = 0;

						break;
					}
				case TileKind.UncoveredDestroyedMineTile:
					{
						playerInGame.CurrentPosition.Column = prevCol;
						playerInGame.CurrentPosition.Row = prevRow;
						playerInGame.NextPosition.Column = prevCol;
						playerInGame.NextPosition.Row = prevRow;
						UpdateOtherPlayerPosition( session, playerInGame, otherPlayer, prevCol, prevRow );
						break;
					}
				case TileKind.UncoveredScoredMineTile:
					{
						minePosition.Column = playerInGame.CurrentPosition.Column;
						minePosition.Row = playerInGame.CurrentPosition.Row;

						playerInGame.CurrentPosition.Column = prevCol;
						playerInGame.CurrentPosition.Row = prevRow;
						playerInGame.NextPosition.Column = prevCol;
						playerInGame.NextPosition.Row = prevRow;

						UpdateOtherPlayerPosition( session, playerInGame, otherPlayer, prevCol, prevRow );
						break;
					}
				case TileKind.UncoveredMineByPineConeExplosionNotScored:
					{
						playerInGame.CurrentPosition.Column = prevCol;
						playerInGame.CurrentPosition.Row = prevRow;
						playerInGame.NextPosition.Column = prevCol;
						playerInGame.NextPosition.Row = prevRow;
						UpdateOtherPlayerPosition( session, playerInGame, otherPlayer, prevCol, prevRow );
						break;
					}
				default:
					{
						break;
					}
			}

			session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].IsTileUncoveredByPlayer[playerInGame.Player.seatNumber - 1] = true;

			int mineNumber = session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].Number;

			Clients.Client( playerInGame.Player.ConnectionId ).clientReceiveUncoverTile( mapTile, mineNumber, playerInGame.CurrentPosition, minePosition );
		}

		public void ServerBroadcastPlayerClickedOnOtherPlayer( int column, int row, string roomName )
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find( m => m.Name == roomName );
			if (session == null)
			{
				return;
			}
			PlayerInSessionModel playerInGame = session.PlayersInSession.Find( m => m.Player.ConnectionId == Context.ConnectionId );
			if (playerInGame == null)
			{
				return;
			}

			//TODO: temporary
			if (playerInGame.Player.seatNumber == 0)
			{
				return;
			}

			PlayerInSessionModel otherPlayer = session.PlayersInSession.Find( m => m.Player.ConnectionId != Context.ConnectionId );

			if (otherPlayer.CurrentPosition.Column == column && otherPlayer.CurrentPosition.Row == row)
			{
				if (playerInGame.CurrentWeapon == Weapons.Acorn)
				{
					if (playerInGame.IsShooting)
					{
						return;
					}
					else
					{
						playerInGame.IsShooting = true;
						playerInGame.playerShootingHandler = ( object sender, ElapsedEventArgs e ) => Shoot( playerInGame, otherPlayer, this.random, session );
						int counter = MvcApplication.GlobalQuarterSecondTimerCounter;
						switch (counter)
						{
							case 0:
								playerInGame.ShootingQuarterSecondCounter = 1;
								QuarterSecondNotifier.QuarterSecondElapsed1 += playerInGame.playerShootingHandler;
								return;
							case 1:
								playerInGame.ShootingQuarterSecondCounter = 2;
								QuarterSecondNotifier.QuarterSecondElapsed2 += playerInGame.playerShootingHandler;
								return;
							case 2:
								playerInGame.ShootingQuarterSecondCounter = 3;
								QuarterSecondNotifier.QuarterSecondElapsed3 += playerInGame.playerShootingHandler;
								return;
							case 3:
								playerInGame.ShootingQuarterSecondCounter = 4;
								QuarterSecondNotifier.QuarterSecondElapsed4 += playerInGame.playerShootingHandler;
								return;
							case 4:
								playerInGame.ShootingQuarterSecondCounter = 1;
								QuarterSecondNotifier.QuarterSecondElapsed1 += playerInGame.playerShootingHandler;
								return;

							//TODO: log default value somewhere, code should not execute here!
							default:
								return;
						}
					}
				}
			}
		}

		public void ServerBroadcastWeaponSwitched( string weaponName, string roomName )
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find( m => m.Name == roomName );
			if (session != null)
			{
				PlayerInSessionModel playerInGame = session.PlayersInSession.Find( m => m.Player.ConnectionId == Context.ConnectionId );
				if (playerInGame != null)
				{
					//TODO: move strings to Consts
					switch (weaponName)
					{
						case "acorn":
							playerInGame.CurrentWeapon = Weapons.Acorn;
							break;
						case "pineCone":
							playerInGame.CurrentWeapon = Weapons.PineCone;
							break;
						default:
							playerInGame.CurrentWeapon = Weapons.Acorn;
							break;
					}
				}
			}
		}

		public void ServerBroadcastPineConeThrown( int col, int row, string roomName )
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find( m => m.Name == roomName );
			if (session == null)
			{
				return;
			}
			PlayerInSessionModel playerInGame = session.PlayersInSession.Find( m => m.Player.ConnectionId == Context.ConnectionId );
			if (playerInGame == null)
			{
				return;
			}

			//TODO: temporary
			if (playerInGame.Player.seatNumber == 0)
			{
				return;
			}

			if (playerInGame.UncoveredMines <= 0)
			{
				return;
			}

			PlayerInSessionModel otherPlayer = session.PlayersInSession.Find( m => m.Player.ConnectionId != Context.ConnectionId );

			bool isMainPlayer = true;

			int tileforPlayer = (int)PineConeHitsTile( col, row, playerInGame, session, isMainPlayer );
			int tileforOtherPlayer = (int)PineConeHitsTile( col, row, otherPlayer, session, !isMainPlayer );
			int mineNumber = session.Map[col, row].Number;

			if (otherPlayer.CurrentPosition.Column == col && otherPlayer.CurrentPosition.Row == row)
			{
				int upperDmgLimit = (playerInGame.UncoveredMines * 6) + 20 - playerInGame.UncoveredMines;
				int lowerDmgLimit = (playerInGame.UncoveredMines * 4) + 20 - playerInGame.UncoveredMines;
				int rndDamage = this.random.Next( lowerDmgLimit, upperDmgLimit );

				otherPlayer.Health -= rndDamage;

				//TODO: change so it works for not only 2 ppl playing
				Clients.Client( playerInGame.Player.ConnectionId ).clientReceivePineConeExplodes( mineNumber, col, row, tileforPlayer, rndDamage, otherPlayer.Player.seatNumber );
				Clients.Client( otherPlayer.Player.ConnectionId ).clientReceivePlayerGetsHitByPineCone( mineNumber, col, row, tileforOtherPlayer, rndDamage, otherPlayer.Health );

				Clients.Client( playerInGame.Player.ConnectionId ).clientReceiveOtherPlayerPosition( otherPlayer.NextPosition.Column, otherPlayer.NextPosition.Row, otherPlayer.Player.seatNumber );
			}
			else
			{
				//TODO: temporary : -1 and null
				Clients.Client( playerInGame.Player.ConnectionId ).clientReceivePineConeExplodes( mineNumber, col, row, tileforPlayer, -1, null );
				Clients.Client( otherPlayer.Player.ConnectionId ).clientReceivePineConeExplodes( mineNumber, col, row, tileforOtherPlayer, -1, null );
			}

			playerInGame.UncoveredMines--;
		}

		public void ServerBroadcastHealPlayer( string roomName )
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find( m => m.Name == roomName );
			if (session == null)
			{
				return;
			}
			PlayerInSessionModel playerInGame = session.PlayersInSession.Find( m => m.Player.ConnectionId == Context.ConnectionId );
			if (playerInGame == null)
			{
				return;
			}

			//TODO: temporary
			if (playerInGame.Player.seatNumber == 0)
			{
				return;
			}

			if (playerInGame.UncoveredMines <= 0)
			{
				return;
			}

			int upperDmgLimit = (playerInGame.UncoveredMines * 10) + 10;
			int lowerDmgLimit = (playerInGame.UncoveredMines * 5) + 10;
			int healPoints = this.random.Next( lowerDmgLimit, upperDmgLimit );

			playerInGame.Health += healPoints;
			playerInGame.UncoveredMines--;
			playerInGame.CurrentWeapon = Weapons.Acorn;

			Clients.Client( playerInGame.Player.ConnectionId ).clientReceiveHealPlayer( healPoints, playerInGame.Health, playerInGame.UncoveredMines );
		}

		public void ServerBroadcastPlaceTurretOnMap( int col, int row, string roomName )
		{
			GameSessionModel session = GameSessionManagerModel.Instance.GameSessionCollection.Find( m => m.Name == roomName );
			if (session == null)
			{
				return;
			}

			PlayerInSessionModel playerInGame = session.PlayersInSession.Find( m => m.Player.ConnectionId == Context.ConnectionId );
			if (playerInGame == null)
			{
				return;
			}

			//TODO: temporary
			if (playerInGame.Player.seatNumber == 0)
			{
				return;
			}

			int tile = session.Map[col, row].Tile;

			//switch ((TileKind)tile)
			//{
			//	case TileKind.CoveredEmptyTile:
			//		{
			//			this.
			//		}
			//	case TileKind.UncoveredEmptyTile:
			//		{
			//			break;
			//		}
			//	default:
			//		{
			//			break;
			//		}
			//}


		}

		#region Private Methods


		private TileKind PineConeHitsTile( int col, int row, PlayerInSessionModel player, GameSessionModel session, bool isMainPlayer )
		{
			//map
			// 0 = covered tile
			// 1 = uncovered tile
			// 2 = covered Mine tile
			// 3 = uncovered/destroyed Mine tile
			// 4 = uncovered/scored Mine tile
			// 5 = uncovered mine (not scored) uncovered by pineCone explosion
			// 6 = uncovered tile by pineCone explosion
			// 7 = coveredTurret
			// 8 = uncoveredTurret

			int tile = player.PrivateMap[col, row].Tile;
			TileKind result;

			switch ((TileKind)tile)
			{
				case TileKind.CoveredEmptyTile:
					{
						result = TileKind.UncoveredTileByPineConeExplosion;

						if (isMainPlayer)
						{
							player.AmmoPoints += session.Map[col, row].Number;
						}

						break;
					}
				case TileKind.UncoveredEmptyTile:
					{
						result = TileKind.UncoveredTileByPineConeExplosion;
						break;
					}
				case TileKind.CoveredMineTile:
					{
						result = TileKind.UncoveredMineByPineConeExplosionNotScored;
						break;
					}
				case TileKind.UncoveredDestroyedMineTile:
					{
						result = TileKind.UncoveredDestroyedMineTile;
						break;
					}
				case TileKind.UncoveredScoredMineTile:
					{
						result = TileKind.UncoveredScoredMineTile;
						break;
					}
				default:
					{
						result = TileKind.UncoveredEmptyTile;
						break;
					}
			}

			player.PrivateMap[col, row].Tile = (int)result;
			session.Map[col, row].IsTileUncoveredByPlayer[player.Player.seatNumber - 1] = true;

			return result;
		}

		private void Shoot( PlayerInSessionModel playerInGame, PlayerInSessionModel opponent, Random rnd, GameSessionModel game )
		{
			int startCol = playerInGame.CurrentPosition.Column;
			int startRow = playerInGame.CurrentPosition.Row;
			int endCol = opponent.CurrentPosition.Column;
			int endRow = opponent.CurrentPosition.Row;

			if (playerInGame.AmmoPoints == 0)
			{
				playerInGame.IsShooting = false;
				RemoveShootingHandler( playerInGame.ShootingQuarterSecondCounter, playerInGame.playerShootingHandler );

				playerInGame.ShootingQuarterSecondCounter = 0;
				Clients.Client( playerInGame.Player.ConnectionId ).clientReceivePlayerStopsShooting
( opponent.Player.seatNumber );
				return;
			}

			ArrayList tiles;

			if (ShootingPathIsClear( startCol, startRow, endCol, endRow, playerInGame.PrivateMap, out tiles ))
			{
				//TODO: move to separate class/module ie. (Damage Calculation Logic)

				int upperBaseDmgLimit = (playerInGame.UncoveredMines * 2) + 10;

				int upperDmgLimit = rnd.Next( 0, 9 ) == 9 ? upperBaseDmgLimit + rnd.Next( 1, upperBaseDmgLimit ) : upperBaseDmgLimit;
				int lowerDmgLimit = rnd.Next( 0, 2 ) == 0 ? 0 : (playerInGame.UncoveredMines * 2);

				int rndDamage = rnd.Next( lowerDmgLimit, upperDmgLimit );

				opponent.Health -= rndDamage;
				playerInGame.AmmoPoints -= 1;

				//TODO: temporary
				if (opponent.Health <= 0 )
				{
					game.EndGame = true;

					PositionModel uncoveredBulletTile = GetUncoveredBulletTile( tiles, game.Map, playerInGame.UncoveredBulletTile, opponent.Player.seatNumber - 1 );

					Clients.Client( playerInGame.Player.ConnectionId ).clientReceivePlayerShootsOtherPlayer( rndDamage, playerInGame.AmmoPoints, opponent.Player.seatNumber, string.Format( "Player {0} has won the game by destroying player {1}. Hail to the king! Congratz {0}.", playerInGame.Player.Name, opponent.Player.Name ) );
					Clients.Client( opponent.Player.ConnectionId ).clientReceivePlayerGetsShotByOtherPlayer( rndDamage, opponent.Health, uncoveredBulletTile, string.Format( "Player {0} has won the game by destroying player {1}. Hail to the king! Congratz {0}.", playerInGame.Player.Name, opponent.Player.Name ) );

					playerInGame.IsShooting = false;
					RemoveShootingHandler( playerInGame.ShootingQuarterSecondCounter, playerInGame.playerShootingHandler );
				}
				else
				{
					PositionModel uncoveredBulletTile = GetUncoveredBulletTile( tiles, game.Map, playerInGame.UncoveredBulletTile, opponent.Player.seatNumber - 1 );

					Clients.Client( playerInGame.Player.ConnectionId ).clientReceivePlayerShootsOtherPlayer( rndDamage, playerInGame.AmmoPoints, opponent.Player.seatNumber );
					Clients.Client( opponent.Player.ConnectionId ).clientReceivePlayerGetsShotByOtherPlayer( rndDamage, opponent.Health, uncoveredBulletTile );
				}
			}
			else
			{
				playerInGame.IsShooting = false;
				RemoveShootingHandler( playerInGame.ShootingQuarterSecondCounter, playerInGame.playerShootingHandler );

				Clients.Client( playerInGame.Player.ConnectionId ).clientReceivePlayerStopsShooting
( opponent.Player.seatNumber );
			}
		}

		private PositionModel GetUncoveredBulletTile( ArrayList tiles, SessionMapTileModel[,] map, PositionModel uncoveredBulletTile, int index )
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

		private bool IsOtherPlayerInTile( int otherCol, int otherRow, int col, int row )
		{
			return col == otherCol && row == otherRow;
		}

		private void UpdateOtherPlayerPosition( GameSessionModel session, PlayerInSessionModel playerInGame, PlayerInSessionModel otherPlayer, int col, int row )
		{
			bool nextTileOtherPlayerUncovered = session.Map[col, row].IsTileUncoveredByPlayer[otherPlayer.Player.seatNumber - 1];
			bool prevTileOtherPlayerUncovered = session.Map[playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row].IsTileUncoveredByPlayer[otherPlayer.Player.seatNumber - 1];

			if (nextTileOtherPlayerUncovered)
			{
				if (!prevTileOtherPlayerUncovered)
				{
					Clients.Client( otherPlayer.Player.ConnectionId ).clientReceiveUpdateOtherPlayerPosition_changeAlphaOtherPlayer( playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row, playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, playerInGame.Player.seatNumber, (.1) );
				}
				else
				{
					Clients.Client( otherPlayer.Player.ConnectionId ).clientReceiveUpdateOtherPlayerPosition( playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, playerInGame.Player.seatNumber );
				}
			}
			else if (!nextTileOtherPlayerUncovered && prevTileOtherPlayerUncovered)
			{
				Clients.Client( otherPlayer.Player.ConnectionId ).clientReceiveUpdateOtherPlayerPosition_changeAlphaOtherPlayer( playerInGame.CurrentPosition.Column, playerInGame.CurrentPosition.Row, playerInGame.NextPosition.Column, playerInGame.NextPosition.Row, playerInGame.Player.seatNumber, -.1 );

			}
		}

		private bool CheckIfTileIsMine( int num )
		{
			return num == 2 ? true : false;
		}

		private bool CheckIfTilesAroundParameterTileAreUncovered( int col, int row, MapTileModel[,] map )
		{
			int rMinusOne = row - 1;
			int rPlusOne = row + 1;
			int kMinusOne = col - 1;
			int kPlusOne = col + 1;

			for (var k = kMinusOne; k <= kPlusOne; k++)
			{
				for (var r = rMinusOne; r <= rPlusOne; r++)
				{

					if (r >= 0 && r < GameSettings.Map.NumberOfTiles_Row && k >= 0 && k < GameSettings.Map.NumberOfTiles_Column)
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

		private List<PositionModel> CheckIfMineIsUncoveredAllAround( PlayerInSessionModel player )
		{
			List<PositionModel> tiles = new List<PositionModel>();

			int numCol = GameSettings.Map.NumberOfTiles_Column;
			int numRow = GameSettings.Map.NumberOfTiles_Row;
			int col = player.CurrentPosition.Column;
			int row = player.CurrentPosition.Row;

			int rMinusOne = row - 1;
			int rPlusOne = row + 1;
			int kMinusOne = col - 1;
			int kPlusOne = col + 1;

			for (var k = kMinusOne; k <= kPlusOne; k++)
			{
				for (var r = rMinusOne; r <= rPlusOne; r++)
				{
					//check if tile is outside of map boundry(ex. row = -1)
					if (r >= 0 && r < numRow && k >= 0 && k < numCol)
					{

						var isMine = CheckIfTileIsMine( player.PrivateMap[k, r].Tile );
						if (isMine)
						{
							if (CheckIfTilesAroundParameterTileAreUncovered( k, r, player.PrivateMap ))
							{
								//The mine is uncovered from all sides here
								player.PrivateMap[k, r].Tile = 4;
								tiles.Add( new PositionModel( k, r ) );
							}
						}

					}
				}

			}

			return tiles;

		}

		private ArrayList CalculateStraightLine( int startX, int startY, int endX, int endY )
		{
			ArrayList coordinatesArray = new ArrayList();
			// Translate coordinates
			int x1 = startX;
			int y1 = startY;
			int x2 = endX;
			int y2 = endY;
			// Define differences and error check
			int dx = Math.Abs( x2 - x1 );
			int dy = Math.Abs( y2 - y1 );
			int sx = (x1 < x2) ? 1 : -1;
			int sy = (y1 < y2) ? 1 : -1;
			int err = dx - dy;
			// Set first coordinates
			coordinatesArray.Add( new PositionModel( x1, y1 ) );
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
				coordinatesArray.Add( new PositionModel( x1, y1 ) );
			}
			// Return the result
			return coordinatesArray;

		}

		private bool ShootingPathIsClear( int startColumn, int startRow, int endColumn, int endRow, MapTileModel[,] playerMap, out ArrayList tiles )
		{
			tiles = CalculateStraightLine( startColumn, startRow, endColumn, endRow );
			int tileValue;
			foreach (PositionModel tile in tiles)
			{
				tileValue = playerMap[tile.Column, tile.Row].Tile;

				if (tileValue != 1 && tileValue != 6)
				{
					return false;
				}
			}

			return true;
		}

		private void RemoveShootingHandler( int counter, ElapsedEventHandler playerShootingHandler )
		{
			switch (counter)
			{
				case 0:
					QuarterSecondNotifier.QuarterSecondElapsed4 -= playerShootingHandler;
					return;
				case 1:
					QuarterSecondNotifier.QuarterSecondElapsed1 -= playerShootingHandler;
					return;
				case 2:
					QuarterSecondNotifier.QuarterSecondElapsed2 -= playerShootingHandler;
					return;
				case 3:
					QuarterSecondNotifier.QuarterSecondElapsed3 -= playerShootingHandler;
					return;
				case 4:
					QuarterSecondNotifier.QuarterSecondElapsed4 -= playerShootingHandler;
					return;
				default:
					return;
			}
		}

		#endregion
	}
}