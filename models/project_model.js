// var mysql = require('mysql2');
var helpers = require(app_root + '/routes/helpers/helpers');
var User    = require(app_root + '/models/user_model');
var fs      = require('fs');
var path    = require('path');

class Project {

  constructor(req, res, pid, owner_id) {
    this.req       = req || {};
    this.res       = res || {};
    this.pid       = pid;
    this.this_user = new User();
    this.this_user.getUserInfoFromGlobal(owner_id);
    this.user_obj    = this.this_user.User_obj;
    this.project_obj = {};
    this.make_empty_project_obj();
    // this.make_project_obj();
  }

  make_empty_project_obj() {
    var temp_project_obj = {};

    temp_project_obj = {
      abstract_data: {},
      active: 0,
      created_at: new Date(),
      d_region_arr: [],
      description: "",
      email: "",
      first: "",
      first_name: "",
      funding: 0,
      institution: "",
      last: "",
      last_name: "",
      matrix: 0,
      metagenomic: 0,
      oid: 0,
      owner_user_id: 0,
      permissions: [0], // initially has only project owner_id
      pi_email: "",
      pi_name: "",
      pid: 0,
      project: "",
      project_description: "",
      project_id: 0,
      project_title: "",
      public: 0,
      rev_project_name: "",
      title: "",
      updated_at: new Date(),
      username: "",
    };
    this.project_obj = temp_project_obj;
  }

  // make_project_obj() {
  //   if ((helpers.isInt(this.pid)) && this.pid > 0) {
  //     this.make_project_obj_with_existing_project_info_by_pid();
  //   }
  //   else {
  //     this.make_project_obj_from_new_form_info();
  //   }
  //
  //   console.log("CCHH this.project_obj = ", this.project_obj);
  // }

  get_pid(project_name) {
    var pid = this.pid;
    if (typeof PROJECT_INFORMATION_BY_PNAME[project_name] !== 'undefined') {
      pid = PROJECT_INFORMATION_BY_PNAME[project_name]["pid"];
    }
    return pid;
  }

  make_project_obj_from_new_csv(project_name, data_arr) {
    // TODO: transpose and unique data_arr
    // That assumes one project per submission.
    // TODO: print a warning

    var first_name  = helpers.unique_array(data_arr.first_name)[0];
    var last_name   = helpers.unique_array(data_arr.last_name)[0];
    var email       = helpers.unique_array(data_arr.pi_email)[0];
    var institution = helpers.unique_array(data_arr.institution)[0];
    this.this_user.getUserInfoFromGlobalbyUniqKey(first_name, last_name, email, institution);
    this.user_obj                        = this.this_user.User_obj;
    this.project_obj.abstract_data       = this.get_current_project_abstract_data(project_name);
    this.project_obj.description         = helpers.unique_array(data_arr.project_description)[0] || this.project_obj.description;
    this.project_obj.email               = email;
    this.project_obj.first               = first_name;
    this.project_obj.first_name          = first_name;
    this.project_obj.funding             = helpers.unique_array(data_arr.funding_code)[0] || this.project_obj.funding;
    this.project_obj.institution         = institution;
    this.project_obj.last                = last_name;
    this.project_obj.last_name           = last_name;
    this.project_obj.metagenomic         = helpers.unique_array(data_arr.metagenomic)[0] || this.project_obj.metagenomic;
    this.project_obj.oid                 = this.user_obj.user_id;
    this.project_obj.owner_user_id       = this.user_obj.user_id;
    this.project_obj.permissions         = [this.user_obj.user_id]; // initially has only project owner_id
    this.project_obj.pi_email            = email;
    this.project_obj.pi_name             = first_name + ' ' + last_name;
    this.project_obj.project             = helpers.unique_array(data_arr.project)[0] || project_name;
    this.project_obj.project_description = this.project_obj.description;
    this.project_obj.project_title       = helpers.unique_array(data_arr.project_title)[0] || this.project_obj.title;
    this.project_obj.rev_project_name    = helpers.reverseString(this.project_obj.project);
    this.project_obj.title               = this.project_obj.project_title;
    this.project_obj.updated_at          = new Date();
    this.project_obj.username            = this.user_obj.username;
    // this.project_obj.active: 0,
// this.project_obj.created_at: new Date(),
// this.project_obj.matrix: 0,
// this.project_obj.pid: 0,
// this.project_obj.project_id: 0,
// this.project_obj.public: 0,
  }

