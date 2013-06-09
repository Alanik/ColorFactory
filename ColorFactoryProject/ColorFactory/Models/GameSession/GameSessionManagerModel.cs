using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models
{
    public class GameSessionManagerModel
    {

		private static GameSessionManagerModel _instance;

        public List<GameSessionModel> GameSessionCollection
        {
            get;
            set;
        }

        private GameSessionManagerModel()
        {
			GameSessionCollection = new List<GameSessionModel>();
        }

        public static GameSessionManagerModel Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new GameSessionManagerModel();
                }
                return _instance;
            }
        }

        public void AddGameSession(GameSessionModel session)
        {
            GameSessionCollection.Add(session);
        }

        public void RemoveGameSession(string roomName)
        {
            var session = GameSessionCollection.Find(p => p.Name == roomName);
            GameSessionCollection.Remove(session);
        }

		public List<PlayerInSessionModel> InitializePlayersInGame(List<PlayerModel> players)
		{

		List<PlayerInSessionModel> playersInGame = new List<PlayerInSessionModel>();
		Random rnd = new Random();

			foreach (var player in players)
			{
				PlayerInSessionModel playerInGame = new PlayerInSessionModel(rnd.Next(12),rnd.Next(12), player.Name, player.ConnnectionId);
				playerInGame.Player = player;
				playersInGame.Add(playerInGame);
			}

			return playersInGame;
		}
   
    }
}