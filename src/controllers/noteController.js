const mongoose = require("mongoose");
const Note = require("../models/Note");

async function createNote(req, res, next) {
  try {
    const note = await Note.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, message: "Note created successfully", data: note });
  } catch (error) {
    next(error);
  }
}

async function getAllNotes(req, res, next) {
  try {
    const filter = { user: req.user._id };
    const allowedStatuses = ["pending", "in-progress", "completed"];
    const allowedPriorities = ["low", "medium", "high"];

    if (req.query.status) {
      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }
      filter.status = req.query.status;
    }
    if (req.query.priority) {
      if (!allowedPriorities.includes(req.query.priority)) {
        return res.status(400).json({ success: false, message: "Invalid priority filter" });
      }
      filter.priority = req.query.priority;
    }
    if (req.query.search) {
      const search = String(req.query.search).trim();
      if (search.length > 100) {
        return res.status(400).json({ success: false, message: "Search query is too long" });
      }
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    const allowedSortFields = ["createdAt", "updatedAt", "title", "dueDate", "priority", "status"];
    const sortBy = req.query.sortBy || "createdAt";
    const order = req.query.order || "desc";
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({ success: false, message: "Invalid sorting field" });
    }
    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({ success: false, message: "Sort order must be asc or desc" });
    }

    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);
    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Page must be a positive integer and limit must be between 1 and 100",
      });
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: order === "asc" ? 1 : -1, _id: 1 };
    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).sort(sort).skip(skip).limit(limit),
      Note.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: notes.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalNotes / limit),
        totalNotes,
        limit,
      },
      data: notes,
    });
  } catch (error) {
    next(error);
  }
}

async function getNoteById(req, res, next) {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    next(error);
  }
}

async function updateNote(req, res, next) {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.status(200).json({ success: true, message: "Note updated successfully", data: note });
  } catch (error) {
    next(error);
  }
}

async function deleteNote(req, res, next) {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    res.status(200).json({ success: true, message: "Note deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = { createNote, getAllNotes, getNoteById, updateNote, deleteNote };
