package com.logitrack.logistics;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.text.TextUtils;
import android.util.Base64;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/**
 * Stores the active native tracking handoff. The shift-scoped credential is
 * encrypted with an app-private AndroidKeyStore key; non-secret routing and
 * expiry metadata remains in MODE_PRIVATE preferences so the foreground
 * service can recover after ordinary process recreation.
 */
final class SecureTrackingStore {

    private static final String ANDROID_KEY_STORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "logitrack_worker_tracking_credential_v1";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String PREFERENCES = "worker_tracking_secure_session";
    private static final String KEY_CREDENTIAL_CIPHERTEXT = "credential_ciphertext";
    private static final String KEY_CREDENTIAL_IV = "credential_iv";
    private static final String KEY_API_URL = "api_url";
    private static final String KEY_WORKER_ID = "worker_id";
    private static final String KEY_DEVICE_ID = "device_id";
    private static final String KEY_EXPIRES_AT = "expires_at";

    private SecureTrackingStore() {}

    static final class Session {
        final String apiUrl;
        final String trackingCredential;
        final String workerId;
        final String deviceId;
        final long expiresAtMillis;

        Session(
            String apiUrl,
            String trackingCredential,
            String workerId,
            String deviceId,
            long expiresAtMillis
        ) {
            this.apiUrl = apiUrl;
            this.trackingCredential = trackingCredential;
            this.workerId = workerId;
            this.deviceId = deviceId;
            this.expiresAtMillis = expiresAtMillis;
        }

        boolean isValidAt(long nowMillis) {
            return !TextUtils.isEmpty(apiUrl)
                && !TextUtils.isEmpty(trackingCredential)
                && !TextUtils.isEmpty(workerId)
                && !TextUtils.isEmpty(deviceId)
                && expiresAtMillis > nowMillis;
        }
    }

    static void save(Context context, Session session) throws GeneralSecurityException {
        if (session == null || !session.isValidAt(System.currentTimeMillis())) {
            throw new GeneralSecurityException("Cannot store an invalid or expired tracking session.");
        }

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
        cipher.updateAAD(metadataAad(
            session.apiUrl,
            session.workerId,
            session.deviceId,
            session.expiresAtMillis
        ));
        byte[] encryptedCredential = cipher.doFinal(
            session.trackingCredential.getBytes(StandardCharsets.UTF_8)
        );

        SharedPreferences.Editor editor = preferences(context)
            .edit()
            .clear()
            .putString(
                KEY_CREDENTIAL_CIPHERTEXT,
                Base64.encodeToString(encryptedCredential, Base64.NO_WRAP)
            )
            .putString(
                KEY_CREDENTIAL_IV,
                Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP)
            )
            .putString(KEY_API_URL, session.apiUrl)
            .putString(KEY_WORKER_ID, session.workerId)
            .putString(KEY_DEVICE_ID, session.deviceId)
            .putLong(KEY_EXPIRES_AT, session.expiresAtMillis);

        if (!editor.commit()) {
            throw new GeneralSecurityException("Could not persist the tracking session.");
        }
    }

    static Session load(Context context) {
        SharedPreferences preferences = preferences(context);
        String ciphertext = preferences.getString(KEY_CREDENTIAL_CIPHERTEXT, null);
        String iv = preferences.getString(KEY_CREDENTIAL_IV, null);
        String apiUrl = preferences.getString(KEY_API_URL, null);
        String workerId = preferences.getString(KEY_WORKER_ID, null);
        String deviceId = preferences.getString(KEY_DEVICE_ID, null);
        long expiresAtMillis = preferences.getLong(KEY_EXPIRES_AT, 0L);

        if (
            TextUtils.isEmpty(ciphertext)
                || TextUtils.isEmpty(iv)
                || TextUtils.isEmpty(apiUrl)
                || TextUtils.isEmpty(workerId)
                || TextUtils.isEmpty(deviceId)
                || expiresAtMillis <= 0L
        ) {
            clear(context);
            return null;
        }

        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(
                Cipher.DECRYPT_MODE,
                getOrCreateKey(),
                new GCMParameterSpec(128, Base64.decode(iv, Base64.NO_WRAP))
            );
            cipher.updateAAD(metadataAad(
                apiUrl,
                workerId,
                deviceId,
                expiresAtMillis
            ));
            byte[] plaintext = cipher.doFinal(Base64.decode(ciphertext, Base64.NO_WRAP));
            Session session = new Session(
                apiUrl,
                new String(plaintext, StandardCharsets.UTF_8),
                workerId,
                deviceId,
                expiresAtMillis
            );
            if (!session.isValidAt(System.currentTimeMillis())) {
                clear(context);
                return null;
            }
            return session;
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            clear(context);
            return null;
        }
    }

    static void clear(Context context) {
        preferences(context).edit().clear().commit();
    }

    private static SharedPreferences preferences(Context context) {
        return context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE);
    }

    private static byte[] metadataAad(
        String apiUrl,
        String workerId,
        String deviceId,
        long expiresAtMillis
    ) {
        String metadata = apiUrl
            + "\n" + workerId
            + "\n" + deviceId
            + "\n" + expiresAtMillis;
        return metadata.getBytes(StandardCharsets.UTF_8);
    }

    private static SecretKey getOrCreateKey() throws GeneralSecurityException {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEY_STORE);
        try {
            keyStore.load(null);
        } catch (java.io.IOException exception) {
            throw new GeneralSecurityException("Could not open AndroidKeyStore.", exception);
        }

        if (keyStore.containsAlias(KEY_ALIAS)) {
            java.security.Key key = keyStore.getKey(KEY_ALIAS, null);
            if (key instanceof SecretKey) {
                return (SecretKey) key;
            }
            keyStore.deleteEntry(KEY_ALIAS);
        }

        KeyGenerator generator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            ANDROID_KEY_STORE
        );
        generator.init(
            new KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .setUserAuthenticationRequired(false)
                .build()
        );
        return generator.generateKey();
    }
}