  make_project_obj_with_existing_project_info_by_pid(pid) {
    this.project_obj = Object.assign(PROJECT_INFORMATION_BY_PID[pid]);
    const owner_id   = this.project_obj.oid;
    this.this_user.getUserInfoFromGlobal(owner_id);
    this.user_obj = this.this_user.User_obj;

    //renaming
    this.project_obj.project_description = PROJECT_INFORMATION_BY_PID[pid].description;
    this.project_obj.pi_email            = PROJECT_INFORMATION_BY_PID[pid].email;
    this.project_obj.pi_name             = PROJECT_INFORMATION_BY_PID[pid].first + ' ' + PROJECT_INFORMATION_BY_PID[pid].last;
    this.project_obj.first_name          = PROJECT_INFORMATION_BY_PID[pid].first;
    this.project_obj.last_name           = PROJECT_INFORMATION_BY_PID[pid].last;
    this.project_obj.project_id          = PROJECT_INFORMATION_BY_PID[pid].pid;
    this.project_obj.rev_project_name    = helpers.reverseString(PROJECT_INFORMATION_BY_PID[pid].project);
    this.project_obj.project_title       = PROJECT_INFORMATION_BY_PID[pid].title;
    this.project_obj.abstract_data       = this.get_current_project_abstract_data(this.project_obj.project);
    this.project_obj.permissions         = [this.user_obj.user_id]; // initially has only project owner_id

  }

  make_project_obj_from_new_form_info(owner_id) {
    this.this_user.getUserInfoFromGlobal(owner_id);
    this.user_obj        = this.this_user.User_obj;
    var temp_project_obj = {};
    var req              = this.req;
    var d_region_arr     = [];
    var project_name     = "";
    var project_name3    = "";

    d_region_arr  = req.form.d_region.split('#');
    project_name3 = d_region_arr[2];
    if (d_region_arr[0] === 'Shotgun') {
      temp_project_obj.metagenomic = 1;
      project_name3                = 'Sgun';
    }
    project_name                         = req.form.project_name1 + '_' + req.form.project_name2 + '_' + project_name3;
    this.project_obj.abstract_data       = this.get_current_project_abstract_data(this.project_obj.project);
    this.project_obj.description         = req.form.project_description;
    this.project_obj.email               = this.user_obj.email;
    this.project_obj.first               = this.user_obj.first_name;
    this.project_obj.first_name          = this.user_obj.first_name;
    this.project_obj.funding             = req.form.funding_code;
    this.project_obj.institution         = this.user_obj.institution;
    this.project_obj.last                = this.user_obj.last_name;
    this.project_obj.last_name           = this.user_obj.last_name;
    this.project_obj.metagenomic         = 0;
    this.project_obj.oid                 = this.user_obj.user_id;
    this.project_obj.owner_user_id       = this.user_obj.user_id;
    this.project_obj.permissions         = [this.user_obj.user_id]; // initially has only project owner_id
    this.project_obj.pi_email            = this.user_obj.email;
    this.project_obj.pi_name             = this.user_obj.first_name + ' ' + this.user_obj.last_name;
    this.project_obj.project             = project_name;
    this.project_obj.project_description = req.form.project_description;
    this.project_obj.project_title       = req.form.project_title;
    this.project_obj.rev_project_name    = helpers.reverseString(project_name);
    this.project_obj.title               = req.form.project_title;
    this.project_obj.updated_at          = new Date();
    this.project_obj.username            = this.user_obj.username;
    // this.project_obj.active: 0,
// this.project_obj.created_at: new Date(),
// this.project_obj.matrix: 0,
// this.project_obj.pid: 0,
// this.project_obj.project_id: 0,
// this.project_obj.public: 0,
  }

