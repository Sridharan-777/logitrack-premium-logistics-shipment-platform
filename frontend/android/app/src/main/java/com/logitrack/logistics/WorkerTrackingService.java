package com.logitrack.logistics;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.SystemClock;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicBoolean;

public class WorkerTrackingService extends Service {

    static final String ACTION_START = "com.logitrack.logistics.action.START_WORKER_TRACKING";
    static final String ACTION_STOP = "com.logitrack.logistics.action.STOP_WORKER_TRACKING";
    static final String EXTRA_API_URL = "worker_tracking_api_url";
    static final String EXTRA_TRACKING_CREDENTIAL = "worker_tracking_credential";
    static final String EXTRA_WORKER_ID = "worker_tracking_worker_id";
    static final String EXTRA_DEVICE_ID = "worker_tracking_device_id";
    static final String EXTRA_EXPIRES_AT = "worker_tracking_expires_at";

    private static final long UPDATE_INTERVAL_MILLIS = 8_000L;
    private static final long EXPIRY_CHECK_INTERVAL_MILLIS = 60_000L;
    private static final long MAX_RETRY_DELAY_MILLIS = 5L * 60L * 1000L;
    private static final long FORCE_STOP_DELAY_MILLIS = 5_000L;
    private static final int NOTIFICATION_ID = 2922;
    private static final String NOTIFICATION_CHANNEL_ID = "worker_location_tracking";

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final AtomicBoolean uploadInFlight = new AtomicBoolean(false);
    private FusedLocationProviderClient fusedLocationClient;
    private ExecutorService networkExecutor;
    private ExecutorService stopExecutor;
    private LocationCallback locationCallback;
    private String apiBaseUrl;
    private String locationEndpoint;
    private String trackingCredential;
    private String workerId;
    private String deviceId;
    private long expiresAtMillis;
    private long expiresAtElapsedRealtime;
    private boolean locationUpdatesActive;
    private volatile boolean stopping;
    private boolean stopFinished;
    private volatile long nextUploadAllowedAtMillis;
    private volatile int consecutiveUploadFailures;
    private volatile HttpURLConnection activeLocationConnection;
    private volatile HttpURLConnection activeStopConnection;

    private final Runnable expiryRunnable = new Runnable() {
        @Override
        public void run() {
            long remaining = expiresAtElapsedRealtime - SystemClock.elapsedRealtime();
            if (remaining <= 0L) {
                requestStop(true);
                return;
            }
            mainHandler.postDelayed(this, Math.min(remaining, EXPIRY_CHECK_INTERVAL_MILLIS));
        }
    };

    private final Runnable forceStopRunnable = this::finishStop;

