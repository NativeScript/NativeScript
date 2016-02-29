package com.tns;

import java.io.Closeable;
import java.io.DataInputStream;
import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.LocalServerSocket;
import android.net.LocalSocket;
import android.util.Log;

public class NativeScriptSyncService
{
	private static String SYNC_ROOT_SOURCE_DIR = "/data/local/tmp/";
	private static final String SYNC_SOURCE_DIR = "/sync/";
	private static final String FULL_SYNC_SOURCE_DIR = "/fullsync/";
	private static final String REMOVED_SYNC_SOURCE_DIR = "/removedsync/";

	private static Logger logger;
	private final Context context;

	private final String syncPath;
	private final String fullSyncPath;
	private final String removedSyncPath;
	private final File fullSyncDir;
	private final File syncDir;
	private final File removedSyncDir;

	private LocalServerSocketThread localServerThread;
	private Thread localServerJavaThread;

	public NativeScriptSyncService(Logger logger, Context context)
	{
		this.logger = logger;
		this.context = context;

		syncPath = SYNC_ROOT_SOURCE_DIR + context.getPackageName() + SYNC_SOURCE_DIR;
		fullSyncPath = SYNC_ROOT_SOURCE_DIR + context.getPackageName() + FULL_SYNC_SOURCE_DIR;
		removedSyncPath = SYNC_ROOT_SOURCE_DIR + context.getPackageName() + REMOVED_SYNC_SOURCE_DIR;
		fullSyncDir = new File(fullSyncPath);
		syncDir = new File(syncPath);
		removedSyncDir = new File(removedSyncPath);
	}

	public void sync()
	{
		if (logger != null && logger.isEnabled())
		{
			logger.write("Sync is enabled:");
			logger.write("Sync path              : " + syncPath);
			logger.write("Full sync path         : " + fullSyncPath);
			logger.write("Removed files sync path: " + removedSyncPath);
		}

		if (fullSyncDir.exists())
		{
			executeFullSync(context, fullSyncDir);
			deleteRecursive(fullSyncDir);
			return;
		}

		if (syncDir.exists())
		{
			executePartialSync(context, syncDir);
			deleteRecursive(syncDir);
		}

		if (removedSyncDir.exists())
		{
			executeRemovedSync(context, removedSyncDir);
			deleteRecursive(removedSyncDir);
		}
	}

	private class LocalServerSocketThread implements Runnable
	{
		private volatile boolean running;
		private final String name;

		private ListenerWorker commThread;
		private LocalServerSocket serverSocket;

		public LocalServerSocketThread(String name)
		{
			this.name = name;
			this.running = false;
		}

