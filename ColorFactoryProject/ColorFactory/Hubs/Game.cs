using Microsoft.AspNet.SignalR.Hubs;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Hubs
{
    [HubName("game")]
    public class Game : Hub
    {

        public void ServerBroadcastStartGameFromGameHub(string roomName)
        {
            Clients.Caller.clientReceiveStartGameCounter(roomName);
        }

    }
}