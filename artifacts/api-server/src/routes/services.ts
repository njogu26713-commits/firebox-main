import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb";

const router = Router();

router.get("/services", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const col = db.collection("services");

    const filter: Record<string, unknown> = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.popular !== undefined) filter.popular = req.query.popular === "true";
    if (req.query.recent !== undefined) filter.recent = req.query.recent === "true";
    if (req.query.q) {
      const q = req.query.q as string;
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { tagline: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { keywords: { $regex: q, $options: "i" } },
      ];
    }

    const services = await col.find(filter).toArray();
    res.json(services.map((s) => ({ ...s, _id: s._id.toString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list services");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/services", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const col = db.collection("services");

    const body = req.body;
    if (!body.id || !body.name || !body.tagline || !body.description || !body.category || !body.status || !body.iconName) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existing = await col.findOne({ id: body.id });
    if (existing) {
      res.status(400).json({ error: "Service with this id already exists" });
      return;
    }

    const doc = {
      id: body.id,
      name: body.name,
      tagline: body.tagline,
      description: body.description,
      category: body.category,
      status: body.status,
      iconName: body.iconName,
      iconUrl: body.iconUrl ?? "",
      keywords: body.keywords ?? [],
      popular: body.popular ?? false,
      recent: body.recent ?? false,
      features: body.features ?? [],
      url: body.url ?? "",
    };

    const result = await col.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId.toString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/services/:id", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const col = db.collection("services");

    const service = await col.findOne({ id: req.params.id });
    if (!service) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    res.json({ ...service, _id: service._id.toString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/services/:id", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const col = db.collection("services");

    const allowed = ["name", "tagline", "description", "category", "status", "iconName", "iconUrl", "keywords", "popular", "recent", "features", "url"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in req.body) update[key] = req.body[key];
    }

    if (Object.keys(update).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const result = await col.findOneAndUpdate(
      { id: req.params.id },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    res.json({ ...result, _id: result._id.toString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update service");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/services/:id", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const col = db.collection("services");

    const result = await col.findOneAndDelete({ id: req.params.id });
    if (!result) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    res.json({ success: true, id: req.params.id });
  } catch (err) {
    req.log.error({ err }, "Failed to delete service");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
