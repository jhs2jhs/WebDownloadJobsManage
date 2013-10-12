var myconfig = require('./CONFIG.js');
var myutil = require('./myutil.js')
var sprintf = require('util').format;
var nodemailer = require("nodemailer");

// dump the database as well. 

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: myconfig.mail_opts.smtp_server_user,
        pass: myconfig.mail_opts.smtp_server_pass
    }
});