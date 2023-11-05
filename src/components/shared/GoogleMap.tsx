// import React, { useRef } from 'react';
// import { Map, Marker, GoogleApiWrapper, IMapProps } from 'google-maps-react';

// function GoogleMap({ google, lat, lng }: IMapProps & any): JSX.Element {
//   const map = useRef(null);
//   function onMarkerClick() {
//     console.log('Marker clicked..');
//   }

//   return (
//     <div className="w-full h-96 relative">
//       <Map
//         google={google}
//         initialCenter={{
//           lat,
//           lng
//         }}
//         onDragend={() => {
//           console.log('dragend..');
//         }}
//         onClick={onMarkerClick}
//         ref={map}
//       >
//         {map ? (
//           <Marker
//             position={{ lat, lng }}
//             draggable={true}
//             onDragend={(e: any) => {
//               console.log('dragend..', e?.map?.center?.lat(), e?.map?.center?.lng());
//             }}
//           ></Marker>
//         ) : (
//           <></>
//         )}
//       </Map>
//     </div>
//   );
// }

// export default GoogleApiWrapper((props) => ({
//   apiKey: 'AIzaSyBL9zlkm2YRyU_hN1yMGrVJ6_JlEHCzzig',
//   libraries: ['places'],

//   ...props
// }))(GoogleMap);

// // AIzaSyBL9zlkm2YRyU_hN1yMGrVJ6_JlEHCzzig

// // import React from "react";
// // import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';

// // const MapWithAMarker = withScriptjs(
// //   withGoogleMap((props) => (
// //     <GoogleMap
// //       defaultZoom={8}
// //       defaultCenter={{ lat: -34.397, lng: 150.644 }}
// //     >
// //       <Marker position={{ lat: -34.397, lng: 150.644 }} />
// //     </GoogleMap>
// //   ))
// // );

// // export default function GoogleMap(){
// //   return (
// //     <MapWithAMarker
// //       googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyBL9zlkm2YRyU_hN1yMGrVJ6_JlEHCzzig&v=3.exp&libraries=places"
// //       loadingElement={<div style={{ height: `100%` }} />}
// //       containerElement={<div style={{ height: `400px` }} />}
// //       mapElement={<div style={{ height: `100%` }} />}
// //     />
// //   );
// // };

export {};