    public static void stop(Context context) {
        Intent stopIntent = new Intent(context, WorkerTrackingService.class);
        stopIntent.setAction(ACTION_STOP);
        try {
            context.startService(stopIntent);
        } catch (IllegalStateException | SecurityException exception) {
            SecureTrackingStore.clear(context);
            context.stopService(new Intent(context, WorkerTrackingService.class));
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        networkExecutor = Executors.newSingleThreadExecutor();
        stopExecutor = Executors.newSingleThreadExecutor();
        createNotificationChannel();
        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult result) {
                Location location = result.getLastLocation();
                if (location == null || stopping) {
                    return;
                }
                if (SystemClock.elapsedRealtime() >= expiresAtElapsedRealtime) {
                    requestStop(true);
                    return;
                }
                uploadLocation(location);
            }
        };
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            SecureTrackingStore.Session restored = SecureTrackingStore.load(this);
            if (!activateSession(restored, false)) {
                requestStop(false);
                return START_NOT_STICKY;
            }
            return START_STICKY;
        }

        if (ACTION_STOP.equals(intent.getAction())) {
            restoreSensitiveFields(SecureTrackingStore.load(this));
            requestStop(true);
            return START_NOT_STICKY;
        }

        if (!ACTION_START.equals(intent.getAction()) || stopping) {
            requestStop(false);
            return START_NOT_STICKY;
        }

        SecureTrackingStore.Session requested = new SecureTrackingStore.Session(
            intent.getStringExtra(EXTRA_API_URL),
            intent.getStringExtra(EXTRA_TRACKING_CREDENTIAL),
            intent.getStringExtra(EXTRA_WORKER_ID),
            intent.getStringExtra(EXTRA_DEVICE_ID),
            intent.getLongExtra(EXTRA_EXPIRES_AT, 0L)
        );
        if (!requested.isValidAt(System.currentTimeMillis())) {
            requestStop(false);
            return START_NOT_STICKY;
        }

        SecureTrackingStore.Session existing = SecureTrackingStore.load(this);
        if (existing != null && !existing.workerId.equals(requested.workerId)) {
            if (!activateSession(existing, false)) {
                requestStop(false);
                return START_NOT_STICKY;
            }
            return START_STICKY;
        }

        if (!activateSession(requested, true)) {
            requestStop(false);
            return START_NOT_STICKY;
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        mainHandler.removeCallbacks(expiryRunnable);
        mainHandler.removeCallbacks(forceStopRunnable);
        stopLocationUpdates();
        disconnect(activeLocationConnection);
        disconnect(activeStopConnection);
        clearSensitiveMemory();
        if (networkExecutor != null) {
            networkExecutor.shutdownNow();
        }
        if (stopExecutor != null) {
            stopExecutor.shutdownNow();
        }
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private boolean activateSession(SecureTrackingStore.Session session, boolean persist) {
        long nowMillis = System.currentTimeMillis();
        if (session == null || !session.isValidAt(nowMillis) || stopping) {
            return false;
        }

        if (persist) {
            try {
                SecureTrackingStore.save(this, session);
            } catch (GeneralSecurityException exception) {
                return false;
            }
        }

        stopLocationUpdates();
        restoreSensitiveFields(session);
        long remainingMillis = session.expiresAtMillis - nowMillis;
        expiresAtElapsedRealtime = SystemClock.elapsedRealtime() + remainingMillis;
        nextUploadAllowedAtMillis = 0L;
        consecutiveUploadFailures = 0;

        startAsForegroundService();
        scheduleExpiryCheck();
        startLocationUpdates();
        return true;
    }

    private void restoreSensitiveFields(SecureTrackingStore.Session session) {
        if (session == null) {
            return;
        }
        apiBaseUrl = session.apiUrl;
        locationEndpoint = session.apiUrl + "/worker-locations/shift/device/location";
        trackingCredential = session.trackingCredential;
        workerId = session.workerId;
        deviceId = session.deviceId;
        expiresAtMillis = session.expiresAtMillis;
    }

    private void startAsForegroundService() {
        Notification notification = buildNotification();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private void startLocationUpdates() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestStop(true);
            return;
        }

        long duration = Math.max(1L, expiresAtElapsedRealtime - SystemClock.elapsedRealtime());
        LocationRequest request = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, UPDATE_INTERVAL_MILLIS)
            .setMinUpdateIntervalMillis(UPDATE_INTERVAL_MILLIS)
            .setMaxUpdateDelayMillis(UPDATE_INTERVAL_MILLIS)
            .setDurationMillis(duration)
            .build();

        try {
            locationUpdatesActive = true;
            fusedLocationClient
                .requestLocationUpdates(request, locationCallback, Looper.getMainLooper())
                .addOnFailureListener(ignored -> {
                    locationUpdatesActive = false;
                    requestStop(true);
                });
        } catch (SecurityException exception) {
            locationUpdatesActive = false;
            requestStop(true);
        }
    }

    private void stopLocationUpdates() {
        if (fusedLocationClient != null && locationCallback != null && locationUpdatesActive) {
            fusedLocationClient.removeLocationUpdates(locationCallback);
        }
        locationUpdatesActive = false;
    }

    private void uploadLocation(Location location) {
        long now = System.currentTimeMillis();
        if (
            stopping ||
            now < nextUploadAllowedAtMillis ||
            locationEndpoint == null ||
            trackingCredential == null ||
            deviceId == null ||
            networkExecutor == null ||
            networkExecutor.isShutdown()
        ) {
            return;
        }
        if (!uploadInFlight.compareAndSet(false, true)) {
            return;
        }

        final String endpoint = locationEndpoint;
        final String credential = trackingCredential;
        final String currentDeviceId = deviceId;
        final double latitude = location.getLatitude();
        final double longitude = location.getLongitude();
        final float accuracy = location.hasAccuracy() ? Math.max(0.0f, location.getAccuracy()) : 0.0f;
        final long timestamp = location.getTime() > 0L ? location.getTime() : now;

        try {
            networkExecutor.execute(() -> {
                try {
                    PostResult result = postLocation(
                        endpoint,
                        credential,
                        currentDeviceId,
                        latitude,
                        longitude,
                        accuracy,
                        timestamp
                    );
                    handleLocationResponse(result);
                } finally {
                    uploadInFlight.set(false);
                }
            });
        } catch (RejectedExecutionException exception) {
            uploadInFlight.set(false);
        }
    }

    private void handleLocationResponse(PostResult result) {
        if (stopping) {
            return;
        }

        int responseCode = result.responseCode;
        if (responseCode >= 200 && responseCode < 300) {
            consecutiveUploadFailures = 0;
            nextUploadAllowedAtMillis = 0L;
            return;
        }

        if (
            responseCode == HttpURLConnection.HTTP_UNAUTHORIZED ||
            responseCode == HttpURLConnection.HTTP_FORBIDDEN ||
            responseCode == HttpURLConnection.HTTP_CONFLICT ||
            responseCode == HttpURLConnection.HTTP_GONE
        ) {
            mainHandler.post(() -> requestStop(false));
            return;
        }

        if (responseCode == 429) {
            consecutiveUploadFailures = 0;
            long retryDelay = result.retryAfterMillis > 0L ? result.retryAfterMillis : UPDATE_INTERVAL_MILLIS;
            nextUploadAllowedAtMillis = System.currentTimeMillis() + Math.min(retryDelay, MAX_RETRY_DELAY_MILLIS);
            return;
        }

        if (responseCode == -1 || responseCode >= 500) {
            int failures = Math.min(consecutiveUploadFailures + 1, 6);
            consecutiveUploadFailures = failures;
            long retryDelay = UPDATE_INTERVAL_MILLIS * (1L << (failures - 1));
            nextUploadAllowedAtMillis = System.currentTimeMillis() + Math.min(retryDelay, MAX_RETRY_DELAY_MILLIS);
            return;
        }

        consecutiveUploadFailures = 0;
        nextUploadAllowedAtMillis = System.currentTimeMillis() + 60_000L;
    }

    private PostResult postLocation(
        String endpoint,
        String credential,
        String currentDeviceId,
        double latitude,
        double longitude,
        float accuracy,
        long timestamp
    ) {
        HttpURLConnection connection = null;
        try {
            JSONObject payload = new JSONObject();
            payload.put("latitude", latitude);
            payload.put("longitude", longitude);
            payload.put("accuracy", accuracy);
            payload.put("timestamp", timestamp);
            payload.put("deviceId", currentDeviceId);
            byte[] body = payload.toString().getBytes(StandardCharsets.UTF_8);

            connection = openPostConnection(endpoint, credential, body.length, 10_000);
            activeLocationConnection = connection;
            try (OutputStream output = connection.getOutputStream()) {
                output.write(body);
            }

            int responseCode = connection.getResponseCode();
            long retryAfterMillis = responseCode == 429 ? readRetryAfterMillis(connection) : 0L;
            return new PostResult(responseCode, retryAfterMillis);
        } catch (IOException | JSONException exception) {
            return new PostResult(-1, 0L);
        } finally {
            if (activeLocationConnection == connection) {
                activeLocationConnection = null;
            }
            disconnect(connection);
        }
    }

    private void requestStop(boolean notifyBackend) {
        if (stopping) {
            return;
        }
        stopping = true;
        mainHandler.removeCallbacks(expiryRunnable);
        stopLocationUpdates();
        disconnect(activeLocationConnection);
        stopForegroundCompat();

        final String stopEndpoint = apiBaseUrl == null ? null : apiBaseUrl + "/worker-locations/shift/device/stop";
        final String credential = trackingCredential;
        final String currentDeviceId = deviceId;
        if (
            notifyBackend &&
            stopEndpoint != null &&
            credential != null &&
            currentDeviceId != null &&
            stopExecutor != null &&
            !stopExecutor.isShutdown()
        ) {
            mainHandler.postDelayed(forceStopRunnable, FORCE_STOP_DELAY_MILLIS);
            try {
                stopExecutor.execute(() -> {
                    postStop(stopEndpoint, credential, currentDeviceId);
                    mainHandler.post(this::finishStop);
                });
                return;
            } catch (RejectedExecutionException ignored) {
                mainHandler.removeCallbacks(forceStopRunnable);
            }
        }

        finishStop();
    }

    private void postStop(String endpoint, String credential, String currentDeviceId) {
        HttpURLConnection connection = null;
        try {
            JSONObject payload = new JSONObject();
            payload.put("deviceId", currentDeviceId);
            byte[] body = payload.toString().getBytes(StandardCharsets.UTF_8);
            connection = openPostConnection(endpoint, credential, body.length, 2_000);
            activeStopConnection = connection;
            try (OutputStream output = connection.getOutputStream()) {
                output.write(body);
            }
            connection.getResponseCode();
        } catch (IOException | JSONException ignored) {
            // Local tracking must stop even when the best-effort server notification fails.
        } finally {
            if (activeStopConnection == connection) {
                activeStopConnection = null;
            }
            disconnect(connection);
        }
    }

    private HttpURLConnection openPostConnection(String endpoint, String credential, int bodyLength, int timeoutMillis) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(endpoint).openConnection();
        connection.setRequestMethod("POST");
        connection.setConnectTimeout(timeoutMillis);
        connection.setReadTimeout(timeoutMillis);
        connection.setDoOutput(true);
        connection.setRequestProperty("Authorization", "Bearer " + credential);
        connection.setRequestProperty("Content-Type", "application/json; charset=utf-8");
        connection.setRequestProperty("Accept", "application/json");
        connection.setFixedLengthStreamingMode(bodyLength);
        return connection;
    }

    private long readRetryAfterMillis(HttpURLConnection connection) {
        String retryAfterHeader = connection.getHeaderField("Retry-After");
        if (retryAfterHeader != null) {
            try {
                long seconds = Long.parseLong(retryAfterHeader.trim());
                if (seconds > 0L) {
                    return seconds * 1000L;
                }
            } catch (NumberFormatException ignored) {
                // Fall through to the JSON response body.
            }
        }

        try (InputStream input = connection.getErrorStream()) {
            if (input == null) {
                return 0L;
            }
            String responseBody = readLimitedUtf8(input, 4096);
            long retryAfterMillis = new JSONObject(responseBody).optLong("retryAfterMs", 0L);
            return Math.max(0L, retryAfterMillis);
        } catch (IOException | JSONException ignored) {
            return 0L;
        }
    }

    private static String readLimitedUtf8(InputStream input, int maximumBytes) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int remaining = maximumBytes;
        while (remaining > 0) {
            int count = input.read(buffer, 0, Math.min(buffer.length, remaining));
            if (count == -1) {
                break;
            }
            output.write(buffer, 0, count);
            remaining -= count;
        }
        return output.toString(StandardCharsets.UTF_8.name());
    }

    private void scheduleExpiryCheck() {
        mainHandler.removeCallbacks(expiryRunnable);
        mainHandler.post(expiryRunnable);
    }

    private void finishStop() {
        if (stopFinished) {
            return;
        }
        stopFinished = true;
        mainHandler.removeCallbacks(forceStopRunnable);
        disconnect(activeStopConnection);
        SecureTrackingStore.clear(this);
        clearSensitiveMemory();
        stopSelf();
    }

    private void stopForegroundCompat() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
    }

    private void clearSensitiveMemory() {
        trackingCredential = null;
        workerId = null;
        deviceId = null;
        apiBaseUrl = null;
        locationEndpoint = null;
        expiresAtMillis = 0L;
        expiresAtElapsedRealtime = 0L;
        nextUploadAllowedAtMillis = 0L;
        consecutiveUploadFailures = 0;
        uploadInFlight.set(false);
    }

    private static void disconnect(HttpURLConnection connection) {
        if (connection != null) {
            connection.disconnect();
        }
    }

    private Notification buildNotification() {
        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent openAppPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, WorkerTrackingService.class);
        stopIntent.setAction(ACTION_STOP);
        PendingIntent stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_location)
            .setContentTitle(getString(R.string.worker_tracking_notification_title))
            .setContentText(getString(R.string.worker_tracking_notification_text))
            .setStyle(new NotificationCompat.BigTextStyle().bigText(getString(R.string.worker_tracking_notification_text)))
            .setContentIntent(openAppPendingIntent)
            .addAction(0, getString(R.string.worker_tracking_stop), stopPendingIntent)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return;
        }

        NotificationChannel channel = new NotificationChannel(
            NOTIFICATION_CHANNEL_ID,
            getString(R.string.worker_tracking_channel_name),
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription(getString(R.string.worker_tracking_channel_description));
        channel.setShowBadge(false);
        NotificationManager manager = getSystemService(NotificationManager.class);
        manager.createNotificationChannel(channel);
    }

    private static final class PostResult {
        final int responseCode;
        final long retryAfterMillis;

        PostResult(int responseCode, long retryAfterMillis) {
            this.responseCode = responseCode;
            this.retryAfterMillis = retryAfterMillis;
        }
    }
}
