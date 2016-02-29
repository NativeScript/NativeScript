package com.tns;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;

import com.tns.Logger;
import com.tns.ExtractPolicy;
import com.tns.FileExtractor;

public class DefaultExtractPolicy implements ExtractPolicy
{
	private final Logger logger;

	private final static String ASSETS_THUMB_FILENAME = "assetsThumb";

	public DefaultExtractPolicy(Logger logger)
	{
		this.logger = logger;
	}

	public boolean shouldExtract(android.content.Context context)
	{
		String assetsThumb = generateAssetsThumb(context);
		if (assetsThumb != null)
		{
			String assetsThumbFilePath = context.getFilesDir().getPath() + File.separatorChar + ASSETS_THUMB_FILENAME;
			String oldAssetsThumb = getCachedAssetsThumb(assetsThumbFilePath);
			if (oldAssetsThumb == null || !assetsThumb.equals(oldAssetsThumb))
			{
				saveNewAssetsThumb(assetsThumb, assetsThumbFilePath);
				return true;
			}
		}

		return false;
	}

	public boolean forceOverwrite()
	{
		return true;
	}

	public FileExtractor extractor()
	{
		return null;
	}

	private String generateAssetsThumb(Context context)
	{
		try
		{
			PackageInfo packageInfo = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
			int code = packageInfo.versionCode;
			long updateTime = packageInfo.lastUpdateTime;
			return String.valueOf(updateTime) + "-" + String.valueOf(code);
		}
		catch (PackageManager.NameNotFoundException e)
		{
			logger.write("Error while getting current assets thumb");
			e.printStackTrace();
		}

		return null;
	}

	private String getCachedAssetsThumb(String assetsThumbFilePath)
	{
		try
		{
			File cachedThumbFile = new File(assetsThumbFilePath);
			if (cachedThumbFile.exists())
			{
				FileInputStream in = new FileInputStream(cachedThumbFile);
				BufferedReader reader = new BufferedReader(new InputStreamReader(in));
				String cachedThumb = reader.readLine();
				reader.close();
				in.close();
				return cachedThumb;
			}
		}
		catch (FileNotFoundException e)
		{
			logger.write("Error while getting current assets thumb");
			e.printStackTrace();
		}
		catch (IOException e)
		{
			logger.write("Error while getting current asstes thumb");
			e.printStackTrace();
		}

		return null;
	}

	private void saveNewAssetsThumb(String newThumb, String assetsThumbFile)
	{
		File cachedThumbFile = new File(assetsThumbFile);
		try
		{
			FileOutputStream out = new FileOutputStream(cachedThumbFile, false);
			BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(out));
			try
			{
				writer.write(newThumb);
				writer.newLine();
				writer.flush();
			}
			finally
			{
				writer.close();
				out.close();
			}
		}
		catch (FileNotFoundException e)
		{
			logger.write("Error while writting current assets thumb");
			e.printStackTrace();
		}
		catch (IOException e)
		{
			logger.write("Error while writting current assets thumb");
			e.printStackTrace();
		}
	}

}
