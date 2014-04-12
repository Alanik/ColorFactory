using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Timers;
using System.Web;

namespace ColorFactory.CustomEventHandlers
{
	public static class QuarterSecondNotifier
	{
		public static event ElapsedEventHandler QuarterSecondElapsed1;
		public static event ElapsedEventHandler QuarterSecondElapsed2;
		public static event ElapsedEventHandler QuarterSecondElapsed3;
		public static event ElapsedEventHandler QuarterSecondElapsed4;

		public static void OnQuarterSecondElapsed(int counter)
			{
			switch (counter)
			{
				case 0:
					if (QuarterSecondElapsed4 != null)
					{
						QuarterSecondElapsed4(null, null);
					}
					return;
				case 1:
					if (QuarterSecondElapsed1 != null)
					{
						QuarterSecondElapsed1(null, null);
					}
					return;
				case 2:
					if (QuarterSecondElapsed2 != null)
					{
						QuarterSecondElapsed2(null, null);
					}
					return;
				case 3:
					if (QuarterSecondElapsed3 != null)
					{
						QuarterSecondElapsed3(null, null);
					}
					return;
				case 4:
					if (QuarterSecondElapsed4 != null)
					{
						QuarterSecondElapsed4(null, null);
					}
					return;
				default:
					return;
			}
		}
	}
}