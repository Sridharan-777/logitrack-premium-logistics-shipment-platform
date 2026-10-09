package com.logitrack.logistics;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.text.TextUtils;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@CapacitorPlugin(
    name = "WorkerTracking",
    permissions = {
        @Permission(
            alias = WorkerTrackingPlugin.LOCATION_PERMISSION,
            strings = { Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION }
        ),
        @Permission(alias = WorkerTrackingPlugin.NOTIFICATION_PERMISSION, strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class WorkerTrackingPlugin extends Plugin {

    static final String LOCATION_PERMISSION = "location";
    static final String NOTIFICATION_PERMISSION = "notifications";

    @PluginMethod
    public void startTracking(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null || activity.isFinishing() || !activity.hasWindowFocus()) {
            call.reject("Open the worker screen and start location sharing from the visible Start button.");
            return;
        }

        String apiUrl = normalizeApiUrl(call.getString("apiUrl"));
        String trackingCredential = normalizeTrackingCredential(call.getString("trackingCredential"));
        String workerId = normalizeIdentifier(call.getString("workerId"));
        Long expiresAtMillis = call.getLong("expiresAt");
        String deviceId = createStableDeviceId();
        if (apiUrl == null) {
            call.reject("A valid HTTPS API URL is required.");
            return;
        }
        if (trackingCredential == null) {
            call.reject("A valid shift-scoped tracking credential is required.");
            return;
        }
        if (workerId == null) {
            call.reject("A valid worker identifier is required.");
            return;
        }
        if (expiresAtMillis == null || expiresAtMillis <= System.currentTimeMillis()) {
            call.reject("The tracking shift has already expired.");
            return;
        }
        if (deviceId == null) {
            call.reject("This Android device could not be identified securely.");
            return;
        }

        SecureTrackingStore.Session activeSession = SecureTrackingStore.load(getContext());
        if (activeSession != null && !activeSession.workerId.equals(workerId)) {
            call.reject("Another worker already has active tracking on this device. Stop it before switching accounts.");
            return;
        }

        if (getPermissionState(LOCATION_PERMISSION) != PermissionState.GRANTED) {
            requestPermissionForAlias(LOCATION_PERMISSION, call, "locationPermissionCallback");
            return;
        }

        requestNotificationOrStart(call);
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        if (getPermissionState(LOCATION_PERMISSION) != PermissionState.GRANTED) {
            call.reject("Precise location permission is required to track an active delivery.");
            return;
        }

        requestNotificationOrStart(call);
    }

    private void requestNotificationOrStart(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && getPermissionState(NOTIFICATION_PERMISSION) != PermissionState.GRANTED) {
            requestPermissionForAlias(NOTIFICATION_PERMISSION, call, "notificationPermissionCallback");
            return;
        }

        launchTrackingService(call);
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && getPermissionState(NOTIFICATION_PERMISSION) != PermissionState.GRANTED) {
            call.reject("Notification permission is required so location sharing always remains visible to the worker.");
            return;
        }

        launchTrackingService(call);
    }

    private void launchTrackingService(PluginCall call) {
        String apiUrl = normalizeApiUrl(call.getString("apiUrl"));
        String trackingCredential = normalizeTrackingCredential(call.getString("trackingCredential"));
        String workerId = normalizeIdentifier(call.getString("workerId"));
        Long expiresAtMillis = call.getLong("expiresAt");
        String deviceId = createStableDeviceId();
        if (
            apiUrl == null
                || trackingCredential == null
                || workerId == null
                || deviceId == null
                || expiresAtMillis == null
                || expiresAtMillis <= System.currentTimeMillis()
        ) {
            call.reject("The tracking request is incomplete or expired. Sign in as a worker and try again.");
            return;
        }

        SecureTrackingStore.Session activeSession = SecureTrackingStore.load(getContext());
        if (activeSession != null && !activeSession.workerId.equals(workerId)) {
            call.reject("Another worker already has active tracking on this device. Stop it before switching accounts.");
            return;
        }

        SecureTrackingStore.Session session = new SecureTrackingStore.Session(
            apiUrl,
            trackingCredential,
            workerId,
            deviceId,
            expiresAtMillis
        );
        try {
            SecureTrackingStore.save(getContext(), session);
        } catch (GeneralSecurityException exception) {
            call.reject("Android could not protect the tracking credential on this device.");
            return;
        }

        Intent intent = new Intent(getContext(), WorkerTrackingService.class);
        intent.setAction(WorkerTrackingService.ACTION_START);
        intent.putExtra(WorkerTrackingService.EXTRA_API_URL, apiUrl);
        intent.putExtra(WorkerTrackingService.EXTRA_TRACKING_CREDENTIAL, trackingCredential);
        intent.putExtra(WorkerTrackingService.EXTRA_WORKER_ID, workerId);
        intent.putExtra(WorkerTrackingService.EXTRA_DEVICE_ID, deviceId);
        intent.putExtra(WorkerTrackingService.EXTRA_EXPIRES_AT, expiresAtMillis);

        try {
            ContextCompat.startForegroundService(getContext(), intent);
            JSObject result = new JSObject();
            result.put("tracking", true);
            result.put("workerId", workerId);
            result.put("deviceId", deviceId);
            result.put("expiresAt", expiresAtMillis);
            call.resolve(result);
        } catch (IllegalStateException | SecurityException exception) {
            SecureTrackingStore.clear(getContext());
            call.reject("Location sharing could not start. Keep LogiTrack visible and try again.");
        }
    }

    @PluginMethod
    public void stopTracking(PluginCall call) {
        WorkerTrackingService.stop(getContext());
        JSObject result = new JSObject();
        result.put("tracking", false);
        call.resolve(result);
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        SecureTrackingStore.Session session = SecureTrackingStore.load(getContext());
        JSObject result = new JSObject();
        result.put("tracking", session != null);
        result.put("workerId", session == null ? "" : session.workerId);
        result.put("deviceId", session == null ? "" : session.deviceId);
        result.put("expiresAt", session == null ? 0L : session.expiresAtMillis);
        call.resolve(result);
    }

    private static String normalizeApiUrl(String rawValue) {
        if (TextUtils.isEmpty(rawValue)) {
            return null;
        }

        String value = rawValue.trim();
        while (value.endsWith("/")) {
            value = value.substring(0, value.length() - 1);
        }

        if (value.length() == 0 || value.length() > 2048) {
            return null;
        }

        Uri uri = Uri.parse(value);
        if (!"https".equalsIgnoreCase(uri.getScheme()) || TextUtils.isEmpty(uri.getHost())) {
            return null;
        }
        if (uri.getUserInfo() != null || uri.getQuery() != null || uri.getFragment() != null) {
            return null;
        }

        return value;
    }

    private static String normalizeTrackingCredential(String rawValue) {
        if (TextUtils.isEmpty(rawValue)) {
            return null;
        }

        String value = rawValue.trim();
        return value.length() == 0 || value.length() > 8192 ? null : value;
    }

    private static String normalizeIdentifier(String rawValue) {
        if (TextUtils.isEmpty(rawValue)) {
            return null;
        }

        String value = rawValue.trim();
        if (value.length() == 0 || value.length() > 128 || !value.matches("[A-Za-z0-9._:-]+")) {
            return null;
        }
        return value;
    }

    private String createStableDeviceId() {
        String androidId = Settings.Secure.getString(
            getContext().getContentResolver(),
            Settings.Secure.ANDROID_ID
        );
        if (TextUtils.isEmpty(androidId)) {
            return null;
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(
                (getContext().getPackageName() + ":" + androidId)
                    .getBytes(StandardCharsets.UTF_8)
            );
            StringBuilder result = new StringBuilder("android-");
            for (byte value : hash) {
                int unsigned = value & 0xff;
                result.append(Character.forDigit(unsigned >>> 4, 16));
                result.append(Character.forDigit(unsigned & 0x0f, 16));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            return null;
        }
    }
}
