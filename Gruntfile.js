module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    // ### execute node scripts
    execute: {
      migration: {
        src: ["src/data/migration.js"]
      },
      remigration: {
        src: ["src/data/migration.js"],
        options: {
          args: ["--reinit"]
        }
      },
      initDb: {
        src: ["src/data/init/init*.js"]
      }
    },
    // ### run express server
    express: {
      dev: {
        options: {
          script: "src/devServer.js",
          node_env: "development"
        }
      },
      prod: {
        options: {
          script: "src/devServer.js",
          node_env: "production",
          background: true,
          serverreload: true
        }
      },
    },
    // ### watch file changes and run tasks
    watch: {
      express: {
        files: [
          "src/*.js",
          "src/api/*.js",
          "src/models/*.js",
          "src/config/*.js",
          "src/middlewares/*.js"
          //'!node_modules/**/*.js'
        ],
        tasks: ["express:prod"],
        options: {
          spawn: false // Without this option specified express won't be reloaded
        }
      }
    }
  });
  // Plugins
  // ### execute node scripts
  grunt.loadNpmTasks("grunt-execute");
  // ### run express server
  grunt.loadNpmTasks("grunt-express-server");
  // ### watch file changes and run tasks
  grunt.loadNpmTasks("grunt-contrib-watch");

  // Tasks
  grunt.registerTask("database", ["execute:migration", "execute:initDb"]);
  grunt.registerTask("remigration", ["execute:remigration"]);
  grunt.registerTask("initdb", ["execute:initDb"]);
  grunt.registerTask("dev", ["express:dev", "watch"]);
  grunt.registerTask("prod", ["express:prod", "watch"]);
};
