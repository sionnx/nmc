import { eapiReqDecrypt } from "../util/crypto";
import { SimpleSong } from "./cache_cloud_songs";

type SearchResult = {
  code: number;
  data: {
    blocks: Block[];
  };
};

type Block = {
  blockCode: string;
  resources: Resource[];
};


type Resource = {
  resourceType: string;
  resourceId: string;
  foldId: string;
  baseInfo: {
    simpleSongData: {
        id: number;
        name: string;

        privilege:{
            id: number;
        }
    },
    metaData: string[];
  };
  extInfo: {
    algClickableTags: AlgClickableTag[];
  };
};

type AlgClickableTag = {
  clickable: boolean,
  text: string,
}

type SearchRequest = {
  keyword: string;
};


function cacheSearchKeyword(body:object){
  if(!$request!.url.startsWith("https://interface.music.163.com/eapi/search/pc/complex/page/v3")) {
    return;
  }

  let keyword = (body as SearchRequest).keyword!!;

  $persistentStore.write(keyword, "search_keyword");
  

  console.log("search keyword cached:" + keyword);
}

function processSearchResult(url: string, body: object) {
  if (
    !url.startsWith(
      "https://interface.music.163.com/eapi/search/pc/complex/page/v3"
    )
  ) {
    return;
  }

  console.log("processing search result");

  const blocks = (body as SearchResult).data.blocks;
  const search_block_song = blocks.find(
    (block: any) => block.blockCode === "search_block_song"
  );

  if (!search_block_song) {
    console.log("search_block_song not found");
    return;
  }

  const resources = search_block_song.resources;

  if (resources.length === 0) {
    console.log("resources array is empty");
    return body;
  }

  const first_song = resources[0];

  console.log("first_song rewritten");

  let keyword = $persistentStore.read("search_keyword") || "";

  let cloud_songs = searchCloudSongs(keyword); 

  cloud_songs.forEach((song: SimpleSong) => {
    const copied_song = JSON.parse(JSON.stringify(first_song));

    copied_song.foldId = song.id.toString();
    copied_song.resourceId = song.id.toString();
    copied_song.baseInfo.simpleSongData = song;
    copied_song.baseInfo.metaData = []

    copied_song.extInfo.algClickableTags = [];
    copied_song.extInfo.algClickableTags.push({
      clickable: false,
      text: "音乐云盘",
     });

    resources.unshift(copied_song);
  });

  return body;
}


function searchCloudSongs(keyword: string) : SimpleSong[] {
  console.log("searching cloud songs for keyword:" + keyword);

  const songList: SimpleSong[] = JSON.parse($persistentStore.read("cloud_songs") || "[]");
  return songList.filter((song: SimpleSong) => 
    song.name.includes(keyword) || 
    song.ar?.some(artist => artist.name?.includes(keyword)) || 
    song.al?.name?.includes(keyword)
  );
}


export { cacheSearchKeyword, processSearchResult };
