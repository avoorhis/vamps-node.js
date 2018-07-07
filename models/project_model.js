// var mysql = require('mysql2');
var helpers = require(app_root + '/routes/helpers/helpers');
var User    = require(app_root + '/models/user_model');

class Project {

  constructor(req, res, pid, owner_id) {
    this.req      = req || {};
    this.res      = res || {};
    this.pid      = pid;
    this.user_obj = User.getUserInfoFromGlobal(owner_id);

    this.project_obj = this.make_project_obj();
  }

  make_project_obj() {
    var project_obj   = {};
    var req           = this.req;
    var d_region_arr  = [];
    // var funding             = "";
    var metagenomic   = 0;
    // var project_description = "";
    var project_name  = "";
    var project_name3 = "";
    // var title               = "";

    if ((helpers.isInt(this.pid)) && this.pid > 0) {
      project_obj = Object.assign(PROJECT_INFORMATION_BY_PID[this.pid]);
    }
    else {
      project_obj = {
        active: 0,
        created_at: new Date(),
        matrix: 0,
        owner_info: this.user_obj,
        owner_user_id: this.user_obj.user_id,
        project_id: 0,
        public: 0,
        updated_at: new Date(),
        first_name: this.user_obj.first_name,
        institution: this.user_obj.institution,
        last_name: this.user_obj.last_name,
        pi_email: this.user_obj.email,
        pi_name: this.user_obj.first_name + ' ' + this.user_obj.last_name,
        username: this.user_obj.username
      };
    }

    if ((typeof req.form !== 'undefined') && (typeof req.form.d_region !== 'undefined')) {
      d_region_arr                    = req.form.d_region.split('#');
      project_obj.funding             = req.form.funding_code;
      project_obj.metagenomic         = metagenomic;
      project_obj.project             = req.form.project_name1 + '_' + req.form.project_name2 + '_' + d_region_arr[2];
      project_obj.project_description = req.form.project_description;
      project_obj.rev_project_name    = helpers.reverseString(project_name);
      project_obj.title               = req.form.project_title;
      if (d_region_arr[0] === 'Shotgun') {
        metagenomic   = 1;
        project_name3 = 'Sgun';
      }

    }
    else {
      if (typeof req.body.project_id !== 'undefined' && (helpers.isInt(req.body.project_id))) {
        var pid = this.pid;

        project_obj.project_description = PROJECT_INFORMATION_BY_PID[pid].description;
        project_obj.pi_email            = PROJECT_INFORMATION_BY_PID[pid].email;
        project_obj.pi_name             = PROJECT_INFORMATION_BY_PID[pid].first + ' ' + PROJECT_INFORMATION_BY_PID[pid].last;
        project_obj.first_name          = PROJECT_INFORMATION_BY_PID[pid].first;
        project_obj.last_name           = PROJECT_INFORMATION_BY_PID[pid].last;
        project_obj.project_id          = PROJECT_INFORMATION_BY_PID[pid].pid;
        project_obj.rev_project_name    = helpers.reverseString(PROJECT_INFORMATION_BY_PID[pid].project);
        project_obj.project_title       = PROJECT_INFORMATION_BY_PID[pid].title;
        // project_obj.funding             = req.form.funding_code;

      }
      // else {
      //   project_info = PROJECT_INFORMATION_BY_PNAME[project_name_or_pid];
      // }

    }
    //
    // project_obj = {
    //   active: 0,
    //   created_at: new Date(),
    //   funding: funding,
    //   matrix: 0,
    //   metagenomic: metagenomic,
    //   owner_info: this.user_obj,
    //   owner_user_id: this.user_obj.user_id,
    //   project: project_name,
    //   project_description: project_description,
    //   project_id: 0,
    //   public: 0,
    //   rev_project_name: helpers.reverseString(project_name),
    //   title: title,
    //   updated_at: new Date(),
    //   first_name: this.user_obj.first,
    //   institution: this.user_obj.institution,
    //   last_name: this.user_obj.last,
    //   pi_email: this.user_obj.email,
    //   pi_name: this.user_obj.first + ' ' + this.user_obj.last,
    //   username: this.user_obj.username
    //
    // };

    console.log("CCHH this.project_obj = ", project_obj);
    return project_obj;
  }

  add_info_to_globals() {
  }

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