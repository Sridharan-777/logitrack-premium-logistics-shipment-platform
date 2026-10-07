package com.logitrack.logistics;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
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
        String token = normalizeToken(call.getString("token"));
        if (apiUrl == null) {
            call.reject("A valid HTTPS API URL is required.");
            return;
        }
        if (token == null) {
            call.reject("A valid signed-in worker token is required.");
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
        String token = normalizeToken(call.getString("token"));
        if (apiUrl == null || token == null) {
            call.reject("The tracking request is incomplete. Sign in as a worker and try again.");
            return;
        }

        Intent intent = new Intent(getContext(), WorkerTrackingService.class);
        intent.setAction(WorkerTrackingService.ACTION_START);
        intent.putExtra(WorkerTrackingService.EXTRA_API_URL, apiUrl);
        intent.putExtra(WorkerTrackingService.EXTRA_WORKER_TOKEN, token);

        try {
            ContextCompat.startForegroundService(getContext(), intent);
            JSObject result = new JSObject();
            result.put("tracking", true);
            result.put("expiresAt", System.currentTimeMillis() + WorkerTrackingService.SESSION_DURATION_MILLIS);
            call.resolve(result);
        } catch (IllegalStateException | SecurityException exception) {
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

    private static String normalizeToken(String rawValue) {
        if (TextUtils.isEmpty(rawValue)) {
            return null;
        }

        String value = rawValue.trim();
        return value.length() > 8192 ? null : value;
    }
}
