import { Router } from "express";
import { getDb } from "../lib/mongodb";

const router = Router();

const DEFAULT_SOCIAL_LINKS = {
  whatsapp: "",
  facebook: "",
  tiktok: "",
  instagram: "",
  x: "",
  whatsappChannel: "",
};

router.get("/settings/social-links", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const settings = await db.collection("siteSettings").findOne({ _id: "social-links" });
    const links = settings?.links && typeof settings.links === "object" ? settings.links : {};
    res.json({ ...DEFAULT_SOCIAL_LINKS, ...links });
  } catch (err) {
    req.log.error({ err }, "Failed to load social links");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/settings/social-links", async (req, res): Promise<void> => {
  try {
    const links = Object.fromEntries(
      Object.keys(DEFAULT_SOCIAL_LINKS).map((key) => [
        key,
        typeof req.body?.[key] === "string" ? req.body[key].trim().slice(0, 500) : "",
      ]),
    );
    const db = await getDb();
    await db.collection("siteSettings").updateOne(
      { _id: "social-links" },
      { $set: { links, updatedAt: new Date() } },
      { upsert: true },
    );
    res.json(links);
  } catch (err) {
    req.log.error({ err }, "Failed to save social links");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

export { DEFAULT_SOCIAL_LINKS };

