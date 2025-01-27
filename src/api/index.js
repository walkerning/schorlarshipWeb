var express = require("express");
var errors = require("../errors");
var permit = require("../middlewares/permission");
// api methods
var users = require("./users");
var permissions = require("./permissions");
var groups = require("./groups");
var forms = require("./forms");
var fills = require("./fills");
var honors = require("./honors");
var users_honors = require("./users_honors");
var scholars = require("./scholars");
var users_scholars = require("./users_scholars");
var reasons = require("./reasons");
var users_reasons = require("./users_reasons");
var groups_honors = require("./groups_honors");
var groups_scholars = require("./groups_scholars");
var groups_reasons = require("./groups_reasons");
var notices = require("./notices");

var apiRouter = express.Router();

function catchError(apiFunc) {
  return function(req, res, next) {
    try {
      apiFunc(req, res, next)
        .catch(function(err) {
          next(err);
        });
    } catch ( err ) {
      next(new errors.InternalServerError({
        stack: err
      }));
    }
  };
}


//// Routing endpoints `/users`
// List users
apiRouter.get("/users", permit(["user"], ["user_honor"], ["user_scholar"]), catchError(users.list));
// Create user
apiRouter.post("/users", permit(["user"]), catchError(users.create));
// Get user info of current context user
// FIXME: do i need to enable visit all the endpoints under `/users` by the special identifier "me"
apiRouter.get("/users/me", catchError(users.infoMe));
// Get user info
apiRouter.get("/users/:userId", permit(["me"], ["user"], ["user_honor"], ["user_scholar"]), catchError(users.info));
// Update user info
apiRouter.put("/users/:userId", permit(["me"], ["user"]), catchError(users.updateInfo));
// Reset user password. This is a pseudo resource "newPassword"
apiRouter.put("/users/:userId/newPassword", permit(["user"]), catchError(users.newPassword));
// Delete user
apiRouter.delete("/users/:userId", permit(["user"]), catchError(users.delete));

// List the honors this user has applied or got
apiRouter.get("/users/:userId/honors", permit(["me"], ["user_honor"]), catchError(users_honors.listHonors));
// Apply for honor
apiRouter.post("/users/:userId/honors", permit(["me", "apply"]), catchError(users_honors.applyHonor));
// Delete a honor application
// apiRouter.delete("/users/:userId/honors/:honorId", permit(["me", "apply"]), catchError(users_honors.cancelHonor));
apiRouter.delete("/users/:userId/honors/:honorId", permit(["user_honor"]), catchError(users_honors.cancelHonor));
// Change honor apply status for this user
apiRouter.put("/users/:userId/honors/:honorId/admin", permit(["user_honor"]), catchError(users_honors.updateHonor));
// Change honor apply fill content when the state is "temp"
apiRouter.put("/users/:userId/honors/:honorId", permit(["user_honor"], ["me", "apply"]), catchError(users_honors.updateHonorFill));
// Add score for a user honor state
apiRouter.post("/users/:userId/honors/:honorId/scores", permit(["user_honor"]), catchError(users_honors.addHonorScore));
// Update score for a user honor state
apiRouter.put("/users/:userId/honors/:honorId/scores/:scorerId", permit(["user_honor", "me_scorer"]), catchError(users_honors.updateHonorScore));
// Delete score for a user honor state
apiRouter.delete("/users/:userId/honors/:honorId/scores/:scorerId", permit(["user_honor", "me_scorer"]), catchError(users_honors.deleteHonorScore));

// List the scholars this user has got
apiRouter.get("/users/:userId/scholars", permit(["me"], ["user"], ["user_honor"], ["user_scholar"]), catchError(users_scholars.listScholars));
// Give a scholar to user
apiRouter.post("/users/:userId/scholars", permit(["user_scholar"]), catchError(users_scholars.giveScholar));
// Change money for a scholar owner
apiRouter.put("/users/:userId/scholars/:scholarId", permit(["user_scholar"]), catchError(users_scholars.updateScholar));
// Upload the thanks-letter form
apiRouter.post("/users/:userId/scholars/:scholarId/thanksletter", permit(["me"]), catchError(users_scholars.uploadThanksLetter));
// Change the thanks-letter form
apiRouter.put("/users/:userId/scholars/:scholarId/thanksletter", permit(["me"], ["user_scholar"]), catchError(users_scholars.changeThanksLetter));
// Delete a scholar for this user
apiRouter.delete("/users/:userId/scholars/:scholarId", permit(["user_scholar"]), catchError(users_scholars.deleteScholar));

// users-reasons endpoints.
apiRouter.get("/users/:userId/reasons", permit(["me"], ["user"], ["user_honor"]), catchError(users_reasons.listReasons));
// Apply a reason
apiRouter.post("/users/:userId/reasons", permit(["me", "apply"]), catchError(users_reasons.applyReason));
// Change a reason fill
apiRouter.put("/users/:userId/reasons/:reasonId", permit(["me", "apply"], ["user_honor"]), catchError(users_reasons.updateReasonFill));

