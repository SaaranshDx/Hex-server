const CAPE_RENDERER_URL = process.env.CAPE_RENDERER_URL || "https://hex-cape-renderer.saaransh762.workers.dev/";

async function generateCapePreview(capeBuffer) {
  const formData = new FormData();
  const blob = new Blob([capeBuffer], { type: "image/png" });
  formData.append("cape", blob, "cape.png");

  const response = await fetch(CAPE_RENDERER_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cape renderer API returned ${response.status}: ${await response.text()}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { generateCapePreview };
