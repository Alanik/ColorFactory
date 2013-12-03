using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ColorFactory.Models.GameSession
{
	public class GameSessionManagerModel
	{

		private static GameSessionManagerModel _instance;
		private GameSessionManagerModel()
		{
			this.GameSessionCollection = new List<GameSessionModel>();
		}

		public List<GameSessionModel> GameSessionCollection{ get; set; }
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
			this.GameSessionCollection.Add(session);
		}

		public void RemoveGameSession(string roomName)
		{
			var session = GameSessionCollection.Find(p => p.Name == roomName);
			this.GameSessionCollection.Remove(session);
		}
	}
}