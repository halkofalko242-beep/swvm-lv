import { registerRootComponent } from 'expo';
import TrackPlayer from 'react-native-track-player';
import App from './App';

// Register TrackPlayer background service
TrackPlayer.registerPlaybackService(() => require('./service'));

registerRootComponent(App);
