using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class PlayerManagerModel
    {

        private static PlayerManagerModel _instance;

		private PlayerManagerModel()
		{
			PlayerCollection = new List<PlayerModel>();
		}

        public List<PlayerModel> PlayerCollection
        {
            get;
            set;
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

        public void AddPlayer(PlayerModel player)
        {
            PlayerCollection.Add(player);
        }

        public void RemovePlayerBasedOnName(string playerName)
        {
            var player = PlayerCollection.Find(p => p.Name == playerName);
            PlayerCollection.Remove(player);
        }

        public void RemovePlayerBasedOnConnectionId(string playerId)
        {
            var player = PlayerCollection.Find(p => p.ConnnectionId == playerId);
            PlayerCollection.Remove(player);
        }

    }
}