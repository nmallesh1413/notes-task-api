const { body, param } = require("express-validator");

const statuses = ["pending", "in-progress", "completed"];
const priorities = ["low", "medium", "high"];

const createNoteRules = [
  body("title").trim().notEmpty().withMessage("Title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must contain 3 to 100 characters"),
  body("description").trim().notEmpty().withMessage("Description is required")
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
  body("priority").optional().isIn(priorities).withMessage("Invalid priority"),
  body("dueDate").optional({ values: "null" }).isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date"),
];

const updateNoteRules = [
  param("id").isMongoId().withMessage("Invalid note ID"),
  body().isObject().withMessage("Request body must be a JSON object"),
  body().custom((value) => {
    const allowed = ["title", "description", "status", "priority", "dueDate"];
    const keys = Object.keys(value);
    if (!keys.length) throw new Error("Provide at least one field to update");
    const invalid = keys.filter((key) => !allowed.includes(key));
    if (invalid.length) throw new Error(`Unknown field(s): ${invalid.join(", ")}`);
    return true;
  }),
  body("title").optional().trim().isLength({ min: 3, max: 100 })
    .withMessage("Title must contain 3 to 100 characters"),
  body("description").optional().trim().notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
  body("priority").optional().isIn(priorities).withMessage("Invalid priority"),
  body("dueDate").optional({ values: "null" }).isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date"),
];

const noteIdRules = [
  param("id").isMongoId().withMessage("Invalid note ID"),
];

module.exports = { createNoteRules, updateNoteRules, noteIdRules };
