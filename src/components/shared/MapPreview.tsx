import React from 'react';
import GoogleMapReact from 'google-map-react';
import { Icon } from '@iconify/react';

const AnyReactComponent = (props: any) => (
  <span>
    <Icon
      icon="fluent:location-12-filled"
      width={30}
      className="text-red-500"
    />
  </span>
);

export default function MapPreview({ lat, lng }: { lat: number; lng: number }) {
  const defaultProps = {
    center: {
      lat,
      lng
    },
    zoom: 11
  };

  function handleApiLoaded(map: any, maps: any) {
    console.log(map, maps);
  }

  return (
    // Important! Always set the container height explicitly
    <div className="w-full h-96">
      <GoogleMapReact
        bootstrapURLKeys={{ key: 'AIzaSyBL9zlkm2YRyU_hN1yMGrVJ6_JlEHCzzig' }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
      >
        <AnyReactComponent
          lat={lat}
          lng={lng}
          text="My Marker"
        />
      </GoogleMapReact>
    </div>
  );
}
