export async function getNowPlaying() {
  const res = await fetch("http://localhost:8000/now-playing");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}