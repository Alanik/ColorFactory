using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.Room
{
    public class RoomManagerModel
    {

        private static RoomManagerModel _instance;

        public List<RoomModel> RoomCollection { get; set;}

        private RoomManagerModel()
        {
			RoomCollection = new List<RoomModel>();
        }

        public static RoomManagerModel Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new RoomManagerModel();
                }
                return _instance;
            }
        }

        public void AddRoom(RoomModel room)
        {
            RoomCollection.Add(room);
        }

        public void RemoveRoom(string roomName)
        {
            var room = RoomCollection.Find(p => p.Name == roomName);
            RoomCollection.Remove(room);
        }
    }
}