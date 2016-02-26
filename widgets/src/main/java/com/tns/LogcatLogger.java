package com.tns;

import android.content.Context;
import android.util.Log;

public final class LogcatLogger implements Logger
{
	private final static String DEFAULT_LOG_TAG = "TNS.Java";
	
	private boolean enabled;

	public LogcatLogger(boolean isEnabled, Context context)
	{
		this.enabled = isEnabled;

		if (!isEnabled)
		{
			this.initLogging(context);
		}
	}

	public final boolean isEnabled()
	{
		return enabled;
	}

	public final void setEnabled(boolean isEnabled)
	{
		enabled = isEnabled;
	}

	public final void write(String msg)
	{
		Log.d(DEFAULT_LOG_TAG, msg);
	}

	public final void write(String tag, String msg)
	{
		Log.d(tag, msg);
	}

	private void initLogging(Context context)
	{
		boolean isDebuggableApp = JsDebugger.isDebuggableApp(context);

		if (isDebuggableApp)
		{
			String verboseLoggingProp = Util.readSystemProperty("nativescript.verbose.logging");

			if (Util.isPositive(verboseLoggingProp))
			{
				setEnabled(true);
			}
		}
	}
}
