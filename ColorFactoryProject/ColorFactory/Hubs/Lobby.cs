﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ColorFactory.Models.ViewModels;
using System.Threading.Tasks;
using ColorFactory.Models.Room;
using ColorFactory.Models.Player;
using ColorFactory.Models.GameSession;

namespace ColorFactory.Hubs
{
	[HubName("lobby")]
	public class Lobby : Hub
	{
		#region Public Methods
		public void ServerBroadcastCreateRoom(string roomName)
		{
			PlayerModel player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.ConnectionId.ToString() == Context.ConnectionId);

			if (player != null)
			{
				if (player.seatNumber != 0)
				{
					Clients.Caller.clientReceivePlayerCreateRoomErrorPlayerIsAlreadyAdmin();
					return;
				}
				RoomModel room = new RoomModel(player, roomName);
				player.roomPlayerIsIn = room;
				RoomManagerModel.Instance.RoomCollection.Add(room);
				Clients.All.clientReceiveRoomCreated(roomName);
				Clients.Caller.clientReceiveSetRoomToPlayerOnRoomCreated(roomName);
			}
		}
		public void ServerBroadcastPlayerEnterRoom(string roomName)
		{
			var room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);
			if (room != null)
			{
				IEnumerable<IGrouping<int, bool>> listOfPlayerReady = room.Players.GroupBy(player => player.seatNumber, player => player.Ready);

				Groups.Add(Context.ConnectionId, roomName).ContinueWith(task =>
							{
								if (!task.IsCanceled)
								{
									Clients.Caller.clientReceivePlayerEnterRoom(GetPlayerNamesInRoom(room));
								}
							});
			}
			else
			{
				Clients.Caller.clientReceiveSpecifiedRoomDoesNotExist(roomName);
			}
		}
		public void ServerBroadcastPlayerEnterLobby()
		{
			Clients.Caller.clientReceivePlayerEnterLobby(GetRoomNames());
		}
		public void ServerBroadcastPlayerTakeSeat(string roomName, int seatNumber)
		{
			var room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);
			var player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.ConnectionId.ToString() == Context.ConnectionId);

			if (player != null && room != null)
			{
				if (player.seatNumber != 0)
				{
					Clients.Caller.clientReceivePlayerEnterRoomErrorPlayerAlreadyInARoom();
					return;
				}

				player.seatNumber = seatNumber;
				room.AddPlayer(player);
				player.roomPlayerIsIn = room;

				Groups.Add(Context.ConnectionId, roomName).ContinueWith(task =>
				{
					if (!task.IsCanceled)
					{
						Clients.Group(roomName).clientReceivePlayerTakeSeat(GetPlayerNamesInRoom(room));
					}
				});
			}
		}

		public void ServerBroadcastPlayerIsReady(string roomName, int seatNumber)
		{
			RoomModel room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);
			PlayerModel player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.ConnectionId.ToString() == Context.ConnectionId);

			if (player != null && room != null)
			{
				//If player's seat number is not the same as clicked seat number
				if (player.seatNumber != seatNumber || player.roomPlayerIsIn != room)
				{
					return;
				}

				if (player.Ready)
				{
					player.Ready = false;
					Clients.Group(roomName).clientReceivePlayerIsNotReady(seatNumber);
				}
				//player goes from notReady to ready here
				else
				{
					player.Ready = true;
					Clients.Group(roomName).clientReceivePlayerIsReady(seatNumber);

					if (AreAllPlayersReady(room))
					{
						//Initialize game session
						GameSessionManagerModel.Instance.GameSessionCollection.Add(new GameSessionModel(room.Players, room.Name));

						Clients.Group(roomName).clientReceiveInitializeGame(roomName);
					}
				}
			}
		}
		public void ServerBroadcastAddPlayerToPlayerCollection(PlayerModel player)
		{
			PlayerManagerModel.Instance.AddPlayer(player);

			Clients.All.clientReceiveAddPlayerToPlayerCollection(PlayerManagerModel.Instance.PlayerCollection.Count, GetOnlinePlayerNames());
		}

		public void ServerBroadcastChatMessage(string message, string playerName)
		{

			Clients.All.clientReceiveChatMessage(message, playerName);

		}

		public override Task OnDisconnected()
		{
			PlayerModel player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.ConnectionId.ToString() == Context.ConnectionId);

			if (player != null)
			{
				if (player.roomPlayerIsIn != null)
				{
					RoomModel room = player.roomPlayerIsIn;
					room.RemovePlayer(player);

					if (room.Admin == player)
					{
						Clients.Group(room.Name).clientReceiveAdminLeaveSeat(room.Name);

						foreach (var aplayer in room.Players)
						{
							aplayer.roomPlayerIsIn = null;
							aplayer.seatNumber = 0;
							aplayer.Ready = false;
						}

						RoomManagerModel.Instance.RoomCollection.Remove(room);
					}
					else
					{
						Clients.Group(room.Name).clientReceivePlayerLeaveSeat(room.Name, player.seatNumber);
					}
				}

				RemovePlayerFromPlayerCollection(player);
				Clients.All.clientReceiveOnDisconnect(player.Name, PlayerManagerModel.Instance.PlayerCollection.Count);
			}


			return null;
		}
		#endregion

		#region Private Methods
		private bool AreAllPlayersReady(RoomModel room)
		{
			int counter = 0;
			foreach (var item in room.Players)
			{
				if (item.Ready)
					counter++;
			}

			if (counter == RoomModel.MaxNumOfPlayersInRoom)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
		private List<HomePage_PlayersInARoomViewModel> GetPlayerNamesInRoom(RoomModel room)
		{
			List<HomePage_PlayersInARoomViewModel> playerNames = new List<HomePage_PlayersInARoomViewModel>();
			foreach (var item in room.Players)
			{
				HomePage_PlayersInARoomViewModel player = new HomePage_PlayersInARoomViewModel(item.Name, item.seatNumber, item.Ready);
				playerNames.Add(player);
			}

			return playerNames;
		}
		private List<string> GetRoomNames()
		{
			List<string> roomNames = new List<string>();

			foreach (var room in RoomManagerModel.Instance.RoomCollection)
			{
				roomNames.Add(room.Name);
			}
			return roomNames;
		}
		private List<string> GetOnlinePlayerNames()
		{
			List<string> Names = new List<string>();

			foreach (var player in PlayerManagerModel.Instance.PlayerCollection)
			{
				Names.Add(player.Name);

			}
			return Names;

		}
		private void RemovePlayerFromPlayerCollection(PlayerModel player)
		{
			PlayerManagerModel.Instance.PlayerCollection.Remove(player);
		}
		#endregion

	}
}