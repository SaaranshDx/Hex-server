// utils/api.js
async function getApiUrl() {
  const res = await fetch("https://raw.githubusercontent.com/SaaranshDx/GhostDrop/main/serverurl");
  if (!res.ok) throw new Error("failed to fetch api url");
  return (await res.text()).trim();
}

module.exports = { getApiUrl };