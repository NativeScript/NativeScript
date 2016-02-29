package com.tns;

import java.io.File;

import android.app.Application;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

public class RuntimeHelper
{
	private final Application app;
	
	public RuntimeHelper(Application app)
	{
		this.app = app;
	}
	
	// hasErrorIntent tells you if there was an event (with an uncaught exception) raised from ErrorReport
	public boolean hasErrorIntent()
	{
		boolean hasErrorIntent = false;
		
		try
		{
			 //empty file just to check if there was a raised uncaught error by ErrorReport
			File errFile = new File(app.getFilesDir(), ErrorReport.ERROR_FILE_NAME);
			
			if (errFile.exists())
			{
				errFile.delete();
				hasErrorIntent = true;
			}
		}
		catch (Exception e)
		{
			Log.d(logTag, e.getMessage());
		}
		
		return hasErrorIntent;
	}
	
	public void initRuntime()
	{
		System.loadLibrary("NativeScript");
		
		Logger logger = new LogcatLogger(false, app);
		
		boolean showErrorIntent = hasErrorIntent();
		if (!showErrorIntent)
		{
			Thread.UncaughtExceptionHandler exHandler = new NativeScriptUncaughtExceptionHandler(logger, app);

			Thread.setDefaultUncaughtExceptionHandler(exHandler);
			
			Async.Http.setApplicationContext(this.app);
			
			ExtractPolicy extractPolicy = new DefaultExtractPolicy(logger);
			boolean skipAssetExtraction = Util.runPlugin(logger, app);
			if (!skipAssetExtraction)
			{
				new AssetExtractor(null, logger).extractAssets(app, extractPolicy);
			}
			
			if (NativeScriptSyncService.isSyncEnabled(this.app))
			{
				NativeScriptSyncService syncService = new NativeScriptSyncService(logger, this.app);

				syncService.sync();
				syncService.startServer();

				// preserve this instance as strong reference
				// do not preserve in NativeScriptApplication field inorder to make the code more portable
				Platform.getOrCreateJavaObjectID(syncService);
			}
			else
			{
				if (logger.isEnabled())
				{
					logger.write("NativeScript LiveSync is not enabled.");
				}
			}
			String appName = app.getPackageName();
			File rootDir = new File(app.getApplicationInfo().dataDir);
			File appDir = app.getFilesDir();

			ClassLoader classLoader = app.getClassLoader();
			File dexDir = new File(rootDir, "code_cache/secondary-dexes");
			String dexThumb = null;
			try
			{
				dexThumb = Util.getDexThumb(app);
			}
			catch (NameNotFoundException e)
			{
				if (logger.isEnabled()) logger.write("Error while getting current proxy thumb");
				e.printStackTrace();
			}
			ThreadScheduler workThreadScheduler = new WorkThreadScheduler(new Handler(Looper.getMainLooper()));
			Platform.init(this.app, workThreadScheduler, logger, appName, null, rootDir, appDir, classLoader, dexDir, dexThumb);
			Platform.runScript(new File(appDir, "internal/ts_helpers.js"));
			Platform.run();
		}
	}
	
	private final String logTag = "MyApp";
}
