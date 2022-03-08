package org.nativescript.widgetsdemo;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import android.Manifest;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;

import org.nativescript.widgets.filesystem.AsyncCallback;
import org.nativescript.widgets.filesystem.FileDirent;
import org.nativescript.widgets.filesystem.FileStat;
import org.nativescript.widgets.filesystem.FileSystem;
import org.nativescript.widgets.filesystem.Constants;
import org.nativescript.widgets.filesystem.FsWatcher;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Arrays;

public class MainActivity extends AppCompatActivity {
	static final String TAG = "com.test";

	void log(Object object) {
		Log.d(TAG, " " + object);
	}

	FsWatcher watcher;
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
//		ContentValues contentValues = new ContentValues();
//		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
//			contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, "Documents/NS/thing/");
//		}
//
//		contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, "help.txt");
//
//		// /Images
//		Uri uri = getContentResolver().insert(MediaStore.Files.getContentUri("external"), contentValues);
//
//		try {
//			ParcelFileDescriptor fd = getContentResolver().openFileDescriptor(uri, "rwt");
//			FileSystem.writeSync(fd.getFd(), "Testing", "", -1);
//		} catch (FileNotFoundException e) {
//			e.printStackTrace();
//		} catch (Exception e) {
//			e.printStackTrace();
//		}

