package com.nativescript.widgetstestapp;

import android.content.Context;
import android.os.Build;
import android.util.Log;

import androidx.test.platform.app.InstrumentationRegistry;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.nativescript.widgets.File;
import org.nativescript.widgets.Utils;

import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Date;

import static org.junit.Assert.*;

/**
 * Instrumented test, which will execute on an Android device.
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
@RunWith(AndroidJUnit4.class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ExampleInstrumentedTest {
	private Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();

	private String getFilePath() throws IOException {
		if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
			return appContext.getFilesDir().getCanonicalPath() + "/test2.txt";
		}
		else {
			return appContext.getFilesDir().getCanonicalPath() + "/test2.txt";

		}
	}

	@Test
	public void a_useAppContext() {
		// Context of the app under test.
		assertEquals("com.nativescript.widgetstestapp", appContext.getPackageName());
	}

	@Test
	public void b_assetsExists() throws IOException {
		assertNotEquals(null, getFilePath());
	}
	@Test
	public void c_readAndWriteFile() throws Exception {
		String filePath = getFilePath();
		String content = "Hello I am new!";
		File.ensureFileExists(appContext,filePath, false);
		File.writeText(appContext,filePath, content, "UTF-8");
		assertEquals(content, Utils.getText(appContext, filePath, "UTF-8"));
	}

	@Test
	public void d_fileExists() throws IOException {
		assertEquals(true, File.fileExists(appContext, getFilePath()));
	}
	@Test
	public void d_fileLength() throws IOException {
		assertEquals(15, File.fileLength(appContext, getFilePath()));
	}
}
