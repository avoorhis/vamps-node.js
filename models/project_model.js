var mysql = require('mysql2');

var Project    = {

  getAllProjects: function (callback) {

    return connection.query("Select * from project", callback);

  },
  getProjectById: function (id, callback) {

    return connection.query("select * from project where project_id = ?", [project_id], callback);
  },
  addProject: function (Project, callback) {
    return connection.query("INSERT INTO project VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE project = VALUES(project), rev_project_name = VALUES(rev_project_name);", [Project.project_id,
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
  getProjectByName: function (project_name, callback) {
    return connection.query("select * from project where project_name = ?", [project_name], callback);
  },
  deleteProject: function (id, callback) {
    return connection.query("delete from project where Id=?", [id], callback);
  },
  updateProject: function (id, Project, callback) {
    return connection.query("update project set Title=?,Status=? where Id=?", [Project.Title, Project.Status, id], callback);
  }

};
module.exports = Project;
//  UNIQUE KEY `project` (`project`),
//   UNIQUE KEY `rev_project_name` (`rev_project_name`),