		//open();
		//access();
		//appendFileBytes();
		//appendFileString();
		//copyFile();
		//exists();
		//fstat();
		//readdir();
		//readdirPaths();
		//readFile();
		//readFiles();
		//readv();
		watch();
	}

	void open() {
		int flags = Constants.O_RDONLY | Constants.O_CREAT | Constants.O_WRONLY;
		FileSystem.open(
			new File(getCacheDir(), "test1.txt").getAbsolutePath(), flags, 0, new AsyncCallback<Integer>() {
				@Override
				public void onSuccess(Integer result) {
					log("onSuccess: " + result);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			});
	}

	void access() {
		FileSystem.access(
			new File(getFilesDir(), "test.txt").getAbsolutePath(), Constants.R_OK, new AsyncCallback<Void>() {
				@Override
				public void onSuccess(Void result) {
					log("onSuccess: " + result);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			});
	}

	void exists() {
		FileSystem.exists(
			new File(getFilesDir(), "test.txt").getAbsolutePath(), new AsyncCallback<Boolean>() {
				@Override
				public void onSuccess(Boolean result) {
					log("onSuccess: " + result);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			});
	}

	void appendFileBytes() {
		int flags = Constants.O_RDONLY | Constants.O_CREAT | Constants.O_WRONLY;
		FileSystem.open(
			new File(getFilesDir(), "test.txt").getAbsolutePath(), flags, 0, new AsyncCallback<Integer>() {
				@Override
				public void onSuccess(Integer result) {
					log("onSuccess: " + result);
					String text = "Append Files Bytes";
					FileSystem.appendFile(
						result, text.getBytes(), new AsyncCallback<Void>() {
							@Override
							public void onSuccess(Void result) {
								log("append successful");
							}

							@Override
							public void onError(Object error) {
								log("append error: " + error);
							}
						}
					);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			});
	}

	void appendFileString() {
		int flags = Constants.O_RDONLY | Constants.O_CREAT | Constants.O_WRONLY;
		FileSystem.open(
			new File(getFilesDir(), "test.txt").getAbsolutePath(), flags, 0, new AsyncCallback<Integer>() {
				@Override
				public void onSuccess(Integer result) {
					log("onSuccess: " + result);
					String text = "Append Files String";
					FileSystem.appendFile(
						result, text, new AsyncCallback<Void>() {
							@Override
							public void onSuccess(Void result) {
								log("append successful");
							}

							@Override
							public void onError(Object error) {
								log("append error: " + error);
							}
						}
					);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			});
	}

	void copyFile() {
		FileSystem.copyFile(
			new File(getFilesDir(), "test.txt").getAbsolutePath(),
			new File(getFilesDir(), "test_copy.txt").getAbsolutePath(),
			Constants.COPYFILE_EXCL,
			new AsyncCallback<Void>() {
				@Override
				public void onSuccess(Void result) {
					log("onSuccess: " + result);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			}
		);
	}

	void fstat() {
		int flags = Constants.O_RDONLY;
		FileSystem.open(
			new File(getFilesDir(), "test.txt").getAbsolutePath(), flags, 0, new AsyncCallback<Integer>() {
				@Override
				public void onSuccess(Integer result) {
					log("onSuccess: " + result);
					FileSystem.fstat(
						result, new AsyncCallback<FileStat>() {
							@Override
							public void onSuccess(FileStat result) {
								log("fstat successful: " + result);
							}

							@Override
							public void onError(Object error) {
								log("append error: " + error);
							}
						}
					);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			});
	}

	void readdir() {
		FileSystem.readdir(getFilesDir().getAbsolutePath(), "", true, new AsyncCallback<Object[]>() {
			@Override
			public void onSuccess(Object[] result) {
				for (Object res : result) {
					FileDirent dirent = (FileDirent) res;
					log("onSuccess item name: " + dirent.getName());
					log("onSuccess item isFile: " + dirent.isFile());
				}
				log("onSuccess: " + Arrays.toString(result));
			}

			@Override
			public void onError(Object error) {
				log("onError: " + error);
			}
		});
	}

	void readdirPaths() {
		FileSystem.readdir(getFilesDir().getAbsolutePath(), "", false, new AsyncCallback<Object[]>() {
			@Override
			public void onSuccess(Object[] result) {
				log("onSuccess: " + result);
				for (Object res : result) {
					String ret = (String) res;
					log("onSuccess: path" + ret);
				}
			}

			@Override
			public void onError(Object error) {
				log("onError: " + error);
			}
		});
	}

	void readFile() {
		FileSystem.readFile(new File(getFilesDir(), "test.txt").getAbsolutePath(), Constants.O_RDONLY, new AsyncCallback<ByteBuffer>() {
			@Override
			public void onSuccess(ByteBuffer result) {
				byte[] buf = new byte[result.remaining()];
				result.get(buf);
				log("onSuccess: " + new String(buf));
				System.gc();
			}

			@Override
			public void onError(Object error) {
				log("onError: " + error);
			}
		});
	}

	void readFiles() {
		int max = 10;
		final String path = new File(getFilesDir(), "Big_Buck_Bunny_1080_10s_30MB.mp4").getAbsolutePath();
		for (int i = 0; i < max; i++) {
			int finalI = i;
			FileSystem.readFile(path, Constants.O_RDONLY, new AsyncCallback<ByteBuffer>() {
				@Override
				public void onSuccess(ByteBuffer result) {
					log("onSuccess: read count" + finalI);
				}

				@Override
				public void onError(Object error) {
					log("onError: " + error);
				}
			});
		}
	}

	void readv() {
		FileSystem.open(new File(getFilesDir(), "test.txt").getAbsolutePath(), Constants.O_RDONLY, 0, new AsyncCallback<Integer>() {
			@Override
			public void onSuccess(Integer result) {
				try {
					final FileStat stat = FileSystem.fstatSync(result);
					final ByteBuffer buffer = ByteBuffer.allocateDirect((int) stat.getSize());
					buffer.order(ByteOrder.nativeOrder());
					ByteBuffer[] buffers = new ByteBuffer[]{buffer};
					FileSystem.readv(result, buffers, -1, new AsyncCallback<Long>() {
						@Override
						public void onSuccess(Long result) {
							log("onSuccess readv:" + result);
							byte[] buf = new byte[(int) stat.getSize()];
							buffer.get(buf);
							log("onSuccess readv: data .....  " + new String(buf));
						}

						@Override
						public void onError(Object error) {
							log("onError readv:" + error);
						}
					});
				} catch (Exception e) {
					e.printStackTrace();
				}
			}

			@Override
			public void onError(Object error) {
				log("onError: " + error);
			}
		});
	}

	void watch() {
		watcher = FileSystem.watch(getFilesDir().getAbsolutePath(), true, true, "", new AsyncCallback<FsWatcher.Event>() {
			@Override
			public void onSuccess(FsWatcher.Event result) {
				log("onSuccess watch:");
				log(result.getEventType());
				log(result.getFileName());
			}

			@Override
			public void onError(Object error) {

			}
		});
	}

	void requestPermission() {
		ActivityResultLauncher<String> launcher = registerForActivityResult(
			new ActivityResultContracts.RequestPermission(), granted -> {

			}
		);

		launcher.launch(
			Manifest.permission.READ_EXTERNAL_STORAGE
		);
	}

	void openDownloadsFile() {
		String path = "";
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
			Cursor cursor = getContentResolver().query(
				MediaStore.Downloads.EXTERNAL_CONTENT_URI, new String[]{
					MediaStore.MediaColumns._ID,
					MediaStore.MediaColumns.DISPLAY_NAME
				},
				MediaStore.MediaColumns.DISPLAY_NAME + "=? ",
				new String[]{
					"test_file_1.txt"
				}, null
			);

			boolean exists = false;
			while (!cursor.isClosed() && cursor.moveToNext()) {
				int index = cursor.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME);
				String name = cursor.getString(index);
				int id_col = cursor.getColumnIndex(MediaStore.MediaColumns._ID);
				int id = cursor.getInt(id_col);
				if (name.equals("test_file_1.txt")) {
					exists = true;
					cursor.close();
					path = Uri.withAppendedPath(MediaStore.Downloads.EXTERNAL_CONTENT_URI, "" + id).toString();
				}

			}

			if (!exists) {
				ContentValues values = new ContentValues();
				values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
				values.put(MediaStore.MediaColumns.DISPLAY_NAME, "test_file_1.txt");
				values.put(MediaStore.MediaColumns.MIME_TYPE, "text/plain");
				Uri uri = getContentResolver().insert(
					MediaStore.Downloads.EXTERNAL_CONTENT_URI, values
				);
				path = uri.toString();
			}
		} else {
			path = new File(Environment.getExternalStoragePublicDirectory(
				Environment.DIRECTORY_DOWNLOADS
			), "NS/test_file_1.txt").getAbsolutePath();
		}

		Log.d("com.test", "uri " + path);
		String text = "Osei Fortune";
		int size = 0;

		try {
			size = text.getBytes("UTF8").length;
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		int finalSize = size;
		String finalPath = path;

		//		FileSystem.open(this, path, "w+", "", new FileSystem.Callback<FileSystem.FileHandle>() {
//			@Override
//			public void onSuccess(FileSystem.FileHandle handle) {
//				log(handle);
//				handle.appendFile(text, "", new FileSystem.Callback<Void>() {
//					@Override
//					public void onSuccess(Void object) {
//						log("Done");
//						byte[] buf = new byte[finalSize];
//						handle.read(buf, 0, finalSize, 0, new FileSystem.Callback<Long>() {
//							@Override
//							public void onSuccess(Long object) {
//								log("size read: " + object);
//
//								try {
//									log(new String(buf, "UTF8"));
//								} catch (UnsupportedEncodingException e) {
//									e.printStackTrace();
//								}
//
//								handle.stat(new FileSystem.Callback<String>() {
//									@Override
//									public void onSuccess(String object) {
//										log("stat: " + object);
//										handle.close(new FileSystem.Callback<Void>() {
//											@Override
//											public void onSuccess(Void object) {
//												log("file closed");
//												//FileSystem.unlinkSync(getBaseContext(), finalPath);
//											}
//
//											@Override
//											public void onError(Exception error) {
//												log("file close error: " + error);
//											}
//										});
//									}
//
//									@Override
//									public void onError(Exception error) {
//										log("stat error: " + error);
//									}
//								});
//
//							}
//
//							@Override
//							public void onError(Exception error) {
//								log("read error: " + error);
//							}
//						});
//					}
//
//					@Override
//					public void onError(Exception error) {
//						log(error);
//					}
//				});
//			}
//
//			@Override
//			public void onError(Exception error) {
//				log(error);
//			}
//		});


		createAnCopyTempFile();
	}

	void createAnCopyTempFile() {
//		try {
//			String data = "Hello World!!";
//			String handle1Path = new File(
//				getCacheDir(), "ns_copy_test1.txt"
//			).getAbsolutePath();
//
//			FileSystem.FileHandle handle1 = FileSystem.openSync(
//				this, handle1Path, "w+", ""
//			);
//
//			String handle2Path = new File(
//				getCacheDir(), "ns_copy_test1_clone.txt"
//			).getAbsolutePath();
//
//			FileSystem.FileHandle handle2 = FileSystem.openSync(
//				this, handle2Path, "w+", ""
//			);
//
//
//			FileSystem.appendFileSync(handle1, data, "");
//
//			FileSystem.copyFileSync(handle1Path, handle2Path);
//
//			byte[] buf = new byte[data.getBytes().length];
//
//			FileSystem.readSync(handle2, buf,0, buf.length, 0);
//
//			log(new String(buf));
//
//		} catch (Exception e) {
//			e.printStackTrace();
//		}
	}
}
