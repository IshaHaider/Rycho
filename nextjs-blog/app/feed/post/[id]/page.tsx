"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Song {
  name: string;
  artist: string;
  album: string;
  image: string;
  audioUrl: string; 
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string; 
}

interface User {
  spotifyId: string;
}

export default function PostPage({ params }: { params: { id: string } }) {
  const [token, setToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [spotifyId, setSpotifyId] = useState<string | null>(null);
  const [showAlbums, setShowAlbums] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<Playlist | null>(null); 
  const [filteredPlaylists, setFilteredPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null);




  const filteredAlbums = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playPreview = (audioUrl: string) => {
    if (audioPlayer) {
      if (audioPlayer.src !== audioUrl) {
        audioPlayer.src = audioUrl;
        audioPlayer.play();
      } else {
        if (audioPlayer.paused) {
          audioPlayer.play();
        } else {
          audioPlayer.pause();
        }
      }
    }
  };

  useEffect(() => {
    const newAudioPlayer = new Audio();
    setAudioPlayer(newAudioPlayer);

    return () => {
      if (newAudioPlayer) {
        newAudioPlayer.pause();
        newAudioPlayer.src = '';
      }
    };
  }, []);


  useEffect(() => {
    setFilteredPlaylists(playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [searchQuery, playlists]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };


  useEffect(() => {
    const fetchToken = () => {
      const storedToken = window.localStorage.getItem("token");
      setToken(storedToken);
    }

    fetchToken();
  }, []);

  useEffect(() => {
    const storedSpotifyId = window.localStorage.getItem("spotifyId");
    if (params.id) {
      setSpotifyId(params.id);
    } else if (storedSpotifyId) {
      setSpotifyId(storedSpotifyId);
    } else {
    }
  }, [params]);


  useEffect(() => {
    if (token) {
      const fetchPlaylists = async () => {
        try {
          const { data } = await axios.get('https://api.spotify.com/v1/me/playlists', {
            headers: {
              Authorization: 'Bearer ' + token
            }
          });

          const playlistsData: Playlist[] = data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            image: item.images[0].url, 
          }));

          setPlaylists(playlistsData);
          setFilteredPlaylists(playlistsData);
        } catch (error) {
          console.error("Error fetching playlists: ", error);
        }
      }

      fetchPlaylists();
    }
  }, [token]);

  const fetchPlaylistSongs = async (playlistId: string) => {
    try {
      const { data } = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
  
      const extractedSongs: Song[] = data.items.map((item: any) => ({
        name: item.track.name,
        artist: item.track.artists[0].name,
        album: item.track.album.name,
        image: item.track.album.images.length > 0 ? item.track.album.images[0].url : '',
        audioUrl: item.track.preview_url
      }));
  
      setPlaylistSongs(extractedSongs);
      setSelectedPlaylistId(playlistId); 
      setShowAlbums(false); 
    } catch (error) {
      console.error("Error fetching songs for playlist: ", error);
    }
  }
  

  const handlePostSong = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (selectedSong) {
      try {
        const response = await axios.post("http://localhost:3000/api/feed/post", {
          method: "addPost",
          spotifyId: spotifyId, 
          songName: selectedSong.name,
          albumName: selectedSong.album, 
          artistName: selectedSong.artist, 
          imageURL: selectedSong.image, 
          audioURL: selectedSong.audioUrl, 
          caption: "", 
          likes: 0,
          roomStat: true,
          comments: [],
        });

        console.log("Song posted successfully:", response.data);
      } catch (error) {
        console.error("Error posting song:", error);
      }
    } else {
      console.warn("No song selected to post.");
    }
  };
  

  const handleBackToAlbums = () => {
    setShowAlbums(true);
    setSelectedAlbum(null);
  };

  
  return (
    <div className="flex flex-col items-center m-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Search ${selectedAlbum ? selectedAlbum.name : 'Album'}...`} // Display the album name if selected
          className="bg-gray-200 mt-3 mr-4 pl-4 pr-8 py-1 rounded-full focus:outline-none focus:ring focus:border-blue-300 max-w-104 text-black"
          value={searchQuery}
          onChange={handleInputChange}
        />
        <button
          onClick={() => setSearchQuery("")} // Clear search query on button click
          className="px-4 py-2 bg-gray-500 text-white rounded-md ml-2 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap justify-center">
        {/* Playlists */}
        {showAlbums ? (
          filteredAlbums.map((playlist, index) => (
            <div key={index} className="m-4 cursor-pointer" onClick={() => {
              fetchPlaylistSongs(playlist.id);
              setSelectedAlbum(playlist); // Set the selected album when clicked
              setSearchQuery(""); // Clear search query when album is selected
            }}>
              <img src={playlist.image} alt={playlist.name} className="w-40 h-40 object-cover rounded-lg mb-2" />
              <p className="text-center">{playlist.name}</p>
            </div>
          ))
        ) : (
          // Render songs of selected album only
          <div className="flex flex-col items-center m-4">
            {/* Button to go back */}
            <button onClick={handleBackToAlbums} className="mb-4 ml-4 w-10 h-10 bg-gray-500 text-white rounded-full hover:bg-gray-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 3.293a1 1 0 011.414 1.414L7.414 10l6.293 6.293a1 1 0 01-1.414 1.414l-7-7a1 1 0 010-1.414l7-7a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
  
            {/* Render filtered songs based on search query */}
            <ul>
              {playlistSongs
                .filter(song =>
                  song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  song.artist.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((song, index) => (
                  <li
                    key={index}
                    className={`cursor-pointer mb-2 flex items-center ${selectedSong === song ? 'bg-gray-200' : ''}`}
                    onClick={() => {
                      setSelectedSong((prevSong) => (prevSong === song ? null : song));
                    }}
                  >
                    <img src={song.image} alt={song.name} className="w-12 h-12 object-cover rounded-lg mr-2" />
                    <div>
                      <p className={`text-base font-semibold ${selectedSong === song ? 'text-gray-800' : ''}`}>{song.name}</p>
                      <p className={`text-xs ${selectedSong === song ? 'text-gray-800' : ''}`}>{song.artist}</p>
                    </div>
                    {/* Play/pause button */}
                    <button
                      className="ml-auto mr-4 text-gray-600 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the row selection event from triggering
                        playPreview(song.audioUrl);
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={selectedSong === song ? "M4 6h16M4 12h16M4 18h16" : "M5 3a2 2 0 012-2h10a2 2 0 012 2v18a2 2 0 01-2 2H7a2 2 0 01-2-2V3z"}
                        />
                      </svg>
                    </button>
                  </li>
                ))}
            </ul>
  
            {/* Button to post the selected song */}
            {selectedSong && (
              <button onClick={handlePostSong} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Post Song
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
  
}