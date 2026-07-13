import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../lib/mongodb";

const router = Router();

// List all tutorials
router.get("/tutorials", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const tutorials = await db.collection("tutorials").find({}).sort({ createdAt: -1 }).toArray();
    res.json(tutorials.map(t => ({ ...t, _id: t._id.toString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to list tutorials");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Upload a tutorial
router.post("/tutorials", async (req, res): Promise<void> => {
  try {
    const { title, description, fileName, fileType, fileData } = req.body;
    if (!title || !fileName || !fileType || !fileData) {
      res.status(400).json({ error: "title, fileName, fileType, and fileData are required" });
      return;
    }
    const db = await getDb();
    const result = await db.collection("tutorials").insertOne({
      title,
      description: description ?? "",
      fileName,
      fileType,
      fileData,
      createdAt: new Date(),
    });
    res.status(201).json({ id: result.insertedId.toString(), title });
  } catch (err) {
    req.log.error({ err }, "Failed to create tutorial");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a tutorial
router.delete("/tutorials/:id", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const result = await db.collection("tutorials").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Tutorial not found" });
      return;
    }
    res.status(204).end();
  } catch (err) {
    req.log.error({ err }, "Failed to delete tutorial");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
