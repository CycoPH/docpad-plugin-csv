(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  module.exports = function(BasePlugin) {
    var CSVPlugin, balUtil, pathUtil, csvUtils;
    balUtil = require('bal-util');
    pathUtil = require('path');
    csvUtils = require('csv');
    return CSVPlugin = (function(_super) {

      __extends(CSVPlugin, _super);

      CSVPlugin.prototype.name = 'csv';

      CSVPlugin.prototype.config = {
        csvPath: 'csv',
        currency: '',
        decimal: 2,
        decimalPoint: '.',
        thousandSep: ',',
        defExtension: '.csv',
        zeroIs: "TBD"
      };

      CSVPlugin.prototype.foundCSVs = null;
      CSVPlugin.prototype.foundCSVQueries = null;
      CSVPlugin.prototype.csvRequestNr = 0;

      function CSVPlugin() {
        var config, docpad;
        CSVPlugin.__super__.constructor.apply(this, arguments);
        docpad = this.docpad;
        config = this.config;
        config.csvPath = pathUtil.resolve(docpad.config.srcPath, config.csvPath);
        //
        // check the docpad.plugins.csv key for configurations
        if (docpad.config.docpad) {
          if (docpad.config.docpad.plugins) {
            if (docpad.config.docpad.plugins.csv) {
              // console.dir(docpad.config.docpad.plugins.csv);
              for(key in docpad.config.docpad.plugins.csv) {
                config[key] = docpad.config.docpad.plugins.csv[key];
              }
              // console.dir(config);
            }
          }
        }
        // console.dir(docpad.config);
      }

      Number.prototype.formatMoney = function(c, d, t){ 
        var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0; 
        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ""); 
      }; 

      CSVPlugin.prototype.fJustText = function (csv, inText) {
        return inText;
      }

      CSVPlugin.prototype.fPrice = function (csv, inText) {
        var num = +inText;
        var config = csv.plugin.config;
        if (inText.length === 0 && config.zeroIs.length > 0) {
          return config.zeroIs;
        }
        if (isNaN(inText)) {
          return inText;
        }

        return config.currency + num.formatMoney(config.decimal, config.decimalPoint, config.thousandSep); 
      }

      CSVPlugin.prototype.fPriceNoDec = function (csv, inText) {
        var num = +inText;
        var config = csv.plugin.config;
        if (inText.length === 0 && config.zeroIs.length > 0) {
          return config.zeroIs;
        }
        if (isNaN(inText)) {
          return inText;
        }

        return config.currency + num.formatMoney(0, config.decimalPoint, config.thousandSep); 
      }

      CSVPlugin.prototype.renderCSVSync = function(outOp, name, data) {
        var config, id, oneCSVQuery;
        config = this.config;

        if (config.defExtension !== undefined) {
          name += config.defExtension;
        }
        ++this.csvRequestNr;
        id = name+this.csvRequestNr;
        oneCSVQuery = {
          id: id,
          plugin: this,
          name: name,
          data: data,
          path: pathUtil.join(config.csvPath, name),
          container: "[csv:" + id + "]",
          outOp: outOp
        };
        this.foundCSVQueries[id] = oneCSVQuery;
        return oneCSVQuery.container;
      };

      CSVPlugin.prototype.renderCSV = function(csv, next) {
        var docpad;
        docpad = this.docpad;
        balUtil.exists(csv.path, function(exists) {
          var err;
          if (!exists) {
            err = new Error("The csv file [" + csv.name + "] was not found, and as such will not be rendered.");
            if (err) {
              return next(err);
            }
          }
          // Load the CSV data and then call the render function
          var csvParsedData = csv.plugin.foundCSVs[csv.name];
          if (csvParsedData === undefined) {
            csv.csvData = {};
            csvUtils()
              .from.path(csv.path, {trim: true})
              .on('data', function(data, index) {csv.csvData[data[0]] = data[1]; })
              .on('end', function(count) {
                  csv.plugin.foundCSVs[csv.name] = csv.csvData;
                  if (csv.csvData[csv.data] === undefined) {
                    return next(new Error("Unable to find entry [" +csv.data+"] in CSV file [" + csv.name + "]"));
                  } else {
                    return docpad.renderText(csv.outOp(csv, csv.csvData[csv.data]), {filename: csv.path}, next);
                  }
                })
              .on('error',function(error) {return next(new Error("Unable to parse CSV file [" + csv.name + "]")); });
          } else {
            csv.csvData = csvParsedData;
            if (csv.csvData[csv.data] === undefined) {
              return next(new Error("Unable to find entry [" +csv.data+"] in CSV file [" + csv.name + "]"));
            } else {
              return docpad.renderText(csv.outOp(csv, csv.csvData[csv.data]), {filename: csv.path}, next);
            }
          }
        });
        return this;
      };


      CSVPlugin.prototype.extendTemplateData = function(_arg) {
        var me, templateData;
        templateData = _arg.templateData;
        me = this;
        this.foundCSVs = {};
        this.foundCSVQueries = {};
        this.csvRequestNr = 0;

        // Hookup the csv function call from within the document
        templateData.csv = function(name, data) {
          return me.renderCSVSync(me.fJustText, name, data);
        };
        templateData.csvPrice = function(name, data) {
          return me.renderCSVSync(me.fPrice, name, data);
        };
        templateData.csvPriceNoDec = function(name, data) {
          return me.renderCSVSync(me.fPriceNoDec, name, data);
        };
        return this;
      };

      CSVPlugin.prototype.renderDocument = function(opts, next) {
        var config, docpad, file, foundCSVQueries, me, tasks, templateData;
        templateData = opts.templateData, file = opts.file;
        me = this;
        docpad = this.docpad;
        config = this.config;
        foundCSVQueries = this.foundCSVQueries;
        tasks = new balUtil.Group(next);
        // Run over all the CSV entries we have and check if the source 'content' has got an entry for it.
        balUtil.each(foundCSVQueries, function(oneQuery) {
          return tasks.push(function(complete) {
            if (opts.content.indexOf(oneQuery.container) === -1) {
              return complete();
            }
            docpad.log('debug', "Rendering csv: " + oneQuery.name+oneQuery.data);

            return me.renderCSV(oneQuery, function(err, contentRendered) {
              if (err) {
                docpad.warn("Rendering csv failed: " + oneQuery.name+oneQuery.data + ". The error follows:", err);
              } else {
                docpad.log('debug', "Rendered csv: " + oneQuery.name+oneQuery.data);
                opts.content = opts.content.replace(oneQuery.container, contentRendered);
              }
              return complete();
            });
          });
        });
        tasks.sync();
        return this;
      };

      return CSVPlugin;

    })(BasePlugin);
  };

}).call(this);
