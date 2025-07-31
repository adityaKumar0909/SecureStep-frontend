import {useEffect, useRef, useState} from "react";
import {io} from "socket.io-client";

export default function Location_tracking() {
    const socketRef = useRef(null);
    const [roomCode, setRoomCode] = useState('');
    const [currentRoom, setCurrentRoom] = useState(null);
    const [location, setLocation] = useState(null);

    const joinRoom = () => {
        if (roomCode.trim() !== '') {
            socketRef.current.emit('join-room', roomCode);
            setCurrentRoom(roomCode);
        }
    };

    useEffect(() => {

        //connect once only
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('receive-location', (data) => {
            console.log('📍 New location received:', data);
            setLocation(data.location);
        });

        return () => {
            socketRef.current.off('receive-location');
            socketRef.current.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800">
            <h1 className="text-3xl font-bold mb-6">📡 Real-time Location Viewer</h1>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md mr-2"
                />
                <button
                    onClick={joinRoom}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Join Room
                </button>
            </div>

            {currentRoom && (
                <div className="mb-4 text-lg">
                    ✅ Joined Room: <strong>{currentRoom}</strong>
                </div>
            )}

            {location ? (
                <div className="mt-6 text-xl">
                    📍 Current Location:<br/>
                    <span className="font-mono">Latitude: {location.lat}</span><br/>
                    <span className="font-mono">Longitude: {location.lon}</span>
                </div>
            ) : (
                currentRoom && <div className="mt-6 text-gray-500">Waiting for location updates...</div>
            )}
        </div>
    );

}

