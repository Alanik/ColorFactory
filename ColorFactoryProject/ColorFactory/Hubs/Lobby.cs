using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ColorFactory.Models;
using System.Threading.Tasks;

namespace ColorFactory.Hubs
{
    [HubName("lobby")]
    public class Lobby : Hub
    {
        private Dictionary<int, string> GetRoomPlayerNamesList(RoomModel room)
        {
            Dictionary<int, string> playerNames = new Dictionary<int, string>();

            foreach (var player in room.Players)
            {
                playerNames.Add(player.seatNumber, player.Name);
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

        public void ServerBroadcastCreateRoom(string roomName)
        {
            PlayerModel player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.Id.ToString() == Context.ConnectionId);

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

        public void ServerBroadcastPlayerEnterRoom(string roomName)
        {
            var room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);
            Groups.Add(Context.ConnectionId, roomName).ContinueWith(task =>
            {

                if (!task.IsCanceled)
                {
                    Clients.Caller.clientReceivePlayerEnterRoom(GetRoomPlayerNamesList(room));
                }
            });
        }

        public void ServerBroadcastPlayerEnterLobby()
        {
            Clients.Caller.clientReceivePlayerEnterLobby(GetRoomNamesList());
        }

        public void ServerBroadcastPlayerTakeSeat(string roomName, int seatNumber)
        {
            var room = RoomManagerModel.Instance.RoomCollection.Find(p => p.Name == roomName);
            var player = PlayerManagerModel.Instance.PlayerCollection.Find(p => p.Id.ToString() == Context.ConnectionId);

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

            RemovePlayerFromPlayerCollection(player);

            return Clients.All.clientReceiveOnDisconnect(player.Name, PlayerManagerModel.Instance.PlayerCollection.Count);
        }
    }
}