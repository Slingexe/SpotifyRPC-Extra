import TrackInfo from "../components/TrackInfo";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">🎧 Now Playing</h1>
      <TrackInfo />
    </main>
  );
}