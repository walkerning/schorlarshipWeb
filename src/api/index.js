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
var scholars = require("./scholars");

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
apiRouter.get("/users", permit(["user"]), catchError(users.list));
// Create user
apiRouter.post("/users", permit(["user"]), catchError(users.create));
// Get user info
apiRouter.get("/users/:userId", permit(["me"], ["user"]), catchError(users.info));
// Update user info
apiRouter.put("/users/:userId", permit(["me"], ["user"]), catchError(users.updateInfo));
// Delete user
apiRouter.delete("/users/:userId", permit(["user"]), catchError(users.delete));

// List the honors this user has applied or got
apiRouter.get("/users/:userId/honors", permit(["me"], ["user"]), catchError(users.listHonors));
// Apply for honor
apiRouter.post("/users/:userId/honors", permit(["me"]), catchError(users.applyHonor));
// Change honor apply status for this user
apiRouter.put("/users/:userId/honors/:honorId", permit(["user", "honor"]), catchError(users.updateHonor));
// Delete a honor apply for this user
apiRouter.delete("/users/:userId/honors/:honorId", permit(["user", "honor"]), catchError(users.deleteHonor));

// List the scholars this user has got
apiRouter.get("/users/:userId/scholars", permit(["me"], ["user"]), catchError(users.listScholars));
// Give a scholar to user
apiRouter.post("/users/:userId/scholars", permit(["user", "scholar"]), catchError(users.giveScholar));
// Upload the thanks-letter form
apiRouter.put("/users/:userId/scholars/:scholarId/thanksletter", permit(["me"]), catchError(users.uploadThanksLetter));
// Delete a scholar for this user
apiRouter.delete("/users/:userId/scholars/:scholarId", permit(["user", "honor"]), catchError(users.deleteScholar));


//// Routing endpoins `/permissions`
// List permissions
apiRouter.get("/permissions", permit(["permission"]), catchError(permissions.list));
// List users of a permission group
apiRouter.get("/permissions/:permissionId/users", permit(["permission"]), catchError(permissions.listUsers));
// Add user to a permission group
apiRouter.post("/permissions/:permissionId/users", permit(["permission"]), catchError(permissions.addUser));
// Delete a user from a permission group
apiRouter.delete("/permissions/:permissionId/users/:userId", permit(["permission"]), catchError(permissions.deleteUser));


//// Routing endpoints `/groups`
// List groups
apiRouter.get("/groups", permit(["user"]), catchError(groups.list));
// Create group
apiRouter.post("/groups", permit(["user"]), catchError(groups.create));
// Update group info
apiRouter.put("/groups/:groupId", permit(["user"]), catchError(groups.updateInfo));


//// Routing endpoints `/forms`
// List forms
apiRouter.get("/forms", permit(["form"]), catchError(forms.list));
// Create forms
apiRouter.post("/forms", permit(["form"]), catchError(forms.create));
// Get form info
apiRouter.get("/forms/:formId", catchError(forms.info));
// Update form
apiRouter.put("/forms/:formId", permit(["form"]), catchError(forms.updateInfo));
// Delete form
apiRouter.delete("/forms/:formId", permit(["form"]), catchError(forms.delete));


//// Routing endpoints `/users/:userId/forms/`. Form-fills
// List fills
apiRouter.get("/users/:userId/forms", permit(["me"], ["form", "user"]), catchError(fills.list));
// Create new fill
apiRouter.post("/users/:userId/forms", permit(["me"]), catchError(fills.create));
// Get fill info
apiRouter.get("/users/:userId/forms/:fillId", permit(["me"], ["form", "user"]), catchError(fills.info));
// Update fill info
apiRouter.put("/users/:userId/forms/:fillId", permit(["me"]), catchError(fills.updateInfo));
// Delete fill?


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


module.exports = apiRouter;
