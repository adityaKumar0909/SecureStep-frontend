import InputCustom from "./input_custom.jsx";
import ButtonCustom from "./button_custom.jsx";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
    width: "90%",
    height: "400px",
    borderRadius: "12px",
    margin: "0 auto",
};

const defaultCenter = {
    lat: 0,
    lng: 0,
};

export const Header = () => {
    const socketRef = useRef(null);
    const [roomCode, setRoomCode] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [location, setLocation] = useState(null);
    const [tracking, setTracking] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const joinRoom = () => {
        if (roomCode.trim() !== '') {
            socketRef.current.emit('join-room', roomCode);
            setCurrentRoom(roomCode);
        }
    };

    useEffect(() => {
        if (!socketRef.current) {
            socketRef.current = io('https://securestep-backend.onrender.com', {
                transports: ['websocket'],
                reconnectionAttempts: 5
            });

            socketRef.current.on('receive-location', (data) => {
                console.log('📍 New location received:', data);
                    if (data?.location != null) {
                        setLocation({ lat: data.location.lat, lng: data.location.lon });
                        setTracking(Boolean(data.tracking));
                    } else {
                        setLocation({ lat: "", lng: "" });
                        setTracking(false);
                    }
                // setLocation({ lat: data.location.lat, lng: data.location.lon });
                // setTracking(data.tracking);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('receive-location');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    return (


        <div className="flex flex-col lg:flex-row min-h-screen bg-white">

            {/* Left Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 lg:px-8">
                <div className="max-w-xl w-full">
                    <h2 className="text-3xl sm:text-5xl font-bold font-outfit text-black mb-6 text-center lg:text-left">
                        Track your loved ones
                        <br className="hidden md:block" />
                        in real-time{" "}
                        <span className="inline-block text-deep-purple-accent-400">with one tap</span>
                    </h2>

                    <legend className="text-black font-outfit mb-2 text-center lg:text-left">
                        What is your tracking code?
                    </legend>

                    <input
                        type="text"
                        placeholder="Enter code..."
                        className="input input-xl font-outfit w-full mb-4"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                    />

                    <div className="flex justify-center lg:justify-start">
                        <button onClick={joinRoom} className="p-6 btn btn-neutral btn-dash text-2xl">Start tracking</button>
                    </div>

                    {currentRoom && (
                        <div className="mt-6 text-black font-outfit text-2xl text-center lg:text-left">
                            Joined Room: <strong>{currentRoom}</strong>
                        </div>
                    )}

                    {location ? (
                        <div className="mt-4 text-black font-outfit text-center lg:text-left">
                            <div className="font-outfit text-lg">Latitude: {location.lat}</div>
                            <div className="font-outfit text-lg">Longitude: {location.lng}</div>
                            <div className="mt-4 text-black font-outfit text-center lg:text-left text-xl">
                                User : {tracking ?
                                <div className="badge badge-success text-lg">
                                    <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor" strokeLinejoin="miter" strokeLinecap="butt"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeLinecap="square" stroke-miterlimit="10" strokeWidth="2"></circle><polyline points="7 13 10 16 17 8" fill="none" stroke="currentColor" strokeLinecap="square" stroke-miterlimit="10" strokeWidth="2"></polyline></g></svg>
                                    Online
                                </div> : <div className="badge badge-error text-lg">
                                    <svg className="size-[1em]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><rect x="1.972" y="11" width="20.056" height="2" transform="translate(-4.971 12) rotate(-45)" fill="currentColor" strokeWidth={0}></rect><path d="m12,23c-6.065,0-11-4.935-11-11S5.935,1,12,1s11,4.935,11,11-4.935,11-11,11Zm0-20C7.038,3,3,7.037,3,12s4.038,9,9,9,9-4.037,9-9S16.962,3,12,3Z" strokeWidth={0} fill="currentColor"></path></g></svg>
                                    Offline
                                </div>}
                            </div>
                        </div>
                    ) : (
                        currentRoom && (
                            <div className="mt-4 text-gray-500 text-center lg:text-left">
                                Waiting for location updates...
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={location||defaultCenter}
                        zoom={location ? 15 : 2}
                        options={{
                            disableDefaultUI: true,
                            zoomControl: false,
                            mapTypeControl: false,
                            scaleControl: false,
                            streetViewControl: false,
                            rotateControl: false,
                            fullscreenControl: false
                        }}
                    >
                        {location && (
                            <Marker position={location} title="Tracked Location" />
                        )}
                    </GoogleMap>
                ) : (
                    <div className="w-[90%] h-56 sm:h-96 bg-black rounded-[12px] flex items-center justify-center text-white text-lg mx-auto">
                        Loading Map...
                    </div>
                )}
            </div>
        </div>
    );
};
