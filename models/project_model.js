// var mysql = require('mysql2');
var helpers = require(app_root + '/routes/helpers/helpers');
var User    = require(app_root + '/models/user_model');
var fs      = require('fs');
var path    = require('path');

class Project {

  constructor(req, res, pid, owner_id) {
    this.req      = req || {};
    this.res      = res || {};
    this.pid      = pid;
    this.user_obj = User.getUserInfoFromGlobal(owner_id);

    this.project_obj = {};
    this.make_project_obj();
  }

  make_project_obj() {
    if ((helpers.isInt(this.pid)) && this.pid > 0) {
      this.make_project_obj_with_existing_project_info_by_pid();
    }
    else {
      this.make_project_obj_from_new_form_info();
    }

    console.log("CCHH this.project_obj = ", this.project_obj);
  }

  make_project_obj_with_existing_project_info_by_pid() {
    var temp_project_obj = Object.assign(PROJECT_INFORMATION_BY_PID[this.pid]);

    var pid               = this.pid;

    temp_project_obj.project_description = PROJECT_INFORMATION_BY_PID[pid].description;
    temp_project_obj.pi_email            = PROJECT_INFORMATION_BY_PID[pid].email;
    temp_project_obj.pi_name             = PROJECT_INFORMATION_BY_PID[pid].first + ' ' + PROJECT_INFORMATION_BY_PID[pid].last;
    temp_project_obj.first_name          = PROJECT_INFORMATION_BY_PID[pid].first;
    temp_project_obj.last_name           = PROJECT_INFORMATION_BY_PID[pid].last;
    temp_project_obj.project_id          = PROJECT_INFORMATION_BY_PID[pid].pid;
    temp_project_obj.rev_project_name    = helpers.reverseString(PROJECT_INFORMATION_BY_PID[pid].project);
    temp_project_obj.project_title       = PROJECT_INFORMATION_BY_PID[pid].title;
    temp_project_obj.abstract_data       = this.get_current_project_abstract_data(temp_project_obj.project);
    // temp_project_obj.funding             = req.form.funding_code;

    this.project_obj = temp_project_obj;
  }

  make_project_obj_from_new_form_info() {
    var temp_project_obj = {};
    var req              = this.req;
    var d_region_arr     = [];
    var project_name     = "";
    var project_name3    = "";

    temp_project_obj = {
      active: 0,
      created_at: new Date(),
      email: this.user_obj.email,
      first: this.user_obj.first_name,
      first_name: this.user_obj.first_name,
      institution: this.user_obj.institution,
      last: this.user_obj.last_name,
      last_name: this.user_obj.last_name,
      matrix: 0,
      oid: this.user_obj.user_id,
      owner_user_id: this.user_obj.user_id,
      permissions: [this.user_obj.user_id], // initially has only project owner_id
      pi_email: this.user_obj.email,
      pi_name: this.user_obj.first_name + ' ' + this.user_obj.last_name,
      pid: 0,
      project_id: 0,
      public: 0,
      updated_at: new Date(),
      username: this.user_obj.username,
    };

    if ((typeof req.form !== 'undefined') && (typeof req.form.d_region !== 'undefined')) {
      d_region_arr = req.form.d_region.split('#');
      if (d_region_arr[0] === 'Shotgun') {
        temp_project_obj.metagenomic = 1;
        project_name3                = 'Sgun';
      }
      project_name3                        = d_region_arr[2];
      temp_project_obj.funding             = req.form.funding_code;
      temp_project_obj.metagenomic         = 0;
      project_name                         = req.form.project_name1 + '_' + req.form.project_name2 + '_' + project_name3;
      temp_project_obj.project             = project_name;
      temp_project_obj.project_description = req.form.project_description;
      temp_project_obj.description         = req.form.project_description;
      temp_project_obj.rev_project_name    = helpers.reverseString(project_name);
      temp_project_obj.title               = req.form.project_title;
      temp_project_obj.project_title       = req.form.project_title;
      temp_project_obj.abstract_data       = this.get_current_project_abstract_data(temp_project_obj.project);

      // env_package_id

    }
    this.project_obj = temp_project_obj;
  }

  get_current_project_abstract_data(project) {
    var all_abstract_data = this.get_projects_abstract_data(project, this.req.CONFIG.PATH_TO_STATIC_DOWNLOADS);
    var project_prefix    = this.get_project_prefix(project);
    var current_abstr = all_abstract_data[project_prefix];
    if (typeof current_abstr === 'undefined') {
      current_abstr      = {};
      current_abstr.pdfs = [];
    }
    return current_abstr;
  }

  get_projects_abstract_data(project, path_to_static) {
    console.time('TIME: get_projects_abstract_data');

    var info_file     = '';
    var abstract_data = {};
    if (project.substring(0, 3) === 'DCO') {
      info_file     = path.join(path_to_static, 'abstracts', 'DCO_info.json');
      abstract_data = JSON.parse(fs.readFileSync(info_file, 'utf8'));
    }

    console.timeEnd('TIME: get_projects_abstract_data');
    return abstract_data;
  }

  get_project_prefix(project) {
    console.time('TIME: get_project_prefix');
    var project_parts  = project.split('_');
    var project_prefix = project;

    if (project_parts.length >= 2) {
      project_prefix = project_parts[0] + '_' + project_parts[1];
    }
    console.timeEnd('TIME: get_project_prefix');
    return project_prefix;
  }

  add_info_to_globals() {
  }

  getAllProjects(callback) {

    return connection.query("Select * from project", callback);

  }

  getProjectById(project_id, callback) {

    return connection.query("select * from project where project_id = ?", [project_id], callback);
  }

  add_info_to_project_globals(object_to_add, pid) {

    //undefined: env_package_id
    if (typeof PROJECT_INFORMATION_BY_PID[pid] === 'undefined') {
      PROJECT_INFORMATION_BY_PID[pid]            = Object.assign(object_to_add);
      PROJECT_INFORMATION_BY_PID[pid].pid        = pid;
      PROJECT_INFORMATION_BY_PID[pid].project_id = pid;
    }

    if (typeof PROJECT_INFORMATION_BY_PNAME[object_to_add.project] === 'undefined') {
      PROJECT_INFORMATION_BY_PNAME[object_to_add.project] = Object.assign(PROJECT_INFORMATION_BY_PID[pid]);
    }
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