package com.beforeafter;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.View;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.FileProvider;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerModule;

import com.otaliastudios.cameraview.CameraListener;
import com.otaliastudios.cameraview.CameraUtils;
import com.otaliastudios.cameraview.CameraView;
import com.otaliastudios.cameraview.FileCallback;
import com.otaliastudios.cameraview.PictureResult;
import com.otaliastudios.cameraview.controls.Engine;
import com.otaliastudios.cameraview.controls.Facing;
import com.otaliastudios.cameraview.controls.Mode;
import com.otaliastudios.cameraview.controls.PictureFormat;
import com.otaliastudios.cameraview.controls.Preview;
import com.otaliastudios.cameraview.filter.Filters;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class CameraViewModule extends ReactContextBaseJavaModule {
    private static final String TAG = "CameraViewModule";
    private static final String REACT_CLASS = "CameraView";

    private CameraView camera;
    private ReactApplicationContext reactContext;

    public CameraViewModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void startCamera(int viewId) {
        UIManagerModule uiManager = reactContext.getNativeModule(UIManagerModule.class);
        uiManager.addUIBlock(nativeViewManager -> {
            try {
                View view = nativeViewManager.resolveView(viewId);
                camera= (CameraView) view;
                if (view instanceof CameraView) {
                    camera.setFacing(Facing.BACK);
                    camera.setMode(Mode.PICTURE);
                    camera.setPictureFormat(PictureFormat.JPEG);
                    camera.setPreview(Preview.GL_SURFACE);
                    camera.setEngine(Engine.CAMERA1);
                    camera.open();
                    camera.addCameraListener(new CameraListener() {
                        public void onPictureTaken(PictureResult result) {
                            Log.w("Picture Result", result.toString());
                            String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(new Date());
                            String fileName = "IMG_" + timeStamp + ".jpg";

                            File storageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM), "Camera");
                            if (!storageDir.exists()) {
                                storageDir.mkdirs();
                            }

//                            File destFile = new File(storageDir, fileName);
                            CameraUtils.writeToFile(result.getData(), new File(storageDir, fileName), new FileCallback() {
                                @Override
                                public void onFileReady(@Nullable File file) {
//                                    if (file != null) {
//                                        Context context = PicturePreviewActivity.this;
//                                        Intent intent = new Intent(Intent.ACTION_SEND);
//                                        intent.setType("image/*");
//                                        Uri uri = FileProvider.getUriForFile(context, context.getPackageName() + ".provider", file);
//                                        intent.putExtra(Intent.EXTRA_STREAM, uri);
//                                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
//                                        startActivity(intent);
//                                    } else {
////                                        Toast.makeText(PicturePreviewActivity.this, "Error while writing file.", Toast.LENGTH_SHORT).show();
//                                    }
                                }
                            });
//                            try {
//                                OutputStream outputStream = new FileOutputStream(destFile);
//                                result.toFile(outputStream, new FileCallback() {
//                                    @Override
//                                    public void onFileReady(@Nullable File file) {
//
//                                    }
//                                });
//                                outputStream.flush();
//                                outputStream.close();
//                            } catch (Exception e) {
//                                e.printStackTrace();

                            // Add the image to the device's MediaStore
//                            ContentValues values = new ContentValues();
//                            values.put(MediaStore.Images.Media.DATA, destFile.getAbsolutePath());
//                            values.put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg");
//                            values.put(MediaStore.Images.Media.DATE_TAKEN, System.currentTimeMillis());
//                            getReactApplicationContext().getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                        }
                    });
                }
            } catch (IllegalViewOperationException e) {
                Log.e(TAG, "Error starting camera: " + e.getMessage());
            }
        });
    }

    @ReactMethod
    public void stopCamera(int viewId) {
            try {
                camera.close();
            } catch (IllegalViewOperationException e) {
                Log.e(TAG, "Error stopping camera: " + e.getMessage());
            }
    }

    @ReactMethod
    public void captureMedia(int viewId) {
            try {
                camera.takePictureSnapshot();
            } catch (IllegalViewOperationException e) {
                Log.e(TAG, "Error While Capture Media: " + e.getMessage());
            }
    }

    @ReactMethod
    public void setFilter(int viewId, String filterName) {
            try {
                camera.setFilter(Filters.valueOf(filterName).newInstance());
            } catch (IllegalViewOperationException e) {
                Log.e(TAG, "Error Applying Filters camera: " + e.getMessage());
            }
    }

}
