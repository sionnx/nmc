type cloudSongsResponse = {
    code: number;
    data: {
        songId: number;
        songName: string;
            artist: string;
            album: string;
            simpleSong: SimpleSong;
        }[];
};

type SimpleSong = {
    name: string;
    id: number;
    ar: { // artist
        id: number;
        name: string| null;
    }[] | null;
    al: { // album
        id: number;
        name: string| null;
    } | null;
}

function cacheCloudSongs(body: object) {
    if(!$request!.url.startsWith("https://interface.music.163.com/eapi/v1/cloud/get")) {
        return;
    }

    console.log("caching cloud songs");

    //存储 song list
    const songList: SimpleSong[] = (body as cloudSongsResponse).data.map((song) => (song.simpleSong));

    $persistentStore.write(JSON.stringify(songList), "cloud_songs");

    console.log("cloud songs cached");
}

export { cacheCloudSongs, type SimpleSong }; 