var mysql = require('mysql2');

var Project    = {

  getAllProjects: function (callback) {

    return connection.query("Select * from project", callback);

  },
  getProjectById: function (id, callback) {

    return connection.query("select * from project where project_id = ?", [project_id], callback);
  },
  addProject: function (Project, callback) {
    return connection.query("Insert into project values(?,?,?,?,?,?,?,?,?,?,?,?,?)", [Project.project_id,
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
    return connection.query("delete from project where Id=?", [id], callback);
  },
  updateProject: function (id, Project, callback) {
    return connection.query("update project set Title=?,Status=? where Id=?", [Project.Title, Project.Status, id], callback);
  }

};
module.exports = Project;
