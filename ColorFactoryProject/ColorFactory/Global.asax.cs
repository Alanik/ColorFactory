using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using ColorFactory.Models;
using System.Timers;
using ColorFactory.CustomEventHandlers;
using System.Diagnostics;



namespace ColorFactory
{
	// Note: For instructions on enabling IIS6 or IIS7 classic mode, 
	// visit http://go.microsoft.com/?LinkId=9394801

	public class MvcApplication : System.Web.HttpApplication
	{
		private ElapsedEventHandler quarterSecondTimerHandler;
		public static System.Timers.Timer GlobalQuarterSecondTimer = new System.Timers.Timer(250);		
		public volatile static int GlobalQuarterSecondTimerCounter;

		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();
			WebApiConfig.Register(GlobalConfiguration.Configuration);
			FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
			RouteTable.Routes.MapHubs();
			RouteConfig.RegisterRoutes(RouteTable.Routes);
			BundleConfig.RegisterBundles(BundleTable.Bundles);
			AuthConfig.RegisterAuth();

			GlobalQuarterSecondTimerCounter = 1;

			quarterSecondTimerHandler = (sender, e) => UpdateCounter();
			GlobalQuarterSecondTimer.Enabled = true;	
			GlobalQuarterSecondTimer.Elapsed += quarterSecondTimerHandler;
		}

		private void UpdateCounter()
		{
			++GlobalQuarterSecondTimerCounter;

			int localCounter = GlobalQuarterSecondTimerCounter;

			QuarterSecondNotifier.OnQuarterSecondElapsed(localCounter);

			if (GlobalQuarterSecondTimerCounter > 3)
			{
				GlobalQuarterSecondTimerCounter = 0;		
			}
		}
	}
}