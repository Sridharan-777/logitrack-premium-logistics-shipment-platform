package com.logitrack.logistics;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(WorkerTrackingPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