//// Routing endpoins `/permissions`
// List permissions
apiRouter.get("/permissions", permit(["permission"]), catchError(permissions.list));
// List users of a permission group
apiRouter.get("/permissions/:permissionName/users", permit(["permission"]), catchError(permissions.listUsers));
// Add user to a permission group
apiRouter.post("/permissions/:permissionName/users", permit(["permission"]), catchError(permissions.addUser));
// Delete a user from a permission group
apiRouter.delete("/permissions/:permissionName/users/:userId", permit(["permission"]), catchError(permissions.deleteUser));


//// Routing endpoints `/groups`
// List groups
apiRouter.get("/groups", permit(["user"], ["user_honor"], ["user_scholar"]), catchError(groups.list));
// Create group
apiRouter.post("/groups", permit(["user"]), catchError(groups.create));
// Update group info
apiRouter.put("/groups/:groupId", permit(["user"]), catchError(groups.updateInfo));

// List the honors that the members in a group have
apiRouter.get("/groups/:groupId/honors", permit(["user_honor"]), catchError(groups_honors.list));

// List the scholars that the members in a group have
apiRouter.get("/groups/:groupId/scholars", permit(["user_scholar"]), catchError(groups_scholars.list));

// List the scholars that the members in a group have
apiRouter.get("/groups/:groupId/reasons", permit(["user_honor"]), catchError(groups_reasons.list));

//// Routing endpoints `/forms`
// List forms
apiRouter.get("/forms", catchError(forms.list));
// Create forms
apiRouter.post("/forms", permit(["form"]), catchError(forms.create));
// Get form info
apiRouter.get("/forms/:formId", catchError(forms.info));
// Update form
apiRouter.put("/forms/:formId", permit(["form"]), catchError(forms.updateInfo));
// Delete form
apiRouter.delete("/forms/:formId", permit(["form"]), catchError(forms.delete));


// //// Routing endpoints `/users/:userId/forms/`. Form-fills
// // List fills
// apiRouter.get("/users/:userId/forms", permit(["me"], ["form", "user"]), catchError(fills.list));
// // Create new fill
// apiRouter.post("/users/:userId/forms", permit(["me"]), catchError(fills.create));
// // Get fill info
// apiRouter.get("/users/:userId/forms/:fillId", permit(["me"], ["form", "user"]), catchError(fills.info));
// // Update fill info
// apiRouter.put("/users/:userId/forms/:fillId", permit(["me"]), catchError(fills.updateInfo));
// // Delete fill?


//// Routing endpoints `/honors`
// List honors
apiRouter.get("/honors", catchError(honors.list));
// Create honor
apiRouter.post("/honors", permit(["honor"]), catchError(honors.create));
// Get honor info
apiRouter.get("/honors/:honorId", catchError(honors.info));
// Update honor info
apiRouter.put("/honors/:honorId", permit(["honor"]), catchError(honors.updateInfo));
// Delete honor
apiRouter.delete("/honors/:honorId", permit(["honor"]), catchError(honors.delete));

//// Routing endpoints `/scholars`
// List scholars
apiRouter.get("/scholars", catchError(scholars.list));
// Create scholar
apiRouter.post("/scholars", permit(["scholar"]), catchError(scholars.create));
// Get scholar info
apiRouter.get("/scholars/:scholarId", catchError(scholars.info));
// Update scholar info
apiRouter.put("/scholars/:scholarId", permit(["scholar"]), catchError(scholars.updateInfo));
// Delete scholar
apiRouter.delete("/scholars/:scholarId", permit(["scholar"]), catchError(scholars.delete));

//// Routing endpoints `/reasons`
// List reasons
apiRouter.get("/reasons", catchError(reasons.list));
// Create reason
apiRouter.post("/reasons", permit(["honor"]), catchError(reasons.create));
// Get reason info
apiRouter.get("/reasons/:reasonId", catchError(reasons.info));
// Update reason info
apiRouter.put("/reasons/:reasonId", permit(["honor"]), catchError(reasons.updateInfo));
// Delete reason
apiRouter.delete("/reasons/:reasonId", permit(["honor"]), catchError(reasons.delete));

//// Routing endpoints `/notices`
// List notices
apiRouter.get("/notices", catchError(notices.list));
// Create notice
apiRouter.post("/notices", permit(["notice"]), catchError(notices.create));
// Get notice info
apiRouter.get("/notices/:noticeId", catchError(notices.info));
// Update notice info
apiRouter.put("/notices/:noticeId", permit(["notice"]), catchError(notices.updateInfo));
// Upload attachment for notice
apiRouter.post("/notices/:noticeId/attachment", permit(["notice"]), catchError(notices.uploadAttachment));
// Delete attachment for notice
apiRouter.delete("/notices/:noticeId/attachment", permit(["notice"]), catchError(notices.deleteAttachment));
// Delete notice
apiRouter.delete("/notices/:noticeId", permit(["notice"]), catchError(notices.delete));

module.exports = apiRouter;
