package com.nativescript.widgetstestapp;

import androidx.appcompat.app.AppCompatActivity;
import androidx.documentfile.provider.DocumentFile;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.nativescript.widgetstestapp.R;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.nativescript.widgets.File;
import org.nativescript.widgets.Utils;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);

		Button fileButton = findViewById(R.id.pick_file_button);
		fileButton.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				openFile();
			}
		});
		Button folderButton = findViewById(R.id.pick_folder_button);
		folderButton.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View view) {
				openFolder();
			}
		});
	}


	// Request code for selecting a PDF document.
	private static final int PICK_FILE = 2;
	private static final int PICK_FOLDER = 3;

	private void openFile() {
		Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
		intent.addCategory(Intent.CATEGORY_OPENABLE);
//		intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
//		intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
		intent.setType("*/*");

		startActivityForResult(intent, PICK_FILE);
	}

	private void openFolder() {
		Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE);
//		intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
//		intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
//		intent.addFlags(Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
//		intent.addFlags(Intent.FLAG_GRANT_PREFIX_URI_PERMISSION);

		startActivityForResult(intent, PICK_FOLDER);
	}

	@Override
	public void onActivityResult(int requestCode, int resultCode,
															 Intent resultData) {
		super.onActivityResult(requestCode, resultCode, resultData);
		if (requestCode == PICK_FILE
			&& resultCode == Activity.RESULT_OK) {
			// The result data contains a URI for the document or directory that
			// the user selected.
			Uri uri = null;
			if (resultData != null) {
				uri = resultData.getData();
				try {
					Log.d("Test", uri.toString() + " " + File.fileLength(this, uri.toString()) + " " + Utils.getText(this, uri.toString(), "UTF-8"));
				} catch (Exception exception) {
					exception.printStackTrace();
				}
				// Perform operations on the document using its URI.
			}
		} else if (requestCode == PICK_FOLDER
			&& resultCode == Activity.RESULT_OK) {
			Uri uri = null;
			if (resultData != null) {
				uri = resultData.getData();
//				DocumentFile tree = DocumentFile.fromTreeUri(this, uri);
//				DocumentFile[] files = tree.listFiles();
//				if(files.length > 0) {
//					try {
//						Log.d("Test1", files[0].getUri().toString() + " " + files[0].length() + " " + File.fileLength(this, files[0].getUri().toString()) + " " + Utils.getText(this, files[0].getUri().toString(), "UTF-8"));
//					} catch (Exception exception) {
//						exception.printStackTrace();
//					}
//				}
				JSONArray array = File.getEntities(this, uri.toString());
				Log.d("Test", uri.toString() + " " + File.fileLength(this, uri.toString()) + " " + array.toString());
				if (array.length() > 0) {
					try {
						Log.d("Test1", ((JSONObject) array.get(0)).getString("path") + " " + File.fileLength(this, ((JSONObject) array.get(0)).getString("path")) + " " + Utils.getText(this, ((JSONObject) array.get(0)).getString("path"), "UTF-8"));
					} catch (Exception exception) {
						exception.printStackTrace();
					}

				}
				// Perform operations on the document using its URI.
			}
		}
	}
}
