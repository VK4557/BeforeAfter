/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  Button,
  Animated,
  PanResponder,
  NativeModules,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import FilterCamera, {
  startCamera,
  stopCamera,
  Filters,
  setFilter,
  captureMedia,
} from './CameraView';

function App(): JSX.Element {
  const width = useSharedValue(0);
  const pressed = useSharedValue(false);

  const startingPosition = 0;
  const x = useSharedValue(startingPosition);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const loc = useSharedValue({x: 0, y: 0});
  const [isCameraOpen, setCameraOpen] = useState(false);

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ]);
      if (
        granted['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can use the Storage');
      } else {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const cameraRef = React.useRef();

  const handleStartCamera = async () => {
    await requestStoragePermission();
    console.log('start Camera', cameraRef.current._nativeTag);
    startCamera(cameraRef.current._nativeTag);
    setCameraOpen(true);
  };

  const handleStopCamera = () => {
    stopCamera(cameraRef.current._nativeTag);
    setCameraOpen(false);
  };

  const onCapture = () => {
    console.log('capture image');
    captureMedia(cameraRef.current._nativeTag);
  };

  const eventHandler = useAnimatedGestureHandler({
    onStart: (event, ctx: any) => {
      pressed.value = true;
      ctx.startX = x.value;
      console.log('pressed');
    },
    onActive: (event, ctx) => {
      // x.value = startingPosition + event.translationX;
      // y.value = startingPosition + event.translationY;
      x.value = ctx.startX + event.translationX;
    },
    onEnd: (event, ctx) => {
      pressed.value = false;
      // x.value = startingPosition;

      // y.value = withSpring(startingPosition);
    },
  });
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: x.value,
    };
  });

  const zoom = useSharedValue(1);
  const pinchHandler =
    useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
      onStart: (event, ctx: any) => {
        // Store the initial scale value when the gesture starts
        ctx.startScale = zoom.value;
      },
      onActive: (event, ctx: any) => {
        // Update the scale based on the pinch gesture's scale factor
        zoom.value = ctx.startScale * event.scale;
      },
      onEnd: () => {
        // Ensure the zoom stays within a specific range when the gesture ends
        // zoom.value = withTiming(
        //   Math.max(1, Math.min(zoom.value, 3)), // Set the minimum and maximum scale values as per your requirement
        //   { duration: 300 }
        // );
      },
    });
  const imageStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: zoom.value}],
    };
  });
  const dragEventHandler = useAnimatedGestureHandler({
    onStart: (event, ctx: any) => {
      pressed.value = true;
      ctx.startX = dragX.value;
      ctx.startY = dragY.value;
      console.log('pressed', loc.value);
    },
    onActive: (event, ctx) => {
      // x.value = startingPosition + event.translationX;
      // y.value = startingPosition + event.translationY;
      dragX.value = ctx.startX + event.translationX;
      dragY.value = ctx.startY + event.translationY;
    },
    onEnd: (event, ctx) => {
      pressed.value = false;
      console.log('event', event);
      loc.value = {
        x: loc.value.x + event.translationX,
        y: loc.value.y + event.translationY,
      };
      console.log('final', loc.value);

      // x.value = startingPosition;

      // y.value = withSpring(startingPosition);
    },
  });
  const dragAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: dragX.value}, {translateY: dragY.value}],
    };
  });

  const pan = useRef(new Animated.ValueXY()).current;
  const [location, setLocation] = useState(new Animated.ValueXY());

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, {dx: pan.x, dy: pan.y}]),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
      onPanResponderEnd: (e, st) => {
        console.log('e', e.nativeEvent, st);
        // setLocation()
        const jsanimated = JSON.stringify(pan.x);

        const finalResult = Number(jsanimated);
        // console.log(finalResult + st.dx);
        console.log({x: pan.x, y: pan.y});
      },
    }),
  ).current;

  return (
    <View>
      <FilterCamera ref={cameraRef} style={{width: '100%', height: 500}} />
      {!isCameraOpen && (
        <Button title="Start Camera" onPress={handleStartCamera} />
      )}
      {isCameraOpen && (
        <>
          <TouchableOpacity
            style={{position: 'absolute', top: 440, left: 180}}
            onPress={onCapture}>
            <View
              style={{
                width: 50,
                aspectRatio: 1,
                backgroundColor: 'black',
                borderRadius: 25,
                borderWidth: 5,
                borderColor: 'white',
              }}
            />
          </TouchableOpacity>
          <Button
            title="Apply Filter"
            onPress={() => {
              setFilter(
                cameraRef.current._nativeTag,
                Filters[Math.ceil((Filters.length - 1) * Math.random())],
              );
            }}
            color={'green'}
          />
          <Button
            title="Stop Camera"
            onPress={handleStopCamera}
            color={'red'}
          />
        </>
      )}
    </View>
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      {/* <SafeAreaView>
        <View style={[{flex: 1, flexDirection: 'row', marginTop: 20}]}>
          <Animated.View
            style={[
              {
                // borderRightWidth: 5,
                // borderRightColor: 'red',
                height: 350,
                overflow: 'hidden',
              },
              animatedStyle,
            ]}>
            <PinchGestureHandler onGestureEvent={pinchHandler}>
            <Animated.Image
              source={require('./assets/image1.jpg')}
              style={[{width: 300, height: 400, resizeMode: 'cover'}, imageStyle]}
            />
            </PinchGestureHandler>
          </Animated.View>
          <PanGestureHandler onGestureEvent={eventHandler}>
            <Animated.View style={{height: 350, width: 5, backgroundColor: 'red'}} />
          </PanGestureHandler>
          <View style={{position: 'absolute', zIndex: -10}}>
            <Animated.Image
              source={require('./assets/image2.jpg')}
              style={{height: 350, width: 300}}
            />
          </View>
        </View>
        <Button
          title="Press"
          onPress={() => {
            x.value = withTiming(300, {duration: 5000});
          }}
        />
      </SafeAreaView> */}
      {/* <PanGestureHandler onGestureEvent={dragEventHandler}>
      <Animated.View style={[{height: 250, width: 200, overflow: 'hidden'}, dragAnimatedStyle]}>
        <Image
          source={require('./assets/image1.jpg')}
          style={[{width: 200, height: 250, resizeMode: 'cover'}]}
        />
      </Animated.View>
      </PanGestureHandler> */}
      <Animated.View
        style={[
          {height: 200, width: 150, backgroundColor: 'red', overflow: 'hidden'},
          {transform: [{translateX: pan.x}, {translateY: pan.y}]},
        ]}
        {...panResponder.panHandlers}>
        <Image
          source={require('./assets/image1.jpg')}
          style={[{width: 200, height: 250, resizeMode: 'cover'}]}
          // {...panResponder.panHandlers}
        />
      </Animated.View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
