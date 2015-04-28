'use strict'
/***
@author Vikram Somu
@date 1/25/2015

TERM MANAGER
A class to manage probing / downloading terms.
Polls OSCAR for new terms. If so, we add the term to memory
and mark its 'probed' flag to false. The term will 
be marked true for 'probed' after the CatalogConnector
processes the term.
*/

var https = require('https'),
    cheerio = require('cheerio'),
    monk = require('monk'),
    poller_interval = null;

function TermManager(connection_url, delay) {
	var db = monk(connection_url);
	this.historical_terms = db.get('historical_terms');
	this.start_season_poller(delay);
}


/*
This depends there on unique term_code's per given document
in the collection. No two docs should share term_code.
*/
TermManager.prototype.set_probed = function(term_code, val) {
	this.historical_terms.update(
		{code:term_code},
		{ $set: 
			{
				probed: val
			}
		}
	);
};

TermManager.prototype.is_new_term = function(term_obj, cb) {
	this.historical_terms.findOne(term_obj)
	.on('success', function (doc) {
		if(!doc) { 
			cb(true, term_obj);
		}else {
			cb(false, term_obj);
		}		
	});
};

TermManager.prototype.add_new_term = function(term_obj) {
	term_obj.probed = false;
	this.historical_terms.insert(term_obj);
};

TermManager.prototype.poll_new_terms = function() {
  var _this = this;

  var options = {
    hostname: 'oscar.gatech.edu',
    port: 443,
    path: '/pls/bprod/bwckctlg.p_disp_dyn_ctlg',
    method: 'GET',
    rejectUnauthorized: 'false'
  };

  var req = https.request(options, function(res) {
    var body = [];
    res.setEncoding('utf8');

    res
    .on('data', function(chunk) {
      body.push(chunk);
    });

    res
    .on('end', function() {

    	var $ = cheerio.load(body.join(''));

      if($('#term_input_id') && $('#term_input_id')['0']) {
        var term_opts = $('#term_input_id')['0'].children;
      } else{
        var term_opts = [];      
      }

    	for(var i=0; i<term_opts.length; i++) {
    		if(term_opts[i].attribs && term_opts[i].children) {
      		var term_code = term_opts[i].attribs.value,
    				 	term_str = term_opts[i].children[0].data.trim(),
    				 	term_comps = term_str.split(' '),
    				 	d = new Date(),
    				 	year = d.getFullYear();

          // console.log("Checking box of terms...")
          // console.log('code: ', term_code, ' str: ', term_str)

    			//Check if its a typical registration term
    			if(term_comps.length == 2) {
    				//Check if the term is from this year (summer/fall) or next year (spring)
    				if(year == term_comps[1] || (year + 1) == term_comps[1]) {
    					var term_obj = {
    						code: term_code,
    						str: term_str
    					}


    					_this.is_new_term(term_obj, function(is_new, term_obj) {
    						//encountered new term

                // console.log("TERM OBJ CONSIDERED: ", term_obj)

                if(is_new) {
                  // console.log("NEW TERM OBJ: ", term_obj)
    							_this.add_new_term(term_obj);
    						}
    					});
    				}
    			}

    		}
    	}

    });
  });

  req.end();

  req
  .on('error', function(e) {
     console.log("Error: " + e.message); 
     console.log( e.stack );
  }); 
};

TermManager.prototype.start_season_poller = function(delay) {
	var _this = this;
	poller_interval = setInterval(function() {
		_this.poll_new_terms();
	}, delay);
};

TermManager.prototype.stop_season_poller = function() {
	if(poller_interval) {
		clearInterval(poller_interval);
	}
};

TermManager.prototype.get_unprobed_terms = function(cb) {
	this.historical_terms.find({probed:false})
	.on('success', function (docs) {
    // console.log("UNPROBED TERMS", docs)
		cb(docs);
	});
};

TermManager.prototype.decompose_term_code = function(term_code) {
	var year = term_code.slice(0,4),
			season_month = term_code.slice(4);

	return {
		year: year,
		month: season_month
	};
}

TermManager.prototype.term_code_to_legacy = function(term_code) {
	var year = term_code.slice(0,4),
			season_month = term_code.slice(4);

			translate_obj = {
				'02': 'spring',
				'05': 'summer',
				'08': 'fall'
			};

	return translate_obj[season_month] + year;
};

TermManager.prototype.is_spring = function(month) {
  return month >= 9 || month <= 0;
};

TermManager.prototype.is_summer = function(month) {
  return month >= 2 && month <= 8;
};

TermManager.prototype.is_fall = function(month) {
  return month >= 2 && month <= 5;
};

module.exports = TermManager;