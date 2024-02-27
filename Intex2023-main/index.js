
// Authors: Aiki Takaku, Mark Barlocker, Spencer Olson, David Winn
// The index.js file is where all the routing takes place. 
// This allows for navigation from one page to another while passing data. 
// This also connects to our database.



const express = require("express");
const { platform } = require("os");
let app = express();
let path = require("path")

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

const moment = require("moment");

const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD|| "admin",
        database: process.env.RDS_DB_NAME || "local_intex",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    }
});

let count = 0;
knex('form_entry').max('entry_id as max_value')
.then((result) => {
    count = parseInt(result[0].max_value);
});

app.listen(port, () => console.log("My server is listening"));

app.get('/', (req, res) => {
    res.render("landingPage");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/surveyForm', (req, res) => {
    res.render("surveyForm");
});

app.get('/employeeList/:id', (req, res) => {
    Promise.all([
        knex.select().from("user"),
        knex.select().from("user").where("user_id", req.params.id).first()
    ])
    .then(([users, userData]) => {
        res.render("employeeList", {users: users, userData: userData});
    })
    .catch(err => {
        console.error("Error fetching data:", err);
        res.status(500).send("Error fetching data");
    });
});


app.get('/editProfile/:id', (req, res) => {
    knex.select()
    .from("user")
    .where("user_id", req.params.id)
    .then(users => {
        let phone = users[0].phone;

        let cleanNumber = phone.replace(/\D/g, '');

        let part1 = cleanNumber.substring(0, 3); // First part '222'
        let part2 = cleanNumber.substring(3, 6); // Second part '222'
        let part3 = cleanNumber.substring(6);

        res.render("editProfile", {
            users: users,
            part1: part1,
            part2: part2,
            part3: part3
        });
    });
});

app.get('/adminEditProfile/:id/:adminId', (req, res) => {
    knex.select()
    .from("user")
    .where("user_id", req.params.id)
    .then(users => {
        let phone = users[0].phone;

        let cleanNumber = phone.replace(/\D/g, '');

        let part1 = cleanNumber.substring(0, 3); // First part '222'
        let part2 = cleanNumber.substring(3, 6); // Second part '222'
        let part3 = cleanNumber.substring(6);

        res.render("adminEditProfile", {
            users: users,
            part1: part1,
            part2: part2,
            part3: part3,
            adminId: req.params.adminId
        });
    });
});

app.post('/editProfile', (req,res)=>{
    const phone = `(${req.body.phone1}) ${req.body.phone2} - ${req.body.phone3}`;
    knex("user")
    .where("user_id", parseInt(req.body.user_id))
    .update({
        username:req.body.username,
        password:req.body.password,
        first_name:req.body.fname,
        last_name:req.body.lname,
        email:req.body.email,
        phone:phone
    })
    .then(users => {
        res.redirect("/editProfile/"+ parseInt(req.body.user_id));
    })
});

app.post('/adminEditProfile/:adminId', (req,res)=>{
    const phone = `(${req.body.phone1}) ${req.body.phone2} - ${req.body.phone3}`;
    knex("user")
    .where("user_id", parseInt(req.body.user_id))
    .update({
        username:req.body.username,
        password:req.body.password,
        first_name:req.body.fname,
        last_name:req.body.lname,
        email:req.body.email,
        phone:phone
    })
    .then(users => {
        res.redirect("/employeeList/" + parseInt(req.params.adminId));
    })
});

app.get('/cancel/:id', (req, res) => {
    res.redirect('/formList/'+ parseInt(req.params.id));
});

app.get('/formList/:id', (req, res) => {
    // Fetch data from 'form_entry' and 'users' tables concurrently
    Promise.all([
        knex.select().from("form_entry"),
        knex.select().from('user').where("user_id", req.params.id).first()
    ])
    .then(([formEntries, userData]) => {
        // Combine the fetched data and render the view with both sets of data
        res.render("formList", { formEntries: formEntries, userData: userData });
    })
    .catch(err => {
        console.error("Error fetching data:", err);
        res.status(500).send("Error fetching data");
    });
});


app.get('/editEntry/:id/:adminId', (req, res) => {
    knex.select().from('form_entry')
    .innerJoin('organization_form', 'form_entry.entry_id', 'organization_form.entry_id')
    .innerJoin('organization', 'organization_form.org_id', 'organization.org_id')
    .innerJoin('platform_form', 'form_entry.entry_id', 'platform_form.entry_id')
    .innerJoin('platform', 'platform.platform_id', 'platform_form.platform_id')
    .where('form_entry.entry_id', parseInt(req.params.id)).then(formEntry => {
        res.render('editForm', {formEntry: formEntry, adminId: req.params.adminId});
    });
});

