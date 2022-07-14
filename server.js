const http = require('http');
const fs = require('fs');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */

    // Get all the artists
    if (req.method === 'GET' && req.url === '/artists') {
      const urlParts = req.url.split('/');
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify(artists));
      return res.end();
    }

    // Get a specific artist's details based on artistId
    if (req.method === 'GET' && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        const artist = artists[`${artistId}`];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(artist));
        return res.end();
      }
    }

    // Add an artist
    if (req.method === 'POST' && req.url === '/artists') {
      let artist = req.body;
      let artistId = getNewArtistId()
      artist['artistId'] = artistId;
      artists[`${artistId}`] = artist;
      res.statusCode = 201;
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify(artist));
      return res.end();
    }

    // Edit a specified artist by artistId
    if ((req.method === 'PUT' || req.method === 'PATCH')  && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        let keys = Object.keys(req.body);

        keys.forEach(key => {
          artists[artistId][key] = req.body[key];
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(artists[artistId]));
        return res.end();
      }
    }

    // Delete a specified artist by artistId
    if (req.method === 'DELETE' && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        delete artists[artistId];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({"message": "Sucessfully deleted"}));
        return res.end();
      }
    }

    // Get all albums of a specific artist based on artistId
    if (req.method === 'GET' && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 4 && urlParts[3] === 'albums'){
        const artistId = urlParts[2];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        let values = Object.values(albums);
        let artistAlbums = [];

        values.forEach(album => {
          if(album['artistId'] == artistId){
            artistAlbums.push(album);
          }
        });

        res.write(JSON.stringify(artistAlbums));
        return res.end();
      }
    }

    // Get a specific album's details based on albumId
    if (req.method === 'GET' && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        const album = albums[`${albumId}`];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(album));
        return res.end();
      }
    }

    // Add an album to a specific artist based on artistId
    if (req.method === 'POST' && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 4) {
        const artistId = urlParts[2];
        const album = req.body;
        let albumId = getNewAlbumId();
        album['albumId'] = albumId;
        album['artistId'] = artistId;
        albums[`${albumId}`] = album;
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(album));
        return res.end();
      }
    }

    // Edit a specified album by albumId
    if ((req.method === 'PUT' || req.method === 'PATCH')  && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        let keys = Object.keys(req.body);

        keys.forEach(key => {
          albums[albumId][key] = req.body[key];
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(albums[albumId]));
        return res.end();
      }
    }

    // Delete a specified album by albumId
    if (req.method === 'DELETE' && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        delete albums[albumId];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({"message": "Sucessfully deleted"}));
        return res.end();
      }
    }

    // Get all songs of a specific artist based on artistId
    if (req.method === 'GET' && req.url.startsWith('/artists/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 4 && urlParts[3] === 'songs'){
        const artistId = urlParts[2];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        let values = Object.values(albums);
        let songValues = Object.values(songs);
        let artistAlbums = [];
        let artistSongs = [];

        values.forEach(album => {
          if(album['artistId'] == artistId){
            artistAlbums.push(album['albumId']);
          }
        });

        artistAlbums.forEach(ele => {
          songValues.forEach(song => {
            if (song['albumId'] == ele){
              artistSongs.push(song);
            }
          });
        });

        res.write(JSON.stringify(artistSongs));
        return res.end();
      }
    }

    // Get all songs of a specific album based on albumId
    if (req.method === 'GET' && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 4) {
        const albumId = urlParts[2];
        let albumSongs = [];
        let values = Object.values(songs);

        values.forEach(song => {
          if(song['albumId'] == albumId){
            albumSongs.push(song);
          }
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(albumSongs));
        return res.end();
      }
    }

    // Get all songs of a specified trackNumber
    if (req.method === 'GET' && req.url.startsWith('/trackNumbers/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 4) {
        const trackNumber = urlParts[2];
        let trackSongs = [];
        let values = Object.values(songs);

        values.forEach(song => {
          if(song['trackNumber'] == trackNumber){
            trackSongs.push(song);
          }
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(trackSongs));
        return res.end();
      }
    }

    // Get a specific song's details based on songId
    if (req.method === 'GET' && req.url.startsWith('/songs/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const songId = urlParts[2];
        let song = songs[songId];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(song));
        return res.end();
      }
    }

    // Add a song to a specific album based on albumId
    if (req.method === 'POST' && req.url.startsWith('/albums/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 4) {
        const albumId = urlParts[2];
        const song = req.body;
        let songId = getNewSongId();
        song['songId'] = songId;
        song['albumId'] = albumId;
        songs[`${songId}`] = song;
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(song));
        return res.end();
      }
    }

    // Edit a specified song by songId
    if ((req.method === 'PUT' || req.method === 'PATCH')  && req.url.startsWith('/songs/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const songId = urlParts[2];
        let keys = Object.keys(req.body);

        keys.forEach(key => {
          songs[songId][key] = req.body[key];
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(songs[songId]));
        return res.end();
      }
    }

    // Delete a specified song by songId
    if (req.method === 'DELETE' && req.url.startsWith('/songs/')) {
      const urlParts = req.url.split('/');

      if (urlParts.length === 3) {
        const songId = urlParts[2];
        delete songs[songId];
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({"message": "Sucessfully deleted"}));
        return res.end();
      }
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = 5000;

server.listen(port, () => console.log('Server is listening on port', port));
