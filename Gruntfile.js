(function () {
    'use strict';

    var mountFolder = function (connect, dir) {
        return connect.static(require('path').resolve(dir));
    };

    // # Globbing
    // for performance reasons we're only matching one level down:
    // 'test/spec/{,*/}*.js'
    // use this if you want to match all subfolders:
    // 'test/spec/**/*.js'
    // templateFramework: 'lodash'

    module.exports = function (grunt) {
        // show elapsed time at the end
        require('time-grunt')(grunt);
        // load all grunt tasks
        require('load-grunt-tasks')(grunt);

        // configurable paths
        var yeomanConfig = {
            src: 'src',
            lib: 'lib'
        };

        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            yeoman: yeomanConfig,
            watch: {
                options: {
                    nospawn: true
                },
                test: {
                    files: ['<%= yeoman.src %>/scripts/{,*/}*.js', 'test/spec/**/*.js'],
                    tasks: ['test:true']
                }
            },
            clean: {
                lib: ['.tmp', '<%= yeoman.lib %>/*'],
                server: '.tmp'
            },
            jshint: {
                options: {
                    jshintrc: '.jshintrc',
                    reporter: require('jshint-stylish')
                },
                all: [
                    'Gruntfile.js',
                    '<%= yeoman.src %>/{,*/}*.js',
                    'test/spec/{,*/}*.js'
                ]
            },
//            mocha: {
//                all: {
//                    options: {
//                        run: true,
//                        src: ['http://localhost:<%= connect.test.options.port %>/index.html']
//                    }
//                }
//            },
            copy: {
                lib: {
                    files: [{
                        expand: true,
                        dot: true,
                        cwd: '<%= yeoman.src %>',
                        lib: '<%= yeoman.lib %>',
                        src: [
                            '*.{ico,txt}',
                            '.htaccess',
                            'images/{,*/}*.{webp,gif}',
                            'styles/fonts/{,*/}*.*',
                            'bower_components/sass-bootstrap/fonts/*.*'
                        ]
                    }]
                }
            },
            concat: {
                js: {
                    src: '<%= yeoman.src %>/*.js',
                    dest: '<%= yeoman.lib %>/morphing-<%= pkg.version %>.combined.js'
                }
            },
            uglify: {
                dest: {
                    files: {
                        '<%= yeoman.lib %>/morphing-<%= pkg.version %>.min.js': '<%= yeoman.lib %>/morphing-<%= pkg.version %>.combined.js'
                    }
                }
            }
//            bower: {
//                all: {
//                    rjsConfig: '<%= yeoman.src %>/scripts/main.js'
//                }
//            }
        });

        grunt.registerTask('serve', function (target) {
            if (target === 'lib') {
                return grunt.task.run(['build']);
            }

            if (target === 'test') {
                return grunt.task.run([
                    'clean:server',
                    'watch'
                ]);
            }

            grunt.task.run([
                'clean:server',
                'watch'
            ]);
        });

        grunt.registerTask('test', function (isConnected) {
            isConnected = Boolean(isConnected);
            var testTasks = [
                    'clean:server',
                    'mocha'
                ];

            if(!isConnected) {
                return grunt.task.run(testTasks);
            } else {
                // already connected so not going to connect again, remove the connect:test task
                testTasks.splice(testTasks.indexOf('connect:test'), 1);
                return grunt.task.run(testTasks);
            }
        });

        grunt.registerTask('build', [
            'clean:lib',
//            'useminPrepare',
//            'requirejs',
            'concat',
            'uglify',
            'copy'
//            'usemin'
        ]);

        grunt.registerTask('default', [
            'jshint',
            'test',
            'build'
        ]);
    };
})();