app.post("/createEntry", (req, res)=> {
    let entryId = ++count;
    knex.transaction(async (trx) => {
        let organizations = [];
        if(typeof req.body.organizations === 'string') {
            organizations.push(req.body.organizations);
        } else if (req.body.organizations === undefined){
            organizations.push('N/A')
        } else {
            organizations = req.body.organizations
        }
        const orgIdList = await knex('organization')
          .select("org_id")
          .whereIn("org_name", organizations)
          .pluck('org_id');
        
        const orgIdIntList = orgIdList.map(Number);
        
        let platforms = [];
        if(typeof req.body.platform === 'string') {
            platforms.push(req.body.platform);
        } else if(req.body.platform === undefined){
            platforms.push('N/A')
        } else {
            platforms = req.body.platform
        }
        const platformIDList =  await knex('platform')
            .select("platform_id")
            .whereIn("platform_name", platforms)
            .pluck('platform_id');
        
        const platIdIntList = platformIDList.map(Number);
      
        await knex('form_entry')
          .insert({
            entry_id: entryId,
            timestamp: moment().format('MM/DD/YY HH:mm'),
            age: req.body.age,
            gender: req.body.gender,
            relationship: req.body.relationStatus,
            occupation: req.body.occupation,
            uses_social_media: req.body.socialMedia,
            avg_time: req.body.avg_time,
            no_purpose: req.body.no_purpose,
            busy_distracted: req.body.busy_distracted,
            restless: req.body.restless,
            easily_distracted: req.body.easily_distracted,
            worries: req.body.worries,
            concentration: req.body.concentration,
            compare: req.body.compare,
            compare_feelings: req.body.compare_feelings,
            validation: req.body.validation,
            depressed: req.body.depressed,
            motivation: req.body.motivation,
            sleep: req.body.sleep,
            city: "Provo"
          })
          .transacting(trx);
      
        // Insert into other tables using the inserted IDs
        await knex('organization_form')
          .insert(
            orgIdIntList.map((id) => ({
                org_id: id,
                entry_id: entryId
            }))
          )
          .transacting(trx);
        
        await knex('platform_form')
          .insert(
            platIdIntList.map((id) => ({
                platform_id: parseInt(id),
                entry_id: entryId
            }))
          )
          .transacting(trx);
      
        // Commit the transaction if all inserts are successful
        await trx.commit();
      })
        .then(() => {
          // Redirect on success
          res.redirect('/');
        })
        .catch((err) => {
          // Handle errors
          console.error(err);
          res.status(500).json({ err });
        });
});      
  


