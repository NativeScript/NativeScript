package com.tns;

import android.app.Activity;
import android.os.Bundle;

public class ErrorReportActivity extends Activity
{
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		new ErrorReport(this).buildUI();
	}

	@Override
	protected void onPause()
	{
		// the moment the error activity is not in the foreground we want to kill the process
		super.onPause();
		ErrorReport.killProcess(this);
	}
}
