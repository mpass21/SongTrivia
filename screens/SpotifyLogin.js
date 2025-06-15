import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri, ResponseType } from 'expo-auth-session';
import { useSpotify } from '../SpotifyContext'; // Import context

const redirectUri = makeRedirectUri({
  use: 'expo-linking',
  // Uncomment and set 'path' if your Spotify Developer Dashboard redirect URI
  // includes a specific path (e.g., exp://your-ip:port/auth-callback):
  // path: 'auth-callback',
});

// Your actual Spotify Client ID from your Spotify Developer Dashboard.
const CLIENT_ID = 'c220303cd6794a4ab899d6181ac8c17f'; // Ensure this is correct

// Spotify API Endpoints for authorization and token exchange.
const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

// Define the scopes (permissions) your app needs from Spotify.
// Define the scopes (permissions) your app needs from Spotify.
const scopes = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'user-top-read',
  'user-modify-playback-state' 
];
// Ensures the WebBrowser component dismisses properly on Android after auth.
WebBrowser.maybeCompleteAuthSession();

// SpotifyLogin component, now designed to work with React Navigation.
const SpotifyLogin = ({ navigation }) => {
  const { accessToken, setAccessToken, userInfo, setUserInfo } = useSpotify();  // Stores the user's Spotify access token      // Stores fetched Spotify user profile info
  const [loading, setLoading] = useState(false);        // Manages loading state during API calls
  const [error, setError] = useState(null);             // Stores any error messages

  // useAuthRequest hook initiates and manages the OAuth authorization flow.
  // 'request' holds the authorization request parameters.
  // 'response' receives the result of the authorization flow.
  // 'promptAsync' is the function to trigger the browser for user authorization.
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri,
      scopes,
      responseType: ResponseType.Code, // Requests an authorization code
      usePKCE: false, // PKCE is generally recommended, but often handled automatically by Expo AuthSession
                      // for basic flows or not strictly required for certain Spotify configurations.
    },
    discovery
  );

  // useEffect to handle the response from the authentication flow.
  // This runs whenever the 'response' object changes.
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params; // Extract the authorization code from a successful response
      console.log('Authorization code received:', code);
      exchangeCodeForToken(code); // Proceed to exchange the code for an access token
    } else if (response?.type === 'error') {
      // Handle authentication errors (e.g., user denied access, invalid request)
      console.error('Authentication Error:', response.params.error_description || response.params.error);
      setError('Authentication failed. Please try again.');
      setLoading(false); // Stop loading indicator
    } else if (response?.type === 'cancel') {
      // Handle cases where the user cancels the authentication flow
      console.log('Authentication flow cancelled by user.');
      setError('Login cancelled.');
      setLoading(false); // Stop loading indicator
    }
  }, [response]); // Dependency array: effect runs when 'response' changes

  // Function to exchange the authorization code for an access token from Spotify.
  const exchangeCodeForToken = async (code) => {
    setLoading(true); // Start loading indicator
    setError(null); // Clear previous errors
    try {

      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // Basic Authorization header containing Base64 encoded Client ID and Secret
          'Authorization': `Basic ${btoa(`${CLIENT_ID}:54025c97cfdf465288bf7682c6fbea50`)}`, // <<<=== ENSURE THIS CLIENT_SECRET IS CORRECT
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code', // Standard OAuth 2.0 grant type
          code,                              // The authorization code received from Spotify
          redirect_uri: redirectUri,         // The same redirect URI used in the auth request
        }).toString(), // Convert parameters to URL-encoded string
      });

      if (!tokenResponse.ok) {
        // If the token exchange fails, parse and log the error
        const errorData = await tokenResponse.json();
        console.error('Token Exchange Error:', errorData);
        throw new Error(`Failed to exchange code for token: ${errorData.error_description || tokenResponse.statusText}`);
      }

      const data = await tokenResponse.json(); // Parse the successful token response
      console.log('Access Token Data:', data);
      setAccessToken(data.access_token); // Store the received access token

      // After getting the access token, fetch basic user information.
      await fetchUserInfo(data.access_token);

      // Navigate to the 'Callback' page after successful login and user info retrieval.
      // We pass 'userInfo' and 'accessToken' as parameters to the next screen.
      navigation.navigate('Callback', { userInfo, accessToken });

    } catch (e) {
      console.error('Error during token exchange:', e);
      setError(`Failed to get access token: ${e.message}`);
      setLoading(false); // Stop loading on error
    }
  };

  // Function to fetch user profile information using the obtained access token.
  const fetchUserInfo = async (token) => {
    try {
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`, // Use the access token for authorization
        },
      });

      if (!userResponse.ok) {
        // If fetching user info fails, parse and log the error
        const errorData = await userResponse.json();
        console.error('Fetch User Info Error:', errorData);
        throw new Error(`Failed to fetch user info: ${errorData.error.message || userResponse.statusText}`);
      }

      const userData = await userResponse.json(); // Parse the user data
      setUserInfo(userData); // Store the user information
      console.log('User Info:', userData);
    } catch (e) {
      console.error('Error fetching user info:', e);
      setError(`Failed to fetch user data: ${e.message}`);
      throw e; // Re-throw the error so it can be caught by the calling function (exchangeCodeForToken)
    } finally {
        setLoading(false); // Ensure loading is stopped regardless of success or failure
    }
  };

  // Handles the press event on the login/logout button.
  const handleAuthPress = async () => {
    if (accessToken) {
      // If an accessToken exists, the user is currently logged in. This branch handles logout.
      setAccessToken(null); // Clear access token
      setUserInfo(null);    // Clear user info
      setError(null);       // Clear any errors
      // Navigate back to the 'SpotifyLogin' screen.
      // 'canGoBack()' checks if there's a screen to go back to in the navigation stack.
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Fallback: If no back history, directly navigate to 'SpotifyLogin' to ensure we're on the right screen.
        navigation.navigate('SpotifyLogin');
      }
      console.log('Logged out from Spotify.');
    } else {
      // If no accessToken, the user is logged out. This branch handles initiating login.
      setLoading(true); // Start loading indicator
      setError(null);   // Clear any previous errors
      // Prompt the user to authorize the app via the Spotify website/app.
      const result = await promptAsync();
      // If the result is not 'success' and not 'cancel', something unexpected happened, stop loading.
      if (result.type !== 'success' && result.type !== 'cancel') {
        setLoading(false);
      }
      // Success or cancellation will be handled by the useEffect watching the 'response' state.
    }
  };

  // The component's UI. It only renders the login button if not logged in and not loading.
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spotify Integration</Text>

      {/* Show activity indicator while loading */}
      {loading && <ActivityIndicator size="large" color="#1DB954" style={styles.activityIndicator} />}
      {/* Display error message if an error occurred */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Conditionally render the login button if not logged in and not currently loading */}
      {!accessToken && !loading && (
        <View style={styles.loggedOutContainer}>
          <Text style={styles.statusText}>Status: Logged Out</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={handleAuthPress}
            // Disable the button if the authorization request is not ready or if loading
            disabled={!request || loading}
          >
            <Text style={styles.buttonText}>Login with Spotify</Text>
          </TouchableOpacity>
          {/* Inform the user if the authorization request is still being prepared */}
          {!request && <Text style={styles.smallText}>Preparing login...</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#191414',
    padding: 20,
    borderRadius: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  statusText: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  activityIndicator: {
    marginBottom: 20,
  },
  errorText: {
    color: '#FF0000',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  loggedOutContainer: {
    alignItems: 'center',
    width: '100%',
  },
  smallText: {
    color: '#AAAAAA',
    fontSize: 12,
    marginTop: 10,
  },
});

export default SpotifyLogin;
