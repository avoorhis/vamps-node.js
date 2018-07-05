// var mysql = require('mysql2');
var helpers = require(app_root + '/routes/helpers/helpers');

class Project {

  constructor(req, res, user_obj) {
    this.req         = req || {};
    this.res         = res || {};
    this.user_obj = user_obj;
    this.project_obj = this.make_project_obj();
  }

  make_project_obj(req) {
    req                     = this.req;
    var d_region_arr        = [];
    var funding             = "";
    var metagenomic        = 0;
    var project_description = "";
    var project_name        = "";
    var project_name3       = "";
    var title               = "";

    if (typeof req.form !== 'undefined') {
      d_region_arr        = req.form.d_region.split('#');
      funding             = req.form.funding_code;
      project_description = req.form.project_description;
      project_name        = req.form.project_name1 + '_' + req.form.project_name2 + '_' + d_region_arr[2];
      title               = req.form.project_title;
      if (d_region_arr[0] === 'Shotgun') {
        metagenomic  = 1;
        project_name3 = 'Sgun';
      }
    }

    var project_obj = {
      active: 0,
      created_at: new Date(),
      funding: req.form.funding_code,
      matrix: 0,
      metagenomic: metagenomic,
      owner_info: this.user_obj,
      owner_user_id: this.user_obj.user_id,
      project: project_name,
      project_description: project_description,
      project_id: 0,
      public: 0,
      rev_project_name: helpers.reverseString(project_name),
      title: title,
      updated_at: new Date(),
    };
    console.log("CCHH this.project_obj = ", project_obj);
    return project_obj;
  }

  add_info_to_globals() {}

  getAllProjects(callback) {

    return connection.query("Select * from project", callback);

  }

  getProjectById(project_id, callback) {

    return connection.query("select * from project where project_id = ?", [project_id], callback);
  }

  addProject(project_obj, callback) {
    return connection.query("INSERT INTO project VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE project = VALUES(project), rev_project_name = VALUES(rev_project_name);", [project_obj.project_id,
      project_obj.project,
      project_obj.title,
      project_obj.project_description,
      project_obj.rev_project_name,
      project_obj.funding,
      project_obj.owner_user_id,
      project_obj.public,
      project_obj.metagenomic,
      project_obj.matrix,
      project_obj.created_at,
      project_obj.updated_at,
      project_obj.active
    ], callback);
  }

  getProjectByName(project_name, callback) {
    return connection.query("select * from project where project_name = ?", [project_name], callback);
  }

  deleteProject(id, callback) {
    return connection.query("delete from project where Id=?", [id], callback);
  }

  updateProject(id, Project, callback) {
    return connection.query("update project set Title=?,Status=? where Id=?", [Project.Title, Project.Status, id], callback);
  }

}

module.exports = Project;
//  UNIQUE KEY `project` (`project`),
//   UNIQUE KEY `rev_project_name` (`rev_project_name`),