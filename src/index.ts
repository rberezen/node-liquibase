#!/usr/bin/env node
import { spawn } from 'child_process';
import { join } from 'path';
import { LiquibaseCommands } from './enums/liquibase-commands.enum';
import { LiquibaseConfig } from './models/liquibase-config.model';
import { UpdateCommandAttributes } from './models/update-command-attributes.model';


export class Liquibase {
  /**
	 * @description Returns an instance of a lightweight Liquibase Wrapper.
	 *
	 * @param params Configuration for an instance of `Liquibase`
	 *
	 * * @example
   * ```javascript
   * const liquibase = require('node-liquibase');
   *
   * const config = {
   *   contexts: 'TEST,DEV',
   *   labels: 'staging,Jira-1200',
   *   logLevel: 'debug',
   *   overwriteOutputFile: 'true',
   *   logFile: 'myLog.log'
   * };
   *
   * liquibase(config)
   *   .run('status', '--verbose')
   *   .then(() => console.log('success'))
   *   .catch((err) => console.error('fail', err));
   * ```
	 */
  constructor(
    private params: LiquibaseConfig,
  ) {
    this.mergeParamsWithDefaults(params);
  }

  /**
  * The update command deploys any changes that are in the changelog file and that have not been deployed to your database yet.
  * @param params Arguments/Attributes for the command
  *
  * @description The update command is typically used to apply database changes that are specified in the changelog file to your database.
  * When you run the update command, Liquibase sequentially reads changesets in the changelog file, then it compares the unique identifiers of id, author, and path to filename to the values stored in the DATABASECHANGELOG table.
  * If the unique identifiers do not exist, Liquibase will apply the changeset to the database.
  * If the unique identifiers exist, the MD5Sum of the changeset is compared to the one in the database.
  * If they are different, Liquibase will produce an error message that someone has changed it unexpectedly. However, if the status of the runOnChange or runAlways changeset attribute is set to TRUE, Liquibase will re-apply the changeset.
  */
  public update(params: UpdateCommandAttributes) {
    const paramString = this.stringifyParams(params);
    this.run(LiquibaseCommands.Update, paramString)
  }

  private stringifyParams(params: { [key: string]: any }) {
    let commandString = '';

    for (const property in params) {
      const targetValue = params[property];
      commandString += `--${property}=${JSON.stringify(targetValue)} `
    }

    return commandString;
  }

  /**
   * LEGACY CODE START
   */
  /**
   * Spawns a Liquibase command.
   * @param {*} action a string for the Liquibase command to run. Defaults to `'update'`
   * @param {*} params any parameters for the command
   * @returns {Promise} Promise of a node child process.
   */
  private run(action: LiquibaseCommands, params = '') {
    return this.spawnChildProcess(`${this.liquibasePathAndGlobalAttributes} ${action} ${params}`);
  }

  /**
   * Internal Getter that returns a node child process compatible command string.
   * @returns {string}
   * @private
   */
  private get liquibasePathAndGlobalAttributes() {
    let liquibasePathAndGlobalAttributes = `${this.params.liquibase}`;
    Object.keys(this.params).forEach(key => {
      if (key === 'liquibase') {
        return;
      }
      const value = (this.params as { [key: string]: any })[key];
      liquibasePathAndGlobalAttributes = `${liquibasePathAndGlobalAttributes} --${key}=${value}`;
    });
    return liquibasePathAndGlobalAttributes;
  }

  /**
   *
   * Internal method for executing a child process.
   * @param {*} commandString Liquibase commandString
   */
  private spawnChildProcess(commandString: string): Promise<number | null | Error> {
    console.log(`Running ${commandString}...`);

    return new Promise((resolve, reject) => {
      const spawnedChild = spawn(commandString);
      spawnedChild.on('error', (err) => {
        return reject(err);
      });

      spawnedChild.on('close', (code) => {
        console.log(`Exited with code ${code}`);
        return resolve(code);
      });

      spawnedChild.stdout.on('data', (standardOutput) => {
        console.log('\n', standardOutput);
      });

      spawnedChild.stderr.on('data', (standardError) => {
        console.error('\n', standardError);
      });
    });
  }

  private mergeParamsWithDefaults(params: LiquibaseConfig) {
    const defaultParams = {
      // MSSQL Default Parameters
      liquibase: join(__dirname, './liquibase/liquibase'),
      changeLogFile: join(__dirname, './change-log-examples/mssql/changelog.mssql.sql'),
      url: '"jdbc:sqlserver://<IP OR HOSTNAME>:<port number>;database=<database name>;"',
      username: '<username>',
      password: '<password>',
      // liquibaseProLicenseKey: '<paste liquibase-pro-license-key here>',
      classpath: join(__dirname, './drivers/mssql-jdbc-7.4.1.jre8.jar')
      // PostgreSQL Default Parameters Template
      // liquibase: 'liquibase/liquibase',
      // changeLogFile: 'change-log-examples/postgreSQL/changelog.postgresql.sql',
      // url: 'jdbc:postgresql://<IP OR HOSTNAME>:5432/MY_DATABASE_TEST',
      // username: 'postgres',
      // password: 'password',
      // //liquibaseProLicenseKey: '<paste liquibase-pro-license-key here>',
      // classpath: 'drivers/postgresql-42.2.8.jar'
    };

    this.params = Object.assign({}, defaultParams, params);
  }
  /**
   * LEGACY CODE END
  **/
}
