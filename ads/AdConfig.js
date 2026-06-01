import { TestIds } from 'react-native-google-mobile-ads';

// In development (__DEV__), test IDs are used automatically so your AdMob
// account is never flagged. Real IDs are only used in production builds.
export const AD_UNITS = {
  banner:       __DEV__ ? TestIds.BANNER        : 'ca-app-pub-2414187213184434/9359746195',
  interstitial: __DEV__ ? TestIds.INTERSTITIAL  : 'ca-app-pub-2414187213184434/4462642730',
  rewarded:     __DEV__ ? TestIds.REWARDED      : 'ca-app-pub-2414187213184434/9878620949',
};
