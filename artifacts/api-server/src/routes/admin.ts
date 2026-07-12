import { Router } from "express";
import { getDb } from "../lib/mongodb";

const router = Router();

router.get("/admin/stats", async (req, res): Promise<void> => {
  try {
    const db = await getDb();
    const col = db.collection("services");

    const total = await col.countDocuments();
    const available = await col.countDocuments({ status: "Available" });
    const beta = await col.countDocuments({ status: "Beta" });
    const comingSoon = await col.countDocuments({ status: "Coming Soon" });
    const recentCount = await col.countDocuments({ recent: true });
    const popularCount = await col.countDocuments({ popular: true });

    const categoryAgg = await col
      .aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }])
      .toArray();

    const byCategory: Record<string, number> = {};
    for (const row of categoryAgg) {
      byCategory[row._id as string] = row.count as number;
    }

    res.json({ total, available, beta, comingSoon, byCategory, recentCount, popularCount });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
