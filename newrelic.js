'use strict'

/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['vamps-node.js'],
  /**
   * Your New Relic license key.
   */
  license_key: '8b6e39d80ca138e7e5a4f935d497cd8c145c1c01',
  logging: {
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    //level: 'trace'
    level: 'info'
  }
}
