var mysql = require('mysql2');

// exports.get_projects_by_user = function (callback) {
//
//   return connection.query("Select * from vamps2.project", callback);
//
// };


var Project    = {

  getAllProjects: function (callback) {

    return connection.query("Select * from vamps2.project", callback);

  },
  getProjectById: function (id, callback) {

    return connection.query("select * from vamps2.project where project_id = ?", [project_id], callback);
  },
  addProject: function (Project, callback) {
    return connection.query("Insert into vamps2.project values(?,?,?,?,?,?,?,?,?,?,?,?,?)", [Project.project_id,
      Project.project,
      Project.title,
      Project.project_description,
      Project.rev_project_name,
      Project.funding,
      Project.owner_user_id,
      Project.public,
      Project.metagenomic,
      Project.matrix,
      Project.created_at,
      Project.updated_at,
      Project.active
    ], callback);
  },
  deleteProject: function (id, callback) {
    return connection.query("delete from vamps2.project where Id=?", [id], callback);
  },
  updateProject: function (id, Project, callback) {
    return connection.query("update vamps2.project set Title=?,Status=? where Id=?", [Project.Title, Project.Status, id], callback);
  }

};
module.exports = Project;