app.post('/editEntry/:id/:adminId', (req, res) => {
    const entryId = parseInt(req.params.id); 
    knex.transaction(async (trx) => {
      
        await knex('form_entry')
          .where('entry_id', entryId)
          .update({
            age: req.body.age,
            gender: req.body.gender,
            relationship: req.body.relationStatus,
            occupation: req.body.occupation,
            uses_social_media: req.body.socialMedia,
            avg_time: req.body.avg_time,
            no_purpose: req.body.no_purpose,
            busy_distracted: req.body.busy_distracted,
            restless: req.body.restless,
            easily_distracted: req.body.easily_distracted,
            worries: req.body.worries,
            concentration: req.body.concentration,
            compare: req.body.compare,
            compare_feelings: req.body.compare_feelings,
            validation: req.body.validation,
            depressed: req.body.depressed,
            motivation: req.body.motivation,
            sleep: req.body.sleep,
            city: "Provo"
          })
          .transacting(trx);
        
        // Need to delete old platform_form and organization_form entries to update them
        const existingPlatforms = await knex('platform_form')
        .select('platform_id')
        .where({ entry_id: entryId });

        // Extract platform IDs from the existing platforms
        const existingPlatformIds = existingPlatforms.map((platform) => platform.platform_id);


        // Delete associations for platforms that need to be removed
        for (const platformIdToDelete of existingPlatformIds) {
        await knex('platform_form')
            .where({ entry_id: entryId, platform_id: platformIdToDelete })
            .del()
            .transacting(trx);
        }
        const existingOrgs = await knex('organization_form')
        .select('org_id')
        .where({ entry_id: entryId });

        // Extract organization IDs from the existing organizations
        const existingOrgIds = existingOrgs.map((org) => org.org_id);


        // Delete associations for organizations that need to be removed
        for (const orgIdToDelete of existingOrgIds) {
        await knex('organization_form')
            .where({ entry_id: entryId, org_id: orgIdToDelete })
            .del()
            .transacting(trx);
        }

        await trx.commit();


      }).then (() => {
        knex.transaction(async (trx) => {
                // Insert into other tables using the inserted IDs
                let organizations = [];
        
                if(typeof req.body.organizations === 'string') {
                    organizations.push(req.body.organizations);
                } else if (req.body.organizations === undefined){
                    organizations.push('N/A')
                } else {
                    organizations = req.body.organizations
                }
                const orgIdList = await knex('organization')
                  .select("org_id")
                  .whereIn("org_name", organizations)
                  .pluck('org_id');
                
                const orgIdIntList = orgIdList.map(Number);
                
                let platforms = [];
                if(typeof req.body.platform === 'string') {
                    platforms.push(req.body.platform);
                } else if(req.body.platform === undefined){
                    platforms.push('N/A')
                } else {
                    platforms = req.body.platform
                }
                const platformIDList =  await knex('platform')
                    .select("platform_id")
                    .whereIn("platform_name", platforms)
                    .pluck('platform_id');
                
                const platIdIntList = platformIDList.map(Number);
                await knex('organization_form')
                .insert(
                    orgIdIntList.map((id) => ({
                        org_id: id,
                        entry_id: entryId
                    }))
                )
                .transacting(trx);
                
                await knex('platform_form')
                .insert(
                    platIdIntList.map((id) => ({
                        platform_id: parseInt(id),
                        entry_id: entryId
                    }))
                )
                .transacting(trx);
        
                //Rec
                await trx.commit();
        });
      })
        .then(() => {
          // Redirect on success
          res.redirect('/formList/' + parseInt(req.params.adminId));
        })
        .catch((err) => {
          // Handle errors
          console.error(err);
          res.status(500).json({ err });
        });
});      

app.post('/deleteEntry/:id/:adminId', (req, res) => {
    knex.transaction(async (trx) => {
        // Delete entries in other related tables first
        await knex('platform_form').where('entry_id', req.params.id).del().transacting(trx);
        await knex('organization_form').where('entry_id', req.params.id).del().transacting(trx);
        
        // Delete the entry in the main table (form_entry)
        await knex('form_entry').where('entry_id', req.params.id).del().transacting(trx);
      
        // Commit the transaction if all deletes are successful
        await trx.commit();
      })
        .then(() => {
          res.redirect('/formList/' + parseInt(req.params.adminId));
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ err });
        });

});

app.post('/deleteProfile/:id/:adminId', (req, res) => {
    knex.transaction(async (trx) => {
        // Delete the entry in the main table 
        await knex('user').where('user_id', req.params.id).del().transacting(trx);
      
        // Commit the transaction if all deletes are successful
        await trx.commit();
      })
        .then(() => {
          res.redirect('/employeeList/' + parseInt(req.params.adminId));
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ err });
        });

});

app.post('/createAccount/:adminId', (req, res) => {
    const {fname, lname, email, phone1, phone2, phone3, username, password} = req.body;
    const phone = `(${phone1}) ${phone2} - ${phone3}`;
    knex('user')
            .where({ username: username})
            .first()
            .then(existingUser => {
                if (existingUser) {
                    return false;
                } 
                else {
                    knex('user')
                        .insert({
                            first_name: fname,
                            last_name: lname,
                            email: email,
                            phone: phone,
                            username: username,
                            password: password
                        })
                        .then(record => {
                            res.redirect('/employeeList/' + parseInt(req.params.adminId));
                        })
                        .catch(err => {
                            console.error(err);
                            res.status(500).send('Internal Server Error');
                        }); 
                }
            })
            .catch(err => {
                console.error(err);
                res.status(500).send('Internal Server Error');
            });
    });


app.post('/loginAccount', (req, res) => {
    const { inputName, inputPass } = req.body
    knex.select()
        .from("user")
        .where({username: inputName, password: inputPass})
        .first()
        .then(foundUser => {
            if (foundUser) {
                res.render('userLandingPage', {data : foundUser});
            } 
            else {
                return false
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

app.get('/userLandingPage/:id', (req, res) => {
    knex.select()
    .from("user")
    .where("user_id", req.params.id)
    .first()
    .then(data => {
        res.render("userLandingPage", {data : data});
    });
});