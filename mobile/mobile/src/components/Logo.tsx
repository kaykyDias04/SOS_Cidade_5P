import React from 'react';
import { View, Image } from 'react-native';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 80 }: LogoProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#1669BB',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1669BB',
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
      }}
    >
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: size * 0.58, height: size * 0.58 }}
        resizeMode="contain"
      />
    </View>
  );
}
