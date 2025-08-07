# SpotifyRPC Extras
This is not necessary to run the SpotifyRPC python app, this is just an extension for it.  
This takes the data from my [SpotifyRPC Server](https://github.com/slingexe/SpotifyRPC) and displays it in a web format  

This uses cloudflared to host the website without port forwarding.

## Running
If you want to make modification to the website use `npm run dev`  
If you just want to use the website run `npm run build` then `npm run start`  

Don't forget to fill out the .env file

# ~~SpotifyRPC Listen Along~~
After creating all of this with listen along in mind, I found out about the absurd requirements for extended quota mode, basically killing this...  
Lets hope spotify reverts this...  