import {NativeModules, requireNativeComponent} from 'react-native';

const {CameraView} = NativeModules;

export const startCamera = viewId => {
  CameraView.startCamera(viewId);
};

export const stopCamera = viewId => {
  CameraView.stopCamera(viewId);
};

export const setFilter= (viewId, filter)=> {
  CameraView.setFilter(viewId, filter)
}

export const captureMedia=(viewId)=> {
  CameraView.captureMedia(viewId)
}

export const Filters = [
  'NONE',
  'AUTO_FIX',
  'BLACK_AND_WHITE',
  'BRIGHTNESS',
  'CONTRAST',
  'CROSS_PROCESS',
  'DOCUMENTARY',
  'DUOTONE',
  'FILL_LIGHT',
  'GAMMA',
  "GRAIN",
  "GRAYSCALE",
  "HUE",
  "INVERT_COLORS",
  "LOMOISH",
  "POSTERIZE",
  "SATURATION",
  "SEPIA",
  "SHARPNESS",
  "TEMPERATURE",
  "TINT",
  "VIGNETTE"
];

export default requireNativeComponent('FilterCamera');
