import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  StyleSheet,
  Text,
  View,
  Button,
  AppState,
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { BsdkInstance } from '../../scripts/bundle.esm.min';

// initialize Nielsen DOM-less SDK configuration
const nSdkConfig = {
  appId: 'P7B723D2D-20BF-45E0-ABA0-A5B7AD25FC8D',
  instanceName: 'dcrStaticInstance',
}; 
// required implementation hooks for function overrides (Nielsen DOM-less SDK)
const implementationHooks = {
  Log: {
    info: function (log: any) {
      console.info(log);
    },
    debug: function (log: any) {
      console.debug(log);
    },
    warn: function (log: any) {
      console.warn(log);
    },
    error: function (error: any) {
      console.error(error);
    },
  },
  Storage: {
    setItem: async function (key: any, value: any) {
      // console.log('Storage set item');
    },
    getItem: async function (key: any) {
      // console.log('Storage get item');
    },
  },
  Fetch: async function (url: string | URL | Request, options: any) {
    // TODO: look into different npm packages and see what the User-Agent being passed in is
    const clientOpts = {
      headers: {
        'User-Agent':
          'react-native-domless/1.6.7.42 Dalvik/2.1.0 (Linux; U; Android 5.1.1; Android SDK built for x86 Build/LMY48X)',
      },
    };
    const data = Object.assign(options, clientOpts);

    const response = await fetch(url, data);
    if (response.ok) {
      return response;
    } else {
      throw new Error('Request failed');
    }
  },
  SetTimeout: function (callback: () => void, timeout: number | undefined) {
    return setTimeout(callback, timeout);
  },
  SetInterval: function (callback: () => void, interval: number | undefined) {
    return setInterval(callback, interval);
  },
  ClearTimeout: function (
    timeout: string | number | NodeJS.Timeout | undefined
  ) {
    clearTimeout(timeout);
  },
  ClearInterval: function (
    interval: string | number | NodeJS.Timeout | undefined
  ) {
    clearInterval(interval);
  },
};

// Nielsen DOM-less SDK instance metadata
const nSdkMetadata = {
  appName: 'Test Sample App 1',
  deviceId: 'testDeviceId1',
  nol_sdkDebug: 'debug',
  sfcode: 'qat4',
  domlessEnv: '1',
};

// initialization of Nielsen DOM-less SDK instance
const nSdkInstance = (BsdkInstance as any)(
  nSdkConfig.appId,
  nSdkConfig.instanceName,
  nSdkMetadata,
  implementationHooks
);

export default function TabLayout() {

    // Retrieve AppState
    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);
  
    useEffect(() => {
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
  
        if (
          (appState.current.match(/background/) ||
            appState.current.match(/inactive/)) &&
          nSdkInstance
        ) {
          // Nielsen SDK processEvent on 'blur'
          nSdkInstance.then((instance: any) => {
            console.log(`AppLog: AppState background event fired.`);
            instance.processEvent({ type: 'blur', timestamp: Date.now() });
          });
        }
  
        if (appState.current.match(/active/) && nSdkInstance) {
          // Nielsen SDK processEvent on 'focus'
          nSdkInstance.then((instance: any) => {
            console.log(`AppLog: AppState active event fired.`);
            instance.processEvent({ type: 'Focus', timestamp: Date.now() });
          });
        }
      });
  
      return () => {
        subscription.remove();
      };
    }, []);

    const home = {
      type: 'static',
      assetid: 'HomePage',
      section: 'home',
    };
  
    const about = {
      type: 'static',
      assetid: 'AboutPage',
      section: 'about',
    };

    nSdkInstance.then((instance: any) => {
      console.log('AppLog: Starting DCR STATIC measurement');
      instance.ggPM('staticstart', home);
    });

  return (
    <Tabs
    screenOptions={{
        tabBarActiveTintColor: '#ffd33d',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
        backgroundColor: '#25292e',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ),
        }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            nSdkInstance.then((instance: any) => {
              instance.ggPM('14', home);
            });
          }
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24}/>
          ),
        }}
        listeners={{
          tabPress: e => {
            e.preventDefault();
            nSdkInstance.then((instance: any) => {
              instance.ggPM('14', about);
            });
          }
        }}
      />
    </Tabs>
  );
}