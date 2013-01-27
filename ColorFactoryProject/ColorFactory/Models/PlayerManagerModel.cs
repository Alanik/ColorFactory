using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class PlayerManagerModel
    {

        private static PlayerManagerModel _instance;

        public List<PlayerModel> PlayerCollection
        {
            get;
            set;
        }

        private PlayerManagerModel()
        {

        }

        public static PlayerManagerModel Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new PlayerManagerModel();
                }
                return _instance;
            }
        }

        public void InitializePlayerCollection()
        {
            PlayerCollection = new List<PlayerModel>();
        }

        public void AddPlayer(PlayerModel player)
        {
            PlayerCollection.Add(player);
        }

        public void RemovePlayer(string playerName)
        {
            var player = PlayerCollection.Find(p => p.Name == playerName);
            PlayerCollection.Remove(player);
        }

        public void RemovePlayer(Guid playerId)
        {
            var player = PlayerCollection.Find(p => p.Id == playerId);
            PlayerCollection.Remove(player);
        }


    }
}