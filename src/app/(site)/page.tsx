import { getSongs } from "../../actions/getSongs";
import { getSongsUser } from "../../actions/getSongsUser";
import { getPlaylists } from "@/actions/getPlaylists";
import Header from "../../components/Header";
import ListItem from "../../components/ListItem";
import PageContent from "./components/PageContent";
import socket from '../api/socket';
import PageContentUser from "./components/PageContentUser";
import PageContentPlaylist from "./components/PageContentPlaylist";

export const revalidate = 0;

export default async function Home() {
  const songs = await getSongs();
  const songs_user = await getSongsUser();
  const playlists = await getPlaylists();

  return (
    <div className="h-full w-full overflow-hidden overflow-y-auto rounded-lg bg-indigo-400">
      <Header>
        <div className="mb-2">
          <h1 className="text-3xl font-semibold text-white">Добро пожаловать</h1>
          <PageContentPlaylist
            playlists={playlists}
          />
        </div>
      </Header>
      <div className="mb-7 mt-2 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Новые треки</h1>
        </div>
        <PageContent songs={songs} />
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Мои треки</h1>
        </div>
        <PageContentUser songs={songs_user}/>
      </div>
    </div>
  );
}
