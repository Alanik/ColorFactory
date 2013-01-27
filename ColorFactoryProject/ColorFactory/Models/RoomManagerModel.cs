using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class RoomManagerModel
    {

private static RoomManagerModel _instance;

        public List<RoomModel> RoomCollection
        {
            get;
            set;
        }

        private RoomManagerModel()
        {

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

        public void InitializeRoomCollection()
        {
            RoomCollection = new List<RoomModel>();
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