  get_current_project_abstract_data(project) {
    var all_abstract_data = this.get_projects_abstract_data(project, this.req.CONFIG.PATH_TO_STATIC_DOWNLOADS);
    var project_prefix    = this.get_project_prefix(project);
    var current_abstr     = all_abstract_data[project_prefix];
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

  getAllProjects(callback) {

    return connection.query("SELECT * FROM project", callback);

  }

  getProjectById(project_id, callback) {

    return connection.query("SELECT * FROM project WHERE project_id = ?", [project_id], callback);
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
    console.log("IN: Project:addProject");
    console.log('PPP0 project_obj', project_obj);
    // console.log('PPP1 JSON.stringify(project_obj)', JSON.stringify(project_obj));
    const query1 = "INSERT INTO project (project_id, project, title, project_description, rev_project_name, funding, owner_user_id, public, metagenomic, matrix, created_at, updated_at, active) VALUES('" +
      project_obj.project_id + "', '" +
      project_obj.project + "', '" +
      project_obj.title + "', '" +
      project_obj.project_description + "', '" +
      project_obj.rev_project_name + "', '" +
      project_obj.funding + "', '" +
      project_obj.owner_user_id + "', '" +
      project_obj.public + "', '" +
      project_obj.metagenomic + "', '" +
      project_obj.matrix + "', '" +
      project_obj.created_at + "', '" + // TODO: change to valid format
      project_obj.updated_at + "', '" +
      project_obj.active + "') ON DUPLICATE KEY UPDATE project = VALUES(project), rev_project_name = VALUES(rev_project_name);";
    console.log("QQQ0 query1", query1);

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
    // const query_getProjectByName = "SELECT * FROM project WHERE project = ?", [project_name];
    // const query_getProjectByName = "SELECT * FROM project WHERE project = 'DCO_BRZ_Av6'";

    const query_getProjectByName = "SELECT * FROM project WHERE project = " + connection.escape(project_name);
    console.log("FROM getProjectByName: query_getProjectByName", query_getProjectByName);
    return connection.query(query_getProjectByName, callback);
  }

  deleteProject(id, callback) {
    return connection.query("DELETE FROM project WHERE project_id = ?", [id], callback);
  }

  updateProject(id, Project, callback) {
    return connection.query("UPDATE project SET Title = ?, Status = ? WHERE project_id = ?", [Project.Title, Project.Status, id], callback);
  }

  get_project_name_from_file_name(edit_metadata_file) {
    console.time('TIME: get_project_name_from_file_name');
    console.log('IN: get_project_name_from_file_name');
    var edit_metadata_file_parts = [];
    var edit_metadata_project    = '';

    var name_no_path_arr = edit_metadata_file.split('/');
    var name_no_path     = name_no_path_arr[name_no_path_arr.length - 1];
    console.log('FFF05: name_no_path', name_no_path);

    if (name_no_path.includes("-")) {
      // valid file project name
      edit_metadata_file_parts = name_no_path.split('-')[1].split('_') || '';
      console.log('FFF04: edit_metadata_file_parts', edit_metadata_file_parts);

      if (edit_metadata_file_parts.length >= 4) {
        edit_metadata_project = edit_metadata_file_parts[1] + '_' + edit_metadata_file_parts[2] + '_' + edit_metadata_file_parts[3];
      }
    }
    // else {
    // tmp file name, e.g. 38992e2fdc27e34fb1dd4231fc680504
    // }

    console.timeEnd('TIME: get_project_name_from_file_name');
    return edit_metadata_project;
  }

}

module.exports = Project;
//  UNIQUE KEY `project` (`project`),
//   UNIQUE KEY `rev_project_name` (`rev_project_name`),