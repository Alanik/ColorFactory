using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ColorFactory.Models;
using ColorFactory.Models.ViewModels;
using System.Threading.Tasks;

namespace ColorFactory.Hubs
{
    [HubName("lobby")]
    public class Lobby : Hub
    {
        private List<IndexPlayersInRoomViewModel> GetRoomPlayerNamesList(RoomModel room)
        {
            List<IndexPlayersInRoomViewModel> playerNames = new List<IndexPlayersInRoomViewModel>();
            foreach (var item in room.Players)
            {
                IndexPlayersInRoomViewModel player = new IndexPlayersInRoomViewModel(item.Name, item.seatNumber, item.Ready);
                playerNames.Add(player);
            }


            return playerNames;
        }
        private List<string> GetRoomNamesList()
        {
            List<string> roomNames = new List<string>();

            foreach (var room in RoomManagerModel.Instance.RoomCollection)
            {
                roomNames.Add(room.Name);
            }
            return roomNames;
        }
        private List<string> GetOnlinePlayerNamesList()
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
        private bool AreAllPlayersReady(RoomModel room)
        {
            int counter = 0;
            foreach (var item in room.Players)
            {
                if (item.Ready)
                    counter++;
            }

            if (counter == 4)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        public void ServerBroadcastCreateRoom(string roomName)
        {
            PlayerModel player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.Id.ToString() == Context.ConnectionId);

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
            }
        }
        public void ServerBroadcastPlayerEnterRoom(string roomName)
        {
            var room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);

            IEnumerable<IGrouping<int, bool>> listOfPlayerReady = room.Players.GroupBy(player => player.seatNumber, player => player.Ready);

            if (room != null)
            {
                Groups.Add(Context.ConnectionId, roomName).ContinueWith(task =>
                            {
                                if (!task.IsCanceled)
                                {
                                    Clients.Caller.clientReceivePlayerEnterRoom(GetRoomPlayerNamesList(room));
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
            Clients.Caller.clientReceivePlayerEnterLobby(GetRoomNamesList());
        }
        public void ServerBroadcastPlayerTakeSeat(string roomName, int seatNumber)
        {
            var room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);
            var player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.Id.ToString() == Context.ConnectionId);

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
                        Clients.Group(roomName).clientReceivePlayerTakeSeat(GetRoomPlayerNamesList(room));
                    }
                });
            }
        }
        public void ServerBroadcastPlayerIsReady(string roomName, int seatNumber)
        {
            var room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);
            var player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.Id.ToString() == Context.ConnectionId);

            if (player != null && room != null)
            {
                //If player's seat number is not the same as clicked seat number
                if (player.seatNumber != seatNumber)
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
                        //start game
                        Clients.Group(roomName).clientReceiveStartGame();
                    }
                }
            }
        }
        public void ServerBroadcastAddPlayerToPlayerCollection(PlayerModel player)
        {
            PlayerManagerModel.Instance.AddPlayer(player);
            Clients.Others.clientReceiveMessage(PlayerManagerModel.Instance.PlayerCollection.Count, player.Name);
            Clients.Caller.clientReceiveMessage(PlayerManagerModel.Instance.PlayerCollection.Count, GetOnlinePlayerNamesList());
        }

        public override Task OnDisconnected()
        {
            var player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.Id.ToString() == Context.ConnectionId);
            var room = player.roomPlayerIsIn;
            if (room != null)
            {
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
            return Clients.All.clientReceiveOnDisconnect(player.Name, PlayerManagerModel.Instance.PlayerCollection.Count);
        }
    }
}