		public void stop()
		{
			this.running = false;
			try
			{
				serverSocket.close();
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
		}

		public void run()
		{
			running = true;
			try
			{
				serverSocket = new LocalServerSocket(this.name);
				while (running)
				{
					LocalSocket socket = serverSocket.accept();
					commThread = new ListenerWorker(socket);
					new Thread(commThread).start();
				}
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
		}
	}

	private class ListenerWorker implements Runnable
	{
		private final DataInputStream input;
		private Closeable socket;
		private OutputStream output;

		public ListenerWorker(LocalSocket socket) throws IOException
		{
			this.socket = socket;
			input = new DataInputStream(socket.getInputStream());
			output = socket.getOutputStream();
		}

		public void run()
		{
			try
			{
				int length = input.readInt();
				input.readFully(new byte[length]); // ignore the payload
				executePartialSync(context, syncDir);
				executeRemovedSync(context, removedSyncDir);

				Platform.runScript(new File(NativeScriptSyncService.this.context.getFilesDir(), "internal/livesync.js"));
				try
				{
					output.write(1);
				}
				catch (IOException e)
				{
					e.printStackTrace();
				}
				socket.close();
			}
			catch (IOException e)
			{
				e.printStackTrace();
			}
		}
	}

	public void startServer()
	{
		localServerThread = new LocalServerSocketThread(context.getPackageName() + "-livesync");
		localServerJavaThread = new Thread(localServerThread);
		localServerJavaThread.start();
	}

	private void deleteRecursive(File fileOrDirectory)
	{

		if (fileOrDirectory.isDirectory())
		{
			for (File child : fileOrDirectory.listFiles())
			{
				deleteRecursive(child);
			}
		}

		fileOrDirectory.delete();
	}

	public static boolean isSyncEnabled(Context context)
	{
		int flags;
		boolean shouldExecuteSync = false;
		try
		{
			flags = context.getPackageManager().getPackageInfo(context.getPackageName(), 0).applicationInfo.flags;
			shouldExecuteSync = ((flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0);
		}
		catch (NameNotFoundException e)
		{
			e.printStackTrace();
			return false;
		}

		return shouldExecuteSync;
	}

	final FileFilter deletingFilesFilter = new FileFilter()
	{
		@Override
		public boolean accept(File pathname)
		{
			if (pathname.isDirectory())
			{
				return true;
			}

			boolean success = pathname.delete();
			if (!success)
			{
				logger.write("Syncing: file not deleted: " + pathname.getAbsolutePath().toString());
			}
			return false;
		}
	};

	private void deleteDir(File directory)
	{
		File[] subDirectories = directory.listFiles(deletingFilesFilter);
		if (subDirectories != null)
		{
			for (int i = 0; i < subDirectories.length; i++)
			{
				File subDir = subDirectories[i];
				deleteDir(subDir);
			}
		}

		boolean success = directory.delete();
		if (!success && directory.exists())
		{
			logger.write("Syncing: directory not deleted: " + directory.getAbsolutePath().toString());
		}
	}

	private void moveFiles(File sourceDir, String sourceRootAbsolutePath, String targetRootAbsolutePath)
	{
		File[] files = sourceDir.listFiles();

		if (files != null)
		{
			if (logger.isEnabled())
			{
				logger.write("Syncing total number of fiiles: " + files.length);
			}

			for (int i = 0; i < files.length; i++)
			{
				File file = files[i];
				if (file.isFile())
				{
					if (logger.isEnabled())
					{
						logger.write("Syncing: " + file.getAbsolutePath().toString());
					}

					String targetFilePath = file.getAbsolutePath().replace(sourceRootAbsolutePath, targetRootAbsolutePath);
					File targetFileDir = new File(targetFilePath);

					File targetParent = targetFileDir.getParentFile();
					if (targetParent != null)
					{
						targetParent.mkdirs();
					}

					boolean success = copyFile(file.getAbsolutePath(), targetFilePath);
					if (!success)
					{
						logger.write("Sync failed: " + file.getAbsolutePath().toString());
					}
				}
				else
				{
					moveFiles(file, sourceRootAbsolutePath, targetRootAbsolutePath);
				}
			}
		}
		else
		{
			if (logger.isEnabled())
			{
				logger.write("Can't move files. Source is empty.");
			}
		}
	}

	// this removes only the app directory from the device to preserve
	// any existing files in /files directory on the device
	private void executeFullSync(Context context, final File sourceDir)
	{
		String appPath = context.getFilesDir().getAbsolutePath() + "/app";
		final File appDir = new File(appPath);

		if (appDir.exists())
		{
			deleteDir(appDir);
			moveFiles(sourceDir, sourceDir.getAbsolutePath(), appDir.getAbsolutePath());
		}
	}

	private void executePartialSync(Context context, File sourceDir)
	{
		String appPath = context.getFilesDir().getAbsolutePath() + "/app";
		final File appDir = new File(appPath);

		if (!appDir.exists())
		{
			Log.e("TNS", "Application dir does not exists. Partial Sync failed. appDir: " + appPath);
			return;
		}

		if (logger.isEnabled())
		{
			logger.write("Syncing sourceDir " + sourceDir.getAbsolutePath() + " with " + appDir.getAbsolutePath());
		}

		moveFiles(sourceDir, sourceDir.getAbsolutePath(), appDir.getAbsolutePath());
	}

	private void deleteRemovedFiles(File sourceDir, String sourceRootAbsolutePath, String targetRootAbsolutePath)
	{
		if (!sourceDir.exists())
		{
			if (logger.isEnabled())
			{
				logger.write("Directory does not exist: " + sourceDir.getAbsolutePath());
			}
		}

		File[] files = sourceDir.listFiles();

		if (files != null)
		{
			for (int i = 0; i < files.length; i++)
			{
				File file = files[i];
				if (file.isFile())
				{
					if (logger.isEnabled())
					{
						logger.write("Syncing removed file: " + file.getAbsolutePath().toString());
					}

					String targetFilePath = file.getAbsolutePath().replace(sourceRootAbsolutePath, targetRootAbsolutePath);
					File targetFile = new File(targetFilePath);
					targetFile.delete();
				}
				else
				{
					deleteRemovedFiles(file, sourceRootAbsolutePath, targetRootAbsolutePath);
				}
			}
		}
	}

	private void executeRemovedSync(final Context context, final File sourceDir)
	{
		String appPath = context.getFilesDir().getAbsolutePath() + "/app";
		deleteRemovedFiles(sourceDir, sourceDir.getAbsolutePath(), appPath);
	}

	private boolean copyFile(String sourceFile, String destinationFile)
	{
		FileInputStream fis = null;
		FileOutputStream fos = null;

		try
		{
			fis = new FileInputStream(sourceFile);
			fos = new FileOutputStream(destinationFile, false);

			byte[] buffer = new byte[4096];
			int read = 0;

			while ((read = fis.read(buffer)) != -1)
			{
				fos.write(buffer, 0, read);
			}
		}
		catch (FileNotFoundException e)
		{
			logger.write("Error copying file " + sourceFile);
			e.printStackTrace();
			return false;
		}
		catch (IOException e)
		{
			logger.write("Error copying file " + sourceFile);
			e.printStackTrace();
			return false;
		}
		finally
		{
			try
			{
				if (fis != null)
				{
					fis.close();
				}
				if (fos != null)
				{
					fos.close();
				}
			}
			catch (IOException e)
			{
			}
		}

		return true;
	}
}
