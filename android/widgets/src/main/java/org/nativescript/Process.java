package org.nativescript;

import android.os.SystemClock;
import android.util.Log;

import java.io.BufferedReader;
import java.io.FileReader;

/**
 * Created by cankov on 15/05/2017.
 */
public class Process {
    static long startTime = -1;

    public static long getStartTime() {
        if (startTime != -1) {
            return startTime;
        }

        try {
            int pid = android.os.Process.myPid();
            final String path = "/proc/" + pid + "/stat";
            final BufferedReader reader = new BufferedReader(new FileReader(path));
            final String stat;
            try {
                stat = reader.readLine();
            } finally {
                reader.close();
            }
            final String field2End = ") ";
            final String fieldSep = " ";
            final int fieldStartTime = 20;
            final int msInSec = 1000;

            final String[] fields = stat.substring(stat.lastIndexOf(field2End)).split(fieldSep);
            final long t = Long.parseLong(fields[fieldStartTime]);
            int tckName;
            try {
                tckName = Class.forName("android.system.OsConstants").getField("_SC_CLK_TCK").getInt(null);
            } catch (ClassNotFoundException e) {
                tckName = Class.forName("libcore.io.OsConstants").getField("_SC_CLK_TCK").getInt(null);
            }
            final Object os = Class.forName("libcore.io.Libcore").getField("os").get(null);
            final long tck = (Long) os.getClass().getMethod("sysconf", Integer.TYPE).invoke(os, tckName);
            startTime = t * msInSec / tck;
        } catch (Exception e) {
            Log.v("JS", "Failed to get process start time. Using the current time as start time. Error: " + e);
            startTime = SystemClock.elapsedRealtime();
        }

        return startTime;
    }

    public static long getUpTime() {
        long startTime = getStartTime();
        long currentTime = SystemClock.elapsedRealtime();
        return currentTime - startTime;
    }
}
