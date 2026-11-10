const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const { createNoteRules, updateNoteRules, noteIdRules } = require("../validators/noteValidators");
const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

const router = express.Router();

router.use(protect);
router.route("/")
  .post(createNoteRules, validateRequest, createNote)
  .get(getAllNotes);

router.route("/:id")
  .get(noteIdRules, validateRequest, getNoteById)
  .put(updateNoteRules, validateRequest, updateNote)
  .delete(noteIdRules, validateRequest, deleteNote);

module.exports = router;
