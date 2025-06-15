import React, { createContext, useState, useContext } from 'react';

const SpotifyContext = createContext();

export const useSpotify = () => {
  return useContext(SpotifyContext);
};

export const SpotifyProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null); // <- You may want to add this too

  const value = { accessToken, setAccessToken, userInfo, setUserInfo };
  return (
    <SpotifyContext.Provider value={value}>
      {children}
    </SpotifyContext.Provider>
  );
};

export { SpotifyContext }; // ✅ ADD THIS LINE
