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

        public void InitializeGameSessionCollection()
        {
            GameSessionCollection = new List<GameSessionModel>();
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
   
    }
}